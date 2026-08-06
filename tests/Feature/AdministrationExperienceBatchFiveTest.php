<?php

use App\Models\ActivityLog;
use App\Models\User;
use Database\Seeders\AuthorizationSeeder;

beforeEach(function () {
    $this->seed(AuthorizationSeeder::class);
});

it('orders managed accounts by role hierarchy', function () {
    $operator = User::factory()->create(['name' => 'A Operator']);
    $operator->assignRole('operator');
    $admin = User::factory()->create(['name' => 'B Admin']);
    $admin->assignRole('admin');
    $superadmin = User::factory()->create(['name' => 'C Superadmin']);
    $superadmin->assignRole('superadmin');

    $this->actingAs($superadmin)
        ->get(route('administrasi.akun.index'))
        ->assertInertia(fn ($page) => $page
            ->where('users.data.0.id', $superadmin->id)
            ->where('users.data.1.id', $admin->id)
            ->where('users.data.2.id', $operator->id));
});

it('filters manageable accounts by search role and status', function () {
    $superadmin = User::factory()->create();
    $superadmin->assignRole('superadmin');
    $activeOperator = User::factory()->create([
        'name' => 'Operator Khusus',
        'username' => 'operator.khusus',
        'is_active' => true,
    ]);
    $activeOperator->assignRole('operator');
    $inactiveOperator = User::factory()->create(['is_active' => false]);
    $inactiveOperator->assignRole('operator');

    $this->actingAs($superadmin)
        ->get(route('administrasi.akun.index', [
            'search' => 'Khusus',
            'role' => 'operator',
            'status' => 'active',
        ]))
        ->assertOk()
        ->assertInertia(fn ($page) => $page
            ->has('users.data', 1)
            ->where('users.data.0.id', $activeOperator->id)
            ->where('filters.search', 'Khusus'));
});

it('does not let admin use account filters to expose higher roles', function () {
    $admin = User::factory()->create();
    $admin->assignRole('admin');

    $this->actingAs($admin)
        ->get(route('administrasi.akun.index', ['role' => 'admin']))
        ->assertSessionHasErrors('role');
});

it('exports only visible and filtered activity logs for admin', function () {
    $admin = User::factory()->create();
    $admin->assignRole('admin');

    ActivityLog::query()->create([
        'user_name' => 'Operator',
        'role_name' => 'operator',
        'action' => 'login.failed',
        'module' => 'authentication',
        'description' => 'Login operator gagal',
        'status' => 'failed',
    ]);
    ActivityLog::query()->create([
        'user_name' => 'Root',
        'role_name' => 'superadmin',
        'action' => 'role.permissions-updated',
        'module' => 'authorization',
        'description' => 'Rahasia Superadmin',
        'status' => 'success',
    ]);

    $response = $this->actingAs($admin)
        ->get(route('administrasi.log-aktivitas.export', ['status' => 'failed']))
        ->assertOk()
        ->assertHeader('content-type', 'text/csv; charset=UTF-8');

    expect($response->streamedContent())
        ->toContain('Login operator gagal')
        ->not->toContain('Rahasia Superadmin');
});

it('shows security dashboard only to superadmin', function () {
    $superadmin = User::factory()->create();
    $superadmin->assignRole('superadmin');
    $admin = User::factory()->create();
    $admin->assignRole('admin');
    $operator = User::factory()->create();
    $operator->assignRole('operator');

    $this->actingAs($superadmin)
        ->get(route('administrasi.keamanan.index'))
        ->assertOk()
        ->assertInertia(fn ($page) => $page
            ->where('accounts.total', 3)
            ->where('accounts.superadmin', 1)
            ->where('accounts.admin', 1)
            ->where('accounts.operator', 1));

    $this->actingAs($admin)
        ->get(route('administrasi.keamanan.index'))
        ->assertForbidden();
});

it('supports free text and role filters for activity logs', function () {
    $superadmin = User::factory()->create();
    $superadmin->assignRole('superadmin');

    ActivityLog::query()->create([
        'user_name' => 'Operator Satu',
        'role_name' => 'operator',
        'action' => 'report.exported',
        'module' => 'report',
        'description' => 'Export laporan khusus',
        'status' => 'success',
    ]);
    ActivityLog::query()->create([
        'user_name' => 'Admin',
        'role_name' => 'admin',
        'action' => 'login.success',
        'module' => 'authentication',
        'description' => 'Aktivitas lain',
        'status' => 'success',
    ]);

    $this->actingAs($superadmin)
        ->get(route('administrasi.log-aktivitas.index', ['search' => 'khusus', 'role' => 'operator']))
        ->assertOk()
        ->assertInertia(fn ($page) => $page
            ->has('logs.data', 1)
            ->where('logs.data.0.action', 'report.exported'));
});
