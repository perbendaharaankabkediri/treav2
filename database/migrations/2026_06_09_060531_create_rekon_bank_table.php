<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    /**
     * Run the migrations.
     */
    public function up(): void
    {
        Schema::create('rekon_bank', function (Blueprint $table) {
            $table->integer('id', true);
            $table->date('periode_rekon')->comment('Tanggal akhir bulan, misal 2026-02-28');
            $table->decimal('saldo_awal_tahun', 20)->nullable()->default(0);
            $table->decimal('total_penerimaan_ytd', 20)->nullable()->default(0)->comment('Total masuk s/d periode ini');
            $table->decimal('total_pengeluaran_ytd', 20)->nullable()->default(0)->comment('Total keluar s/d periode ini');
            $table->decimal('saldo_buku_akhir', 20)->comment('Hasil rumus: awal + masuk - keluar');
            $table->decimal('saldo_bank_akhir', 20);
            $table->decimal('selisih', 20);
            $table->text('keterangan_umum')->nullable();
            $table->timestamp('created_at')->useCurrent();
            $table->timestamp('updated_at')->useCurrentOnUpdate()->useCurrent();
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('rekon_bank');
    }
};
