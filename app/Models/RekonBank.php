<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\HasMany;

class RekonBank extends Model
{
    protected $table = 'rekon_bank';
    protected $fillable = [
        'periode_rekon', 
        'saldo_buku_akhir', 
        'saldo_bank_akhir', 
        'selisih'
    ];

    /**
     * Relasi ke Detail Selisih
     */
    public function details(): HasMany
    {
        return $this->hasMany(RekonBankDetail::class, 'rekon_bank_id');
    }

    public function getTotalDetailAttribute() {
        return $this->details->sum('nominal');
    }
}
