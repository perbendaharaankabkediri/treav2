<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('activity_notifications', function (Blueprint $table) {
            $table->id();
            $table->foreignId('activity_log_id')->unique()->constrained()->cascadeOnDelete();
            $table->string('type', 100);
            $table->string('severity', 20)->default('info')->index();
            $table->string('title');
            $table->text('message');
            $table->timestamp('created_at')->useCurrent()->index();
        });

        Schema::create('activity_notification_recipients', function (Blueprint $table) {
            $table->id();
            $table->foreignId('activity_notification_id')
                ->constrained('activity_notifications')
                ->cascadeOnDelete();
            $table->foreignId('user_id')->constrained()->cascadeOnDelete();
            $table->timestamp('read_at')->nullable()->index();
            $table->timestamp('created_at')->useCurrent();
            $table->unique(['activity_notification_id', 'user_id'], 'activity_notification_recipient_unique');
            $table->index(['user_id', 'read_at']);
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('activity_notification_recipients');
        Schema::dropIfExists('activity_notifications');
    }
};
