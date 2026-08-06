/*
 * TREA - Upgrade fondasi role, permission, dan audit untuk PostgreSQL.
 *
 * WAJIB:
 * 1. Backup database utama.
 * 2. Ganti nilai v_bootstrap_email pada blok bootstrap Superadmin.
 * 3. Jalankan seluruh skrip sebagai satu kesatuan di pgAdmin.
 *
 * Skrip ini idempotent dan menyelaraskan permission role dengan aplikasi saat ini.
 */

/* Pulihkan Query Tool pgAdmin jika percobaan sebelumnya meninggalkan transaksi gagal. */
ROLLBACK;

BEGIN;

/* -------------------------------------------------------------------------- */
/* 1. Fondasi tabel users                                                     */
/* -------------------------------------------------------------------------- */

DO $$
BEGIN
    IF EXISTS (
        SELECT id
        FROM users
        GROUP BY id
        HAVING COUNT(*) > 1
    ) THEN
        RAISE EXCEPTION 'Tabel users memiliki ID duplikat. Perbaiki sebelum upgrade.';
    END IF;

    IF NOT EXISTS (
        SELECT 1
        FROM pg_constraint
        WHERE conrelid = 'users'::regclass
          AND contype = 'p'
    ) THEN
        ALTER TABLE users ADD CONSTRAINT users_pkey PRIMARY KEY (id);
    END IF;
END
$$;

ALTER TABLE users
    ADD COLUMN IF NOT EXISTS is_active boolean NOT NULL DEFAULT true,
    ADD COLUMN IF NOT EXISTS last_login_at timestamp without time zone NULL,
    ADD COLUMN IF NOT EXISTS last_login_ip varchar(45) NULL,
    ADD COLUMN IF NOT EXISTS created_by bigint NULL;

CREATE INDEX IF NOT EXISTS users_is_active_index ON users (is_active);

DO $$
BEGIN
    IF pg_get_serial_sequence('users', 'id') IS NULL THEN
        CREATE SEQUENCE IF NOT EXISTS users_id_seq AS bigint;
        ALTER SEQUENCE users_id_seq OWNED BY users.id;
        ALTER TABLE users
            ALTER COLUMN id SET DEFAULT nextval('users_id_seq');
    END IF;
END
$$;

SELECT setval(
    pg_get_serial_sequence('users', 'id'),
    COALESCE((SELECT MAX(id) FROM users), 0) + 1,
    false
);

/* -------------------------------------------------------------------------- */
/* 2. Tabel Spatie Role & Permission                                          */
/* -------------------------------------------------------------------------- */

CREATE TABLE IF NOT EXISTS permissions (
    id bigserial PRIMARY KEY,
    name varchar(255) NOT NULL,
    guard_name varchar(255) NOT NULL,
    created_at timestamp without time zone NULL,
    updated_at timestamp without time zone NULL,
    CONSTRAINT permissions_name_guard_name_unique UNIQUE (name, guard_name)
);

CREATE TABLE IF NOT EXISTS roles (
    id bigserial PRIMARY KEY,
    name varchar(255) NOT NULL,
    guard_name varchar(255) NOT NULL,
    created_at timestamp without time zone NULL,
    updated_at timestamp without time zone NULL,
    CONSTRAINT roles_name_guard_name_unique UNIQUE (name, guard_name)
);

DO $$
BEGIN
    IF EXISTS (
        SELECT name, guard_name
        FROM permissions
        GROUP BY name, guard_name
        HAVING COUNT(*) > 1
    ) THEN
        RAISE EXCEPTION 'Tabel permissions memiliki kombinasi name/guard_name duplikat.';
    END IF;

    IF EXISTS (
        SELECT name, guard_name
        FROM roles
        GROUP BY name, guard_name
        HAVING COUNT(*) > 1
    ) THEN
        RAISE EXCEPTION 'Tabel roles memiliki kombinasi name/guard_name duplikat.';
    END IF;
END
$$;

CREATE UNIQUE INDEX IF NOT EXISTS permissions_name_guard_unique_upgrade
    ON permissions (name, guard_name);
CREATE UNIQUE INDEX IF NOT EXISTS roles_name_guard_unique_upgrade
    ON roles (name, guard_name);

CREATE TABLE IF NOT EXISTS model_has_permissions (
    permission_id bigint NOT NULL,
    model_type varchar(255) NOT NULL,
    model_id bigint NOT NULL,
    CONSTRAINT model_has_permissions_pkey
        PRIMARY KEY (permission_id, model_id, model_type),
    CONSTRAINT model_has_permissions_permission_id_foreign
        FOREIGN KEY (permission_id) REFERENCES permissions(id) ON DELETE CASCADE
);

CREATE INDEX IF NOT EXISTS model_has_permissions_model_id_model_type_index
    ON model_has_permissions (model_id, model_type);

CREATE TABLE IF NOT EXISTS model_has_roles (
    role_id bigint NOT NULL,
    model_type varchar(255) NOT NULL,
    model_id bigint NOT NULL,
    CONSTRAINT model_has_roles_pkey
        PRIMARY KEY (role_id, model_id, model_type),
    CONSTRAINT model_has_roles_role_id_foreign
        FOREIGN KEY (role_id) REFERENCES roles(id) ON DELETE CASCADE
);

CREATE INDEX IF NOT EXISTS model_has_roles_model_id_model_type_index
    ON model_has_roles (model_id, model_type);

CREATE TABLE IF NOT EXISTS role_has_permissions (
    permission_id bigint NOT NULL,
    role_id bigint NOT NULL,
    CONSTRAINT role_has_permissions_pkey PRIMARY KEY (permission_id, role_id),
    CONSTRAINT role_has_permissions_permission_id_foreign
        FOREIGN KEY (permission_id) REFERENCES permissions(id) ON DELETE CASCADE,
    CONSTRAINT role_has_permissions_role_id_foreign
        FOREIGN KEY (role_id) REFERENCES roles(id) ON DELETE CASCADE
);

/* -------------------------------------------------------------------------- */
/* 3. Penugasan SKPD dan activity log                                         */
/* -------------------------------------------------------------------------- */

CREATE TABLE IF NOT EXISTS user_skpd (
    id bigserial PRIMARY KEY,
    user_id bigint NOT NULL,
    kode_skpd varchar(50) NOT NULL,
    created_at timestamp without time zone NULL,
    updated_at timestamp without time zone NULL,
    CONSTRAINT user_skpd_user_id_kode_skpd_unique UNIQUE (user_id, kode_skpd),
    CONSTRAINT user_skpd_user_id_foreign
        FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
);

CREATE INDEX IF NOT EXISTS user_skpd_kode_skpd_index ON user_skpd (kode_skpd);

CREATE TABLE IF NOT EXISTS activity_logs (
    id bigserial PRIMARY KEY,
    user_id bigint NULL,
    user_name varchar(255) NULL,
    role_name varchar(100) NULL,
    action varchar(100) NOT NULL,
    module varchar(100) NOT NULL,
    subject_type varchar(255) NULL,
    subject_id varchar(255) NULL,
    kode_skpd varchar(50) NULL,
    tahun varchar(4) NULL,
    description text NULL,
    old_values json NULL,
    new_values json NULL,
    metadata json NULL,
    ip_address varchar(45) NULL,
    user_agent text NULL,
    request_id uuid NULL,
    status varchar(20) NOT NULL DEFAULT 'success',
    created_at timestamp without time zone NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT activity_logs_user_id_foreign
        FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE SET NULL
);

CREATE INDEX IF NOT EXISTS activity_logs_action_index ON activity_logs (action);
CREATE INDEX IF NOT EXISTS activity_logs_module_index ON activity_logs (module);
CREATE INDEX IF NOT EXISTS activity_logs_kode_skpd_index ON activity_logs (kode_skpd);
CREATE INDEX IF NOT EXISTS activity_logs_request_id_index ON activity_logs (request_id);
CREATE INDEX IF NOT EXISTS activity_logs_created_at_index ON activity_logs (created_at);
CREATE INDEX IF NOT EXISTS activity_logs_subject_type_subject_id_index
    ON activity_logs (subject_type, subject_id);

/* -------------------------------------------------------------------------- */
/* 4. Perbaikan cache database Laravel                                        */
/* -------------------------------------------------------------------------- */

CREATE TABLE IF NOT EXISTS cache (
    "key" varchar(255) NOT NULL,
    value text NOT NULL,
    expiration integer NOT NULL
);

CREATE TABLE IF NOT EXISTS cache_locks (
    "key" varchar(255) NOT NULL,
    owner varchar(255) NOT NULL,
    expiration integer NOT NULL
);

DELETE FROM cache a
USING cache b
WHERE a.ctid < b.ctid
  AND a."key" = b."key";

DELETE FROM cache_locks a
USING cache_locks b
WHERE a.ctid < b.ctid
  AND a."key" = b."key";

DO $$
BEGIN
    IF NOT EXISTS (
        SELECT 1
        FROM pg_index i
        JOIN pg_class t ON t.oid = i.indrelid
        JOIN pg_attribute a ON a.attrelid = t.oid
            AND a.attnum = ANY (i.indkey)
        WHERE t.relname = 'cache'
          AND i.indisunique
          AND a.attname = 'key'
          AND array_length(i.indkey, 1) = 1
    ) THEN
        DROP INDEX IF EXISTS cache_key_unique;
        CREATE UNIQUE INDEX cache_key_unique ON cache ("key");
    END IF;

    IF NOT EXISTS (
        SELECT 1
        FROM pg_index i
        JOIN pg_class t ON t.oid = i.indrelid
        JOIN pg_attribute a ON a.attrelid = t.oid
            AND a.attnum = ANY (i.indkey)
        WHERE t.relname = 'cache_locks'
          AND i.indisunique
          AND a.attname = 'key'
          AND array_length(i.indkey, 1) = 1
    ) THEN
        DROP INDEX IF EXISTS cache_locks_key_unique;
        CREATE UNIQUE INDEX cache_locks_key_unique ON cache_locks ("key");
    END IF;
END
$$;

/* -------------------------------------------------------------------------- */
/* 5. Permission final aplikasi                                               */
/* -------------------------------------------------------------------------- */

INSERT INTO roles (name, guard_name, created_at, updated_at)
VALUES
    ('superadmin', 'web', CURRENT_TIMESTAMP, CURRENT_TIMESTAMP),
    ('admin', 'web', CURRENT_TIMESTAMP, CURRENT_TIMESTAMP),
    ('operator', 'web', CURRENT_TIMESTAMP, CURRENT_TIMESTAMP)
ON CONFLICT (name, guard_name) DO NOTHING;

INSERT INTO permissions (name, guard_name, created_at, updated_at)
VALUES
    ('dashboard.view', 'web', CURRENT_TIMESTAMP, CURRENT_TIMESTAMP),
    ('users.view', 'web', CURRENT_TIMESTAMP, CURRENT_TIMESTAMP),
    ('users.create', 'web', CURRENT_TIMESTAMP, CURRENT_TIMESTAMP),
    ('users.update', 'web', CURRENT_TIMESTAMP, CURRENT_TIMESTAMP),
    ('users.activate', 'web', CURRENT_TIMESTAMP, CURRENT_TIMESTAMP),
    ('users.reset-password', 'web', CURRENT_TIMESTAMP, CURRENT_TIMESTAMP),
    ('users.assign-skpd', 'web', CURRENT_TIMESTAMP, CURRENT_TIMESTAMP),
    ('users.assign-operator', 'web', CURRENT_TIMESTAMP, CURRENT_TIMESTAMP),
    ('users.manage-admin', 'web', CURRENT_TIMESTAMP, CURRENT_TIMESTAMP),
    ('roles.manage', 'web', CURRENT_TIMESTAMP, CURRENT_TIMESTAMP),
    ('permissions.manage', 'web', CURRENT_TIMESTAMP, CURRENT_TIMESTAMP),
    ('activity-log.view', 'web', CURRENT_TIMESTAMP, CURRENT_TIMESTAMP),
    ('skpd.view', 'web', CURRENT_TIMESTAMP, CURRENT_TIMESTAMP),
    ('bendahara.view', 'web', CURRENT_TIMESTAMP, CURRENT_TIMESTAMP),
    ('bendahara.manage', 'web', CURRENT_TIMESTAMP, CURRENT_TIMESTAMP),
    ('bud.view', 'web', CURRENT_TIMESTAMP, CURRENT_TIMESTAMP),
    ('bud.manage', 'web', CURRENT_TIMESTAMP, CURRENT_TIMESTAMP),
    ('icsa-rekon.view', 'web', CURRENT_TIMESTAMP, CURRENT_TIMESTAMP),
    ('icsa-rekon.create', 'web', CURRENT_TIMESTAMP, CURRENT_TIMESTAMP),
    ('icsa-rekon.update', 'web', CURRENT_TIMESTAMP, CURRENT_TIMESTAMP),
    ('icsa-rekon.delete', 'web', CURRENT_TIMESTAMP, CURRENT_TIMESTAMP),
    ('icsa-rekon.print', 'web', CURRENT_TIMESTAMP, CURRENT_TIMESTAMP),
    ('icsa-rekon.export', 'web', CURRENT_TIMESTAMP, CURRENT_TIMESTAMP),
    ('icsa-rekap.view', 'web', CURRENT_TIMESTAMP, CURRENT_TIMESTAMP),
    ('kasda-import.execute', 'web', CURRENT_TIMESTAMP, CURRENT_TIMESTAMP),
    ('kasda-saldo-awal.view', 'web', CURRENT_TIMESTAMP, CURRENT_TIMESTAMP),
    ('kasda-saldo-awal.manage', 'web', CURRENT_TIMESTAMP, CURRENT_TIMESTAMP),
    ('kasda-matching.view', 'web', CURRENT_TIMESTAMP, CURRENT_TIMESTAMP),
    ('kasda-matching.execute', 'web', CURRENT_TIMESTAMP, CURRENT_TIMESTAMP),
    ('kasda-matching.undo', 'web', CURRENT_TIMESTAMP, CURRENT_TIMESTAMP),
    ('kasda-matching.delete', 'web', CURRENT_TIMESTAMP, CURRENT_TIMESTAMP),
    ('kasda-rekon.view', 'web', CURRENT_TIMESTAMP, CURRENT_TIMESTAMP),
    ('kasda-rekon.manage', 'web', CURRENT_TIMESTAMP, CURRENT_TIMESTAMP),
    ('kasda-rekon.print', 'web', CURRENT_TIMESTAMP, CURRENT_TIMESTAMP),
    ('kasda-monitoring.view', 'web', CURRENT_TIMESTAMP, CURRENT_TIMESTAMP),
    ('laporan.export', 'web', CURRENT_TIMESTAMP, CURRENT_TIMESTAMP)
ON CONFLICT (name, guard_name) DO NOTHING;

/* Hapus permission fitur yang sudah dicabut dari aplikasi. */
DELETE FROM role_has_permissions
WHERE permission_id IN (
    SELECT id FROM permissions
    WHERE name IN (
        'skpd.manage',
        'laporan-realisasi.view',
        'laporan-realisasi.import',
        'laporan-realisasi.delete'
    )
);

DELETE FROM model_has_permissions
WHERE permission_id IN (
    SELECT id FROM permissions
    WHERE name IN (
        'skpd.manage',
        'laporan-realisasi.view',
        'laporan-realisasi.import',
        'laporan-realisasi.delete'
    )
);

DELETE FROM permissions
WHERE name IN (
    'skpd.manage',
    'laporan-realisasi.view',
    'laporan-realisasi.import',
    'laporan-realisasi.delete'
);

/* Sinkronisasi penuh permission Superadmin. */
DELETE FROM role_has_permissions
WHERE role_id = (
    SELECT id FROM roles WHERE name = 'superadmin' AND guard_name = 'web'
);

INSERT INTO role_has_permissions (permission_id, role_id)
SELECT p.id, r.id
FROM permissions p
CROSS JOIN roles r
WHERE p.guard_name = 'web'
  AND p.name IN (
      'dashboard.view', 'users.view', 'users.create', 'users.update',
      'users.activate', 'users.reset-password', 'users.assign-skpd',
      'users.assign-operator', 'users.manage-admin', 'roles.manage',
      'permissions.manage', 'activity-log.view', 'skpd.view',
      'bendahara.view', 'bendahara.manage', 'bud.view', 'bud.manage',
      'icsa-rekon.view', 'icsa-rekon.create', 'icsa-rekon.update',
      'icsa-rekon.delete', 'icsa-rekon.print', 'icsa-rekon.export',
      'icsa-rekap.view', 'kasda-import.execute', 'kasda-saldo-awal.view',
      'kasda-saldo-awal.manage', 'kasda-matching.view',
      'kasda-matching.execute', 'kasda-matching.undo',
      'kasda-matching.delete', 'kasda-rekon.view', 'kasda-rekon.manage',
      'kasda-rekon.print', 'kasda-monitoring.view', 'laporan.export'
  )
  AND r.name = 'superadmin'
  AND r.guard_name = 'web';

/* Sinkronisasi penuh permission Admin: semua kecuali pengelolaan permission/Admin. */
DELETE FROM role_has_permissions
WHERE role_id = (
    SELECT id FROM roles WHERE name = 'admin' AND guard_name = 'web'
);

INSERT INTO role_has_permissions (permission_id, role_id)
SELECT p.id, r.id
FROM permissions p
CROSS JOIN roles r
WHERE p.guard_name = 'web'
  AND p.name IN (
      'dashboard.view', 'users.view', 'users.create', 'users.update',
      'users.activate', 'users.reset-password', 'users.assign-skpd',
      'users.assign-operator', 'activity-log.view', 'skpd.view',
      'bendahara.view', 'bendahara.manage', 'bud.view', 'bud.manage',
      'icsa-rekon.view', 'icsa-rekon.create', 'icsa-rekon.update',
      'icsa-rekon.delete', 'icsa-rekon.print', 'icsa-rekon.export',
      'icsa-rekap.view', 'kasda-import.execute', 'kasda-saldo-awal.view',
      'kasda-saldo-awal.manage', 'kasda-matching.view',
      'kasda-matching.execute', 'kasda-matching.undo',
      'kasda-matching.delete', 'kasda-rekon.view', 'kasda-rekon.manage',
      'kasda-rekon.print', 'kasda-monitoring.view', 'laporan.export'
  )
  AND r.name = 'admin'
  AND r.guard_name = 'web';

/* Sinkronisasi penuh permission Operator: hanya akses baca/cetak/export. */
DELETE FROM role_has_permissions
WHERE role_id = (
    SELECT id FROM roles WHERE name = 'operator' AND guard_name = 'web'
);

INSERT INTO role_has_permissions (permission_id, role_id)
SELECT p.id, r.id
FROM permissions p
CROSS JOIN roles r
WHERE p.guard_name = 'web'
  AND p.name IN (
      'dashboard.view',
      'icsa-rekon.view',
      'icsa-rekon.print',
      'icsa-rekon.export',
      'icsa-rekap.view',
      'laporan.export',
      'bendahara.view'
  )
  AND r.name = 'operator'
  AND r.guard_name = 'web';

/* -------------------------------------------------------------------------- */
/* 6. Bootstrap Superadmin                                                    */
/* -------------------------------------------------------------------------- */

DO $$
DECLARE
    v_bootstrap_email text := 'perbendaharaankabupatenkediri@gmail.com';
    v_user_id bigint;
    v_role_id bigint;
BEGIN
    IF v_bootstrap_email IS NULL
        OR BTRIM(v_bootstrap_email) = ''
        OR POSITION('@' IN v_bootstrap_email) = 0 THEN
        RAISE EXCEPTION 'Isi v_bootstrap_email dengan alamat email yang valid.';
    END IF;

    SELECT id INTO v_user_id
    FROM users
    WHERE LOWER(email) = LOWER(v_bootstrap_email)
    LIMIT 1;

    IF v_user_id IS NULL THEN
        RAISE EXCEPTION 'Email bootstrap Superadmin tidak ditemukan: %', v_bootstrap_email;
    END IF;

    SELECT id INTO v_role_id
    FROM roles
    WHERE name = 'superadmin' AND guard_name = 'web';

    DELETE FROM model_has_roles
    WHERE model_type = E'App\\Models\\User'
      AND model_id = v_user_id;

    INSERT INTO model_has_roles (role_id, model_type, model_id)
    VALUES (v_role_id, E'App\\Models\\User', v_user_id);
END
$$;

COMMIT;

/* -------------------------------------------------------------------------- */
/* 7. Verifikasi setelah COMMIT                                               */
/* -------------------------------------------------------------------------- */

SELECT r.name AS role, COUNT(rhp.permission_id) AS jumlah_permission
FROM roles r
LEFT JOIN role_has_permissions rhp ON rhp.role_id = r.id
WHERE r.name IN ('superadmin', 'admin', 'operator')
GROUP BY r.id, r.name
ORDER BY CASE r.name
    WHEN 'superadmin' THEN 1
    WHEN 'admin' THEN 2
    WHEN 'operator' THEN 3
    ELSE 4
END;

SELECT u.id, u.name, u.email, r.name AS role
FROM users u
JOIN model_has_roles mhr
  ON mhr.model_id = u.id
 AND mhr.model_type = E'App\\Models\\User'
JOIN roles r ON r.id = mhr.role_id
WHERE r.name = 'superadmin';
