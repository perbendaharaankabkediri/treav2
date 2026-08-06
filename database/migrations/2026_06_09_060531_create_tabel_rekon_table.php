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
        Schema::create('tabel_rekon', function (Blueprint $table) {
            $table->integer('id', true);
            $table->string('no_rekon', 100)->unique('uq_no_rekon');
            $table->integer('tahun');
            $table->tinyInteger('bulan');
            $table->string('kode_skpd', 50);
            $table->date('tanggal_rekon');
            $table->string('created', 50)->nullable();
            $table->dateTime('date_created')->nullable();
            $table->string('modified', 50)->nullable();
            $table->dateTime('date_modified')->nullable();

            $table->unique(['tahun', 'kode_skpd', 'bulan'], 'uq_rekon');
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('tabel_rekon');
    }
};
