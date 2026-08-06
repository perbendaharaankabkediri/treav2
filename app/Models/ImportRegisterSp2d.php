<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\HasMany;

class ImportRegisterSp2d extends Model
{
    protected $table = 'tabel_import_register_sp2d';

    protected $guarded = [];

    protected function casts(): array
    {
        return [
            'tahun' => 'integer',
            'bulan' => 'integer',
            'is_active' => 'boolean',
            'confirmed_at' => 'datetime',
            'total_bruto' => 'decimal:2',
            'total_potongan' => 'decimal:2',
            'total_netto' => 'decimal:2',
        ];
    }

    public function details(): HasMany
    {
        return $this->hasMany(RegisterSp2d::class, 'import_register_sp2d_id');
    }

    public function importer(): BelongsTo
    {
        return $this->belongsTo(User::class, 'imported_by');
    }
}
