<?php

declare(strict_types=1);

require dirname(__DIR__).'/vendor/autoload.php';

$app = require_once dirname(__DIR__).'/bootstrap/app.php';
$app->make(Illuminate\Contracts\Console\Kernel::class)->bootstrap();

$sourceDatabase = $argv[1] ?? null;
$targetDatabase = $argv[2] ?? null;

if (! $sourceDatabase || ! $targetDatabase) {
    fwrite(STDERR, "Usage: php scripts/compare-pg-schema.php <source-db> <target-db>\n");
    exit(2);
}

$base = config('database.connections.pgsql');

/**
 * @return array{tables: array<string, array<string, mixed>>}
 */
function inspectDatabase(array $base, string $database): array
{
    $dsn = sprintf(
        'pgsql:host=%s;port=%s;dbname=%s',
        $base['host'],
        $base['port'],
        $database,
    );
    $pdo = new PDO($dsn, $base['username'], $base['password'], [
        PDO::ATTR_ERRMODE => PDO::ERRMODE_EXCEPTION,
    ]);

    $tables = [];
    $tableNames = $pdo->query(
        "select tablename from pg_catalog.pg_tables
         where schemaname = 'public' order by tablename",
    )->fetchAll(PDO::FETCH_COLUMN);

    $columnStatement = $pdo->prepare(
        "select column_name, data_type, udt_name, character_maximum_length,
                numeric_precision, numeric_scale, is_nullable, column_default,
                is_identity, identity_generation
         from information_schema.columns
         where table_schema = 'public' and table_name = :table
         order by ordinal_position",
    );
    $constraintStatement = $pdo->prepare(
        "select con.conname, con.contype, pg_get_constraintdef(con.oid, true) definition
         from pg_catalog.pg_constraint con
         join pg_catalog.pg_class rel on rel.oid = con.conrelid
         join pg_catalog.pg_namespace nsp on nsp.oid = rel.relnamespace
         where nsp.nspname = 'public' and rel.relname = :table
         order by con.contype, con.conname",
    );
    $indexStatement = $pdo->prepare(
        "select indexname, indexdef
         from pg_catalog.pg_indexes
         where schemaname = 'public' and tablename = :table
         order by indexname",
    );

    foreach ($tableNames as $table) {
        $columnStatement->execute(['table' => $table]);
        $constraintStatement->execute(['table' => $table]);
        $indexStatement->execute(['table' => $table]);
        $tables[$table] = [
            'columns' => $columnStatement->fetchAll(PDO::FETCH_ASSOC),
            'constraints' => $constraintStatement->fetchAll(PDO::FETCH_ASSOC),
            'indexes' => $indexStatement->fetchAll(PDO::FETCH_ASSOC),
        ];
    }

    return ['tables' => $tables];
}

function normalized(mixed $value): string
{
    return json_encode($value, JSON_UNESCAPED_SLASHES | JSON_UNESCAPED_UNICODE);
}

$source = inspectDatabase($base, $sourceDatabase);
$target = inspectDatabase($base, $targetDatabase);
$sourceTables = array_keys($source['tables']);
$targetTables = array_keys($target['tables']);
$commonTables = array_intersect($sourceTables, $targetTables);

$result = [
    'source' => $sourceDatabase,
    'target' => $targetDatabase,
    'tables_only_in_source' => array_values(array_diff($sourceTables, $targetTables)),
    'tables_only_in_target' => array_values(array_diff($targetTables, $sourceTables)),
    'different_common_tables' => [],
];

foreach ($commonTables as $table) {
    foreach (['columns', 'constraints', 'indexes'] as $part) {
        if (normalized($source['tables'][$table][$part]) !== normalized($target['tables'][$table][$part])) {
            $result['different_common_tables'][$table][] = $part;
            if (($argv[3] ?? null) === '--details') {
                $result['details'][$table][$part] = [
                    'source' => $source['tables'][$table][$part],
                    'target' => $target['tables'][$table][$part],
                ];
            }
        }
    }
}

echo json_encode($result, JSON_PRETTY_PRINT | JSON_UNESCAPED_SLASHES | JSON_UNESCAPED_UNICODE).PHP_EOL;
