<?php

namespace App\Http\Controllers\ICSA;

use App\Http\Controllers\Controller;
use App\Models\ImportLaporanRealisasi;
use App\Services\LaporanRealisasiImportService;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Str;
use Inertia\Inertia;
use Inertia\Response;

class ImportLaporanRealisasiController extends Controller
{
    public function __construct(private readonly LaporanRealisasiImportService $service) {}

    public function upload(Request $request): RedirectResponse
    {
        $validated = $request->validate([
            'file_laporan_realisasi' => ['required', 'file', 'mimes:xls,xlsx', 'max:102400'],
        ]);

        $batch = $this->service->createPreview(
            $validated['file_laporan_realisasi'],
            (int) $request->user()->id,
        );

        return redirect()->route('icsa.pengeluaran.import-data.laporan-realisasi.preview', $batch);
    }

    public function preview(ImportLaporanRealisasi $batch): Response|RedirectResponse
    {
        if ($batch->status !== 'preview') {
            return redirect()
                ->route('icsa.pengeluaran.import-data.index')
                ->with('error', 'Preview tersebut sudah tidak aktif.');
        }

        $active = ImportLaporanRealisasi::query()
            ->where('tahun', $batch->tahun)
            ->where('bulan', $batch->bulan)
            ->where('is_active', true)
            ->first();

        $oldHashes = $active
            ? DB::table('tabel_laporan_realisasi')
                ->where('import_laporan_realisasi_id', $active->id)
                ->get([
                    'nomor_dokumen',
                    'jenis_dokumen',
                    'jenis_transaksi',
                    'nomor_sp2d',
                    'nomor_spd',
                    'nomor_dpt',
                    'kode_sub_kegiatan',
                    'kode_rekening',
                    'row_hash',
                ])
                ->mapWithKeys(fn (object $row) => [
                    $this->businessKey(
                        $row->nomor_dokumen,
                        $row->jenis_dokumen,
                        $row->jenis_transaksi,
                        $row->nomor_sp2d,
                        $row->nomor_spd,
                        $row->nomor_dpt,
                        $row->kode_sub_kegiatan,
                        $row->kode_rekening,
                    ) => $row->row_hash,
                ])
            : collect();

        $rows = DB::table('tabel_laporan_realisasi')
            ->where('import_laporan_realisasi_id', $batch->id)
            ->orderBy('nomor_baris')
            ->paginate(100)
            ->through(function (object $row) use ($oldHashes) {
                $oldHash = $oldHashes->get($this->businessKey(
                    $row->nomor_dokumen,
                    $row->jenis_dokumen,
                    $row->jenis_transaksi,
                    $row->nomor_sp2d,
                    $row->nomor_spd,
                    $row->nomor_dpt,
                    $row->kode_sub_kegiatan,
                    $row->kode_rekening,
                ));

                return [
                    'id' => $row->id,
                    'nomor_baris' => $row->nomor_baris,
                    'kode_skpd' => $row->kode_skpd,
                    'nama_skpd' => $row->nama_skpd,
                    'kode_sub_kegiatan' => $row->kode_sub_kegiatan,
                    'nama_sub_kegiatan' => $row->nama_sub_kegiatan,
                    'kode_rekening' => $row->kode_rekening,
                    'nama_rekening' => $row->nama_rekening,
                    'nomor_dokumen' => $row->nomor_dokumen,
                    'jenis_dokumen' => $row->jenis_dokumen,
                    'jenis_transaksi' => $row->jenis_transaksi,
                    'tanggal_dokumen' => $row->tanggal_dokumen,
                    'tanggal_transfer' => $row->tanggal_transfer,
                    'tanggal_periode' => $this->isSppLs($row->jenis_dokumen, $row->jenis_transaksi)
                        ? $row->tanggal_transfer
                        : $row->tanggal_dokumen,
                    'dasar_periode' => $this->isSppLs($row->jenis_dokumen, $row->jenis_transaksi)
                        ? 'Tanggal Transfer'
                        : 'Tanggal Dokumen',
                    'keterangan_dokumen' => $row->keterangan_dokumen,
                    'nilai_realisasi' => $row->nilai_realisasi,
                    'nilai_setoran' => $row->nilai_setoran,
                    'nomor_sp2d' => $row->nomor_sp2d,
                    'tanggal_sp2d' => $row->tanggal_sp2d,
                    'nilai_sp2d' => $row->nilai_sp2d,
                    'comparison_status' => $oldHash === null
                        ? 'new'
                        : (hash_equals($oldHash, $row->row_hash) ? 'unchanged' : 'changed'),
                ];
            });

        return Inertia::render('Icsa/Pengeluaran/ImportData/LaporanRealisasiPreview', [
            'title' => 'Preview Laporan Realisasi',
            'batch' => [
                'id' => $batch->id,
                'tahun' => $batch->tahun,
                'bulan' => $batch->bulan,
                'nama_bulan' => $this->monthName($batch->bulan),
                'nama_file_asli' => $batch->nama_file_asli,
                'jumlah_baris' => $batch->jumlah_baris,
                'jumlah_data_baru' => $batch->jumlah_data_baru,
                'jumlah_data_berubah' => $batch->jumlah_data_berubah,
                'jumlah_data_tetap' => $batch->jumlah_data_tetap,
                'jumlah_data_dihapus' => $batch->jumlah_data_dihapus,
                'total_realisasi' => $batch->total_realisasi,
                'total_setoran' => $batch->total_setoran,
                'total_sp2d_unik' => $batch->total_sp2d_unik,
                'has_active_batch' => (bool) $active,
            ],
            'rows' => $rows,
        ]);
    }

    public function confirm(ImportLaporanRealisasi $batch): RedirectResponse
    {
        $this->service->activate($batch);

        return redirect()
            ->route('icsa.pengeluaran.import-data.index')
            ->with('success', "Laporan Realisasi {$this->monthName($batch->bulan)} {$batch->tahun} berhasil diaktifkan.");
    }

    public function cancel(ImportLaporanRealisasi $batch): RedirectResponse
    {
        $this->service->cancel($batch);

        return redirect()
            ->route('icsa.pengeluaran.import-data.index')
            ->with('success', 'Preview Laporan Realisasi dibatalkan. Data aktif sebelumnya tidak berubah.');
    }

    private function businessKey(
        string $document,
        string $documentType,
        string $transactionType,
        ?string $sp2d,
        ?string $spd,
        ?string $dpt,
        string $subActivity,
        string $account,
    ): string {
        $reference = $this->isSppLs($documentType, $transactionType)
            ? (string) $sp2d
            : $document;

        $key = Str::upper(trim($reference)).'|'.Str::upper(trim($subActivity)).'|'.Str::upper(trim($account));

        if ($this->isTbpKkpd($documentType)) {
            return $key.'|'.Str::upper(trim((string) $spd)).'|'.Str::upper(trim((string) $dpt));
        }

        return $this->isTbpSpdTransaction($documentType, $transactionType)
            ? $key.'|'.Str::upper(trim((string) $spd))
            : $key;
    }

    private function isSppLs(string $documentType, string $transactionType): bool
    {
        return $this->normalizeCategory($documentType) === 'SPP'
            && $this->normalizeCategory($transactionType) === 'LS';
    }

    private function isTbpSpdTransaction(string $documentType, string $transactionType): bool
    {
        return $this->normalizeCategory($documentType) === 'TBP'
            && in_array($this->normalizeCategory($transactionType), ['UP', 'GU', 'TU', 'GU KKPD'], true);
    }

    private function isTbpKkpd(string $documentType): bool
    {
        return $this->normalizeCategory($documentType) === 'TBP KKPD';
    }

    private function normalizeCategory(string $value): string
    {
        return trim((string) preg_replace('/[\s_-]+/', ' ', Str::upper(trim($value))));
    }

    private function monthName(int $month): string
    {
        return [
            1 => 'Januari', 2 => 'Februari', 3 => 'Maret', 4 => 'April',
            5 => 'Mei', 6 => 'Juni', 7 => 'Juli', 8 => 'Agustus',
            9 => 'September', 10 => 'Oktober', 11 => 'November', 12 => 'Desember',
        ][$month];
    }
}
