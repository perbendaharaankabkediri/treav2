<?php

namespace App\Http\Middleware;

use App\Models\Bendahara;
use App\Models\Bud;
use App\Services\ActivityLogger;
use Closure;
use Illuminate\Http\Request;
use Symfony\Component\HttpFoundation\Response;
use Throwable;

class AuditOperationalActivity
{
    private const ROUTES = [
        'bendahara.store' => ['bendahara', 'bendahara.created'],
        'bendahara.update' => ['bendahara', 'bendahara.updated'],
        'bendahara.destroy' => ['bendahara', 'bendahara.deleted'],
        'bud.store' => ['bud', 'bud.created'],
        'bud.update' => ['bud', 'bud.updated'],
        'bud.destroy' => ['bud', 'bud.deleted'],
        'icsa.pengeluaran.rekonsiliasi.store' => ['icsa-rekon', 'reconciliation.created'],
        'icsa.pengeluaran.rekonsiliasi.update' => ['icsa-rekon', 'reconciliation.updated'],
        'icsa.pengeluaran.rekonsiliasi.destroy' => ['icsa-rekon', 'reconciliation.deleted'],
        'icsa.pengeluaran.rekonsiliasi.cetak' => ['icsa-rekon', 'reconciliation.printed'],
        'icsa.pengeluaran.rekonsiliasi.excel' => ['icsa-rekon', 'reconciliation.exported'],
        'icsa.pengeluaran.rekap-data.export' => ['icsa-rekap', 'report.exported'],
        'icsa.pengeluaran.import-data.register-sp2d.upload' => ['icsa-import', 'register-sp2d.previewed'],
        'icsa.pengeluaran.import-data.register-sp2d.confirm' => ['icsa-import', 'register-sp2d.imported'],
        'icsa.pengeluaran.import-data.register-sp2d.cancel' => ['icsa-import', 'register-sp2d.cancelled'],
        'icsa.pengeluaran.import-data.laporan-realisasi.upload' => ['icsa-import', 'laporan-realisasi.previewed'],
        'icsa.pengeluaran.import-data.laporan-realisasi.confirm' => ['icsa-import', 'laporan-realisasi.imported'],
        'icsa.pengeluaran.import-data.laporan-realisasi.cancel' => ['icsa-import', 'laporan-realisasi.cancelled'],
        'kasda.import.bku.preview' => ['kasda-import', 'bku.previewed'],
        'kasda.import.bku.store' => ['kasda-import', 'bku.imported'],
        'kasda.import.mutasi.preview' => ['kasda-import', 'bank-mutation.previewed'],
        'kasda.import.mutasi.store' => ['kasda-import', 'bank-mutation.imported'],
        'kasda.saldo-awal.store' => ['kasda-saldo-awal', 'opening-balance.saved'],
        'kasda.pencocokan-harian.proses' => ['kasda-matching', 'matching.processed'],
        'kasda.pencocokan-harian.manual' => ['kasda-matching', 'matching.manual-created'],
        'kasda.pencocokan-harian.unmatch' => ['kasda-matching', 'matching.reverted'],
        'kasda.pencocokan-harian.delete' => ['kasda-matching', 'matching.deleted'],
        'kasda.pencocokan-harian.delete-periode' => ['kasda-matching', 'matching-period.deleted'],
        'kasda.rekon.store' => ['kasda-rekon', 'reconciliation.created'],
        'kasda.rekon.destroy' => ['kasda-rekon', 'reconciliation.deleted'],
        'kasda.rekon.print' => ['kasda-rekon', 'reconciliation.printed'],
    ];

    public function __construct(private readonly ActivityLogger $logger) {}

    public function handle(Request $request, Closure $next): Response
    {
        $routeName = $request->route()?->getName();
        $audit = $routeName ? self::ROUTES[$routeName] ?? null : null;

        if (! $audit) {
            return $next($request);
        }

        $oldValues = $this->oldValues($request, $routeName);

        try {
            $response = $next($request);
        } catch (Throwable $exception) {
            $this->record($request, $audit, 'failed', $oldValues, $exception::class);

            throw $exception;
        }

        $newFlash = $request->session()->get('_flash.new', []);
        $status = $response->getStatusCode() < 400
            && ! in_array('errors', $newFlash, true)
            && ! in_array('error', $newFlash, true)
                ? 'success'
                : 'failed';
        $this->record($request, $audit, $status, $oldValues);

        return $response;
    }

    private function record(
        Request $request,
        array $audit,
        string $status,
        ?array $oldValues = null,
        ?string $error = null,
    ): void {
        [$module, $action] = $audit;
        $routeParameters = collect($request->route()?->parameters() ?? [])
            ->map(fn ($value) => is_object($value) && isset($value->id) ? $value->id : $value)
            ->all();

        $metadata = [
            'route' => $request->route()?->getName(),
            'method' => $request->method(),
            'parameters' => $routeParameters,
            'input' => $this->safeInput($request),
        ];

        if ($error) {
            $metadata['error_type'] = $error;
        }

        $kodeSkpd = $request->input('kode_skpd')
            ?? $request->route('kode_skpd')
            ?? null;
        $tahun = $request->input('tahun') ?? session('tahun');

        $this->logger->record($request, $action, $module, $status, context: [
            'kode_skpd' => $kodeSkpd ? (string) $kodeSkpd : null,
            'tahun' => $tahun,
            'description' => $this->description($action, $status),
            'old_values' => $oldValues,
            'new_values' => $request->isMethodSafe() ? null : $this->safeInput($request),
            'metadata' => $metadata,
        ]);
    }

    private function safeInput(Request $request): array
    {
        return $request->except([
            'password',
            'password_confirmation',
            'current_password',
            'token',
            '_token',
            '_method',
            'file',
        ]);
    }

    private function oldValues(Request $request, string $routeName): ?array
    {
        $model = match ($routeName) {
            'bendahara.update', 'bendahara.destroy' => Bendahara::query()->find($request->route('id')),
            'bud.update', 'bud.destroy' => Bud::query()->find($request->route('id')),
            default => null,
        };

        if (! $model instanceof Bendahara
            && ! $model instanceof Bud) {
            return null;
        }

        return collect($model->getAttributes())
            ->except(['created_at', 'updated_at'])
            ->all();
    }

    private function description(string $action, string $status): string
    {
        return sprintf(
            'Aktivitas %s %s.',
            str_replace(['.', '-'], ' ', $action),
            $status === 'success' ? 'berhasil' : 'gagal',
        );
    }
}
