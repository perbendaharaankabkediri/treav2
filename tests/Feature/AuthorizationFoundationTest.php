<?php

use App\Models\ActivityLog;
use App\Models\User;
use App\Models\UserSkpd;
use Database\Seeders\AuthorizationSeeder;
use Illuminate\Support\Facades\Gate;
use Spatie\Permission\Models\Role;

beforeEach(function () {
    $this->seed(AuthorizationSeeder::class);
});

it('seeds the three system roles with the expected permissions', function () {
    $superadmin = Role::findByName('superadmin');
    $admin = Role::findByName('admin');
    $operator = Role::findByName('operator');

    expect($superadmin->permissions)->toHaveCount(count(AuthorizationSeeder::PERMISSIONS))
        ->and($admin->hasPermissionTo('kasda-import.execute'))->toBeTrue()
        ->and($admin->hasPermissionTo('permissions.manage'))->toBeFalse()
        ->and($admin->hasPermissionTo('users.manage-admin'))->toBeFalse()
        ->and($operator->permissions->pluck('name')->sort()->values()->all())
        ->toBe(collect(AuthorizationSeeder::OPERATOR_PERMISSIONS)->sort()->values()->all());
});

it('allows a superadmin through the application gate', function () {
    $user = User::factory()->create();
    $user->assignRole('superadmin');

    expect(Gate::forUser($user)->allows('an-unregistered-application-ability'))->toBeTrue();
});

it('supports multiple skpd assignments for one user', function () {
    $user = User::factory()->create();

    $user->skpdAssignments()->createMany([
        ['kode_skpd' => '1.01.01'],
        ['kode_skpd' => '1.02.01'],
    ]);

    expect($user->skpdAssignments()->pluck('kode_skpd')->all())
        ->toBe(['1.01.01', '1.02.01'])
        ->and(UserSkpd::query()->count())->toBe(2);
});

it('casts account state and activity log values', function () {
    $user = User::factory()->create([
        'is_active' => false,
        'last_login_at' => now(),
    ]);

    $log = ActivityLog::query()->create([
        'user_id' => $user->id,
        'action' => 'test',
        'module' => 'authorization',
        'old_values' => ['role' => null],
        'new_values' => ['role' => 'operator'],
        'status' => 'success',
    ]);

    expect($user->is_active)->toBeFalse()
        ->and($user->last_login_at)->not->toBeNull()
        ->and($log->new_values)->toBe(['role' => 'operator'])
        ->and($log->user->is($user))->toBeTrue();
});
