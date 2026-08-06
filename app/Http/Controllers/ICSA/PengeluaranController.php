<?php

namespace App\Http\Controllers\ICSA;

use App\Exports\RekapRekonExport;
use App\Exports\RekonKasExport;
use App\Http\Controllers\Controller;
use App\Models\RekonKas;
use App\Models\Skpd;
use App\Services\RekonService;
use App\Support\SkpdAccess;
use App\Support\RekonStatus;
use Barryvdh\DomPDF\Facade\Pdf;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\DB;
use Inertia\Inertia;
use Maatwebsite\Excel\Facades\Excel;

class PengeluaranController extends Controller
{
    protected $rekonService;

    // 3. Buat Constructor untuk meng-inject RekonService ke dalam Controller
    public function __construct(RekonService $rekonService)
    {
        $this->rekonService = $rekonService;
    }

    public function index(Request $request)
    {
        $tahun = session('tahun', 2026);
        $allowedSkpdCodes = SkpdAccess::codes($request->user());

        // Ambil daftar SKPD untuk dropdown filter
        $skpdQuery = DB::table('tabel_skpd')->where('tahun', $tahun);
        $listSkpd = SkpdAccess::apply($skpdQuery, $request->user())
            ->orderBy('kode_skpd')
            ->get();
        $selectedSkpd = $request->kode_skpd;

        if ($selectedSkpd) {
            SkpdAccess::authorize($request->user(), $selectedSkpd);
        }

        $list = $this->rekonService->getDataIndex(
            $tahun,
            $selectedSkpd,
            $allowedSkpdCodes?->all(),
        );

        return Inertia::render('Icsa/Pengeluaran/Rekonsiliasi/Index', [
            'title' => 'Rekon Kas',
            'listSkpd' => $listSkpd,
            'selectedSkpd' => $selectedSkpd,
            'list' => $list,
            'tahun' => $tahun,
        ]);
    }

    public function scanBa(Request $request)
    {
        $validated = $request->validate([
            'skpd' => ['required', 'string', 'max:255'],
            'bulan' => ['required', 'integer', 'between:1,12'],
        ]);

        $skpdQuery = DB::table('tabel_skpd')
            ->where('tahun', session('tahun'))
            ->where('skpd', $validated['skpd']);
        $skpdRecord = SkpdAccess::apply($skpdQuery, $request->user())->first();

        abort_unless($skpdRecord, 403);

        $skpd = $skpdRecord->skpd;
        $bulan = $validated['bulan'];

        $filename = "{$skpd} {$bulan}.pdf";
        $path = storage_path("app/public/scan ba kas/{$filename}");

        if (! file_exists($path)) {
            return response()->json(['exists' => false], 404);
        }

        return response()->file($path, [
            'Content-Type' => 'application/pdf',
            'Content-Disposition' => "inline; filename=\"{$filename}\"",
        ]);
    }

    /* ================= CREATE (Inertia) ================= */
    public function create(Request $request)
    {
        $tahun = session('tahun');

        $listSkpd = Skpd::where('tahun', $tahun)
            ->orderBy('skpd')
            ->get(['kode_skpd', 'skpd']); // Ambil field yang diperlukan saja

        return Inertia::render('Icsa/Pengeluaran/Rekonsiliasi/Create', [
            'title' => 'Tambah Rekonsiliasi',
            'listSkpd' => $listSkpd,
            'selectedSkpd' => $request->query('kode_skpd'), // Menangkap parameter query jika ada
        ]);
    }

    /* ================= STORE HEADER (Inertia) ================= */
    public function store(Request $request)
    {
        $request->validate([
            'kode_skpd' => 'required|string',
            'bulan' => 'required|numeric|min:1|max:12',
        ]);

        $tahun = session('tahun');
        $bulan = (string) $request->bulan;
        $kodeSkpd = $request->kode_skpd;

        // Cek Duplikat Rekon
        $sudahAda = RekonKas::where('tahun', $tahun)
            ->where('bulan', $bulan)
            ->where('kode_skpd', $kodeSkpd)
            ->exists();

        if ($sudahAda) {
            return back()->withErrors([
                'bulan' => 'Rekonsiliasi untuk SKPD dan bulan tersebut sudah ada.',
            ]);
        }

        try {
            $no_rekon = null;

            DB::transaction(function () use ($tahun, $bulan, $kodeSkpd, &$no_rekon) {
                // Generate nomor rekon sesuai logic bawaan app lama
                $no_rekon = $this->generateNoRekon($tahun, $kodeSkpd, $bulan);

                RekonKas::create([
                    'no_rekon' => $no_rekon,
                    'tahun' => $tahun,
                    'bulan' => $bulan,
                    'kode_skpd' => $kodeSkpd,
                    'tanggal_rekon' => now()->toDateString(),
                    'created' => Auth::user()->name ?? 'system',
                    'date_created' => now(),
                ]);
            });

            // Redirect ke halaman edit bawaan Inertia dengan membawa flash session success
            return redirect()
                ->route('icsa.pengeluaran.rekonsiliasi.edit', $no_rekon)
                ->with('success', 'Rekonsiliasi berhasil dibuat. Silakan lengkapi data kas.');

        } catch (\Exception $e) {
            return back()->withErrors([
                'error' => 'Gagal membuat rekonsiliasi: '.$e->getMessage(),
            ]);
        }
    }

    /* ================= GENERATOR NO REKON (Tetap Dipertahankan) ================= */
    private function generateNoRekon($tahun, $kodeSkpd, $bulan)
    {
        $last = RekonKas::where('tahun', $tahun)
            ->where('kode_skpd', $kodeSkpd)
            ->where('bulan', $bulan)
            ->orderByDesc('no_rekon')
            ->first();

        $urut = 1;
        if ($last) {
            $urut = (int) substr($last->no_rekon, -4) + 1;
        }

        return sprintf('REKON/%s/%s/%s/%04d', $tahun, $kodeSkpd, $bulan, $urut);
    }

    public function destroy($noRekon)
    {
        if (! $noRekon) {
            return back()->with('error', 'No Rekon tidak valid');
        }

        /* ================= HEADER REKON ================= */
        $rekon = DB::table('tabel_rekon')
            ->where('no_rekon', $noRekon)
            ->first();

        if (! $rekon) {
            return back()->with('error', 'Data rekonsiliasi tidak ditemukan');
        }

        $tahun = (int) $rekon->tahun;
        $bulan = (int) $rekon->bulan;
        $kodeSkpd = $rekon->kode_skpd;

        /* ================= LOCK BULAN BERANTAI ================= */
        $cekBulanSetelahnya = DB::table('tabel_rekon')
            ->where('tahun', $tahun)
            ->where('kode_skpd', $kodeSkpd)
            ->where('bulan', '>', $bulan)
            ->exists();

        if ($cekBulanSetelahnya) {
            return redirect()
                ->route('icsa.pengeluaran.rekonsiliasi.index', ['kode_skpd' => $kodeSkpd])
                ->with('error', 'Rekonsiliasi tidak dapat dihapus karena bulan setelahnya masih ada');
        }

        /* ================= DELETE TRANSACTION ================= */
        try {

            DB::transaction(function () use ($noRekon) {

                $tables = [
                    'tabel_sp2d',
                    'tabel_spj',
                    'tabel_sts',
                    'tabel_bku',
                    'tabel_posisi_kas',
                    'tabel_selisih',
                    'tabel_rekon', // terakhir header
                ];

                foreach ($tables as $tbl) {
                    DB::table($tbl)
                        ->where('no_rekon', $noRekon)
                        ->delete();
                }

            });

            return redirect()
                ->route('icsa.pengeluaran.rekonsiliasi.index', ['kode_skpd' => $kodeSkpd])
                ->with('success', 'Rekonsiliasi berhasil dihapus');

        } catch (\Throwable $e) {

            return redirect()
                ->route('icsa.pengeluaran.rekonsiliasi.index', ['kode_skpd' => $kodeSkpd])
                ->with('error', 'Gagal menghapus rekonsiliasi');
        }
    }

    /* ================= EDIT / PROSES REKONSILIASI (Inertia) ================= */
    public function edit($noRekon)
    {
        // Decode kembali jika nomor rekon dikirim via URL dengan slash ter-encode
        $noRekon = urldecode($noRekon);

        // Lakukan LEFT JOIN ke tabel master SKPD untuk mengambil kolom nama_skpd
        $rekon = DB::table('tabel_rekon')
            ->leftJoin('tabel_skpd', 'tabel_rekon.kode_skpd', '=', 'tabel_skpd.kode_skpd') // 💡 Sesuaikan 'tabel_skpd' dengan nama tabel master SKPD Anda
            ->where('tabel_rekon.no_rekon', $noRekon)
            ->select('tabel_rekon.*', 'tabel_skpd.skpd') // 💡 Mengambil semua data rekon + nama_skpd
            ->first();

        if (! $rekon) {
            return redirect()->route('icsa.pengeluaran.rekonsiliasi.index')
                ->with('error', 'Data rekonsiliasi tidak ditemukan.');
        }

        // Ambil seluruh paket data komplit dari Service
        $paketData = $this->rekonService->getDetailTransaksiRekon(
            $rekon->no_rekon,
            $rekon->tahun,
            $rekon->bulan,
            $rekon->kode_skpd
        );

        return Inertia::render('Icsa/Pengeluaran/Rekonsiliasi/Edit', [
            'title' => 'Proses Rekon Kas',
            'rekon' => $rekon,
            'dataRekon' => $paketData, // Data terstruktur dari Service siap pakai di frontend!
        ]);
    }

    public function update(Request $request, $no_rekon)
    {
        // Decode kembali nomor rekon jika terdapat karakter '/' ter-encode dari URL
        $noRekon = urldecode($no_rekon);

        try {
            // 💡 Ambil kode_skpd dari tabel sebelum/saat proses update untuk dipakai di redirect rute index
            $kodeSkpd = DB::table('tabel_rekon')->where('no_rekon', $noRekon)->value('kode_skpd');

            // Panggil fungsi pemrosesan update dari rekonService
            $this->rekonService->updateRekonKas($noRekon, $request->all());

            // 💡 Kirim parameter 'kode_skpd' ke route index agar dropdown otomatis ter-filter
            return redirect()
                ->route('icsa.pengeluaran.rekonsiliasi.index', ['kode_skpd' => $kodeSkpd])
                ->with('success', 'Data Rekonsiliasi Kas berhasil diperbarui.');

        } catch (\Exception $e) {
            // Jika gagal, kembalikan ke halaman sebelumnya dan tampilkan pesan error
            return back()->with('error', 'Gagal memperbarui data: '.$e->getMessage());
        }
    }

    public function cetak($no_rekon)
    {
        // Decode jika nomor rekon dikirim via URL dengan slash ter-encode
        $noRekon = urldecode($no_rekon);
        $this->authorizeRekonAccess($noRekon);

        $data = $this->rekonService->getCetakData($noRekon);
        $data['title'] = 'Cetak Rekonsiliasi';

        // Bersihkan nomor rekon dari karakter slash untuk nama file download
        $safeFileName = str_replace(['/', '\\'], '-', $noRekon);

        // Load view blade konvensional (bukan Inertia::render)
        $pdf = Pdf::loadView('icsa.pengeluaran.rekonsiliasi.cetak-pdf', $data)
            ->setPaper([0, 0, 609.4488, 935.433], 'portrait'); // Ukuran F4 Presisi

        return $pdf->stream('Rekon_'.$safeFileName.'.pdf');
    }

    public function excel($no_rekon)
    {
        $noRekon = urldecode($no_rekon);
        $this->authorizeRekonAccess($noRekon);

        // 💡 Ambil data yang sama persis dengan fungsi cetak PDF
        $data = $this->rekonService->getCetakData($noRekon);

        $safeFileName = str_replace(['/', '\\'], '-', $noRekon);

        // Download langsung sebagai file .xlsx
        return Excel::download(
            new RekonKasExport($data),
            'Rekon_'.$safeFileName.'.xlsx'
        );
    }

    // 1. FUNGSI UNTUK TAMPILKAN DI REACT SCREEN
    public function rekapdata(Request $request)
    {
        $tahun = session('tahun');
        $bulan = $request->bulan ? (int) $request->bulan : null;

        // Ambil data dari fungsi private bersama
        $rekap = $this->getSharedRekapData($bulan, $tahun);

        return Inertia::render('Icsa/Pengeluaran/RekapData/Index', [
            'title' => 'Rekap Kas',
            'dataRealisasi' => $rekap['dataRealisasi'],
            'grandTotal' => $rekap['grandTotal'],
            'bulanNama' => $this->bulanNama(),
            'filters' => [
                'bulan' => $request->bulan ?? '',
            ],
        ]);
    }

    // 2. FUNGSI KHUSUS DOWNLOAD EXCEL (Panggil data yang sama)
    public function exportExcel(Request $request)
    {
        $tahun = session('tahun');
        $bulan = (int) $request->bulan;

        // Panggil fungsi private yang sama persis, data dijamin sinkron!
        $rekap = $this->getSharedRekapData($bulan, $tahun);

        // TIPS: Konversi grandTotal menjadi object (object) agar di template blade
        // bisa dipanggil dengan panah ($grandTotal->total_sp2d) tanpa error
        $grandTotalObject = $rekap['grandTotal'] ? (object) $rekap['grandTotal'] : null;

        return Excel::download(
            new RekapRekonExport($rekap['dataRealisasi'], $grandTotalObject),
            'Rekap_Realisasi_Bulan_'.$bulan.'.xlsx'
        );
    }

    // 3. FUNGSI PRIVATE (Pusat Logika Pengumpulan Data)
    private function getSharedRekapData($bulan, $tahun)
    {
        $dataRealisasi = [];
        $grandTotal = null;

        if ($bulan) {
            $bulanStr = (string) $bulan;

            // Tarik summary data gabungan untuk menghemat load
            $sp2d = DB::table('tabel_sp2d')->where('tahun', $tahun)->where('bulan', $bulanStr)->selectRaw('kode_skpd, SUM(nilai_ls) as ls, SUM(nilai_upgu) as up_gu, SUM(nilai_tu) as tu, SUM(nilai_gukkpd) as gukkpd')->groupBy('kode_skpd')->get()->keyBy('kode_skpd');
            $spj = DB::table('tabel_spj')->where('tahun', $tahun)->where('bulan', $bulanStr)->selectRaw('kode_skpd, SUM(nilai_ls) as spj_ls, SUM(nilai_upgu) as spj_up_gu, SUM(nilai_tu) as spj_tu, SUM(nilai_gukkpd) as spj_gukkpd')->groupBy('kode_skpd')->get()->keyBy('kode_skpd');
            $sts = DB::table('tabel_sts')->where('tahun', $tahun)->where('bulan', $bulanStr)->selectRaw('kode_skpd, SUM(sts_upgu) as sts_up_gu, SUM(sts_tu) as sts_tu, SUM(cp_ls) as cp_ls, SUM(cp_upgu) as cp_up_gu, SUM(cp_tu) as cp_tu')->groupBy('kode_skpd')->get()->keyBy('kode_skpd');
            $kasReal = DB::table('tabel_posisi_kas')->where('tahun', $tahun)->where('bulan', $bulanStr)->selectRaw('kode_skpd, SUM(kas_di_bank) as bank, SUM(kas_tunai) as tunai')->groupBy('kode_skpd')->get()->keyBy('kode_skpd');
            $bku = DB::table('tabel_bku')->where('tahun', $tahun)->where('bulan', $bulanStr)->selectRaw('kode_skpd, SUM(penerimaan - pengeluaran) as saldo')->groupBy('kode_skpd')->pluck('saldo', 'kode_skpd');

            // Mengambil nomor rekon dan keterangan selisih untuk penentuan status
            $rekonRef = DB::table('tabel_rekon')->where('tahun', $tahun)->where('bulan', $bulanStr)->get()->keyBy('kode_skpd');
            $selisihRows = DB::table('tabel_selisih')->where('tahun', $tahun)->where('bulan', $bulanStr)->get()->keyBy('kode_skpd');

            // 💡 OPTIMASI: Panggil kalkulasi saldo awal massal ke Service (Hanya 1x query di luar loop)
            $saldoAwalMassal = $this->rekonService->hitungSaldoAwalMassal($tahun, $bulan);
            $saldoAwalBkuMassal = $this->rekonService->hitungSaldoAwalBkuMassal($tahun, $bulan);

            $skpdQuery = DB::table('tabel_skpd')->where('tahun', $tahun);
            $skpds = SkpdAccess::apply($skpdQuery, request()->user())
                ->orderBy('kode_skpd')
                ->get();

            foreach ($skpds as $skpd) {
                $k = $skpd->kode_skpd;
                $hasRekon = isset($rekonRef[$k]);

                $p_ls = (float) ($sp2d[$k]->ls ?? 0);
                $p_up = (float) ($sp2d[$k]->up_gu ?? 0);
                $p_tu = (float) ($sp2d[$k]->tu ?? 0);
                $p_guk = (float) ($sp2d[$k]->gukkpd ?? 0);
                $q_ls = (float) ($spj[$k]->spj_ls ?? 0);
                $q_up = (float) ($spj[$k]->spj_up_gu ?? 0);
                $q_tu = (float) ($spj[$k]->spj_tu ?? 0);
                $q_guk = (float) ($spj[$k]->spj_gukkpd ?? 0);
                $s_up = (float) ($sts[$k]->sts_up_gu ?? 0);
                $s_tu = (float) ($sts[$k]->sts_tu ?? 0);
                $s_cl = (float) ($sts[$k]->cp_ls ?? 0);
                $s_cu = (float) ($sts[$k]->cp_up_gu ?? 0);
                $s_ct = (float) ($sts[$k]->cp_tu ?? 0);

                $total_sp2d = $p_ls + $p_up + $p_tu + $p_guk;
                $total_spj = $q_ls + $q_up + $q_tu + $q_guk;
                $total_sts = $s_up + $s_tu + $s_cl + $s_cu + $s_ct;

                $k_bank = (float) ($kasReal[$k]->bank ?? 0);
                $k_tunai = (float) ($kasReal[$k]->tunai ?? 0);
                $total_real = $k_bank + $k_tunai;

                // 💡 OPTIMASI: Mengambil data dari memori array hasil bulk-fetch, bebas dari query rekursif lambat
                $saldo_awal = $hasRekon ? ($saldoAwalMassal[$k] ?? 0) : 0;
                $kas_sipd = $hasRekon ? ($saldo_awal + $total_sp2d - $total_spj - $total_sts) : 0;
                $selisih = $hasRekon ? (float) number_format($kas_sipd - $total_real, 2, '.', '') : 0;
                $kas_bku = $hasRekon ? (($saldoAwalBkuMassal[$k] ?? 0) + (float) ($bku[$k] ?? 0)) : 0;
                $selisih_bku = $hasRekon ? round($kas_sipd - $kas_bku, 2) : 0;

                // Penentuan Status Rekon
                $selisihRow = $selisihRows[$k] ?? null;
                $status = RekonStatus::determine(
                    $selisihRow !== null,
                    $selisih_bku,
                    $selisihRow?->keterangan_bku,
                    $selisih,
                    $selisihRow?->keterangan_posisi_kas,
                );

                $dataRealisasi[] = (object) [
                    'kode_skpd' => $k,
                    'nama_skpd' => $skpd->skpd,
                    'sp2d_ls' => $p_ls, 'sp2d_upgu' => $p_up, 'sp2d_tu' => $p_tu, 'sp2d_gukkpd' => $p_guk, 'total_sp2d' => $total_sp2d,
                    'spj_ls' => $q_ls, 'spj_upgu' => $q_up, 'spj_tu' => $q_tu, 'spj_gukkpd' => $q_guk, 'total_spj' => $total_spj,
                    'sts_up_gu' => $s_up, 'sts_tu' => $s_tu, 'cp_ls' => $s_cl, 'cp_up_gu' => $s_cu, 'cp_tu' => $s_ct, 'total_sts' => $total_sts,
                    'kas_sipd' => $kas_sipd,
                    'kas_bku' => $kas_bku,
                    'selisih_bku' => $selisih_bku,
                    'kas_bank' => $k_bank,
                    'kas_tunai' => $k_tunai,
                    'selisih' => $selisih,
                    'status_rekon' => $status, // Property status rekon yang ditambahkan
                ];
            }

            $collection = collect($dataRealisasi);
            $grandTotal = [
                'total_sp2d' => $collection->sum('total_sp2d'),
                'total_spj' => $collection->sum('total_spj'),
                'total_sts' => $collection->sum('total_sts'),
                'kas_sipd' => $collection->sum('kas_sipd'),
                'kas_bank' => $collection->sum('kas_bank'),
                'kas_tunai' => $collection->sum('kas_tunai'),
                'selisih' => $collection->sum('selisih'),
            ];
        }

        return compact('dataRealisasi', 'grandTotal');
    }

    private function bulanNama()
    {
        return [
            1 => 'Januari', 2 => 'Februari', 3 => 'Maret', 4 => 'April',
            5 => 'Mei', 6 => 'Juni', 7 => 'Juli', 8 => 'Agustus',
            9 => 'September', 10 => 'Oktober', 11 => 'November', 12 => 'Desember',
        ];
    }

    public function rekapmonitoring(Request $request)
    {
        $tahun = session('tahun');
        $kodeSkpd = $request->kode_skpd;
        $bulan = $request->bulan;
        $statusFilter = $request->status ?? 'all';

        if ($kodeSkpd && $kodeSkpd !== 'all') {
            SkpdAccess::authorize($request->user(), $kodeSkpd);
        }

        $dataRekap = collect();

        $summary = [
            'total' => 0,
            'sudah' => 0,
            'proses' => 0,
            'belum' => 0,
        ];

        if (! empty($bulan)) {
            $bulanStr = (string) $bulan;
            $querySkpd = DB::table('tabel_skpd')->where('tahun', $tahun);
            SkpdAccess::apply($querySkpd, $request->user());
            if ($kodeSkpd && $kodeSkpd !== 'all') {
                $querySkpd->where('kode_skpd', $kodeSkpd);
            }
            $listTampil = $querySkpd->orderBy('kode_skpd')->get();

            // Query Agregat massal
            $sp2d = DB::table('tabel_sp2d')->where('tahun', $tahun)->where('bulan', $bulanStr)->selectRaw('kode_skpd, SUM(nilai_ls + nilai_upgu + nilai_tu + nilai_gukkpd) as total')->groupBy('kode_skpd')->pluck('total', 'kode_skpd');
            $spj = DB::table('tabel_spj')->where('tahun', $tahun)->where('bulan', $bulanStr)->selectRaw('kode_skpd, SUM(nilai_ls + nilai_upgu + nilai_tu + nilai_gukkpd) as total')->groupBy('kode_skpd')->pluck('total', 'kode_skpd');
            $sts = DB::table('tabel_sts')->where('tahun', $tahun)->where('bulan', $bulanStr)->selectRaw('kode_skpd, SUM(sts_upgu + sts_tu + cp_ls + cp_upgu + cp_tu) as total')->groupBy('kode_skpd')->pluck('total', 'kode_skpd');
            $kasReal = DB::table('tabel_posisi_kas')->where('tahun', $tahun)->where('bulan', $bulanStr)->selectRaw('kode_skpd, SUM(kas_di_bank + kas_tunai) as total')->groupBy('kode_skpd')->pluck('total', 'kode_skpd');
            $bku = DB::table('tabel_bku')->where('tahun', $tahun)->where('bulan', $bulanStr)->selectRaw('kode_skpd, SUM(penerimaan - pengeluaran) as saldo')->groupBy('kode_skpd')->pluck('saldo', 'kode_skpd');

            $rekonRef = DB::table('tabel_rekon')->where('tahun', $tahun)->where('bulan', $bulanStr)->pluck('no_rekon', 'kode_skpd');
            $selisihRows = DB::table('tabel_selisih')->where('tahun', $tahun)->where('bulan', $bulanStr)->get()->keyBy('kode_skpd');

            // 💡 OPTIMASI: Panggil kalkulasi saldo awal massal ke Service (Hanya 1x query di luar map loop)
            $saldoAwalMassal = $this->rekonService->hitungSaldoAwalMassal($tahun, $bulan);
            $saldoAwalBkuMassal = $this->rekonService->hitungSaldoAwalBkuMassal($tahun, $bulan);

            $dataRekap = $listTampil->map(function ($s) use ($bulan, $sp2d, $spj, $sts, $kasReal, $bku, $rekonRef, $selisihRows, $saldoAwalMassal, $saldoAwalBkuMassal) {
                $noRekon = $rekonRef[$s->kode_skpd] ?? null;

                // 💡 OPTIMASI: Mengambil data dari memori array hasil bulk-fetch, bebas dari query rekursif lambat
                $saldoAwal = $noRekon ? ($saldoAwalMassal[$s->kode_skpd] ?? 0) : 0;

                $kasSipd = $saldoAwal + (float) ($sp2d[$s->kode_skpd] ?? 0) - (float) ($spj[$s->kode_skpd] ?? 0) - (float) ($sts[$s->kode_skpd] ?? 0);
                $totalKasReal = (float) ($kasReal[$s->kode_skpd] ?? 0);
                $selisih = (float) number_format($kasSipd - $totalKasReal, 2, '.', '');
                $kasBku = $noRekon ? (($saldoAwalBkuMassal[$s->kode_skpd] ?? 0) + (float) ($bku[$s->kode_skpd] ?? 0)) : 0;
                $selisihBku = $noRekon ? round($kasSipd - $kasBku, 2) : 0;

                $selisihRow = $selisihRows[$s->kode_skpd] ?? null;
                $status = RekonStatus::determine(
                    $selisihRow !== null,
                    $selisihBku,
                    $selisihRow?->keterangan_bku,
                    $selisih,
                    $selisihRow?->keterangan_posisi_kas,
                );

                return [
                    'kode_skpd' => $s->kode_skpd,
                    'skpd' => $s->skpd,
                    'bulan' => (int) $bulan,
                    'kas_sipd' => $kasSipd,
                    'kas_bku' => $kasBku,
                    'selisih_bku' => $selisihBku,
                    'kas_real' => $totalKasReal,
                    'selisih' => $selisih,
                    'no_rekon' => $noRekon,
                    'keterangan_bku' => $selisihRow?->keterangan_bku,
                    'keterangan' => $selisihRow?->keterangan_posisi_kas,
                    'status_rekon' => $status,
                ];
            });

            // HITUNG SUMMARY
            $summary = [
                'total' => $dataRekap->count(),
                'sudah' => $dataRekap->where('status_rekon', 'SUDAH')->count(),
                'proses' => $dataRekap->where('status_rekon', 'PROSES')->count(),
                'belum' => $dataRekap->where('status_rekon', 'BELUM')->count(),
            ];

            if ($statusFilter !== 'all') {
                $dataRekap = $dataRekap->where('status_rekon', strtoupper($statusFilter))->values();
            }
        }

        return Inertia::render('Icsa/Pengeluaran/RekapMonitoring/Index', [
            'title' => 'Monitoring Kas',
            'dataRekap' => $dataRekap,
            'listSkpd' => SkpdAccess::apply(
                Skpd::query()->where('tahun', $tahun),
                $request->user(),
            )->orderBy('kode_skpd')->get(),
            'bulanNama' => $this->bulanNama(),
            'summary' => (object) $summary,
            'sessionTahun' => $tahun,
            'filters' => [
                'kode_skpd' => $kodeSkpd ?? 'all',
                'bulan' => $bulan ?? '',
                'status' => $statusFilter,
            ],
        ]);
    }

    private function authorizeRekonAccess(string $noRekon): void
    {
        $kodeSkpd = DB::table('tabel_rekon')
            ->where('no_rekon', $noRekon)
            ->value('kode_skpd');

        abort_if($kodeSkpd === null, 404);
        SkpdAccess::authorize(request()->user(), (string) $kodeSkpd);
    }
}
