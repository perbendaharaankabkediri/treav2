<?php

namespace App\Console\Commands;

use App\Models\ActivityLog;
use Illuminate\Console\Command;

class PruneActivityLogs extends Command
{
    protected $signature = 'activity-logs:prune
                            {--days= : Jumlah hari retensi}
                            {--force : Hapus data tanpa mode preview}
                            {--chunk=1000 : Jumlah baris per proses}';

    protected $description = 'Preview atau hapus activity log yang melewati masa retensi';

    public function handle(): int
    {
        $days = max(30, (int) ($this->option('days') ?: config('operations.activity_log_retention_days')));
        $chunk = max(100, min(5000, (int) $this->option('chunk')));
        $cutoff = now()->subDays($days);
        $query = ActivityLog::query()->where('created_at', '<', $cutoff);
        $count = (clone $query)->count();

        $this->table(
            ['Retensi', 'Batas waktu', 'Log yang memenuhi'],
            [[$days.' hari', $cutoff->format('Y-m-d H:i:s'), number_format($count)]],
        );

        if (! $this->option('force')) {
            $this->warn('Mode preview: tidak ada data yang dihapus. Tambahkan --force untuk menjalankan cleanup.');

            return self::SUCCESS;
        }

        $deleted = 0;
        do {
            $ids = ActivityLog::query()
                ->where('created_at', '<', $cutoff)
                ->orderBy('id')
                ->limit($chunk)
                ->pluck('id');

            if ($ids->isEmpty()) {
                break;
            }

            $deleted += ActivityLog::query()->whereIn('id', $ids)->delete();
        } while (true);

        ActivityLog::query()->create([
            'action' => 'activity-log.pruned',
            'module' => 'system-maintenance',
            'description' => "Menghapus {$deleted} activity log yang lebih lama dari {$days} hari.",
            'metadata' => [
                'retention_days' => $days,
                'cutoff' => $cutoff->toIso8601String(),
                'deleted_count' => $deleted,
            ],
            'status' => 'success',
        ]);

        $this->info(number_format($deleted).' activity log berhasil dihapus.');

        return self::SUCCESS;
    }
}
