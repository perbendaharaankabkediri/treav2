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
        Schema::table('rekon_bank_detail', function (Blueprint $table) {
            $table->foreign(['rekon_bank_id'], 'fk_rekon_header')->references(['id'])->on('rekon_bank')->onUpdate('restrict')->onDelete('cascade');
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::table('rekon_bank_detail', function (Blueprint $table) {
            $table->dropForeign('fk_rekon_header');
        });
    }
};
