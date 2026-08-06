<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class RekonBankDetail extends Model
{
    public $timestamps = false;
    // Nama tabel jika tidak mengikuti jamak (optional jika nama tabel rekon_bank_details)
    protected $table = 'rekon_bank_detail';

    // Kolom yang boleh diisi (Mass Assignment)
    protected $fillable = [
        'rekon_bank_id',
        'keterangan_item',
        'nomor_referensi',
        'tanggal_transaksi',
        'nominal',
        'jenis_selisih', // Misal: 'tambah' atau 'kurang'
    ];  

    /**
     * Relasi Balik ke Header Rekon
     */
    public function header(): BelongsTo
    {
        return $this->belongsTo(RekonBank::class, 'rekon_bank_id');
    }
}
