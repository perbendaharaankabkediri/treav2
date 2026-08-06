<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        $this->addUserAuthorizationColumns();
        $this->createPermissionTables();
        $this->createUserSkpdTable();
        $this->createActivityLogsTable();
    }

    private function addUserAuthorizationColumns(): void
    {
        if (! Schema::hasColumn('users', 'is_active')) {
            Schema::table('users', function (Blueprint $table) {
                $table->boolean('is_active')->default(true)->index();
            });
        }

        if (! Schema::hasColumn('users', 'last_login_at')) {
            Schema::table('users', function (Blueprint $table) {
                $table->timestamp('last_login_at')->nullable();
            });
        }

        if (! Schema::hasColumn('users', 'last_login_ip')) {
            Schema::table('users', function (Blueprint $table) {
                $table->string('last_login_ip', 45)->nullable();
            });
        }

        if (! Schema::hasColumn('users', 'created_by')) {
            Schema::table('users', function (Blueprint $table) {
                $table->unsignedBigInteger('created_by')->nullable();
            });
        }
    }

    private function createPermissionTables(): void
    {
        if (! Schema::hasTable('permissions')) {
            Schema::create('permissions', function (Blueprint $table) {
                $table->id();
                $table->string('name');
                $table->string('guard_name');
                $table->timestamps();
                $table->unique(['name', 'guard_name']);
            });
        }

        if (! Schema::hasTable('roles')) {
            Schema::create('roles', function (Blueprint $table) {
                $table->id();
                $table->string('name');
                $table->string('guard_name');
                $table->timestamps();
                $table->unique(['name', 'guard_name']);
            });
        }

        if (! Schema::hasTable('model_has_permissions')) {
            Schema::create('model_has_permissions', function (Blueprint $table) {
                $table->unsignedBigInteger('permission_id');
                $table->string('model_type');
                $table->unsignedBigInteger('model_id');
                $table->index(
                    ['model_id', 'model_type'],
                    'model_has_permissions_model_id_model_type_index',
                );
                $table->foreign('permission_id')
                    ->references('id')
                    ->on('permissions')
                    ->cascadeOnDelete();
                $table->primary(['permission_id', 'model_id', 'model_type']);
            });
        }

        if (! Schema::hasTable('model_has_roles')) {
            Schema::create('model_has_roles', function (Blueprint $table) {
                $table->unsignedBigInteger('role_id');
                $table->string('model_type');
                $table->unsignedBigInteger('model_id');
                $table->index(
                    ['model_id', 'model_type'],
                    'model_has_roles_model_id_model_type_index',
                );
                $table->foreign('role_id')
                    ->references('id')
                    ->on('roles')
                    ->cascadeOnDelete();
                $table->primary(['role_id', 'model_id', 'model_type']);
            });
        }

        if (! Schema::hasTable('role_has_permissions')) {
            Schema::create('role_has_permissions', function (Blueprint $table) {
                $table->unsignedBigInteger('permission_id');
                $table->unsignedBigInteger('role_id');
                $table->foreign('permission_id')
                    ->references('id')
                    ->on('permissions')
                    ->cascadeOnDelete();
                $table->foreign('role_id')
                    ->references('id')
                    ->on('roles')
                    ->cascadeOnDelete();
                $table->primary(['permission_id', 'role_id']);
            });
        }
    }

    private function createUserSkpdTable(): void
    {
        if (Schema::hasTable('user_skpd')) {
            return;
        }

        Schema::create('user_skpd', function (Blueprint $table) {
            $table->id();
            $table->foreignId('user_id')->constrained()->cascadeOnDelete();
            $table->string('kode_skpd', 50)->index();
            $table->timestamps();
            $table->unique(['user_id', 'kode_skpd']);
        });
    }

    private function createActivityLogsTable(): void
    {
        if (Schema::hasTable('activity_logs')) {
            return;
        }

        Schema::create('activity_logs', function (Blueprint $table) {
            $table->id();
            $table->foreignId('user_id')
                ->nullable()
                ->constrained()
                ->nullOnDelete();
            $table->string('user_name')->nullable();
            $table->string('role_name', 100)->nullable();
            $table->string('action', 100)->index();
            $table->string('module', 100)->index();
            $table->string('subject_type')->nullable();
            $table->string('subject_id')->nullable();
            $table->string('kode_skpd', 50)->nullable()->index();
            $table->string('tahun', 4)->nullable();
            $table->text('description')->nullable();
            $table->json('old_values')->nullable();
            $table->json('new_values')->nullable();
            $table->json('metadata')->nullable();
            $table->string('ip_address', 45)->nullable();
            $table->text('user_agent')->nullable();
            $table->uuid('request_id')->nullable()->index();
            $table->string('status', 20)->default('success');
            $table->timestamp('created_at')->useCurrent()->index();
            $table->index(['subject_type', 'subject_id']);
        });
    }

    /**
     * These tables may have been provisioned manually before Laravel adopted
     * them. Dropping them here could destroy pre-existing production data.
     */
    public function down(): void
    {
        //
    }
};
