<?php

namespace App\Http\Controllers;

use App\Models\ActivityLog;
use App\Models\User;
use Illuminate\Support\Carbon;
use Illuminate\Support\Facades\Cache;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Schema;
use Inertia\Inertia;
use Inertia\Response;
use Throwable;

class SecurityDashboardController extends Controller
{
    public function index(): Response
    {
        $since = now()->subDays(7);
        $recentLogs = ActivityLog::query()
            ->where('created_at', '>=', $since)
            ->get(['module', 'status', 'action', 'created_at']);

        return Inertia::render('Admin/Security/Index', [
            'accounts' => [
                'total' => User::query()->count(),
                'active' => User::query()->where('is_active', true)->count(),
                'inactive' => User::query()->where('is_active', false)->count(),
                'superadmin' => User::role('superadmin')->count(),
                'admin' => User::role('admin')->count(),
                'operator' => User::role('operator')->count(),
            ],
            'activity' => [
                'failed_7_days' => $recentLogs->where('status', 'failed')->count(),
                'failed_logins_7_days' => $recentLogs
                    ->where('status', 'failed')
                    ->filter(fn ($log) => str_contains($log->action, 'login'))
                    ->count(),
                'by_module' => $recentLogs->groupBy('module')
                    ->map->count()
                    ->sortDesc()
                    ->take(8)
                    ->map(fn ($total, $module) => ['module' => $module, 'total' => $total])
                    ->values(),
            ],
            'recentFailures' => ActivityLog::query()
                ->where('status', 'failed')
                ->latest()
                ->limit(10)
                ->get(['id', 'created_at', 'user_name', 'role_name', 'module', 'action', 'description']),
            'recentPermissionChanges' => ActivityLog::query()
                ->where('module', 'authorization')
                ->latest()
                ->limit(10)
                ->get(['id', 'created_at', 'user_name', 'action', 'description']),
            'systemHealth' => $this->systemHealth(),
        ]);
    }

    private function systemHealth(): array
    {
        $database = $this->check(fn () => DB::connection()->getPdo() !== null);
        $cache = $this->check(function () {
            Cache::put('system:health-check', 'ok', 30);
            $healthy = Cache::get('system:health-check') === 'ok';
            Cache::forget('system:health-check');

            return $healthy;
        });
        $heartbeat = Cache::get('system:scheduler:last-heartbeat');
        $heartbeatAt = $heartbeat ? Carbon::parse($heartbeat) : null;
        $heartbeatTtl = config('operations.scheduler_heartbeat_ttl_minutes');
        $schedulerHealthy = $heartbeatAt?->greaterThan(now()->subMinutes($heartbeatTtl)) ?? false;
        $failedJobs = $this->failedJobsCount();

        return [
            'checks' => [
                ['name' => 'Database', 'status' => $database ? 'healthy' : 'critical', 'detail' => $database ? 'Koneksi tersedia' : 'Koneksi gagal'],
                ['name' => 'Cache', 'status' => $cache ? 'healthy' : 'critical', 'detail' => $cache ? 'Baca/tulis berhasil' : 'Baca/tulis gagal'],
                ['name' => 'Storage', 'status' => is_writable(storage_path()) ? 'healthy' : 'critical', 'detail' => is_writable(storage_path()) ? 'Dapat ditulis' : 'Tidak dapat ditulis'],
                ['name' => 'Scheduler', 'status' => $schedulerHealthy ? 'healthy' : 'warning', 'detail' => $heartbeatAt ? 'Terakhir '.$heartbeatAt->diffForHumans() : 'Heartbeat belum ditemukan'],
                ['name' => 'Queue gagal', 'status' => $failedJobs > 0 ? 'warning' : 'healthy', 'detail' => $failedJobs.' job gagal'],
            ],
            'runtime' => [
                'environment' => app()->environment(),
                'debug' => (bool) config('app.debug'),
                'https_forced' => (bool) config('operations.force_https'),
                'secure_cookie' => (bool) config('session.secure'),
                'session_encrypted' => (bool) config('session.encrypt'),
                'queue_connection' => config('queue.default'),
                'session_driver' => config('session.driver'),
            ],
            'activity_logs' => [
                'total' => ActivityLog::query()->count(),
                'expired' => ActivityLog::query()
                    ->where('created_at', '<', now()->subDays(config('operations.activity_log_retention_days')))
                    ->count(),
                'retention_days' => config('operations.activity_log_retention_days'),
                'oldest' => ActivityLog::query()->oldest()->value('created_at'),
            ],
            'database_size' => $this->databaseSize(),
        ];
    }

    private function failedJobsCount(): int
    {
        return Schema::hasTable('failed_jobs') ? DB::table('failed_jobs')->count() : 0;
    }

    private function databaseSize(): ?int
    {
        try {
            if (DB::getDriverName() === 'pgsql') {
                return (int) DB::selectOne('SELECT pg_database_size(current_database()) AS size')->size;
            }

            $path = DB::connection()->getDatabaseName();

            return is_file($path) ? filesize($path) : null;
        } catch (Throwable) {
            return null;
        }
    }

    private function check(callable $callback): bool
    {
        try {
            return (bool) $callback();
        } catch (Throwable) {
            return false;
        }
    }
}
