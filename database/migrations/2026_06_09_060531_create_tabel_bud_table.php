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
        Schema::create('tabel_bud', function (Blueprint $table) {
            $table->integer('id', true);
            $table->year('tahun')->nullable();
            $table->string('nama', 100);
            $table->string('nip', 20)->unique('nip');
            $table->string('jabatan', 50)->nullable();
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('tabel_bud');
    }
};
