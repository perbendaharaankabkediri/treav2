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
        Schema::create('tabel_kabid', function (Blueprint $table) {
            $table->integer('id', true);
            $table->text('tahun')->nullable();
            $table->text('nama')->nullable();
            $table->string('nip', 50)->nullable();
            $table->text('jabatan')->nullable();
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('tabel_kabid');
    }
};
