<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        if (Schema::hasColumn('users', 'username')) {
            return;
        }

        Schema::table('users', function (Blueprint $table) {
            $table->string('username', 50)->nullable();
        });

        if (DB::getDriverName() === 'pgsql') {
            DB::statement(<<<'SQL'
                WITH candidates AS (
                    SELECT
                        id,
                        CASE
                            WHEN cleaned ~ '^[a-z0-9][a-z0-9._-]{2,49}$' THEN cleaned
                            ELSE 'user_' || id::text
                        END AS base_username
                    FROM (
                        SELECT
                            id,
                            LEFT(
                                REGEXP_REPLACE(
                                    LOWER(COALESCE(NULLIF(SPLIT_PART(email, '@', 1), ''), name, 'user')),
                                    '[^a-z0-9._-]',
                                    '',
                                    'g'
                                ),
                                50
                            ) AS cleaned
                        FROM users
                    ) normalized
                ),
                ranked AS (
                    SELECT
                        id,
                        base_username,
                        COUNT(*) OVER (PARTITION BY base_username) AS duplicate_count
                    FROM candidates
                )
                UPDATE users
                SET username = CASE
                    WHEN ranked.duplicate_count = 1 THEN ranked.base_username
                    ELSE LEFT(
                        ranked.base_username,
                        49 - LENGTH(ranked.id::text)
                    ) || '_' || ranked.id::text
                END
                FROM ranked
                WHERE users.id = ranked.id
                SQL);

            DB::statement('ALTER TABLE users ALTER COLUMN username SET NOT NULL');
            DB::statement(
                "ALTER TABLE users ADD CONSTRAINT users_username_format_check
                 CHECK (username = LOWER(username) AND username ~ '^[a-z0-9][a-z0-9._-]{2,49}$')",
            );
            DB::statement(
                'CREATE UNIQUE INDEX users_username_lower_unique ON users (LOWER(username))',
            );

            return;
        }

        Schema::table('users', function (Blueprint $table) {
            $table->unique('username');
        });
    }

    /**
     * Username becomes the login identity, so rollback must not remove it.
     */
    public function down(): void
    {
        //
    }
};
