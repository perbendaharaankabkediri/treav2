<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class Bendahara extends Model
{
    protected $table = 'tabel_bendahara';
    public $timestamps = false;

    protected $fillable = [
        'tahun',
        'kode_skpd',
        'nama',
        'nip',
        'jenis_bendahara',
        'bidang_bendahara'
    ];

    // ======================
    // RELASI
    // ======================

    public function skpd()
    {
        return $this->belongsTo(Skpd::class, 'kode_skpd', 'kode_skpd');
    }


    public function jenis()
    {
        return $this->belongsTo(JenisBendahara::class, 'jenis_bendahara', 'jenis_bendahara');
    }
}
