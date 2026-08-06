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
        Schema::create('monitoring_harian', function (Blueprint $table) {
            $table->bigIncrements('id');
            $table->date('tanggal')->index('idx_monitoring_harian_tanggal');
            $table->enum('source', ['bku', 'bank'])->index('idx_source');
            $table->unsignedBigInteger('source_id');
            $table->enum('jenis', ['masuk', 'keluar']);
            $table->decimal('nominal', 18);
            $table->unsignedBigInteger('group_id')->nullable()->index('idx_group');
            $table->enum('status', ['matched', 'unmatched'])->nullable()->default('unmatched');
            $table->timestamps();
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('monitoring_harian');
    }
};
