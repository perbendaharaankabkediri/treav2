<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        if (! Schema::hasTable('tabel_import_laporan_realisasi')) {
            Schema::create('tabel_import_laporan_realisasi', function (Blueprint $table) {
                $table->id();
                $table->unsignedSmallInteger('tahun');
                $table->unsignedTinyInteger('bulan');
                $table->string('nama_file_asli');
                $table->string('lokasi_file', 500)->nullable();
                $table->char('checksum_file', 64);
                $table->unsignedInteger('jumlah_baris')->default(0);
                $table->unsignedInteger('jumlah_data_baru')->default(0);
                $table->unsignedInteger('jumlah_data_berubah')->default(0);
                $table->unsignedInteger('jumlah_data_tetap')->default(0);
                $table->unsignedInteger('jumlah_data_dihapus')->default(0);
                $table->unsignedInteger('jumlah_data_error')->default(0);
                $table->decimal('total_realisasi', 20, 2)->default(0);
                $table->decimal('total_setoran', 20, 2)->default(0);
                $table->decimal('total_sp2d_unik', 20, 2)->default(0);
                $table->string('status', 20)->default('preview');
                $table->boolean('is_active')->default(false);
                $table->text('catatan')->nullable();
                $table->foreignId('imported_by')->nullable()->constrained('users')->cascadeOnUpdate()->nullOnDelete();
                $table->timestamp('confirmed_at')->nullable();
                $table->timestamps();
                $table->index(['tahun', 'bulan'], 'idx_import_lapreal_periode');
                $table->index('status', 'idx_import_lapreal_status');
                $table->index('checksum_file', 'idx_import_lapreal_checksum');
            });

            if (DB::getDriverName() === 'pgsql') {
                DB::statement(
                    'CREATE UNIQUE INDEX uq_import_lapreal_periode_active
                     ON tabel_import_laporan_realisasi (tahun, bulan)
                     WHERE is_active = TRUE',
                );
            }
        }

        if (! Schema::hasTable('tabel_laporan_realisasi')) {
            Schema::create('tabel_laporan_realisasi', function (Blueprint $table) {
                $table->id();
                $table->foreignId('import_laporan_realisasi_id')
                    ->constrained('tabel_import_laporan_realisasi')
                    ->cascadeOnUpdate()
                    ->cascadeOnDelete();
                $table->unsignedInteger('nomor_baris');
                $table->string('kode_skpd', 50);
                $table->string('nama_skpd', 200);
                $table->string('kode_sub_skpd', 50);
                $table->string('nama_sub_skpd', 200);
                $table->string('kode_fungsi', 20);
                $table->string('nama_fungsi');
                $table->string('kode_sub_fungsi', 20);
                $table->string('nama_sub_fungsi');
                $table->string('kode_urusan', 20);
                $table->string('nama_urusan');
                $table->string('kode_bidang_urusan', 30);
                $table->string('nama_bidang_urusan');
                $table->string('kode_program', 50);
                $table->string('nama_program', 300);
                $table->string('kode_kegiatan', 50);
                $table->text('nama_kegiatan');
                $table->string('kode_sub_kegiatan', 50);
                $table->text('nama_sub_kegiatan');
                $table->string('kode_rekening', 50);
                $table->string('nama_rekening');
                $table->string('nomor_dokumen', 100);
                $table->string('jenis_dokumen', 20);
                $table->string('jenis_transaksi', 20);
                $table->string('nomor_dpt', 100)->nullable();
                $table->date('tanggal_dokumen');
                $table->text('keterangan_dokumen');
                $table->decimal('nilai_realisasi', 20, 2);
                $table->decimal('nilai_setoran', 20, 2)->default(0);
                $table->string('nip_pegawai', 30)->nullable();
                $table->string('nama_pegawai')->nullable();
                $table->date('tanggal_simpan')->nullable();
                $table->string('nomor_spd', 100)->nullable();
                $table->string('periode_spd', 50)->nullable();
                $table->decimal('nilai_spd', 20, 2)->nullable();
                $table->string('tahapan_spd', 100)->nullable();
                $table->string('nama_sub_tahapan_jadwal')->nullable();
                $table->string('tahapan_apbd', 100)->nullable();
                $table->string('nomor_spp', 100)->nullable();
                $table->date('tanggal_spp')->nullable();
                $table->string('nomor_spm', 100)->nullable();
                $table->date('tanggal_spm')->nullable();
                $table->string('nomor_sp2d', 100)->nullable();
                $table->date('tanggal_sp2d')->nullable();
                $table->date('tanggal_transfer')->nullable();
                $table->decimal('nilai_sp2d', 20, 2)->nullable();
                $table->char('row_hash', 64);
                $table->timestamps();
                $table->index('nomor_dokumen', 'idx_tabel_lapreal_nomor_dokumen');
                $table->index('nomor_sp2d', 'idx_tabel_lapreal_nomor_sp2d');
                $table->index('nomor_spp', 'idx_tabel_lapreal_nomor_spp');
                $table->index('nomor_spm', 'idx_tabel_lapreal_nomor_spm');
                $table->index('nomor_spd', 'idx_tabel_lapreal_nomor_spd');
                $table->index('tanggal_dokumen', 'idx_tabel_lapreal_tanggal_dokumen');
                $table->index('tanggal_sp2d', 'idx_tabel_lapreal_tanggal_sp2d');
                $table->index('kode_skpd', 'idx_tabel_lapreal_kode_skpd');
                $table->index('kode_sub_skpd', 'idx_tabel_lapreal_kode_sub_skpd');
                $table->index('kode_sub_kegiatan', 'idx_tabel_lapreal_kode_sub_kegiatan');
                $table->index('kode_rekening', 'idx_tabel_lapreal_kode_rekening');
                $table->index('jenis_dokumen', 'idx_tabel_lapreal_jenis_dokumen');
                $table->index('jenis_transaksi', 'idx_tabel_lapreal_jenis_transaksi');
                $table->index('row_hash', 'idx_tabel_lapreal_row_hash');
            });
        }
    }

    public function down(): void
    {
        Schema::dropIfExists('tabel_laporan_realisasi');
        Schema::dropIfExists('tabel_import_laporan_realisasi');
    }
};
