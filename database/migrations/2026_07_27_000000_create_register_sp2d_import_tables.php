<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        if (! Schema::hasTable('tabel_import_register_sp2d')) {
            Schema::create('tabel_import_register_sp2d', function (Blueprint $table) {
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
                $table->decimal('total_bruto', 20, 2)->default(0);
                $table->decimal('total_potongan', 20, 2)->default(0);
                $table->decimal('total_netto', 20, 2)->default(0);
                $table->string('status', 20)->default('preview');
                $table->boolean('is_active')->default(false);
                $table->text('catatan')->nullable();
                $table->foreignId('imported_by')->nullable()->constrained('users')->cascadeOnUpdate()->nullOnDelete();
                $table->timestamp('confirmed_at')->nullable();
                $table->timestamps();
                $table->index(['tahun', 'bulan'], 'idx_import_register_sp2d_periode');
                $table->index('status', 'idx_import_register_sp2d_status');
                $table->index('checksum_file', 'idx_import_register_sp2d_checksum');
            });

            if (DB::getDriverName() === 'pgsql') {
                DB::statement(
                    'CREATE UNIQUE INDEX uq_import_register_sp2d_periode_active
                     ON tabel_import_register_sp2d (tahun, bulan)
                     WHERE is_active = TRUE',
                );
            }
        }

        if (! Schema::hasTable('tabel_register_sp2d')) {
            Schema::create('tabel_register_sp2d', function (Blueprint $table) {
                $table->id();
                $table->foreignId('import_register_sp2d_id')
                    ->constrained('tabel_import_register_sp2d')
                    ->cascadeOnUpdate()
                    ->cascadeOnDelete();
                $table->unsignedInteger('nomor_baris');
                $table->unsignedInteger('nomor_urut_sumber')->nullable();
                $table->date('tanggal_pembuatan');
                $table->date('tanggal_pencairan');
                $table->string('nomor_sp2d', 100);
                $table->string('kode_skpd', 50)->nullable();
                $table->string('nama_skpd', 200);
                $table->string('nama_penerima');
                $table->text('keterangan');
                $table->string('jenis_sp2d', 20);
                $table->decimal('bruto', 20, 2);
                $table->decimal('potongan', 20, 2);
                $table->decimal('netto', 20, 2);
                $table->char('row_hash', 64);
                $table->timestamps();
                $table->unique(
                    ['import_register_sp2d_id', 'nomor_sp2d'],
                    'uq_register_sp2d_batch_nomor',
                );
                $table->index('nomor_sp2d', 'idx_register_sp2d_nomor');
                $table->index('tanggal_pembuatan', 'idx_register_sp2d_tanggal_pembuatan');
                $table->index('tanggal_pencairan', 'idx_register_sp2d_tanggal_pencairan');
                $table->index('kode_skpd', 'idx_register_sp2d_kode_skpd');
                $table->index('nama_skpd', 'idx_register_sp2d_nama_skpd');
                $table->index('jenis_sp2d', 'idx_register_sp2d_jenis');
                $table->index('row_hash', 'idx_register_sp2d_hash');
            });
        }
    }

    public function down(): void
    {
        Schema::dropIfExists('tabel_register_sp2d');
        Schema::dropIfExists('tabel_import_register_sp2d');
    }
};
