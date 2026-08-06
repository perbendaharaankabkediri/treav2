# Operasional TREA

## Akun dan akses

- Pembuatan akun dilakukan melalui **Administrasi > Manajemen Akun**.
- Superadmin dapat mengelola Admin dan Operator. Admin hanya dapat mengelola Operator.
- Operator wajib memiliki sedikitnya satu penugasan SKPD.
- Menonaktifkan akun akan mengganti remember-token dan menghapus session database pengguna.
- Permission hanya diubah melalui **Administrasi > Role & Permission** oleh Superadmin.

Jika seluruh Superadmin terkunci, jalankan seeder dengan username bootstrap yang sudah dikonfigurasi:

```bash
php artisan db:seed --class=AuthorizationSeeder
```

Pastikan `AUTH_BOOTSTRAP_SUPERADMIN_USERNAME` menunjuk akun yang benar sebelum menjalankannya.

## Activity log dan retensi

Retensi default adalah 365 hari dan dapat diubah melalui:

```dotenv
ACTIVITY_LOG_RETENTION_DAYS=365
```

Preview data yang memenuhi syarat cleanup:

```bash
php artisan activity-logs:prune
```

Penghapusan manual:

```bash
php artisan activity-logs:prune --force
```

Command membatasi retensi minimum 30 hari, menghapus secara bertahap, dan membuat audit log sistem setelah selesai. Scheduler menjalankannya setiap tanggal 1 pukul 02:15.

## Scheduler dan queue

Jalankan scheduler setiap menit melalui cron atau Task Scheduler:

```bash
php artisan schedule:run
```

Jalankan queue worker sebagai service:

```bash
php artisan queue:work --tries=3 --timeout=120
```

Dashboard Keamanan menampilkan heartbeat scheduler, koneksi database/cache, storage, dan jumlah failed job. Heartbeat diperbarui setiap lima menit.

## Checklist deployment

1. Pasang dependency dengan `composer install --no-dev --optimize-autoloader`.
2. Jalankan `npm ci` dan `npm run build`.
3. Isi `.env` produksi tanpa memasukkannya ke version control.
4. Pastikan `APP_ENV=production`, `APP_DEBUG=false`, dan `APP_KEY` unik.
5. Aktifkan `FORCE_HTTPS=true`, `SESSION_SECURE_COOKIE=true`, dan `SESSION_ENCRYPT=true`.
6. Gunakan `LOG_LEVEL=warning` atau `error`.
7. Jalankan `php artisan system:check-production`.
8. Jalankan `php artisan migrate --force`.
9. Jalankan `php artisan optimize`. Image Docker menjalankannya otomatis dari
   `docker/entrypoint.sh` setelah environment produksi tersedia.
10. Pastikan `storage` dan `bootstrap/cache` dapat ditulis oleh proses aplikasi.
11. Aktifkan scheduler dan queue worker.
12. Periksa **Administrasi > Dashboard Keamanan**.

Image Docker production menggunakan Apache dengan document root `public/` dan
OPcache tanpa timestamp validation. Karena itu setiap perubahan kode harus
diikuti build dan deploy image baru; jangan mengganti source langsung di dalam
container yang sedang berjalan.

## Pemeriksaan setelah deployment

```bash
php artisan about
php artisan schedule:list
php artisan system:check-production
php artisan activity-logs:prune
php artisan test
```

Mode preview retensi tidak menghapus data. Jangan menjalankan `--force` sebelum hasil preview diperiksa.
