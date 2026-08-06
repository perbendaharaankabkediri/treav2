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
        Schema::create('tabel_posisi_kas', function (Blueprint $table) {
            $table->integer('id', true);
            $table->string('no_rekon', 50)->nullable();
            $table->integer('tahun')->nullable();
            $table->integer('bulan')->nullable();
            $table->string('kode_skpd', 50)->nullable();
            $table->string('jenis_bendahara', 100)->nullable();
            $table->string('bidang_bendahara', 100)->nullable();
            $table->decimal('kas_tunai', 18)->nullable();
            $table->decimal('kas_di_bank', 18)->nullable();
            $table->string('created', 100)->nullable();
            $table->dateTime('date_created')->nullable();
            $table->string('modified', 100)->nullable();
            $table->dateTime('date_modified')->nullable();

            $table->index(['no_rekon', 'jenis_bendahara'], 'idx_posisi_kas_rekon');
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('tabel_posisi_kas');
    }
};
