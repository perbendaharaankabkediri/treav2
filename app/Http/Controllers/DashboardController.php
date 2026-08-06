<?php

namespace App\Http\Controllers;

use App\Support\SkpdAccess;
use App\Support\RekonStatus;
use Carbon\Carbon;
use Carbon\CarbonPeriod;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;
use Inertia\Inertia;

class DashboardController extends Controller
{
    public function index(Request $request)
    {
        $tahun = (int) session('tahun', now()->year);
        $isOperator = $request->user()->hasRole('operator');
        $bulan = $this->resolveBulan($request, $tahun, $request->user());
        $awalPeriode = Carbon::create($tahun, $bulan, 1)->startOfDay();
        $akhirPeriode = $awalPeriode->copy()->endOfMonth();
        $akhirData = $tahun === (int) now()->year && $bulan === (int) now()->month
            ? min($akhirPeriode, now()->endOfDay())
            : $akhirPeriode;

        $skpdQuery = DB::table('tabel_skpd')->where('tahun', $tahun);
        $skpd = SkpdAccess::apply($skpdQuery, $request->user())
            ->orderBy('kode_skpd')
            ->get(['kode_skpd', 'skpd']);

        $icsa = $this->getIcsaSummary($tahun, $bulan, $skpd);
        $kasda = $isOperator
            ? $this->emptyKasdaSummary()
            : $this->getKasdaSummary($tahun, $awalPeriode, $akhirData);
        $coverage = $isOperator
            ? $this->emptyCoverage($bulan)
            : $this->getCoverage($tahun, $bulan, $awalPeriode, $akhirData);

        $rekonKasda = $isOperator
            ? null
            : DB::table('rekon_bank')
                ->whereYear('periode_rekon', $tahun)
                ->orderByDesc('periode_rekon')
                ->first(['id', 'periode_rekon', 'saldo_buku_akhir', 'saldo_bank_akhir', 'selisih']);

        $rekonKasdaPeriode = ! $isOperator && DB::table('rekon_bank')
            ->whereYear('periode_rekon', $tahun)
            ->whereMonth('periode_rekon', $bulan)
            ->exists();

        $actions = [
            [
                'key' => 'icsa-belum',
                'label' => 'SKPD belum rekonsiliasi',
                'description' => 'Belum membuat dokumen ICSA pada periode ini.',
                'count' => $icsa['summary']['belum'],
                'tone' => 'danger',
                'route' => 'icsa.pengeluaran.rekap-monitoring.index',
                'params' => ['bulan' => $bulan, 'status' => 'belum'],
            ],
            [
                'key' => 'icsa-proses',
                'label' => 'Selisih ICSA belum dijelaskan',
                'description' => 'Dokumen sudah dibuat, tetapi masih perlu penyelesaian.',
                'count' => $icsa['summary']['proses'],
                'tone' => 'warning',
                'route' => 'icsa.pengeluaran.rekap-monitoring.index',
                'params' => ['bulan' => $bulan, 'status' => 'proses'],
            ],
            [
                'key' => 'kasda-unmatched',
                'label' => 'Transaksi Kasda belum cocok',
                'description' => 'Baris bank atau BKU yang belum memiliki pasangan.',
                'count' => $kasda['matching']['unmatched'],
                'tone' => 'warning',
                'route' => 'kasda.transaksi-belum-cocok.index',
                'params' => ['applied' => 1, 'bulan' => $bulan, 'tahun' => $tahun],
            ],
            [
                'key' => 'hari-belum-proses',
                'label' => 'Hari belum diproses',
                'description' => 'Memiliki data bank/BKU tetapi belum masuk pencocokan.',
                'count' => $coverage['hariBelumDiproses'],
                'tone' => 'info',
                'route' => 'kasda.pencocokan-harian.index',
                'params' => [],
            ],
            [
                'key' => 'ba-kasda',
                'label' => 'Berita acara Kasda periode ini',
                'description' => $rekonKasdaPeriode ? 'Berita acara periode ini sudah tersedia.' : 'Belum dibuat untuk periode terpilih.',
                'count' => $rekonKasdaPeriode ? 0 : 1,
                'tone' => $rekonKasdaPeriode ? 'success' : 'danger',
                'route' => 'kasda.rekon.index',
                'params' => [],
            ],
        ];

        if ($isOperator) {
            $actions = array_slice($actions, 0, 2);
        }

        return Inertia::render('Dashboard', [
            'filters' => [
                'tahun' => $tahun,
                'bulan' => $bulan,
                'label' => $awalPeriode->locale('id')->translatedFormat('F Y'),
                'tanggalAkhir' => $akhirData->format('Y-m-d'),
            ],
            'icsa' => $icsa,
            'kasda' => $kasda,
            'coverage' => $coverage,
            'actions' => $actions,
            'rekonKasda' => $rekonKasda ? [
                'id' => $rekonKasda->id,
                'periode' => Carbon::parse($rekonKasda->periode_rekon)->locale('id')->translatedFormat('F Y'),
                'tanggal' => $rekonKasda->periode_rekon,
                'saldoBuku' => (float) $rekonKasda->saldo_buku_akhir,
                'saldoBank' => (float) $rekonKasda->saldo_bank_akhir,
                'selisih' => (float) $rekonKasda->selisih,
            ] : null,
        ]);
    }

    private function resolveBulan(Request $request, int $tahun, $user): int
    {
        $requested = (int) $request->integer('bulan');
        if ($requested >= 1 && $requested <= 12) {
            return $requested;
        }

        $candidates = [];
        $rekonQuery = DB::table('tabel_rekon')->where('tahun', $tahun);
        $bulanIcsa = SkpdAccess::apply($rekonQuery, $user)
            ->pluck('bulan')
            ->map(fn ($month) => (int) $month)
            ->max();
        if ($bulanIcsa >= 1 && $bulanIcsa <= 12) {
            $candidates[] = $bulanIcsa;
        }

        if ($user->hasRole('operator')) {
            return $candidates ? max($candidates) : min(now()->month, 12);
        }

        foreach ([
            ['monitoring_harian', 'tanggal'],
            ['bku_pemda', 'tanggal'],
            ['mutasi_bank', 'effective_date'],
        ] as [$table, $column]) {
            $date = DB::table($table)->whereYear($column, $tahun)->max($column);
            if ($date) {
                $candidates[] = Carbon::parse($date)->month;
            }
        }

        return $candidates ? max($candidates) : min(now()->month, 12);
    }

    private function getIcsaSummary(int $tahun, int $bulan, $skpd): array
    {
        $bulanStr = (string) $bulan;
        $rekon = DB::table('tabel_rekon')
            ->where('tahun', $tahun)
            ->where('bulan', $bulanStr)
            ->get()
            ->keyBy('kode_skpd');

        $sp2d = DB::table('tabel_sp2d')
            ->where('tahun', $tahun)->where('bulan', $bulanStr)
            ->selectRaw('kode_skpd, SUM(COALESCE(nilai_ls,0) + COALESCE(nilai_upgu,0) + COALESCE(nilai_tu,0) + COALESCE(nilai_gukkpd,0)) total')
            ->groupBy('kode_skpd')->pluck('total', 'kode_skpd');
        $spj = DB::table('tabel_spj')
            ->where('tahun', $tahun)->where('bulan', $bulanStr)
            ->selectRaw('kode_skpd, SUM(COALESCE(nilai_ls,0) + COALESCE(nilai_upgu,0) + COALESCE(nilai_tu,0) + COALESCE(nilai_gukkpd,0)) total')
            ->groupBy('kode_skpd')->pluck('total', 'kode_skpd');
        $sts = DB::table('tabel_sts')
            ->where('tahun', $tahun)->where('bulan', $bulanStr)
            ->selectRaw('kode_skpd, SUM(COALESCE(sts_upgu,0) + COALESCE(sts_tu,0) + COALESCE(cp_ls,0) + COALESCE(cp_upgu,0) + COALESCE(cp_tu,0)) total')
            ->groupBy('kode_skpd')->pluck('total', 'kode_skpd');
        $kasRiil = DB::table('tabel_posisi_kas')
            ->where('tahun', $tahun)->where('bulan', $bulanStr)
            ->selectRaw('kode_skpd, SUM(COALESCE(kas_di_bank,0) + COALESCE(kas_tunai,0)) total')
            ->groupBy('kode_skpd')->pluck('total', 'kode_skpd');
        $bku = DB::table('tabel_bku')
            ->where('tahun', $tahun)->where('bulan', $bulanStr)
            ->selectRaw('kode_skpd, SUM(COALESCE(penerimaan,0) - COALESCE(pengeluaran,0)) total')
            ->groupBy('kode_skpd')->pluck('total', 'kode_skpd');
        $selisihRows = DB::table('tabel_selisih')
            ->where('tahun', $tahun)->where('bulan', $bulanStr)
            ->get()->keyBy('kode_skpd');

        $bulanSebelumnya = collect(range(1, max(1, $bulan - 1)))
            ->when($bulan === 1, fn ($months) => collect())
            ->map(fn ($month) => (string) $month);

        $saldoAwal = [];
        $saldoAwalBku = [];
        foreach ($skpd as $item) {
            $saldoAwal[$item->kode_skpd] = 0.0;
            $saldoAwalBku[$item->kode_skpd] = 0.0;
        }

        if ($bulanSebelumnya->isNotEmpty()) {
            $previousSp2d = DB::table('tabel_sp2d')->where('tahun', $tahun)->whereIn('bulan', $bulanSebelumnya)
                ->selectRaw('kode_skpd, SUM(COALESCE(nilai_ls,0) + COALESCE(nilai_upgu,0) + COALESCE(nilai_tu,0) + COALESCE(nilai_gukkpd,0)) total')
                ->groupBy('kode_skpd')->pluck('total', 'kode_skpd');
            $previousSpj = DB::table('tabel_spj')->where('tahun', $tahun)->whereIn('bulan', $bulanSebelumnya)
                ->selectRaw('kode_skpd, SUM(COALESCE(nilai_ls,0) + COALESCE(nilai_upgu,0) + COALESCE(nilai_tu,0) + COALESCE(nilai_gukkpd,0)) total')
                ->groupBy('kode_skpd')->pluck('total', 'kode_skpd');
            $previousSts = DB::table('tabel_sts')->where('tahun', $tahun)->whereIn('bulan', $bulanSebelumnya)
                ->selectRaw('kode_skpd, SUM(COALESCE(sts_upgu,0) + COALESCE(sts_tu,0) + COALESCE(cp_ls,0) + COALESCE(cp_upgu,0) + COALESCE(cp_tu,0)) total')
                ->groupBy('kode_skpd')->pluck('total', 'kode_skpd');
            $previousBku = DB::table('tabel_bku')->where('tahun', $tahun)->whereIn('bulan', $bulanSebelumnya)
                ->selectRaw('kode_skpd, SUM(COALESCE(penerimaan,0) - COALESCE(pengeluaran,0)) total')
                ->groupBy('kode_skpd')->pluck('total', 'kode_skpd');

            foreach ($skpd as $item) {
                $code = $item->kode_skpd;
                $saldoAwal[$code] = (float) ($previousSp2d[$code] ?? 0)
                    - (float) ($previousSpj[$code] ?? 0)
                    - (float) ($previousSts[$code] ?? 0);
                $saldoAwalBku[$code] = (float) ($previousBku[$code] ?? 0);
            }
        }

        $rows = $skpd->map(function ($item) use ($rekon, $sp2d, $spj, $sts, $kasRiil, $bku, $selisihRows, $saldoAwal, $saldoAwalBku) {
            $code = $item->kode_skpd;
            $hasRekon = isset($rekon[$code]);
            $kasSipd = $hasRekon
                ? $saldoAwal[$code] + (float) ($sp2d[$code] ?? 0) - (float) ($spj[$code] ?? 0) - (float) ($sts[$code] ?? 0)
                : 0;
            $kasReal = $hasRekon ? (float) ($kasRiil[$code] ?? 0) : 0;
            $kasBku = $hasRekon ? $saldoAwalBku[$code] + (float) ($bku[$code] ?? 0) : 0;
            $selisihBku = round($kasSipd - $kasBku, 2);
            $selisih = round($kasSipd - $kasReal, 2);
            $selisihRow = $selisihRows[$code] ?? null;
            $keterangan = trim((string) ($selisihRow?->keterangan_posisi_kas ?? ''));
            $status = RekonStatus::determine(
                $selisihRow !== null,
                $selisihBku,
                $selisihRow?->keterangan_bku,
                $selisih,
                $selisihRow?->keterangan_posisi_kas,
            );

            return [
                'kodeSkpd' => $code,
                'skpd' => $item->skpd,
                'noRekon' => $rekon[$code]->no_rekon ?? null,
                'kasSipd' => $kasSipd,
                'kasRiil' => $kasReal,
                'kasBku' => $kasBku,
                'selisihBku' => $selisihBku,
                'selisih' => $selisih,
                'status' => $status,
                'keterangan' => $keterangan ?: null,
            ];
        });

        $completed = $rows->where('status', 'SUDAH')->count();
        $summary = [
            'total' => $rows->count(),
            'seimbang' => $rows->filter(fn ($row) => $row['status'] === 'SUDAH'
                && abs($row['selisihBku']) < RekonStatus::TOLERANCE
                && abs($row['selisih']) < RekonStatus::TOLERANCE)->count(),
            'dijelaskan' => $rows->filter(fn ($row) => $row['status'] === 'SUDAH'
                && (abs($row['selisihBku']) >= RekonStatus::TOLERANCE
                    || abs($row['selisih']) >= RekonStatus::TOLERANCE))->count(),
            'proses' => $rows->where('status', 'PROSES')->count(),
            'belum' => $rows->where('status', 'BELUM')->count(),
            'selesai' => $completed,
            'progress' => $rows->count() ? round($completed / $rows->count() * 100, 1) : 0,
            'kasSipd' => (float) $rows->sum('kasSipd'),
            'kasRiil' => (float) $rows->sum('kasRiil'),
            'selisih' => (float) $rows->sum('selisih'),
        ];

        return [
            'summary' => $summary,
            'attention' => $rows->filter(fn ($row) => $row['status'] === 'PROSES'
                    || ($row['status'] === 'SUDAH'
                        && (abs($row['selisihBku']) >= RekonStatus::TOLERANCE
                            || abs($row['selisih']) >= RekonStatus::TOLERANCE)))
                ->sortByDesc(fn ($row) => abs($row['selisih']))
                ->take(6)->values(),
        ];
    }

    private function getKasdaSummary(int $tahun, Carbon $awal, Carbon $akhir): array
    {
        $matching = DB::table('monitoring_harian')
            ->whereBetween('tanggal', [$awal->toDateString(), $akhir->toDateString()])
            ->selectRaw("
                COUNT(*) total,
                SUM(CASE WHEN status = 'matched' THEN 1 ELSE 0 END) matched,
                SUM(CASE WHEN status = 'unmatched' THEN 1 ELSE 0 END) unmatched
            ")->first();

        $unmatched = DB::table('monitoring_harian')
            ->whereBetween('tanggal', [$awal->toDateString(), $akhir->toDateString()])
            ->where('status', 'unmatched')
            ->selectRaw('
                source, jenis, COUNT(*) jumlah, COALESCE(SUM(nominal), 0) nominal
            ')->groupBy('source', 'jenis')->get()->keyBy(fn ($row) => "{$row->source}_{$row->jenis}");

        $saldoAwal = DB::table('saldo_awal')->where('tahun', $tahun)->first();
        $bankSebelum = DB::table('mutasi_bank')
            ->where('tahun', $tahun)->whereDate('effective_date', '<', $awal->toDateString())
            ->selectRaw('COALESCE(SUM(credit),0) masuk, COALESCE(SUM(debit),0) keluar')->first();
        $bkuSebelum = DB::table('bku_pemda')
            ->where('tahun', $tahun)->whereDate('tanggal', '<', $awal->toDateString())
            ->selectRaw('COALESCE(SUM(penerimaan),0) masuk, COALESCE(SUM(pengeluaran),0) keluar')->first();

        $runningBank = (float) ($saldoAwal->saldo_awal_mutasi ?? 0) + (float) $bankSebelum->masuk - (float) $bankSebelum->keluar;
        $runningBku = (float) ($saldoAwal->saldo_awal_bku ?? 0) + (float) $bkuSebelum->masuk - (float) $bkuSebelum->keluar;

        $bankDaily = DB::table('mutasi_bank')
            ->whereBetween('effective_date', [$awal->toDateString(), $akhir->toDateString()])
            ->selectRaw('effective_date tanggal, COALESCE(SUM(credit),0) masuk, COALESCE(SUM(debit),0) keluar')
            ->groupBy('effective_date')->get()->keyBy('tanggal');
        $bkuDaily = DB::table('bku_pemda')
            ->whereBetween('tanggal', [$awal->toDateString(), $akhir->toDateString()])
            ->selectRaw('tanggal, COALESCE(SUM(penerimaan),0) masuk, COALESCE(SUM(pengeluaran),0) keluar')
            ->groupBy('tanggal')->get()->keyBy('tanggal');

        $trend = collect();
        foreach (CarbonPeriod::create($awal, $akhir) as $date) {
            $key = $date->format('Y-m-d');
            $bank = $bankDaily[$key] ?? null;
            $bku = $bkuDaily[$key] ?? null;
            $runningBank += (float) ($bank->masuk ?? 0) - (float) ($bank->keluar ?? 0);
            $runningBku += (float) ($bku->masuk ?? 0) - (float) ($bku->keluar ?? 0);
            $trend->push([
                'tanggal' => $date->format('d M'),
                'bank' => round($runningBank, 2),
                'bku' => round($runningBku, 2),
                'selisih' => round($runningBank - $runningBku, 2),
            ]);
        }

        $total = (int) ($matching->total ?? 0);
        $matched = (int) ($matching->matched ?? 0);

        return [
            'matching' => [
                'total' => $total,
                'matched' => $matched,
                'unmatched' => (int) ($matching->unmatched ?? 0),
                'rate' => $total ? round($matched / $total * 100, 1) : 0,
            ],
            'saldo' => [
                'bank' => round($runningBank, 2),
                'bku' => round($runningBku, 2),
                'selisih' => round($runningBank - $runningBku, 2),
                'saldoAwalTersedia' => (bool) $saldoAwal,
            ],
            'unmatched' => collect(['bank_masuk', 'bku_masuk', 'bank_keluar', 'bku_keluar'])
                ->mapWithKeys(fn ($key) => [$key => [
                    'jumlah' => (int) ($unmatched[$key]->jumlah ?? 0),
                    'nominal' => (float) ($unmatched[$key]->nominal ?? 0),
                ]]),
            'trend' => $trend,
        ];
    }

    private function getCoverage(int $tahun, int $bulan, Carbon $awal, Carbon $akhir): array
    {
        $rawDates = DB::table('bku_pemda')
            ->whereBetween('tanggal', [$awal->toDateString(), $akhir->toDateString()])
            ->pluck('tanggal')
            ->merge(
                DB::table('mutasi_bank')
                    ->whereBetween('effective_date', [$awal->toDateString(), $akhir->toDateString()])
                    ->pluck('effective_date')
            )
            ->map(fn ($date) => Carbon::parse($date)->format('Y-m-d'))
            ->unique();

        $processedDates = DB::table('monitoring_harian')
            ->whereBetween('tanggal', [$awal->toDateString(), $akhir->toDateString()])
            ->pluck('tanggal')
            ->map(fn ($date) => Carbon::parse($date)->format('Y-m-d'))
            ->unique();

        return [
            'latestBku' => $this->formatDate(DB::table('bku_pemda')->where('tahun', $tahun)->max('tanggal')),
            'latestBank' => $this->formatDate(DB::table('mutasi_bank')->where('tahun', $tahun)->max('effective_date')),
            'latestProcessed' => $this->formatDate(DB::table('monitoring_harian')->whereYear('tanggal', $tahun)->max('tanggal')),
            'hariDenganData' => $rawDates->count(),
            'hariDiproses' => $rawDates->intersect($processedDates)->count(),
            'hariBelumDiproses' => $rawDates->diff($processedDates)->count(),
            'bulan' => $bulan,
        ];
    }

    private function formatDate($date): ?string
    {
        return $date ? Carbon::parse($date)->locale('id')->translatedFormat('d M Y') : null;
    }

    private function emptyKasdaSummary(): array
    {
        return [
            'matching' => [
                'total' => 0,
                'matched' => 0,
                'unmatched' => 0,
                'rate' => 0,
            ],
            'saldo' => [
                'bank' => 0,
                'bku' => 0,
                'selisih' => 0,
                'saldoAwalTersedia' => false,
            ],
            'unmatched' => collect([
                'bank_masuk' => ['jumlah' => 0, 'nominal' => 0],
                'bku_masuk' => ['jumlah' => 0, 'nominal' => 0],
                'bank_keluar' => ['jumlah' => 0, 'nominal' => 0],
                'bku_keluar' => ['jumlah' => 0, 'nominal' => 0],
            ]),
            'trend' => collect(),
        ];
    }

    private function emptyCoverage(int $bulan): array
    {
        return [
            'latestBku' => null,
            'latestBank' => null,
            'latestProcessed' => null,
            'hariDenganData' => 0,
            'hariDiproses' => 0,
            'hariBelumDiproses' => 0,
            'bulan' => $bulan,
        ];
    }
}
