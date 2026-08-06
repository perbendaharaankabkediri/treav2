<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class ActivityNotificationRecipient extends Model
{
    public const UPDATED_AT = null;

    protected $fillable = [
        'activity_notification_id',
        'user_id',
        'read_at',
    ];

    protected function casts(): array
    {
        return ['read_at' => 'datetime', 'created_at' => 'datetime'];
    }

    public function notification(): BelongsTo
    {
        return $this->belongsTo(ActivityNotification::class, 'activity_notification_id');
    }

    public function user(): BelongsTo
    {
        return $this->belongsTo(User::class);
    }
}
