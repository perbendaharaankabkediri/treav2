<?php

namespace App\Console\Commands;

use Illuminate\Console\Command;

class CheckProductionReadiness extends Command
{
    protected $signature = 'system:check-production';

    protected $description = 'Memeriksa konfigurasi minimum sebelum deployment produksi';

    public function handle(): int
    {
        $checks = [
            ['APP_ENV production', app()->isProduction()],
            ['APP_DEBUG nonaktif', ! config('app.debug')],
            ['APP_KEY tersedia', filled(config('app.key'))],
            ['HTTPS dipaksa', (bool) config('operations.force_https')],
            ['Session cookie secure', (bool) config('session.secure')],
            ['Session terenkripsi', (bool) config('session.encrypt')],
            ['Queue bukan sync', config('queue.default') !== 'sync'],
            ['Log level bukan debug', config('logging.channels.single.level') !== 'debug'],
        ];

        $this->table(
            ['Pemeriksaan', 'Status'],
            collect($checks)->map(fn ($check) => [$check[0], $check[1] ? 'OK' : 'PERLU DIPERBAIKI'])->all(),
        );

        $failed = collect($checks)->where(fn ($check) => ! $check[1])->count();

        if ($failed > 0) {
            $this->error("{$failed} pemeriksaan belum memenuhi konfigurasi produksi.");

            return self::FAILURE;
        }

        $this->info('Konfigurasi dasar produksi sudah memenuhi pemeriksaan.');

        return self::SUCCESS;
    }
}
