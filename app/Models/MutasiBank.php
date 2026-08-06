<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class MutasiBank extends Model
{
    protected $table = 'mutasi_bank';

    protected $fillable = [
        'posting_date',
        'effective_date',
        'account',
        'name',
        'description',
        'currency',
        'debit',
        'credit',
        'balance',
        'reference_no',
        'tahun',
        'sumber_file'
    ];
}
