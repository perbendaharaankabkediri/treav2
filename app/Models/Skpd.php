<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class Skpd extends Model
{
    protected $table = 'tabel_skpd';

    protected $primaryKey = 'id'; // ubah jika PK berbeda
    public $timestamps = false;   // kalau tabel tidak pakai created_at updated_at

    protected $guarded = []; // atau isi fillable sesuai kolom

    // fungsi find by kode
    public static function findByKode($kode_skpd)
    {
        return self::where('kode_skpd', $kode_skpd)->first();
    }
}
