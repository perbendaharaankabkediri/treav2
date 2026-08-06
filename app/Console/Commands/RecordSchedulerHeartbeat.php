<?php

namespace App\Console\Commands;

use Illuminate\Console\Command;
use Illuminate\Support\Facades\Cache;

class RecordSchedulerHeartbeat extends Command
{
    protected $signature = 'system:scheduler-heartbeat';

    protected $description = 'Mencatat waktu terakhir scheduler aplikasi berjalan';

    public function handle(): int
    {
        Cache::put('system:scheduler:last-heartbeat', now()->toIso8601String(), now()->addDay());
        $this->info('Scheduler heartbeat recorded.');

        return self::SUCCESS;
    }
}
