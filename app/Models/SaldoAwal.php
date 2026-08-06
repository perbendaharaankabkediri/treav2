<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class SaldoAwal extends Model
{
    protected $table = 'saldo_awal';

    protected $fillable = [
        'tahun',
        'saldo_awal_bku',
        'saldo_awal_mutasi'
    ];
}
