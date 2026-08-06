<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        if (
            Schema::hasTable('tabel_laporan_realisasi')
            && Schema::hasIndex('tabel_laporan_realisasi', 'uq_laporan_realisasi_batch_baris')
        ) {
            Schema::table('tabel_laporan_realisasi', function (Blueprint $table) {
                $table->dropUnique('uq_laporan_realisasi_batch_baris');
            });
        }
    }

    public function down(): void
    {
        if (Schema::hasTable('tabel_laporan_realisasi')) {
            Schema::table('tabel_laporan_realisasi', function (Blueprint $table) {
                $table->unique(
                    ['import_laporan_realisasi_id', 'nomor_dokumen', 'kode_sub_kegiatan', 'kode_rekening'],
                    'uq_laporan_realisasi_batch_baris',
                );
            });
        }
    }
};
