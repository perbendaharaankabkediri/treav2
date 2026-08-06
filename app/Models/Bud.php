<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class Bud extends Model
{
    protected $table = 'tabel_bud';
    
    // Matikan timestamps jika tabel lama Anda tidak memilikinya
    public $timestamps = false; 

    protected $fillable = [
        'tahun', // 🚀 Ditambahkan agar bisa menyimpan tahun anggaran
        'nama',
        'nip',
        'jabatan'
    ];
}