<?php

namespace App\Support;

use App\Models\User;
use Illuminate\Database\Eloquent\Builder as EloquentBuilder;
use Illuminate\Database\Query\Builder as QueryBuilder;
use Illuminate\Support\Collection;

class SkpdAccess
{
    public static function codes(?User $user): ?Collection
    {
        if (! $user || ! $user->hasRole('operator')) {
            return null;
        }

        return $user->assignedSkpdCodes();
    }

    public static function apply(
        EloquentBuilder|QueryBuilder $query,
        ?User $user,
        string $column = 'kode_skpd',
    ): EloquentBuilder|QueryBuilder {
        $codes = self::codes($user);

        if ($codes === null) {
            return $query;
        }

        if ($codes->isEmpty()) {
            return $query->whereRaw('1 = 0');
        }

        return $query->whereIn($column, $codes);
    }

    public static function authorize(?User $user, ?string $kodeSkpd): void
    {
        abort_unless($user?->canAccessSkpd($kodeSkpd), 403);
    }
}
