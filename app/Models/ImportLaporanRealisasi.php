<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\HasMany;

class ImportLaporanRealisasi extends Model
{
    protected $table = 'tabel_import_laporan_realisasi';

    protected $guarded = [];

    protected function casts(): array
    {
        return [
            'tahun' => 'integer',
            'bulan' => 'integer',
            'is_active' => 'boolean',
            'confirmed_at' => 'datetime',
            'total_realisasi' => 'decimal:2',
            'total_setoran' => 'decimal:2',
            'total_sp2d_unik' => 'decimal:2',
        ];
    }

    public function details(): HasMany
    {
        return $this->hasMany(LaporanRealisasi::class, 'import_laporan_realisasi_id');
    }

    public function importer(): BelongsTo
    {
        return $this->belongsTo(User::class, 'imported_by');
    }
}
