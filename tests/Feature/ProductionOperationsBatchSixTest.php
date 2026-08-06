<?php

use App\Models\User;
use Database\Seeders\AuthorizationSeeder;
use Illuminate\Support\Facades\Cache;
use Illuminate\Support\Facades\DB;

beforeEach(function () {
    $this->seed(AuthorizationSeeder::class);
});

it('previews expired activity logs without deleting them', function () {
    DB::table('activity_logs')->insert([
        'action' => 'old.event',
        'module' => 'test',
        'status' => 'success',
        'created_at' => now()->subDays(400),
    ]);

    $this->artisan('activity-logs:prune', ['--days' => 365])
        ->expectsOutputToContain('Mode preview')
        ->assertSuccessful();

    $this->assertDatabaseHas('activity_logs', ['action' => 'old.event']);
});

it('prunes only expired activity logs and records a system audit', function () {
    DB::table('activity_logs')->insert([
        [
            'action' => 'old.event',
            'module' => 'test',
            'status' => 'success',
            'created_at' => now()->subDays(400),
        ],
        [
            'action' => 'recent.event',
            'module' => 'test',
            'status' => 'success',
            'created_at' => now()->subDays(10),
        ],
    ]);

    $this->artisan('activity-logs:prune', ['--days' => 365, '--force' => true])
        ->assertSuccessful();

    $this->assertDatabaseMissing('activity_logs', ['action' => 'old.event']);
    $this->assertDatabaseHas('activity_logs', ['action' => 'recent.event']);
    $this->assertDatabaseHas('activity_logs', [
        'action' => 'activity-log.pruned',
        'module' => 'system-maintenance',
    ]);
});

it('records scheduler heartbeat and exposes healthy status to superadmin', function () {
    $this->artisan('system:scheduler-heartbeat')->assertSuccessful();
    expect(Cache::get('system:scheduler:last-heartbeat'))->not->toBeNull();

    $superadmin = User::factory()->create();
    $superadmin->assignRole('superadmin');

    $this->actingAs($superadmin)
        ->get(route('administrasi.keamanan.index'))
        ->assertOk()
        ->assertInertia(fn ($page) => $page
            ->where('systemHealth.checks.3.name', 'Scheduler')
            ->where('systemHealth.checks.3.status', 'healthy')
            ->where('systemHealth.activity_logs.retention_days', 365));
});

it('removes expired database sessions while keeping current sessions', function () {
    config()->set('session.driver', 'database');
    config()->set('session.lifetime', 120);

    DB::table('sessions')->insert([
        [
            'id' => 'expired-session',
            'payload' => 'payload',
            'last_activity' => now()->subHours(3)->timestamp,
        ],
        [
            'id' => 'current-session',
            'payload' => 'payload',
            'last_activity' => now()->timestamp,
        ],
    ]);

    $this->artisan('system:prune-sessions')->assertSuccessful();

    $this->assertDatabaseMissing('sessions', ['id' => 'expired-session']);
    $this->assertDatabaseHas('sessions', ['id' => 'current-session']);
});

it('adds browser security headers to web responses', function () {
    $this->get('/')
        ->assertOk()
        ->assertHeader('X-Content-Type-Options', 'nosniff')
        ->assertHeader('X-Frame-Options', 'SAMEORIGIN')
        ->assertHeader('Referrer-Policy', 'strict-origin-when-cross-origin')
        ->assertHeader('Permissions-Policy', 'camera=(), microphone=(), geolocation=()')
        ->assertHeader('Cross-Origin-Opener-Policy', 'same-origin')
        ->assertHeader('Content-Security-Policy-Report-Only');
});
