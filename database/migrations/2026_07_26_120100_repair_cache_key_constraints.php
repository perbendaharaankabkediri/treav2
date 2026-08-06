<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        $this->ensureUniqueKey('cache', 'cache_key_unique');
        $this->ensureUniqueKey('cache_locks', 'cache_locks_key_unique');
    }

    private function ensureUniqueKey(string $tableName, string $indexName): void
    {
        if (! Schema::hasTable($tableName) || $this->hasUniqueKey($tableName)) {
            return;
        }

        Schema::table($tableName, function (Blueprint $table) use ($indexName) {
            $table->unique('key', $indexName);
        });
    }

    private function hasUniqueKey(string $tableName): bool
    {
        foreach (Schema::getIndexes($tableName) as $index) {
            if (
                ($index['unique'] ?? false)
                && ($index['columns'] ?? []) === ['key']
            ) {
                return true;
            }
        }

        return false;
    }

    /**
     * The constraint may repair a manually provisioned production table, so
     * rollback must not remove it.
     */
    public function down(): void
    {
        //
    }
};
