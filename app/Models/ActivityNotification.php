<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\HasMany;

class ActivityNotification extends Model
{
    public const UPDATED_AT = null;

    protected $fillable = [
        'activity_log_id',
        'type',
        'severity',
        'title',
        'message',
    ];

    public function activityLog(): BelongsTo
    {
        return $this->belongsTo(ActivityLog::class);
    }

    public function recipients(): HasMany
    {
        return $this->hasMany(ActivityNotificationRecipient::class);
    }
}
