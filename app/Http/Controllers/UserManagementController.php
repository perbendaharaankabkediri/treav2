<?php

namespace App\Http\Controllers;

use App\Models\Skpd;
use App\Models\User;
use App\Services\ActivityLogger;
use App\Services\UserAccessContext;
use Database\Seeders\AuthorizationSeeder;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Str;
use Illuminate\Validation\Rule;
use Illuminate\Validation\Rules\Password;
use Inertia\Inertia;
use Inertia\Response;
use Spatie\Permission\Models\Role;

class UserManagementController extends Controller
{
    public function index(Request $request): Response
    {
        $actor = $request->user();
        $filters = $request->validate([
            'search' => ['nullable', 'string', 'max:100'],
            'role' => ['nullable', Rule::in($this->allowedRolesForFilter($actor))],
            'status' => ['nullable', Rule::in(['active', 'inactive'])],
            'kode_skpd' => ['nullable', 'string', 'max:50'],
        ]);
        $query = User::query()->with(['roles:id,name', 'skpdAssignments:id,user_id,kode_skpd']);

        if ($actor->hasRole('admin')) {
            $query->role('operator');
        }

        $query->when($filters['search'] ?? null, function ($query, $search) {
            $keyword = '%'.mb_strtolower($search).'%';
            $query->where(function ($query) use ($keyword) {
                $query->whereRaw('LOWER(name) LIKE ?', [$keyword])
                    ->orWhereRaw('LOWER(username) LIKE ?', [$keyword]);
            });
        });
        $query->when($filters['role'] ?? null, fn ($query, $role) => $query->role($role));
        $query->when(isset($filters['status']), fn ($query) => $query->where(
            'is_active',
            $filters['status'] === 'active',
        ));
        $query->when($filters['kode_skpd'] ?? null, fn ($query, $code) => $query->whereHas(
            'skpdAssignments',
            fn ($query) => $query->where('kode_skpd', $code),
        ));

        $rolePriority = Role::query()
            ->selectRaw("CASE roles.name WHEN 'superadmin' THEN 1 WHEN 'admin' THEN 2 WHEN 'operator' THEN 3 ELSE 4 END")
            ->join('model_has_roles', 'model_has_roles.role_id', '=', 'roles.id')
            ->whereColumn('model_has_roles.model_id', 'users.id')
            ->where('model_has_roles.model_type', User::class)
            ->limit(1);

        return Inertia::render('Admin/Users/Index', [
            'users' => $query
                ->orderBy($rolePriority)
                ->orderBy('name')
                ->paginate(20)
                ->withQueryString(),
            'filters' => $filters,
            'options' => [
                'roles' => $this->allowedRolesForFilter($actor),
                'skpds' => Skpd::query()
                    ->when(session('tahun'), fn ($query, $tahun) => $query->where('tahun', $tahun))
                    ->orderBy('kode_skpd')
                    ->get(['kode_skpd', 'skpd']),
            ],
        ]);
    }

    public function create(Request $request): Response
    {
        return $this->formResponse($request);
    }

    public function store(Request $request, ActivityLogger $logger): RedirectResponse
    {
        $data = $this->validateUser($request);

        $user = DB::transaction(function () use ($request, $data) {
            $user = User::query()->create([
                'name' => $data['name'],
                'username' => $data['username'],
                'password' => $data['password'],
                'is_active' => true,
                'created_by' => $request->user()->id,
            ]);
            $user->syncRoles([$data['role']]);
            if (array_key_exists('permissions', $data)) {
                $user->syncPermissions($data['permissions']);
            }
            $this->syncSkpd($user, $data);

            return $user;
        });

        $logger->record($request, 'user.created', 'user-management', context: [
            'subject_type' => User::class,
            'subject_id' => (string) $user->id,
            'description' => "Membuat akun {$user->name}.",
            'new_values' => [
                'username' => $user->username,
                'role' => $data['role'],
                'permissions' => $data['permissions'] ?? [],
                'skpd_codes' => $data['skpd_codes'] ?? [],
            ],
        ]);

        return to_route('administrasi.akun.index')->with('success', 'Akun berhasil dibuat.');
    }

    public function edit(Request $request, User $user): Response
    {
        $this->ensureManageable($request->user(), $user);

        return $this->formResponse($request, $user);
    }

    public function update(
        Request $request,
        User $user,
        ActivityLogger $logger,
        UserAccessContext $accessContext,
    ): RedirectResponse {
        $this->ensureManageable($request->user(), $user);
        $data = $this->validateUser($request, $user);
        $oldValues = $this->snapshot($user);

        DB::transaction(function () use ($user, $data) {
            $user->update(['name' => $data['name'], 'username' => $data['username']]);
            $user->syncRoles([$data['role']]);
            if (array_key_exists('permissions', $data)) {
                $user->syncPermissions($data['permissions']);
            }
            $this->syncSkpd($user, $data);
        });
        $accessContext->forget($user);

        $logger->record($request, 'user.updated', 'user-management', context: [
            'subject_type' => User::class,
            'subject_id' => (string) $user->id,
            'description' => "Memperbarui akun {$user->name}.",
            'old_values' => $oldValues,
            'new_values' => $this->snapshot($user->refresh()),
        ]);

        return to_route('administrasi.akun.index')->with('success', 'Akun berhasil diperbarui.');
    }

    public function toggleActive(
        Request $request,
        User $user,
        ActivityLogger $logger,
        UserAccessContext $accessContext,
    ): RedirectResponse {
        $this->ensureManageable($request->user(), $user);
        $oldStatus = $user->is_active;
        $user->forceFill([
            'is_active' => ! $oldStatus,
            'remember_token' => Str::random(60),
        ])->save();
        $accessContext->forget($user);

        if (! $user->is_active && config('session.driver') === 'database') {
            DB::table(config('session.table', 'sessions'))
                ->where('user_id', $user->id)
                ->delete();
        }

        $logger->record($request, 'user.status-updated', 'user-management', context: [
            'subject_type' => User::class,
            'subject_id' => (string) $user->id,
            'description' => ($user->is_active ? 'Mengaktifkan' : 'Menonaktifkan')." akun {$user->name}.",
            'old_values' => ['is_active' => $oldStatus],
            'new_values' => ['is_active' => $user->is_active],
        ]);

        return back()->with('success', 'Status akun berhasil diperbarui.');
    }

    public function resetPassword(Request $request, User $user, ActivityLogger $logger): RedirectResponse
    {
        $this->ensureManageable($request->user(), $user);
        $data = $request->validate([
            'password' => ['required', 'confirmed', Password::defaults()],
        ]);
        $user->update(['password' => $data['password']]);

        $logger->record($request, 'user.password-reset', 'user-management', context: [
            'subject_type' => User::class,
            'subject_id' => (string) $user->id,
            'description' => "Mereset kata sandi akun {$user->name}.",
        ]);

        return back()->with('success', 'Kata sandi berhasil direset.');
    }

    private function formResponse(Request $request, ?User $user = null): Response
    {
        $roles = $this->allowedRoles($request->user());
        $canManageAccountPermissions = $request->user()->hasRole('superadmin');

        return Inertia::render('Admin/Users/Form', [
            'account' => $user?->load('roles:id,name', 'permissions:id,name', 'skpdAssignments:id,user_id,kode_skpd'),
            'roles' => $roles,
            'permissions' => $canManageAccountPermissions
                ? collect(AuthorizationSeeder::PERMISSIONS)
                    ->map(fn ($permission) => ['name' => $permission])
                    ->values()
                : [],
            'rolePermissions' => $canManageAccountPermissions
                ? Role::query()
                    ->whereIn('name', $roles)
                    ->with('permissions:id,name')
                    ->get()
                    ->mapWithKeys(fn (Role $role) => [
                        $role->name => $role->permissions->pluck('name')->values(),
                    ])
                : (object) [],
            'canManageAccountPermissions' => $canManageAccountPermissions,
            'skpds' => Skpd::query()
                ->when(session('tahun'), fn ($query, $tahun) => $query->where('tahun', $tahun))
                ->orderBy('kode_skpd')
                ->get(['kode_skpd', 'skpd']),
        ]);
    }

    private function validateUser(Request $request, ?User $user = null): array
    {
        $allowedRoles = $this->allowedRoles($request->user());
        $canManageAccountPermissions = $request->user()->hasRole('superadmin');
        $selectedRole = (string) $request->input('role');
        $allowedPermissions = $this->allowedDirectPermissions($selectedRole);

        return $request->validate([
            'name' => ['required', 'string', 'max:255'],
            'username' => [
                'required',
                'string',
                'lowercase',
                'min:3',
                'max:50',
                'regex:/^[a-z0-9][a-z0-9._-]*$/',
                Rule::unique('users')->ignore($user?->id),
            ],
            'password' => [$user ? 'nullable' : 'required', 'confirmed', Password::defaults()],
            'role' => ['required', Rule::in($allowedRoles)],
            'permissions' => [
                Rule::prohibitedIf(! $canManageAccountPermissions),
                'sometimes',
                'array',
            ],
            'permissions.*' => ['string', 'distinct', Rule::in($allowedPermissions)],
            'skpd_codes' => ['exclude_unless:role,operator', 'required', 'array', 'min:1'],
            'skpd_codes.*' => [
                'exclude_unless:role,operator',
                'string',
                'distinct',
                Rule::exists('tabel_skpd', 'kode_skpd')->where('tahun', (string) session('tahun')),
            ],
        ]);
    }

    private function allowedRoles(User $actor): array
    {
        return $actor->hasRole('superadmin') ? ['admin', 'operator'] : ['operator'];
    }

    private function allowedRolesForFilter(User $actor): array
    {
        return $actor->hasRole('superadmin')
            ? ['superadmin', 'admin', 'operator']
            : ['operator'];
    }

    private function ensureManageable(User $actor, User $target): void
    {
        abort_if($actor->is($target), 403, 'Akun sendiri tidak dapat dikelola dari halaman ini.');
        abort_if($target->hasRole('superadmin'), 403, 'Akun Superadmin dilindungi.');
        abort_if($actor->hasRole('admin') && ! $target->hasRole('operator'), 403);
    }

    private function syncSkpd(User $user, array $data): void
    {
        $user->skpdAssignments()->delete();

        if ($data['role'] === 'operator') {
            $user->skpdAssignments()->createMany(
                collect($data['skpd_codes'] ?? [])->map(fn ($code) => ['kode_skpd' => $code])->all()
            );
        }
    }

    private function allowedDirectPermissions(string $role): array
    {
        return match ($role) {
            'admin' => array_values(array_diff(
                AuthorizationSeeder::PERMISSIONS,
                AuthorizationSeeder::ADMIN_EXCLUSIONS,
            )),
            'operator' => AuthorizationSeeder::OPERATOR_PERMISSIONS,
            default => [],
        };
    }

    private function snapshot(User $user): array
    {
        return [
            'name' => $user->name,
            'username' => $user->username,
            'role' => $user->getRoleNames()->first(),
            'permissions' => $user->permissions()->pluck('name')->sort()->values()->all(),
            'skpd_codes' => $user->assignedSkpdCodes()->all(),
        ];
    }
}
