<?php

namespace App\Models;

use Database\Factories\UserFactory;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Relations\HasMany;
use Illuminate\Foundation\Auth\User as Authenticatable;
use Illuminate\Notifications\Notifiable;
use Illuminate\Support\Collection;
use Spatie\Permission\Traits\HasRoles;

class User extends Authenticatable
{
    /** @use HasFactory<UserFactory> */
    use HasFactory, HasRoles, Notifiable;

    /**
     * The attributes that are mass assignable.
     *
     * @var list<string>
     */
    protected $fillable = [
        'name',
        'username',
        'password',
        'is_active',
        'created_by',
    ];

    /**
     * The attributes that should be hidden for serialization.
     *
     * @var list<string>
     */
    protected $hidden = [
        'password',
        'remember_token',
    ];

    /**
     * Get the attributes that should be cast.
     *
     * @return array<string, string>
     */
    protected function casts(): array
    {
        return [
            'is_active' => 'boolean',
            'last_login_at' => 'datetime',
            'password' => 'hashed',
        ];
    }

    public function skpdAssignments(): HasMany
    {
        return $this->hasMany(UserSkpd::class);
    }

    public function activityLogs(): HasMany
    {
        return $this->hasMany(ActivityLog::class);
    }

    public function notificationRecipients(): HasMany
    {
        return $this->hasMany(ActivityNotificationRecipient::class);
    }

    public function assignedSkpdCodes(): Collection
    {
        return $this->skpdAssignments()
            ->pluck('kode_skpd')
            ->map(fn ($code) => (string) $code)
            ->values();
    }

    public function canAccessSkpd(?string $kodeSkpd): bool
    {
        if (! $this->hasRole('operator')) {
            return true;
        }

        return $kodeSkpd !== null
            && $this->assignedSkpdCodes()->contains($kodeSkpd);
    }
}
