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
        Schema::create('bku_pemda', function (Blueprint $table) {
            $table->bigIncrements('id');
            $table->date('tanggal')->index('idx_tanggal');
            $table->string('nama_skpd');
            $table->string('nama_sub_skpd')->nullable();
            $table->string('nomor_bukti', 100)->nullable();
            $table->string('jenis_dokumen', 100)->nullable();
            $table->text('uraian')->nullable();
            $table->decimal('penerimaan', 18)->nullable()->default(0);
            $table->decimal('pengeluaran', 18)->nullable()->default(0);
            $table->decimal('saldo', 18)->nullable()->default(0);
            $table->integer('tahun')->index('idx_bku_pemda_tahun');
            $table->string('sumber_file')->nullable();
            $table->timestamps();

            $table->index(['nomor_bukti', 'tanggal', 'tahun'], 'idx_nomor_tanggal_tahun');
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('bku_pemda');
    }
};
