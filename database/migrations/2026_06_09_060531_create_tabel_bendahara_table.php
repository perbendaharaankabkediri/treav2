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
        Schema::create('tabel_bendahara', function (Blueprint $table) {
            $table->integer('id', true);
            $table->text('tahun')->nullable();
            $table->text('kode_skpd')->nullable();
            $table->text('nama')->nullable();
            $table->string('nip', 50)->nullable();
            $table->text('jenis_bendahara')->nullable();
            $table->string('bidang_bendahara', 100)->nullable();
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('tabel_bendahara');
    }
};
