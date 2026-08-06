<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class UserSkpd extends Model
{
    protected $table = 'user_skpd';

    protected $fillable = [
        'user_id',
        'kode_skpd',
    ];

    public function user(): BelongsTo
    {
        return $this->belongsTo(User::class);
    }
}
