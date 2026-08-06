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
        Schema::create('mutasi_bank', function (Blueprint $table) {
            $table->bigIncrements('id');
            $table->dateTime('posting_date')->index('idx_posting_date');
            $table->date('effective_date')->nullable();
            $table->string('account', 100)->nullable();
            $table->string('name')->nullable();
            $table->text('description')->nullable();
            $table->string('currency', 10)->nullable();
            $table->decimal('debit', 18)->nullable()->default(0);
            $table->decimal('credit', 18)->nullable()->default(0);
            $table->decimal('balance', 18)->nullable()->default(0);
            $table->string('reference_no', 100)->nullable()->index('idx_reference_no');
            $table->integer('tahun')->index('idx_mutasi_bank_tahun');
            $table->string('sumber_file')->nullable();
            $table->timestamps();
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('mutasi_bank');
    }
};
