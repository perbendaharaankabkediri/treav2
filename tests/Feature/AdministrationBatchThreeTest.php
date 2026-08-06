<?php

use App\Models\ActivityLog;
use App\Models\User;
use Database\Seeders\AuthorizationSeeder;
use Illuminate\Support\Facades\DB;
use Spatie\Permission\Models\Permission;
use Spatie\Permission\Models\Role;

beforeEach(function () {
    $this->seed(AuthorizationSeeder::class);

    DB::table('tabel_skpd')->insert([
        'tahun' => '2026',
        'kode_skpd' => '1.01.01',
        'skpd' => 'SKPD Pengujian',
    ]);
});

it('allows an admin to create an operator with an skpd assignment', function () {
    $admin = User::factory()->create();
    $admin->assignRole('admin');

    $this->actingAs($admin)->withSession(['tahun' => 2026])->post(route('administrasi.akun.store'), [
        'name' => 'Operator SKPD',
        'username' => 'operator.skpd',
        'password' => 'Password123!',
        'password_confirmation' => 'Password123!',
        'role' => 'operator',
        'skpd_codes' => ['1.01.01'],
    ])->assertRedirect(route('administrasi.akun.index'));

    $operator = User::query()->where('username', 'operator.skpd')->firstOrFail();
    expect($operator->hasRole('operator'))->toBeTrue()
        ->and($operator->assignedSkpdCodes()->all())->toBe(['1.01.01']);

    $this->assertDatabaseHas('activity_logs', [
        'user_id' => $admin->id,
        'action' => 'user.created',
        'subject_id' => (string) $operator->id,
    ]);
});

it('allows a superadmin to create an admin without an skpd assignment', function () {
    $superadmin = User::factory()->create();
    $superadmin->assignRole('superadmin');

    $this->actingAs($superadmin)->withSession(['tahun' => 2026])->post(route('administrasi.akun.store'), [
        'name' => 'Admin Perbendaharaan',
        'username' => 'admin.perbendaharaan',
        'password' => 'Password123!',
        'password_confirmation' => 'Password123!',
        'role' => 'admin',
        'skpd_codes' => [],
    ])->assertRedirect(route('administrasi.akun.index'));

    $admin = User::query()->where('username', 'admin.perbendaharaan')->firstOrFail();

    expect($admin->hasRole('admin'))->toBeTrue()
        ->and($admin->assignedSkpdCodes())->toBeEmpty();
});

it('allows a superadmin to assign permissions directly to an account', function () {
    $superadmin = User::factory()->create();
    $superadmin->assignRole('superadmin');
    Role::findByName('admin')->revokePermissionTo('bud.manage');

    $this->actingAs($superadmin)->withSession(['tahun' => 2026])->post(route('administrasi.akun.store'), [
        'name' => 'Admin BUD',
        'username' => 'admin.bud',
        'password' => 'Password123!',
        'password_confirmation' => 'Password123!',
        'role' => 'admin',
        'permissions' => ['bud.manage'],
        'skpd_codes' => [],
    ])->assertRedirect(route('administrasi.akun.index'));

    $admin = User::query()->where('username', 'admin.bud')->firstOrFail();

    expect($admin->permissions->pluck('name')->all())->toBe(['bud.manage'])
        ->and($admin->can('bud.manage'))->toBeTrue();
});

it('allows a superadmin to replace direct account permissions', function () {
    $superadmin = User::factory()->create();
    $superadmin->assignRole('superadmin');
    $admin = User::factory()->create();
    $admin->assignRole('admin');
    $admin->givePermissionTo('bud.manage');

    $this->actingAs($superadmin)->withSession(['tahun' => 2026])->put(route('administrasi.akun.update', $admin), [
        'name' => $admin->name,
        'username' => $admin->username,
        'role' => 'admin',
        'permissions' => ['bendahara.manage'],
        'skpd_codes' => [],
    ])->assertRedirect(route('administrasi.akun.index'));

    expect($admin->fresh()->permissions->pluck('name')->all())->toBe(['bendahara.manage']);
});

it('prevents an admin from assigning direct permissions to an operator', function () {
    $admin = User::factory()->create();
    $admin->assignRole('admin');

    $this->actingAs($admin)->withSession(['tahun' => 2026])->post(route('administrasi.akun.store'), [
        'name' => 'Operator Khusus',
        'username' => 'operator.khusus',
        'password' => 'Password123!',
        'password_confirmation' => 'Password123!',
        'role' => 'operator',
        'permissions' => ['dashboard.view'],
        'skpd_codes' => ['1.01.01'],
    ])->assertSessionHasErrors('permissions');

    $this->assertDatabaseMissing('users', ['username' => 'operator.khusus']);
});

it('keeps direct account permissions inside the selected role boundary', function () {
    $superadmin = User::factory()->create();
    $superadmin->assignRole('superadmin');

    $this->actingAs($superadmin)->withSession(['tahun' => 2026])->post(route('administrasi.akun.store'), [
        'name' => 'Operator Tidak Aman',
        'username' => 'operator.tidakaman',
        'password' => 'Password123!',
        'password_confirmation' => 'Password123!',
        'role' => 'operator',
        'permissions' => ['users.create'],
        'skpd_codes' => ['1.01.01'],
    ])->assertSessionHasErrors('permissions.0');
});

it('prevents an admin from creating or editing an admin account', function () {
    $admin = User::factory()->create();
    $admin->assignRole('admin');
    $otherAdmin = User::factory()->create();
    $otherAdmin->assignRole('admin');

    $this->actingAs($admin)->withSession(['tahun' => 2026])->post(route('administrasi.akun.store'), [
        'name' => 'Admin Baru',
        'username' => 'admin.baru',
        'password' => 'Password123!',
        'password_confirmation' => 'Password123!',
        'role' => 'admin',
        'skpd_codes' => [],
    ])->assertSessionHasErrors('role');

    $this->actingAs($admin)->get(route('administrasi.akun.edit', $otherAdmin))->assertForbidden();
});

it('protects superadmin and the current account from management actions', function () {
    $superadmin = User::factory()->create();
    $superadmin->assignRole('superadmin');
    $anotherSuperadmin = User::factory()->create();
    $anotherSuperadmin->assignRole('superadmin');

    $this->actingAs($superadmin)
        ->patch(route('administrasi.akun.toggle-active', $anotherSuperadmin))
        ->assertForbidden();

    $this->actingAs($superadmin)
        ->patch(route('administrasi.akun.toggle-active', $superadmin))
        ->assertForbidden();
});

it('keeps role permissions inside their security boundary', function () {
    $superadmin = User::factory()->create();
    $superadmin->assignRole('superadmin');
    $operatorRole = Role::findByName('operator');

    $this->actingAs($superadmin)->put(route('administrasi.role-permission.update', $operatorRole), [
        'permissions' => ['dashboard.view', 'users.create'],
    ])->assertSessionHasErrors('permissions.1');

    expect($operatorRole->fresh()->hasPermissionTo('users.create'))->toBeFalse();
});

it('does not expose obsolete permissions in the role permission form', function () {
    $superadmin = User::factory()->create();
    $superadmin->assignRole('superadmin');
    $adminRole = Role::findByName('admin');
    $obsolete = Permission::findOrCreate('laporan-realisasi.view', 'web');
    $adminRole->givePermissionTo($obsolete);

    $this->actingAs($superadmin)
        ->get(route('administrasi.role-permission.index'))
        ->assertInertia(fn ($page) => $page
            ->where('permissions', fn ($permissions) => ! collect($permissions)->contains('laporan-realisasi.view'))
            ->where(
                'roles.0.permissions',
                fn ($permissions) => ! collect($permissions)->contains(
                    fn ($permission) => $permission['name'] === 'laporan-realisasi.view',
                ),
            ));
});

it('hides authorization and superadmin activity from an admin', function () {
    $admin = User::factory()->create();
    $admin->assignRole('admin');

    ActivityLog::query()->create([
        'user_name' => 'Root',
        'role_name' => 'superadmin',
        'action' => 'role.permissions-updated',
        'module' => 'authorization',
        'status' => 'success',
    ]);
    ActivityLog::query()->create([
        'user_name' => 'Operator',
        'role_name' => 'operator',
        'action' => 'login.success',
        'module' => 'auth',
        'status' => 'success',
    ]);

    $this->actingAs($admin)->get(route('administrasi.log-aktivitas.index'))
        ->assertOk()
        ->assertInertia(fn ($page) => $page
            ->has('logs.data', 1)
            ->where('logs.data.0.module', 'auth'));
});
