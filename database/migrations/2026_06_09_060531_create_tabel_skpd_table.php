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
        Schema::create('tabel_skpd', function (Blueprint $table) {
            $table->integer('id', true);
            $table->integer('tahun')->nullable();
            $table->string('kode_skpd', 50)->nullable();
            $table->string('skpd', 150)->nullable();
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('tabel_skpd');
    }
};
