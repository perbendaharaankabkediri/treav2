<?php

namespace App\Console\Commands;

use Illuminate\Console\Command;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Schema;

class PruneExpiredSessions extends Command
{
    protected $signature = 'system:prune-sessions';

    protected $description = 'Menghapus session database yang telah melewati masa aktif';

    public function handle(): int
    {
        if (config('session.driver') !== 'database' || ! Schema::hasTable(config('session.table', 'sessions'))) {
            $this->info('Session database tidak digunakan; tidak ada data yang dihapus.');

            return self::SUCCESS;
        }

        $cutoff = now()->subMinutes((int) config('session.lifetime'))->timestamp;
        $deleted = DB::table(config('session.table', 'sessions'))
            ->where('last_activity', '<', $cutoff)
            ->delete();

        $this->info(number_format($deleted).' session kedaluwarsa dihapus.');

        return self::SUCCESS;
    }
}
