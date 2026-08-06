<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class JenisBendahara extends Model
{
    protected $table = 'tabel_jenis_bendahara';
    protected $primaryKey = 'jenis_bendahara';
    protected $keyType = 'string';
    public $incrementing = false;
    public $timestamps = false;
}
