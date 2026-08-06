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
        Schema::create('saldo_awal', function (Blueprint $table) {
            $table->bigIncrements('id');
            $table->integer('tahun')->unique('uniq_tahun');
            $table->decimal('saldo_awal_bku', 18)->nullable()->default(0);
            $table->decimal('saldo_awal_mutasi', 18)->nullable()->default(0);
            $table->timestamps();
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('saldo_awal');
    }
};
