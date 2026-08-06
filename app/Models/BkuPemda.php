<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class BkuPemda extends Model
{
    protected $table = 'bku_pemda';

    protected $fillable = [
        'tanggal',
        'nama_skpd',
        'nama_sub_skpd',
        'nomor_bukti',
        'jenis_dokumen',
        'uraian',
        'penerimaan',
        'pengeluaran',
        'saldo',
        'tahun',
        'sumber_file'
    ];
}
