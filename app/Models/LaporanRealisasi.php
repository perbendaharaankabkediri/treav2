<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class LaporanRealisasi extends Model
{
    protected $table = 'tabel_laporan_realisasi';

    protected $guarded = [];

    protected function casts(): array
    {
        return [
            'tanggal_dokumen' => 'date',
            'tanggal_simpan' => 'date',
            'tanggal_spp' => 'date',
            'tanggal_spm' => 'date',
            'tanggal_sp2d' => 'date',
            'tanggal_transfer' => 'date',
            'nilai_realisasi' => 'decimal:2',
            'nilai_setoran' => 'decimal:2',
            'nilai_spd' => 'decimal:2',
            'nilai_sp2d' => 'decimal:2',
        ];
    }

    public function importBatch(): BelongsTo
    {
        return $this->belongsTo(ImportLaporanRealisasi::class, 'import_laporan_realisasi_id');
    }
}
