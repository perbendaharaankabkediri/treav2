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
        Schema::create('pola_kategori_rekon', function (Blueprint $table) {
            $table->id();
            $table->string('kategori');                 // contoh: 'PENARIKAN_BUNGA', 'PAJAK_DAERAH_BAPENDA'
            $table->json('sisi_bank_keywords');          // contoh: ["PBB","PAJAK RESTORAN","BPHTB",...]
            $table->string('pola_uraian_bku');           // contoh: 'STS%' atau 'PENARIKAN PEMINDAHBUKUAN%' (pakai wildcard ILIKE)
            $table->string('nama_skpd')->nullable();
            $table->boolean('is_active')->default(true);
            $table->timestamps();
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('pola_kategori_rekon');
    }
};
