<?php

namespace App\Http\Controllers;

use App\Http\Controllers\Controller;
use App\Models\SaldoAwal;
use App\Models\MutasiBank;
use App\Models\BkuPemda;
use App\Models\RekonBank;
use App\Models\RekonBankDetail;
use Illuminate\Http\Request;
use Inertia\Inertia;
use Illuminate\Support\Collection;
use Illuminate\Support\Facades\Storage;
use Illuminate\Support\Facades\DB;
use Maatwebsite\Excel\Facades\Excel;
use Barryvdh\DomPDF\Facade\Pdf;
use Carbon\Carbon;
use Carbon\CarbonPeriod;
use PhpOffice\PhpSpreadsheet\Shared\Date as ExcelDate;
use App\Services\RekonService;


class KasdaController extends Controller
{
    // ... method kamu yang lain (rekapdata, dll) ...

    /**
     * Menampilkan Halaman Utama Menu Import Kasda
     */
    public function importIndex()
    {
        return Inertia::render('Kasda/Import/Index', [
            'title' => 'Import Data Kasda',
        ]);
    }

    /**
     * Menampilkan halaman pengaturan saldo awal Kasda.
     */
    public function saldoAwalIndex()
    {
        $tahun = session('tahun');
        $saldo = SaldoAwal::where('tahun', $tahun)->first();

        return Inertia::render('Kasda/SaldoAwal/Index', [
            'title' => 'Saldo Awal Kasda',
            'saldo' => $saldo,
            'tahun' => $tahun,
        ]);
    }

    /**
     * Menyimpan atau Mengupdate Saldo Awal
     */
    public function saveSaldoAwal(Request $request)
    {
        $tahun = session('tahun');

        SaldoAwal::updateOrCreate(
            ['tahun' => $tahun],
            [
                'saldo_awal_bku' => $this->cleanNumber($request->saldo_bku),
                'saldo_awal_mutasi' => $this->cleanNumber($request->saldo_mutasi),
            ]
        );

        return back()->with('success', 'Saldo awal berhasil disimpan.');
    }

    /**
     * Helper untuk membersihkan format angka string ke float
     */
    private function cleanNumber(mixed $value)
    {
        if (empty($value)) return 0;

        if (is_numeric($value)) {
            return (float) $value;
        }

        // Menangani jika inputan dikirim dengan format ribuan/desimal lokal (jika ada)
        $clean = str_replace('.', '', $value);
        $clean = str_replace(',', '.', $clean);

        return (float) $clean;
    }

    /**
     * Tampilkan Form Upload BKU
     */
    public function bkuForm()
    {
        return Inertia::render('Kasda/Import/Bku/Form', [
            'title' => 'Import BKU Pemda'
        ]);
    }

    /**
     * Proses Validasi Nama File & Tampilkan Data Preview Excel
     */
    public function bkuPreview(Request $request)
    {
        $request->validate([
            'file_bku' => 'required|mimes:xls,xlsx'
        ]);

        $file = $request->file('file_bku');
        $originalName = $file->getClientOriginalName();

        // Ambil nama tanpa ekstensi
        $filename = pathinfo($originalName, PATHINFO_FILENAME);

        // Validasi format: 001 Januari - 012 Desember
        if (!preg_match('/^(00[1-9]|01[0-2]) (Januari|Februari|Maret|April|Mei|Juni|Juli|Agustus|September|Oktober|November|Desember)$/', $filename, $m)) {
            return redirect()->back()->with('error', 
                'Nama file BKU harus format: 001 Januari - 012 Desember. Contoh: 005 Mei.xlsx'
            );
        }

        // Ekstrak bulan dari nama file (001 -> 1, 002 -> 2, dst)
        $bulan     = (int) $m[1];
        $namaBulan = $m[2];
        $tahun     = session('tahun');

        // Cek apakah bulan tersebut sudah punya data pencocokan harian.
        $hasPencocokanData = DB::table('monitoring_harian')
            ->whereYear('tanggal', $tahun)
            ->whereMonth('tanggal', $bulan)
            ->exists();

        // Simpan file sementara
        $path = $file->store('temp');

        // Baca data excel
        $data = Excel::toArray([], $path, 'local');
        $rows = collect($data[0]);

        // Buang header baris pertama
        $rows = $rows->skip(1)->values();

        // Buang baris kosong (kolom tanggal kosong)
        $rows = $rows->filter(function ($row) {
            return !empty($row[1]);
        })->values()->all(); // Konversi ke array biasa agar mulus dikonversi ke JSON

        return Inertia::render('Kasda/Import/Bku/Preview', [
            'title'             => 'Preview Import BKU',
            'rows'              => $rows,
            'path'              => $path,
            'originalName'      => $originalName,
            'bulan'             => $bulan,
            'namaBulan'         => $namaBulan,
            'tahun'             => $tahun,
            'hasPencocokanData' => $hasPencocokanData,
        ]);
    }

    /**
     * Proses Final: Simpan Data Preview ke Database Produksi
     */
    public function bkuStore(Request $request)
    {
        $path = $request->file_path;
        $originalName = $request->original_name;

        if (!$path || !Storage::exists($path)) {
            return redirect()->route('kasda.import.index')
                ->with('error', 'File temporer tidak ditemukan atau sudah kedaluwarsa.');
        }

        $data = Excel::toArray([], $path, 'local');
        $rows = collect($data[0])->skip(1)->values();
        $tahun = session('tahun');

        DB::transaction(function () use ($rows, $tahun, $originalName) {
            // Hapus data lama yang bersumber dari nama file yang sama (Replace System)
            BkuPemda::where('sumber_file', $originalName)->delete();

            foreach ($rows as $row) {
                if (empty($row[1])) continue;

                BkuPemda::create([
                    'tanggal'        => Carbon::parse($row[1])->format('Y-m-d'),
                    'nama_skpd'      => $row[2] ?? '',
                    'nama_sub_skpd'  => $row[3] ?? '',
                    'nomor_bukti'    => $row[4] ?? '',
                    'jenis_dokumen'  => $row[5] ?? '',
                    'uraian'         => $row[6] ?? '',
                    'penerimaan'     => $this->cleanNumber($row[7]),
                    'pengeluaran'    => $this->cleanNumber($row[8]),
                    'saldo'          => $this->cleanNumber($row[9]),
                    'tahun'          => $tahun,
                    'sumber_file'    => $originalName
                ]);
            }
        });

        // Hapus file excel temporer dari storage
        Storage::delete($path);

        return redirect()->route('kasda.import.index')
            ->with('success', 'Data Bku Pemda berhasil diperbarui berdasarkan file ' . $originalName);
    }

    public function mutasiForm()
    {
        return Inertia::render('Kasda/Import/Mutasi/Form', [
            'title' => 'Import Mutasi Rekening'
        ]);
    }

    /**
     * Preview Data Excel Mutasi Bank
     */
    public function mutasiPreview(Request $request)
    {
        $request->validate([
            'file_mutasi' => 'required|mimes:xls,xlsx'
        ]);

        $file = $request->file('file_mutasi');
        $originalName = $file->getClientOriginalName();
        $filename = pathinfo($originalName, PATHINFO_FILENAME);

        // Validasi format file: 01 Januari - 12 Desember
        if (!preg_match('/^(0[1-9]|1[0-2]) (Januari|Februari|Maret|April|Mei|Juni|Juli|Agustus|September|Oktober|November|Desember)$/', $filename, $m)) {
            return redirect()->back()->with('error', 
                'Nama file Mutasi harus format: 01 Januari - 12 Desember. Contoh: 05 Mei.xlsx'
            );
        }

        // Ekstrak bulan dari nama file (01 -> 1, 02 -> 2, dst)
        $bulan     = (int) $m[1];
        $namaBulan = $m[2];
        $tahun     = session('tahun');

        // Cek apakah bulan tersebut sudah punya data pencocokan harian.
        $hasPencocokanData = DB::table('monitoring_harian')
            ->whereYear('tanggal', $tahun)
            ->whereMonth('tanggal', $bulan)
            ->exists();

        $path = $file->store('temp');
        $data = Excel::toArray([], $path, 'local');
        
        // Ambil sheet pertama, buang baris header pertama
        $rows = collect($data[0])->skip(1)->values();

        // Filter baris kosong (Posting Date tidak kosong)
        $filteredRows = $rows->filter(function ($row) {
            return !empty($row[1]);
        });

        // 💡 Transformasi data ke format Associative Array agar mudah dibaca oleh React Component
        $previewData = $filteredRows->map(function ($row) {
            return [
                'posting_date'   => !empty($row[1]) ? ExcelDate::excelToDateTimeObject($row[1])->format('d-m-Y H:i') : '',
                'effective_date' => !empty($row[2]) ? ExcelDate::excelToDateTimeObject($row[2])->format('d-m-Y') : '',
                'account'        => $row[3] ?? '',
                'name'           => $row[4] ?? '',
                'description'    => $row[5] ?? '',
                'currency'       => $row[6] ?? '',
                'debit'          => $row[7] ?? 0,
                'credit'         => $row[8] ?? 0,
                'balance'        => $row[9] ?? 0,
                'reference_no'   => $row[10] ?? '',
            ];
        })->values()->all();

        // Cek apakah file dengan nama yang sama sudah pernah diimport
        $exists = MutasiBank::where('sumber_file', $originalName)->exists();

        return Inertia::render('Kasda/Import/Mutasi/Preview', [
            'title'             => 'Preview Mutasi Bank',
            'rows'              => $previewData,
            'path'              => $path,
            'originalName'      => $originalName,
            'exists'            => $exists,
            'bulan'             => $bulan,
            'namaBulan'         => $namaBulan,
            'tahun'             => $tahun,
            'hasPencocokanData' => $hasPencocokanData,
        ]);
    }

    /**
     * Simpan Permanen Data Mutasi ke Database
     */
    public function mutasiStore(Request $request)
    {
        $path = $request->file_path;
        $originalName = $request->original_name;

        if (!$path || !Storage::exists($path)) {
            return redirect()->route('kasda.import.mutasi.form')
                ->with('error', 'File temporer tidak ditemukan.');
        }

        $data = Excel::toArray([], $path, 'local');
        $rows = collect($data[0])->skip(1)->values();
        $tahun = session('tahun');

        DB::transaction(function () use ($rows, $tahun, $originalName) {
            // Hapus data lama berdasarkan nama berkas asal (Replace System)
            MutasiBank::where('sumber_file', $originalName)->delete();

            foreach ($rows as $row) {
                if (empty($row[1])) continue;

                MutasiBank::create([
                    'posting_date'   => ExcelDate::excelToDateTimeObject($row[1])->format('Y-m-d H:i:s'),
                    'effective_date' => ExcelDate::excelToDateTimeObject($row[2])->format('Y-m-d'),
                    'account'        => $row[3] ?? '',
                    'name'           => $row[4] ?? '',
                    'description'    => $row[5] ?? '',
                    'currency'       => $row[6] ?? '',
                    'debit'          => $this->cleanNumber($row[7]),
                    'credit'         => $this->cleanNumber($row[8]),
                    'balance'        => $this->cleanNumber($row[9]),
                    'reference_no'   => $row[10] ?? '',
                    'tahun'          => $tahun,
                    'sumber_file'    => $originalName
                ]);
            }
        });

        Storage::delete($path);

        return redirect()->route('kasda.import.index')
            ->with('success', 'Data mutasi rekening berhasil diimport.');
    }

    public function monitoringPeriode(Request $request)
    {
        $tahun     = session('tahun');
        $tgl_awal  = $request->tgl_awal;
        $tgl_akhir = $request->tgl_akhir;

        $rows       = collect();
        $isFiltered = false;

        $totalBankPenerimaan     = 0;
        $totalBkuPenerimaan      = 0;
        $totalSelisihPenerimaan  = 0;
        $totalBankPengeluaran    = 0;
        $totalBkuPengeluaran     = 0;
        $totalSelisihPengeluaran = 0;
        $saldoAkhirBank          = 0;
        $saldoAkhirBku           = 0;
        $saldoAkhirSelisih       = 0;

        if ($tgl_awal && $tgl_akhir) {

            if (
                Carbon::parse($tgl_awal)->year  != $tahun ||
                Carbon::parse($tgl_akhir)->year != $tahun
            ) {
                return back()->with('error', 'Tanggal harus dalam tahun ' . $tahun);
            }

            if ($tgl_awal > $tgl_akhir) {
                return back()->with('error', 'Tanggal awal tidak boleh lebih besar dari tanggal akhir');
            }

            $isFiltered = true;

            $bankData = DB::table('mutasi_bank')
                ->selectRaw("effective_date as tanggal, SUM(credit) as penerimaan, SUM(debit) as pengeluaran")
                ->whereBetween('effective_date', [$tgl_awal, $tgl_akhir])
                ->groupBy('effective_date')
                ->get()
                ->keyBy('tanggal');

            $bkuData = DB::table('bku_pemda')
                ->selectRaw("tanggal, SUM(penerimaan) as penerimaan, SUM(pengeluaran) as pengeluaran")
                ->whereBetween('tanggal', [$tgl_awal, $tgl_akhir])
                ->groupBy('tanggal')
                ->get()
                ->keyBy('tanggal');

            $saldoAwal = DB::table('saldo_awal')
                ->where('tahun', $tahun)
                ->first();

            if (!$saldoAwal) {
                return back()->with('error', 'Saldo awal tahun belum diset');
            }

            $saldoBank = $saldoAwal->saldo_awal_mutasi;
            $saldoBku  = $saldoAwal->saldo_awal_bku;

            // Bawa seluruh pergerakan sebelum tanggal awal agar saldo pada
            // rentang yang dipilih tetap merupakan saldo berjalan yang benar.
            $awalTahun = Carbon::create($tahun, 1, 1)->startOfDay();
            $sehariSebelumPeriode = Carbon::parse($tgl_awal)->subDay();

            if ($sehariSebelumPeriode->gte($awalTahun)) {
                $mutasiSebelumPeriode = DB::table('mutasi_bank')
                    ->whereBetween('effective_date', [
                        $awalTahun->toDateString(),
                        $sehariSebelumPeriode->toDateString(),
                    ])
                    ->selectRaw('COALESCE(SUM(credit), 0) as penerimaan, COALESCE(SUM(debit), 0) as pengeluaran')
                    ->first();

                $bkuSebelumPeriode = DB::table('bku_pemda')
                    ->whereBetween('tanggal', [
                        $awalTahun->toDateString(),
                        $sehariSebelumPeriode->toDateString(),
                    ])
                    ->selectRaw('COALESCE(SUM(penerimaan), 0) as penerimaan, COALESCE(SUM(pengeluaran), 0) as pengeluaran')
                    ->first();

                $saldoBank += (float) $mutasiSebelumPeriode->penerimaan - (float) $mutasiSebelumPeriode->pengeluaran;
                $saldoBku  += (float) $bkuSebelumPeriode->penerimaan - (float) $bkuSebelumPeriode->pengeluaran;
            }

            $period = CarbonPeriod::create($tgl_awal, $tgl_akhir);

            foreach ($period as $date) {
                $tgl = $date->format('Y-m-d');

                $bank = $bankData[$tgl] ?? null;
                $bku  = $bkuData[$tgl]  ?? null;

                $bankMasuk  = $bank->penerimaan  ?? 0;
                $bankKeluar = $bank->pengeluaran ?? 0;
                $bkuMasuk   = $bku->penerimaan   ?? 0;
                $bkuKeluar  = $bku->pengeluaran  ?? 0;

                $saldoBank += ($bankMasuk - $bankKeluar);
                $saldoBku  += ($bkuMasuk  - $bkuKeluar);

                $rows->push([
                    'tanggal'             => $tgl,
                    'bank_penerimaan'     => (float) $bankMasuk,
                    'bku_penerimaan'      => (float) $bkuMasuk,
                    'selisih_penerimaan'  => (float) ($bankMasuk - $bkuMasuk),
                    'bank_pengeluaran'    => (float) $bankKeluar,
                    'bku_pengeluaran'     => (float) $bkuKeluar,
                    'selisih_pengeluaran' => (float) ($bankKeluar - $bkuKeluar),
                    'saldo_bank'          => (float) $saldoBank,
                    'saldo_bku'           => (float) $saldoBku,
                    'selisih_saldo'       => (float) ($saldoBank - $saldoBku),
                ]);
            }

            $totalBankPenerimaan     = (float) $rows->sum('bank_penerimaan');
            $totalBkuPenerimaan      = (float) $rows->sum('bku_penerimaan');
            $totalSelisihPenerimaan  = (float) ($totalBankPenerimaan - $totalBkuPenerimaan);

            $totalBankPengeluaran    = (float) $rows->sum('bank_pengeluaran');
            $totalBkuPengeluaran     = (float) $rows->sum('bku_pengeluaran');
            $totalSelisihPengeluaran = (float) ($totalBankPengeluaran - $totalBkuPengeluaran);

            $saldoAkhirBank    = (float) ($rows->last()['saldo_bank'] ?? 0);
            $saldoAkhirBku     = (float) ($rows->last()['saldo_bku']  ?? 0);
            $saldoAkhirSelisih = (float) ($saldoAkhirBank - $saldoAkhirBku);
        }

        // 💡 Kirim data ke komponen React via Inertia
        return Inertia::render('Kasda/MonitoringPeriode/Index', [
            'tgl_awal'                => $tgl_awal,
            'tgl_akhir'               => $tgl_akhir,
            'rows'                    => $rows->toArray(),
            'isFiltered'              => $isFiltered,
            'totalBankPenerimaan'     => $totalBankPenerimaan,
            'totalBkuPenerimaan'      => $totalBkuPenerimaan,
            'totalSelisihPenerimaan'  => $totalSelisihPenerimaan,
            'totalBankPengeluaran'    => $totalBankPengeluaran,
            'totalBkuPengeluaran'     => $totalBkuPengeluaran,
            'totalSelisihPengeluaran' => $totalSelisihPengeluaran,
            'saldoAkhirBank'          => $saldoAkhirBank,
            'saldoAkhirBku'           => $saldoAkhirBku,
            'saldoAkhirSelisih'       => $saldoAkhirSelisih,
            'title'                   => 'Monitoring Periode'
        ]);
    }

    public function pencocokanHarian(Request $request)
    {
        $tanggal = $request->input('tanggal');
        $status  = $request->input('status');
        $search  = trim((string) $request->input('search', ''));

        // Tetap dukung tautan lama yang masih membawa parameter deskripsi.
        if ($search === '') {
            $search = trim(implode(' ', array_filter([
                $request->input('desc1'),
                $request->input('desc2'),
            ])));
        }

        $data = collect();
        $total = 0;
        $totalMatched = 0;
        $totalUnmatched = 0;
        $totalNominalMatched = 0;
        $totalNominalUnmatched = 0;
        $isProcessed = false;

        if ($tanggal) {
            $baseQuery = DB::table('monitoring_harian as m')
                ->leftJoin('bku_pemda as b', function ($join) {
                    $join->on('m.source_id', '=', 'b.id')
                        ->where('m.source', '=', 'bku');
                })
                ->leftJoin('mutasi_bank as mb', function ($join) {
                    $join->on('m.source_id', '=', 'mb.id')
                        ->where('m.source', '=', 'bank');
                })
                ->select(
                    'm.id', 
                    'm.source', 
                    'm.source_id',
                    'm.jenis', 
                    'm.nominal', 
                    'm.status', 
                    'm.group_id',
                    DB::raw("CONCAT(m.source, '_', m.source_id) as unique_id"),
                    DB::raw("
                        CASE
                            WHEN m.source='bku'  THEN b.uraian
                            WHEN m.source='bank' THEN mb.description
                        END as keterangan
                    ")
                )
                ->whereDate('m.tanggal', $tanggal);

            // Statistik tab selalu mewakili seluruh transaksi pada tanggal aktif.
            $allData = (clone $baseQuery)->get();
            $isProcessed           = $allData->isNotEmpty();
            $total                 = $allData->count();
            $totalMatched          = $allData->where('status', 'matched')->count();
            $totalUnmatched        = $allData->where('status', 'unmatched')->count();
            $totalNominalMatched   = $allData->where('status', 'matched')->sum('nominal');
            $totalNominalUnmatched = $allData->where('status', 'unmatched')->sum('nominal');

            $query = clone $baseQuery;

            if ($search !== '') {
                $searchLike = '%' . strtolower($search) . '%';
                $query->where(function ($q) use ($searchLike, $search) {
                    $q->whereRaw("LOWER(CASE WHEN m.source='bku' THEN b.uraian WHEN m.source='bank' THEN mb.description END) LIKE ?", [$searchLike]);

                    if (ctype_digit($search)) {
                        $q->orWhere('m.source_id', (int) $search);
                    }
                });
            }

            $data = $query->orderBy('m.group_id', 'asc')->orderBy('m.id', 'asc')->get();

            // Jika sebuah transaksi matched lolos filter, tetap kirim seluruh anggota
            // group agar pasangan BKU dan Bank tidak terpotong di tampilan.
            $matchedGroupIds = $data
                ->where('status', 'matched')
                ->pluck('group_id')
                ->filter()
                ->unique()
                ->values();

            if ($matchedGroupIds->isNotEmpty()) {
                $groupRows = (clone $baseQuery)
                    ->whereIn('m.group_id', $matchedGroupIds)
                    ->get();

                $data = $data
                    ->concat($groupRows)
                    ->unique('id')
                    ->sortBy([
                        ['group_id', 'asc'],
                        ['id', 'asc'],
                    ])
                    ->values();
            }

            // 💡 Statistik dihitung aman di sini tanpa query UNION yang error
        }

        return Inertia::render('Kasda/PencocokanHarian/Index', [
            'tanggal'               => $tanggal,
            'status'                => $status,
            'search'                => $search,
            'data'                  => $data,
            'total'                 => $total,
            'totalMatched'          => $totalMatched,
            'totalUnmatched'        => $totalUnmatched,
            'totalNominalMatched'   => (float) $totalNominalMatched,
            'totalNominalUnmatched' => (float) $totalNominalUnmatched,
            'isProcessed'           => $isProcessed,
        ]);
    }

    /**
     * Batas keamanan agar Fase 2 tidak meledak kombinasinya.
     * Silakan disesuaikan setelah lihat volume data riil kamu.
     */
    private const MAX_KANDIDAT_SUBSET   = 50;   // jika kandidat > ini, lewati auto-match, biarkan manual
    private const MAX_ITEM_PER_KOMBINASI = 8;   // batas jumlah baris bank digabung untuk 1 BKU
    private const MAX_BACKTRACK_ATTEMPTS = 200000; // guard worst-case, bukan target normal

    /**
     * Memproses Otomatisasi Rekonsiliasi (4 Fase)
     */
    public function prosesPencocokanHarian(Request $request)
    {
        $tanggal = $request->input('tanggal');

        if (!$tanggal) {
            return redirect()->back()->with('error', 'Tanggal wajib dipilih');
        }

        // Ambil & insert data mentah DI LUAR transaksi —
        // biar transaksi cuma membungkus write yang sebentar, bukan seluruh proses matching.
        try {
            DB::table('monitoring_harian')->whereDate('tanggal', $tanggal)->delete();
            DB::table('monitoring_groups')->whereDate('tanggal', $tanggal)->delete();

            $bkuRows = DB::table('bku_pemda')->whereDate('tanggal', $tanggal)->get();
            $bkuInsert = [];
            foreach ($bkuRows as $row) {
                $penerimaan  = (float) $row->penerimaan;
                $pengeluaran = (float) $row->pengeluaran;

                if ($penerimaan <= 0 && $pengeluaran <= 0) {
                    continue;
                }

                $jenis   = $penerimaan > 0 ? 'masuk' : 'keluar';
                $nominal = $penerimaan > 0 ? $penerimaan : $pengeluaran;

                $bkuInsert[] = [
                    'tanggal'    => $tanggal,
                    'source'     => 'bku',
                    'source_id'  => $row->id,
                    'jenis'      => $jenis,
                    'nominal'    => $nominal,
                    'status'     => 'unmatched',
                    'created_at' => now(),
                    'updated_at' => now(),
                ];
            }
            if (!empty($bkuInsert)) {
                DB::table('monitoring_harian')->insert($bkuInsert);
            }

            $bankRows = DB::table('mutasi_bank')->whereDate('effective_date', $tanggal)->get();
            $bankInsert = [];
            foreach ($bankRows as $row) {
                $jenis   = $row->credit > 0 ? 'masuk' : 'keluar';
                $nominal = $row->credit > 0 ? $row->credit : $row->debit;

                $bankInsert[] = [
                    'tanggal'    => $tanggal,
                    'source'     => 'bank',
                    'source_id'  => $row->id,
                    'jenis'      => $jenis,
                    'nominal'    => $nominal,
                    'status'     => 'unmatched',
                    'created_at' => now(),
                    'updated_at' => now(),
                ];
            }
            if (!empty($bankInsert)) {
                DB::table('monitoring_harian')->insert($bankInsert);
            }

            // Jalankan Engine Pencocokan Otomatis: Fase 0 -> 1 -> 2
            $this->fase0KategoriMatch($tanggal);
            $this->fase1ExactMatch($tanggal);
            $this->fase2OneToManyMatch($tanggal);

            return redirect()->back()->with('success', 'Rekonsiliasi otomatis (4 fase) berhasil diproses.');

        } catch (\Exception $e) {
            return redirect()->back()->with('error', 'Gagal memproses: ' . $e->getMessage());
        }
    }

    /**
     * Konversi nominal ke satuan sen (integer) untuk perbandingan presisi 2 desimal.
     * Menghindari float epsilon pada perbandingan/backtracking, sekaligus tidak
     * membuang nilai sen seperti (int) round() ke rupiah bulat.
     */
    private function toSen($nominal): int
    {
        return (int) round(((float) $nominal) * 100);
    }

    /**
     * FASE 0 — Rule-based Category Match
     */
    private function fase0KategoriMatch(string $tanggal): void
    {
        $kategoriList = DB::table('pola_kategori_rekon')
            ->where('is_active', true)
            ->get();

        foreach ($kategoriList as $kategori) {
            $keywords = json_decode($kategori->sisi_bank_keywords, true) ?? [];
            if (empty($keywords)) continue;

            $bankRows = DB::table('monitoring_harian as mh')
                ->join('mutasi_bank as mb', 'mh.source_id', '=', 'mb.id')
                ->where('mh.tanggal', $tanggal)
                ->where('mh.source', 'bank')
                ->where('mh.status', 'unmatched')
                ->where(function ($q) use ($keywords) {
                    foreach ($keywords as $kw) {
                        $q->orWhere('mb.description', 'ILIKE', '%' . $kw . '%');
                    }
                })
                ->select('mh.*')
                ->get();

            if ($bankRows->isEmpty()) continue;

            $bkuRow = DB::table('monitoring_harian as mh')
                ->join('bku_pemda as bp', 'mh.source_id', '=', 'bp.id')
                ->where('mh.tanggal', $tanggal)
                ->where('mh.source', 'bku')
                ->where('mh.status', 'unmatched')
                ->where('bp.uraian', 'ILIKE', $kategori->pola_uraian_bku)
                ->when($kategori->nama_skpd, fn ($q) => $q->where('bp.nama_skpd', $kategori->nama_skpd))
                ->select('mh.*')
                ->first();

            if (!$bkuRow) continue;

            $sumBankSen    = $this->toSen($bankRows->sum('nominal'));
            $nominalBkuSen = $this->toSen($bkuRow->nominal);

            if ($sumBankSen !== $nominalBkuSen) {
                continue;
            }

            $groupId = DB::table('monitoring_groups')->insertGetId([
                'tanggal'    => $tanggal,
                'created_at' => now(),
                'updated_at' => now(),
            ]);

            $matchedIds = array_merge([$bkuRow->id], $bankRows->pluck('id')->toArray());

            DB::table('monitoring_harian')
                ->whereIn('id', $matchedIds)
                ->update([
                    'group_id'   => $groupId,
                    'status'     => 'matched',
                    'updated_at' => now(),
                ]);
        }
    }

    /**
     * FASE 1 — Exact Match 1:1
     */
    private function fase1ExactMatch(string $tanggal): void
    {
        $items = DB::table('monitoring_harian')
            ->whereDate('tanggal', $tanggal)
            ->where('status', 'unmatched')
            ->get();

        $bkuByJenis  = $items->where('source', 'bku')->groupBy('jenis');
        $bankByJenis = $items->where('source', 'bank')->groupBy('jenis');

        foreach (['masuk', 'keluar'] as $jenis) {
            $bkuList  = collect($bkuByJenis->get($jenis, []));
            $bankList = collect($bankByJenis->get($jenis, []));
            $usedBankIds = [];

            foreach ($bkuList as $bku) {
                $pair = $bankList->first(function ($b) use ($bku, $usedBankIds) {
                    return $this->toSen($b->nominal) === $this->toSen($bku->nominal)
                        && !in_array($b->id, $usedBankIds);
                });

                if (!$pair) continue;
                $usedBankIds[] = $pair->id;

                $groupId = DB::table('monitoring_groups')->insertGetId([
                    'tanggal'    => $tanggal,
                    'created_at' => now(),
                    'updated_at' => now(),
                ]);

                DB::table('monitoring_harian')
                    ->whereIn('id', [$bku->id, $pair->id])
                    ->update([
                        'group_id'   => $groupId,
                        'status'     => 'matched',
                        'updated_at' => now(),
                    ]);
            }
        }
    }

    /**
     * FASE 2 — Auto Match 1 BKU -> N Bank (Subset Sum, dengan pruning + guard)
     * Bekerja di satuan sen (integer) supaya presisi 2 desimal terjaga.
     */
    private function fase2OneToManyMatch(string $tanggal): void
    {
        foreach (['masuk', 'keluar'] as $jenis) {
            $bkuList = DB::table('monitoring_harian')
                ->whereDate('tanggal', $tanggal)
                ->where('source', 'bku')
                ->where('jenis', $jenis)
                ->where('status', 'unmatched')
                ->orderBy('nominal', 'desc')
                ->get();

            $bankList = DB::table('monitoring_harian')
                ->whereDate('tanggal', $tanggal)
                ->where('source', 'bank')
                ->where('jenis', $jenis)
                ->where('status', 'unmatched')
                ->orderBy('nominal', 'desc')
                ->get()
                ->values();

            if ($bkuList->isEmpty() || $bankList->isEmpty()) continue;

            // Guard: kalau kandidat kebanyakan, jangan dipaksa brute-force.
            // Biarkan semua unmatched di jenis ini untuk manual match.
            if ($bankList->count() > self::MAX_KANDIDAT_SUBSET) {
                continue;
            }

            $usedBankIds = [];

            foreach ($bkuList as $bku) {
                $available = $bankList->filter(function ($b) use ($usedBankIds) {
                    return !in_array($b->id, $usedBankIds);
                })->values();

                if ($available->isEmpty()) break;

                $combo = $this->findSubsetSum($available, $this->toSen($bku->nominal));
                if ($combo === null) continue;

                foreach ($combo as $b) {
                    $usedBankIds[] = $b->id;
                }

                $groupId = DB::table('monitoring_groups')->insertGetId([
                    'tanggal'    => $tanggal,
                    'created_at' => now(),
                    'updated_at' => now(),
                ]);

                $matchedIds = array_merge([$bku->id], collect($combo)->pluck('id')->toArray());

                DB::table('monitoring_harian')
                    ->whereIn('id', $matchedIds)
                    ->update([
                        'group_id'   => $groupId,
                        'status'     => 'matched',
                        'updated_at' => now(),
                    ]);
            }
        }
    }

    private function findSubsetSum($items, int $targetSen): ?array
    {
        // Kerja dengan integer sen penuh, hindari float epsilon
        $arr = $items->values()->map(function ($item) {
            return (object) [
                'id'      => $item->id,
                'nominal' => $this->toSen($item->nominal),
                '_orig'   => $item,
            ];
        })->all();

        // Suffix sum untuk pruning: total sisa nominal (sen) dari index i sampai akhir
        $n = count($arr);
        $suffixSum = array_fill(0, $n + 1, 0);
        for ($i = $n - 1; $i >= 0; $i--) {
            $suffixSum[$i] = $suffixSum[$i + 1] + $arr[$i]->nominal;
        }

        $result  = [];
        $attempts = 0;

        $found = $this->backtrack($arr, $suffixSum, 0, $targetSen, [], $result, $attempts);

        if (!$found) {
            return null;
        }

        // kembalikan objek asli (bukan yang sudah dibungkus)
        return array_map(fn ($x) => $x->_orig, $result);
    }

    private function backtrack(
        array $arr,
        array $suffixSum,
        int $start,
        int $remaining,
        array $current,
        array &$result,
        int &$attempts
    ): bool {
        $attempts++;
        if ($attempts > self::MAX_BACKTRACK_ATTEMPTS) {
            return false; // guard worst-case, biarkan manual match
        }

        if ($remaining === 0) {
            $result = $current;
            return true;
        }

        if ($remaining < 0 || $start >= count($arr)) {
            return false;
        }

        // Pruning: kalau total sisa kandidat dari sini ke akhir sudah tidak cukup, stop cabang ini
        if ($suffixSum[$start] < $remaining) {
            return false;
        }

        // Pruning: batas jumlah item per kombinasi
        if (count($current) >= self::MAX_ITEM_PER_KOMBINASI) {
            return false;
        }

        for ($i = $start; $i < count($arr); $i++) {
            $item = $arr[$i];
            if ($item->nominal > $remaining) continue;

            $current[] = $item;
            if ($this->backtrack($arr, $suffixSum, $i + 1, $remaining - $item->nominal, $current, $result, $attempts)) {
                return true;
            }
            array_pop($current);
        }
        return false;
    }

    /**
     * Memproses Pencocokan Manual (Membawa Kembali Proteksi Bisnis Yang Ketat 🛡️)
     */
    public function manualMatch(Request $request)
    {
        $ids     = $request->input('selected'); // Array ID dari tabel monitoring_harian
        $tanggal = $request->input('tanggal');

        if (!$ids || count($ids) < 2) {
            return redirect()->back()->with('error', 'Pilih minimal 2 transaksi untuk dijodohkan');
        }

        // Ambil data berdasarkan ID perantara m.id
        $rows = DB::table('monitoring_harian')
            ->whereIn('id', $ids)
            ->whereNull('group_id')
            ->get();

        if ($rows->count() != count($ids)) {
            return redirect()->back()->with('error', 'Ada transaksi terpilih yang sudah berpasangan (ter-group)');
        }

        if ($rows->pluck('jenis')->unique()->count() > 1) {
            return redirect()->back()->with('error', 'Jenis transaksi tidak sepadan (Harus masuk semua atau keluar semua)');
        }

        $bkuTotalSen  = $this->toSen($rows->where('source', 'bku')->sum('nominal'));
        $bankTotalSen = $this->toSen($rows->where('source', 'bank')->sum('nominal'));

        if ($bkuTotalSen === 0 || $bankTotalSen === 0) {
            return redirect()->back()->with('error', 'Kombinasi salah. Harus melibatkan minimal 1 data BKU dan 1 data Bank');
        }

        if ($bkuTotalSen !== $bankTotalSen) {
            $selisih = number_format(abs($bkuTotalSen - $bankTotalSen) / 100, 2);
            return redirect()->back()->with('error', 'Nominal tidak seimbang (Unbalanced)! Selisih: ' . $selisih);
        }

        DB::beginTransaction();
        try {
            $groupId = DB::table('monitoring_groups')->insertGetId([
                'tanggal'    => $tanggal,
                'created_at' => now(),
                'updated_at' => now(),
            ]);

            DB::table('monitoring_harian')
                ->whereIn('id', $ids)
                ->update([
                    'group_id'   => $groupId,
                    'status'     => 'matched',
                    'updated_at' => now(),
                ]);

            DB::commit();
            return redirect()->back()->with('success', 'Pencocokan manual berhasil disimpan.');

        } catch (\Exception $e) {
            DB::rollBack();
            return redirect()->back()->with('error', $e->getMessage());
        }
    }

    /**
     * Melepas Ikatan Pasangan / Unmatch Group
     */
    public function unmatchGroup(Request $request)
    {
        $groupId = $request->input('group_id');
        $tanggal = $request->input('tanggal');

        if (!$groupId) {
            return redirect()->back()->with('error', 'Group tidak valid');
        }

        $group = DB::table('monitoring_groups')
            ->where('id', $groupId)
            ->whereDate('tanggal', $tanggal)
            ->first();

        if (!$group) {
            return redirect()->back()->with('error', 'Group tidak ditemukan pada sistem');
        }

        DB::beginTransaction();
        try {
            DB::table('monitoring_harian')
                ->where('group_id', $groupId)
                ->update([
                    'group_id'   => null,
                    'status'     => 'unmatched',
                    'updated_at' => now(),
                ]);

            DB::table('monitoring_groups')->where('id', $groupId)->delete();

            DB::commit();
            return redirect()->back()->with('success', 'Ikatan Group #' . $groupId . ' berhasil dilepas.');

        } catch (\Exception $e) {
            DB::rollBack();
            return redirect()->back()->with('error', $e->getMessage());
        }
    }

    /**
     * Menghapus Seluruh Hasil Rekonsiliasi pada Tanggal Terpilih
     */
    public function deletePencocokanHarian(Request $request)
    {
        $tanggal = $request->input('tanggal');

        if (!$tanggal) {
            return redirect()->back()->with('error', 'Tanggal wajib dipilih');
        }

        DB::beginTransaction();
        try {
            DB::table('monitoring_groups')->whereDate('tanggal', $tanggal)->delete();
            DB::table('monitoring_harian')->whereDate('tanggal', $tanggal)->delete();

            DB::commit();
            return redirect()->back()->with('success', 'Seluruh data pencocokan pada tanggal tersebut berhasil dibersihkan.');

        } catch (\Exception $e) {
            DB::rollBack();
            return redirect()->back()->with('error', $e->getMessage());
        }
    }

    public function rekonIndex()
    {
        // Mengambil data esensial rekon bank
        $data = RekonBank::select(['id', 'periode_rekon', 'saldo_buku_akhir', 'saldo_bank_akhir', 'selisih'])
            ->orderBy('periode_rekon', 'desc')
            ->get();

        // PERBAIKAN: Ubah 'data' => $data menjadi 'list' => $data
        return Inertia::render('Kasda/Rekonsiliasi/Index', [
            'title' => 'Daftar Rekonsiliasi Bank',
            'list'  => $data // <-- Mengikuti ekspektasi prop 'list' di Index.jsx Anda
        ]);
    }

    public function deletePencocokanPeriode(Request $request)
    {
        $request->validate([
            'bulan' => 'required|integer|min:1|max:12',
            'tahun' => 'required|integer',
        ]);

        $bulan = $request->input('bulan');
        $tahun = $request->input('tahun');

        DB::beginTransaction();
        try {
            DB::table('monitoring_groups')
                ->whereYear('tanggal', $tahun)
                ->whereMonth('tanggal', $bulan)
                ->delete();

            DB::table('monitoring_harian')
                ->whereYear('tanggal', $tahun)
                ->whereMonth('tanggal', $bulan)
                ->delete();

            DB::commit();
            return response()->json([
                'message' => 'Seluruh data pencocokan pada periode tersebut berhasil dihapus. Silakan lanjutkan proses import.',
            ]);

        } catch (\Exception $e) {
            DB::rollBack();
            return response()->json([
                'message' => 'Gagal menghapus data pencocokan periode: ' . $e->getMessage(),
            ], 500);
        }
    }

    public function rekonCreate()
    {
        return Inertia::render('Kasda/Rekonsiliasi/Create', [
            'title' => 'Tambah Rekon Bank'
        ]);
    }

    public function rekonShow($id)
    {
        $rekon = RekonBank::with('details')->findOrFail($id);
        
        return Inertia::render('Kasda/Rekonsiliasi/Detail', [
            'title' => 'Detail Berita Acara Rekon',
            'rekon' => $rekon
        ]);
    }

    public function rekonStore(Request $request)
    {
        // 1. Validasi Input (Inertia otomatis menangkap error & mengirimnya ke component React)
        $request->validate([
            'periode_rekon' => 'required|date',
            'saldo_buku_akhir' => 'required|numeric',
            'saldo_bank_akhir' => 'required|numeric',
            'selisih' => 'required|numeric',
            'details' => 'array',
            'details.*.keterangan_item' => 'required|string',
            'details.*.nominal' => 'required|numeric',
        ]);

        $totalPenjelasan = collect($request->input('details', []))
            ->sum(fn ($item) => (float) ($item['nominal'] ?? 0));

        if ($this->toSen($totalPenjelasan) !== $this->toSen($request->selisih)) {
            return redirect()->back()
                ->withErrors([
                    'details' => 'Total penjelasan harus sama dengan nilai selisih, termasuk tanda positif atau negatif.',
                ])
                ->withInput();
        }

        try {
            DB::beginTransaction();

            // 2. Simpan Header
            $rekon = RekonBank::create([
                'periode_rekon'    => $request->periode_rekon,
                'saldo_buku_akhir' => $request->saldo_buku_akhir,
                'saldo_bank_akhir' => $request->saldo_bank_akhir,
                'selisih'          => $request->selisih,
            ]);

            // 3. Simpan Detail
            if ($request->has('details')) {
                foreach ($request->details as $item) {
                    $rekon->details()->create([
                        'keterangan_item'   => $item['keterangan_item'],
                        'nomor_referensi'   => $item['nomor_referensi'] ?? null,
                        'tanggal_transaksi' => $item['tanggal_transaksi'] ?? $request->periode_rekon,
                        'nominal'           => $item['nominal'],
                        'jenis_selisih'     => $item['jenis_selisih'] ?? 'tambah',
                    ]);
                }
            }

            DB::commit();

            // Inertia membutuhkan redirect full, flashes otomatis terbawa di `usePage().props.flash`
            return redirect()->route('kasda.rekon.index')
                ->with('success', 'Berita Acara Rekonsiliasi berhasil disimpan!');

        } catch (\Exception $e) {
            DB::rollback();

            // CATATAN: Jangan return response()->json() saat form submission via Inertia.
            // Gunakan redirect back dengan session error agar bisa dibaca di React.
            return redirect()->back()->with('error', 'Gagal simpan: ' . $e->getMessage());
        }
    }

    public function rekonDestroy($id)
    {
        try {
            $rekon = RekonBank::findOrFail($id);
            $rekon->details()->delete();
            $rekon->delete();

            return redirect()->route('kasda.rekon.index')
                ->with('success', 'Data Rekon berhasil dihapus!');
        } catch (\Exception $e) {
            return redirect()->back()->with('error', 'Gagal menghapus data: ' . $e->getMessage());
        }
    }

    public function getDataPeriode(Request $request)
    {
        $request->validate(['tanggal' => 'required|date']); // Proteksi input tanggal

        $tanggal = $request->tanggal; 
        $tahun = date('Y', strtotime($tanggal));

        // PERBAIKAN: Huruf besar pada \App\... agar tidak memicu bug Case-Sensitive di Linux
        return (new \App\Services\RekonService())->getSaldoKumulatif($tanggal, $tahun);
    }

    // public function exportPdf($id)
    // {
    //     $rekon = RekonBank::with('details')->findOrFail($id);
    //     $periodeNama = \Carbon\Carbon::parse($rekon->periode_rekon)->translatedFormat('F Y');

    //     $pdf = Pdf::loadView('rekon.pdf', compact('rekon', 'periodeNama'))
    //             ->setPaper('a4', 'portrait');

    //     // Untuk download/stream file (PDF/Excel), gunakan return standar Laravel (bukan Inertia)
    //     return $pdf->stream("Berita_Acara_Rekon_{$rekon->periode_rekon}.pdf");
    // }

    public function rekonPrint($id)
    {
        \Carbon\Carbon::setLocale('id');
        $rekon = RekonBank::with('details')->findOrFail($id);
        
        $bud = DB::table('tabel_bud')
                ->where('tahun', \Carbon\Carbon::parse($rekon->periode_rekon)->year)
                ->first();

        $pdf = Pdf::loadView('kasda.print', compact('rekon', 'bud'))
                ->setPaper('a4', 'portrait');

        return $pdf->stream('Berita_Acara_Rekon_'.$rekon->periode_rekon.'.pdf');
    }

    /**
     * Menampilkan transaksi hasil pencocokan harian yang belum memiliki pasangan.
     */
    public function transaksiBelumCocok(Request $request)
    {
        $tahun = $request->input('tahun', session('tahun') ?? now()->year);
        $bulan = $request->input('bulan', '');

        if (!$request->boolean('applied')) {
            return Inertia::render('Kasda/TransaksiBelumCocok/Index', [
                'title' => 'Transaksi Belum Cocok',
                'bankData' => [],
                'bkuData' => [],
                'summary' => [
                    'bank' => ['jumlah' => 0, 'penerimaan' => 0, 'pengeluaran' => 0],
                    'bku' => ['jumlah' => 0, 'penerimaan' => 0, 'pengeluaran' => 0],
                    'selisih' => ['penerimaan' => 0, 'pengeluaran' => 0],
                ],
                'filters' => ['bulan' => '', 'tahun' => (string) $tahun],
                'isApplied' => false,
                'hasProcessedData' => false,
            ]);
        }

        $processedQuery = DB::table('monitoring_harian')
            ->whereYear('tanggal', $tahun);

        if ($bulan) {
            $processedQuery->whereMonth('tanggal', $bulan);
        }

        $hasProcessedData = $processedQuery->exists();

        // ── Sisi Bank ──────────────────────────────────────────
        $bankQuery = DB::table('monitoring_harian as mh')
            ->join('mutasi_bank as mb', 'mh.source_id', '=', 'mb.id')
            ->where('mh.status', 'unmatched')
            ->where('mh.source', 'bank')
            ->select([
                'mh.id',
                'mh.tanggal',
                'mh.jenis',
                'mb.description as keterangan',
                'mb.credit as penerimaan',
                'mb.debit as pengeluaran',
            ]);

        // ── Sisi BKU ───────────────────────────────────────────
        $bkuQuery = DB::table('monitoring_harian as mh')
            ->join('bku_pemda as bp', 'mh.source_id', '=', 'bp.id')
            ->where('mh.status', 'unmatched')
            ->where('mh.source', 'bku')
            ->select([
                'mh.id',
                'mh.tanggal',
                'mh.jenis',
                'bp.nama_skpd as skpd',
                'bp.uraian as keterangan',
                'bp.penerimaan as penerimaan',
                'bp.pengeluaran as pengeluaran',
            ]);
        
        // ── Filter tahun & bulan ───────────────────────────────
        foreach ([$bankQuery, $bkuQuery] as $q) {
            $q->whereYear('mh.tanggal', $tahun);
            if ($bulan) {
                $q->whereMonth('mh.tanggal', $bulan);
            }
        }

        // ── Filter SKPD (hanya BKU) ────────────────────────────
        $bankData = $bankQuery->orderBy('mh.tanggal')->orderBy('mh.id')->get();
        $bkuData  = $bkuQuery->orderBy('mh.tanggal')->orderBy('mh.id')->get();

        // ── Summary ────────────────────────────────────────────
        $summary = [
            'bank' => [
                'jumlah'      => $bankData->count(),
                'penerimaan'  => $bankData->sum('penerimaan'),
                'pengeluaran' => $bankData->sum('pengeluaran'),
            ],
            'bku' => [
                'jumlah'      => $bkuData->count(),
                'penerimaan'  => $bkuData->sum('penerimaan'),
                'pengeluaran' => $bkuData->sum('pengeluaran'),
            ],
        ];

        $summary['selisih'] = [
            'penerimaan'  => $summary['bank']['penerimaan']  - $summary['bku']['penerimaan'],
            'pengeluaran' => $summary['bank']['pengeluaran'] - $summary['bku']['pengeluaran'],
        ];

        return Inertia::render('Kasda/TransaksiBelumCocok/Index', [
            'title' => 'Transaksi Belum Cocok',
            'bankData' => $bankData,
            'bkuData'  => $bkuData,
            'summary'  => $summary,
            'filters'  => [
                'bulan' => (string) $bulan,
                'tahun' => (string) $tahun,
            ],
            'isApplied' => true,
            'hasProcessedData' => $hasProcessedData,
        ]);
    }
}
