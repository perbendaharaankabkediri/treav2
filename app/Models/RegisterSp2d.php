<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class RegisterSp2d extends Model
{
    protected $table = 'tabel_register_sp2d';

    protected $guarded = [];

    protected function casts(): array
    {
        return [
            'tanggal_pembuatan' => 'date',
            'tanggal_pencairan' => 'date',
            'bruto' => 'decimal:2',
            'potongan' => 'decimal:2',
            'netto' => 'decimal:2',
        ];
    }

    public function importBatch(): BelongsTo
    {
        return $this->belongsTo(ImportRegisterSp2d::class, 'import_register_sp2d_id');
    }
}
