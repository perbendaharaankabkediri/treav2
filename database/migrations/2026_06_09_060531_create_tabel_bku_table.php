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
        Schema::create('tabel_bku', function (Blueprint $table) {
            $table->integer('id', true);
            $table->text('no_rekon')->nullable();
            $table->text('tahun')->nullable();
            $table->text('bulan')->nullable();
            $table->text('kode_skpd')->nullable();
            $table->decimal('penerimaan', 18)->nullable();
            $table->decimal('pengeluaran', 18)->nullable();
            $table->text('created')->nullable();
            $table->dateTime('date_created')->nullable();
            $table->text('modified')->nullable();
            $table->dateTime('date_modified')->nullable();
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('tabel_bku');
    }
};
