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
        Schema::create('tabel_spj', function (Blueprint $table) {
            $table->integer('id', true);
            $table->string('no_rekon', 50)->nullable();
            $table->integer('tahun')->nullable();
            $table->integer('bulan')->nullable();
            $table->string('kode_skpd', 50)->nullable();
            $table->decimal('nilai_upgu', 18)->nullable();
            $table->decimal('nilai_tu', 18)->nullable();
            $table->decimal('nilai_ls', 18)->nullable();
            $table->decimal('nilai_gukkpd', 18)->nullable();
            $table->string('created', 100)->nullable();
            $table->dateTime('date_created')->nullable();
            $table->string('modified', 100)->nullable();
            $table->dateTime('date_modified')->nullable();
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('tabel_spj');
    }
};
