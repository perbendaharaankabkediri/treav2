<?php

use Illuminate\Foundation\Inspiring;
use Illuminate\Support\Facades\Artisan;
use Illuminate\Support\Facades\Schedule;

Artisan::command('inspire', function () {
    $this->comment(Inspiring::quote());
})->purpose('Display an inspiring quote');

Schedule::command('system:scheduler-heartbeat')
    ->everyFiveMinutes()
    ->withoutOverlapping(10);

Schedule::command('activity-logs:prune --force')
    ->monthlyOn(1, '02:15')
    ->withoutOverlapping(120)
    ->onOneServer();

Schedule::command('system:prune-sessions')
    ->dailyAt('03:15')
    ->withoutOverlapping(30)
    ->onOneServer();
