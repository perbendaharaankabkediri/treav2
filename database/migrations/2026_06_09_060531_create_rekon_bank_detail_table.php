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
        Schema::create('rekon_bank_detail', function (Blueprint $table) {
            $table->integer('id', true);
            $table->integer('rekon_bank_id')->index('fk_rekon_header');
            $table->string('keterangan_item');
            $table->string('nomor_referensi', 100)->nullable()->comment('Nomor SP2D/STS/SK');
            $table->date('tanggal_transaksi');
            $table->decimal('nominal', 20);
            $table->enum('jenis_selisih', ['tambah', 'kurang'])->nullable()->default('tambah');
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('rekon_bank_detail');
    }
};
