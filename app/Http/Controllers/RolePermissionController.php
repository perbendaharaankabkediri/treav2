<?php

namespace App\Http\Controllers;

use App\Services\ActivityLogger;
use App\Services\UserAccessContext;
use Database\Seeders\AuthorizationSeeder;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Illuminate\Validation\Rule;
use Inertia\Inertia;
use Inertia\Response;
use Spatie\Permission\Models\Permission;
use Spatie\Permission\Models\Role;

class RolePermissionController extends Controller
{
    public function index(): Response
    {
        return Inertia::render('Admin/Permissions/Index', [
            'permissions' => Permission::query()
                ->whereIn('name', AuthorizationSeeder::PERMISSIONS)
                ->orderBy('name')
                ->pluck('name'),
            'roles' => Role::query()
                ->whereIn('name', ['admin', 'operator'])
                ->with([
                    'permissions' => fn ($query) => $query
                        ->whereIn('name', AuthorizationSeeder::PERMISSIONS)
                        ->select('permissions.id', 'permissions.name'),
                ])
                ->orderBy('name')
                ->get(['id', 'name']),
            'locked' => [
                'admin' => AuthorizationSeeder::ADMIN_EXCLUSIONS,
                'operator_allowed' => AuthorizationSeeder::OPERATOR_PERMISSIONS,
            ],
        ]);
    }

    public function update(
        Request $request,
        Role $role,
        ActivityLogger $logger,
        UserAccessContext $accessContext,
    ): RedirectResponse
    {
        abort_unless(in_array($role->name, ['admin', 'operator'], true), 403);

        $allowed = $role->name === 'admin'
            ? array_values(array_diff(AuthorizationSeeder::PERMISSIONS, AuthorizationSeeder::ADMIN_EXCLUSIONS))
            : AuthorizationSeeder::OPERATOR_PERMISSIONS;

        $data = $request->validate([
            'permissions' => ['array'],
            'permissions.*' => ['string', 'distinct', Rule::in($allowed)],
        ]);
        $oldPermissions = $role->permissions()->pluck('name')->sort()->values()->all();
        $role->syncPermissions($data['permissions'] ?? []);
        $accessContext->forgetRole($role);

        $logger->record($request, 'role.permissions-updated', 'authorization', context: [
            'subject_type' => Role::class,
            'subject_id' => (string) $role->id,
            'description' => "Memperbarui permission role {$role->name}.",
            'old_values' => ['permissions' => $oldPermissions],
            'new_values' => ['permissions' => collect($data['permissions'] ?? [])->sort()->values()->all()],
        ]);

        return back()->with('success', "Permission {$role->name} berhasil diperbarui.");
    }
}
