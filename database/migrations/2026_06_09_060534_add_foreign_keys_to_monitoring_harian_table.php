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
        Schema::table('monitoring_harian', function (Blueprint $table) {
            $table->foreign(['group_id'], 'fk_monitoring_group')->references(['id'])->on('monitoring_groups')->onUpdate('restrict')->onDelete('set null');
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::table('monitoring_harian', function (Blueprint $table) {
            $table->dropForeign('fk_monitoring_group');
        });
    }
};
