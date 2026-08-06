<?php

namespace App\Services;

use App\Models\User;
use Illuminate\Support\Facades\Cache;
use Spatie\Permission\Models\Role;

class UserAccessContext
{
    private const CACHE_TTL_SECONDS = 3600;

    public function for(User $user): array
    {
        return Cache::remember(
            $this->key($user->id),
            self::CACHE_TTL_SECONDS,
            function () use ($user): array {
                $role = $user->getRoleNames()->first();

                return [
                    'role' => $role,
                    'permissions' => $user->getAllPermissions()
                        ->pluck('name')
                        ->values()
                        ->all(),
                    'skpd_codes' => $role === 'operator'
                        ? $user->assignedSkpdCodes()->all()
                        : [],
                ];
            },
        );
    }

    public function forget(User|int $user): void
    {
        Cache::forget($this->key($user instanceof User ? $user->id : $user));
    }

    public function forgetRole(Role $role): void
    {
        User::query()
            ->role($role)
            ->pluck('users.id')
            ->each(fn ($userId) => $this->forget((int) $userId));
    }

    private function key(int $userId): string
    {
        return "user-access-context:{$userId}";
    }
}
