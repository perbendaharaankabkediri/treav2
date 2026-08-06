<?php

namespace App\Http\Controllers\ICSA;

use App\Http\Controllers\Controller;
use App\Models\ImportLaporanRealisasi;
use App\Models\ImportRegisterSp2d;
use App\Services\RegisterSp2dImportService;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Str;
use Inertia\Inertia;
use Inertia\Response;

class ImportRegisterSp2dController extends Controller
{
    public function __construct(private readonly RegisterSp2dImportService $service) {}

    public function index(): Response
    {
        $history = ImportRegisterSp2d::query()
            ->with('importer:id,name')
            ->whereIn('status', ['completed', 'superseded'])
            ->orderByDesc('tahun')
            ->orderByDesc('bulan')
            ->orderByDesc('confirmed_at')
            ->limit(12)
            ->get()
            ->map(fn (ImportRegisterSp2d $batch) => [
                'id' => $batch->id,
                'tahun' => $batch->tahun,
                'bulan' => $batch->bulan,
                'nama_bulan' => $this->monthName($batch->bulan),
                'nama_file_asli' => $batch->nama_file_asli,
                'jumlah_baris' => $batch->jumlah_baris,
                'total_netto' => $batch->total_netto,
                'status' => $batch->status,
                'is_active' => $batch->is_active,
                'importer' => $batch->importer?->name,
                'confirmed_at' => $batch->confirmed_at?->format('d/m/Y H:i'),
            ]);

        $realisasiHistory = ImportLaporanRealisasi::query()
            ->with('importer:id,name')
            ->whereIn('status', ['completed', 'superseded'])
            ->orderByDesc('tahun')
            ->orderByDesc('bulan')
            ->orderByDesc('confirmed_at')
            ->limit(12)
            ->get()
            ->map(fn (ImportLaporanRealisasi $batch) => [
                'id' => $batch->id,
                'tahun' => $batch->tahun,
                'bulan' => $batch->bulan,
                'nama_bulan' => $this->monthName($batch->bulan),
                'nama_file_asli' => $batch->nama_file_asli,
                'jumlah_baris' => $batch->jumlah_baris,
                'total_realisasi' => $batch->total_realisasi,
                'status' => $batch->status,
                'is_active' => $batch->is_active,
                'importer' => $batch->importer?->name,
                'confirmed_at' => $batch->confirmed_at?->format('d/m/Y H:i'),
            ]);

        return Inertia::render('Icsa/Pengeluaran/ImportData/Index', [
            'title' => 'Import Data Pengeluaran',
            'history' => $history,
            'realisasiHistory' => $realisasiHistory,
        ]);
    }

    public function upload(Request $request): RedirectResponse
    {
        $validated = $request->validate([
            'file_register_sp2d' => ['required', 'file', 'mimes:xls,xlsx', 'max:20480'],
        ]);

        $batch = $this->service->createPreview(
            $validated['file_register_sp2d'],
            (int) $request->user()->id,
        );

        return redirect()->route('icsa.pengeluaran.import-data.register-sp2d.preview', $batch);
    }

    public function preview(ImportRegisterSp2d $batch): Response|RedirectResponse
    {
        if ($batch->status !== 'preview') {
            return redirect()
                ->route('icsa.pengeluaran.import-data.index')
                ->with('error', 'Preview tersebut sudah tidak aktif.');
        }

        $active = ImportRegisterSp2d::query()
            ->where('tahun', $batch->tahun)
            ->where('bulan', $batch->bulan)
            ->where('is_active', true)
            ->first();

        $oldHashes = $active
            ? DB::table('tabel_register_sp2d')
                ->where('import_register_sp2d_id', $active->id)
                ->pluck('row_hash', 'nomor_sp2d')
                ->mapWithKeys(fn ($hash, $number) => [Str::upper(trim($number)) => $hash])
            : collect();

        $rows = DB::table('tabel_register_sp2d')
            ->where('import_register_sp2d_id', $batch->id)
            ->orderBy('nomor_baris')
            ->get()
            ->map(function (object $row) use ($oldHashes) {
                $oldHash = $oldHashes->get(Str::upper(trim($row->nomor_sp2d)));

                return [
                    'id' => $row->id,
                    'nomor_urut' => $row->nomor_urut_sumber,
                    'tanggal_pembuatan' => $row->tanggal_pembuatan,
                    'tanggal_pencairan' => $row->tanggal_pencairan,
                    'nomor_sp2d' => $row->nomor_sp2d,
                    'kode_skpd' => $row->kode_skpd,
                    'nama_skpd' => $row->nama_skpd,
                    'nama_penerima' => $row->nama_penerima,
                    'keterangan' => $row->keterangan,
                    'jenis_sp2d' => $row->jenis_sp2d,
                    'bruto' => $row->bruto,
                    'potongan' => $row->potongan,
                    'netto' => $row->netto,
                    'comparison_status' => $oldHash === null
                        ? 'new'
                        : (hash_equals($oldHash, $row->row_hash) ? 'unchanged' : 'changed'),
                ];
            });

        $unmatchedSkpd = $rows
            ->whereNull('kode_skpd')
            ->pluck('nama_skpd')
            ->unique()
            ->values();

        return Inertia::render('Icsa/Pengeluaran/ImportData/RegisterSp2dPreview', [
            'title' => 'Preview Register SP2D',
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
                'total_bruto' => $batch->total_bruto,
                'total_potongan' => $batch->total_potongan,
                'total_netto' => $batch->total_netto,
                'has_active_batch' => (bool) $active,
            ],
            'rows' => $rows,
            'unmatchedSkpd' => $unmatchedSkpd,
        ]);
    }

    public function confirm(ImportRegisterSp2d $batch): RedirectResponse
    {
        $this->service->activate($batch);

        return redirect()
            ->route('icsa.pengeluaran.import-data.index')
            ->with('success', "Register SP2D {$this->monthName($batch->bulan)} {$batch->tahun} berhasil diaktifkan.");
    }

    public function cancel(ImportRegisterSp2d $batch): RedirectResponse
    {
        $this->service->cancel($batch);

        return redirect()
            ->route('icsa.pengeluaran.import-data.index')
            ->with('success', 'Preview import dibatalkan. Data aktif sebelumnya tidak berubah.');
    }

    private function monthName(int $month): string
    {
        return [
            1 => 'Januari',
            2 => 'Februari',
            3 => 'Maret',
            4 => 'April',
            5 => 'Mei',
            6 => 'Juni',
            7 => 'Juli',
            8 => 'Agustus',
            9 => 'September',
            10 => 'Oktober',
            11 => 'November',
            12 => 'Desember',
        ][$month];
    }
}
