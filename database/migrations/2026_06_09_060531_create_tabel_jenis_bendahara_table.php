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
        Schema::create('tabel_jenis_bendahara', function (Blueprint $table) {
            $table->integer('id', true);
            $table->text('jenis_bendahara')->nullable();
            $table->text('bendahara')->nullable();
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('tabel_jenis_bendahara');
    }
};
