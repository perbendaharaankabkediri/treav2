<?php

use App\Models\ActivityLog;
use App\Models\ActivityNotificationRecipient;
use App\Models\User;
use App\Services\ActivityNotificationService;
use Database\Seeders\AuthorizationSeeder;

beforeEach(function () {
    $this->seed(AuthorizationSeeder::class);
});

it('notifies superadmin admin and actor about an important operator activity', function () {
    $superadmin = User::factory()->create();
    $superadmin->assignRole('superadmin');
    $admin = User::factory()->create();
    $admin->assignRole('admin');
    $operator = User::factory()->create();
    $operator->assignRole('operator');

    $log = ActivityLog::query()->create([
        'user_id' => $operator->id,
        'user_name' => $operator->name,
        'role_name' => 'operator',
        'action' => 'report.exported',
        'module' => 'report',
        'description' => 'Operator mengekspor laporan.',
        'status' => 'success',
    ]);

    app(ActivityNotificationService::class)->createFor($log);

    expect(ActivityNotificationRecipient::query()->pluck('user_id')->all())
        ->toHaveCount(3)
        ->toContain($superadmin->id, $admin->id, $operator->id);
});

it('does not turn routine activity into a notification', function () {
    $operator = User::factory()->create();
    $operator->assignRole('operator');
    $log = ActivityLog::query()->create([
        'user_id' => $operator->id,
        'user_name' => $operator->name,
        'role_name' => 'operator',
        'action' => 'reconciliation.created',
        'module' => 'reconciliation',
        'status' => 'success',
    ]);

    app(ActivityNotificationService::class)->createFor($log);

    expect(ActivityNotificationRecipient::query()->count())->toBe(0);
});

it('only lets the recipient mark a notification as read', function () {
    $operator = User::factory()->create();
    $operator->assignRole('operator');
    $other = User::factory()->create();
    $other->assignRole('operator');
    $log = ActivityLog::query()->create([
        'user_id' => $operator->id,
        'user_name' => $operator->name,
        'role_name' => 'operator',
        'action' => 'operation.failed',
        'module' => 'test',
        'status' => 'failed',
    ]);
    app(ActivityNotificationService::class)->createFor($log);
    $recipient = ActivityNotificationRecipient::query()->where('user_id', $operator->id)->firstOrFail();

    $this->actingAs($other)
        ->patch(route('notifications.read', $recipient))
        ->assertForbidden();

    $this->actingAs($operator)
        ->patch(route('notifications.read', $recipient))
        ->assertRedirect();

    expect($recipient->refresh()->read_at)->not->toBeNull();
});
