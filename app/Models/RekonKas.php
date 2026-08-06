<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class RekonKas extends Model
{
    protected $table = 'tabel_rekon';
    protected $primaryKey = 'no_rekon';
    public $incrementing = false;
    protected $keyType = 'string';
    public $timestamps = false;

    protected $fillable = [
        'no_rekon',
        'tahun',
        'bulan',
        'kode_skpd',
        'tanggal_rekon',
        'created',
        'date_created'
    ];

    public function skpd()
    {
        return $this->belongsTo(Skpd::class, 'kode_skpd', 'kode_skpd')
            ->where('tahun', $this->tahun);
    }
}
