<?php

namespace Database\Seeders;

use App\Models\User;
use Illuminate\Database\Seeder;
use Spatie\Permission\Models\Permission;
use Spatie\Permission\Models\Role;
use Spatie\Permission\PermissionRegistrar;

class AuthorizationSeeder extends Seeder
{
    public const PERMISSIONS = [
        'dashboard.view',
        'users.view',
        'users.create',
        'users.update',
        'users.activate',
        'users.reset-password',
        'users.assign-skpd',
        'users.assign-operator',
        'users.manage-admin',
        'roles.manage',
        'permissions.manage',
        'activity-log.view',
        'skpd.view',
        'bendahara.view',
        'bendahara.manage',
        'bud.view',
        'bud.manage',
        'icsa-rekon.view',
        'icsa-rekon.create',
        'icsa-rekon.update',
        'icsa-rekon.delete',
        'icsa-rekon.print',
        'icsa-rekon.export',
        'icsa-rekap.view',
        'kasda-import.execute',
        'kasda-saldo-awal.view',
        'kasda-saldo-awal.manage',
        'kasda-matching.view',
        'kasda-matching.execute',
        'kasda-matching.undo',
        'kasda-matching.delete',
        'kasda-rekon.view',
        'kasda-rekon.manage',
        'kasda-rekon.print',
        'kasda-monitoring.view',
        'laporan.export',
    ];

    public const ADMIN_EXCLUSIONS = [
        'roles.manage',
        'permissions.manage',
        'users.manage-admin',
    ];

    public const OPERATOR_PERMISSIONS = [
        'dashboard.view',
        'icsa-rekon.view',
        'icsa-rekon.print',
        'icsa-rekon.export',
        'icsa-rekap.view',
        'laporan.export',
        'bendahara.view',
    ];

    public function run(): void
    {
        app(PermissionRegistrar::class)->forgetCachedPermissions();

        foreach (self::PERMISSIONS as $permission) {
            Permission::findOrCreate($permission, 'web');
        }

        $superadmin = Role::query()->firstOrCreate(['name' => 'superadmin', 'guard_name' => 'web']);
        $admin = Role::query()->firstOrCreate(['name' => 'admin', 'guard_name' => 'web']);
        $operator = Role::query()->firstOrCreate(['name' => 'operator', 'guard_name' => 'web']);

        if ($superadmin->wasRecentlyCreated) {
            $superadmin->syncPermissions(self::PERMISSIONS);
        }

        if ($admin->wasRecentlyCreated) {
            $admin->syncPermissions(array_values(array_diff(
                self::PERMISSIONS,
                self::ADMIN_EXCLUSIONS,
            )));
        }

        if ($operator->wasRecentlyCreated) {
            $operator->syncPermissions(self::OPERATOR_PERMISSIONS);
        }

        $bootstrapUsername = config('authorization.bootstrap_superadmin_username');

        if ($bootstrapUsername) {
            User::query()
                ->whereRaw('LOWER(username) = ?', [mb_strtolower($bootstrapUsername)])
                ->first()
                ?->syncRoles([$superadmin]);
        }

        app(PermissionRegistrar::class)->forgetCachedPermissions();
    }
}
