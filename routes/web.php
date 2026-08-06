<?php

use App\Http\Controllers\ActivityLogController;
use App\Http\Controllers\NotificationController;
use App\Http\Controllers\BendaharaController;
use App\Http\Controllers\BudController;
use App\Http\Controllers\DashboardController;
use App\Http\Controllers\ICSA\PengeluaranController;
use App\Http\Controllers\ICSA\ImportRegisterSp2dController;
use App\Http\Controllers\ICSA\ImportLaporanRealisasiController;
use App\Http\Controllers\KasdaController;
use App\Http\Controllers\ProfileController;
use App\Http\Controllers\RolePermissionController;
use App\Http\Controllers\SecurityDashboardController;
use App\Http\Controllers\SkpdController;
use App\Http\Controllers\UserManagementController;
use Illuminate\Foundation\Application;
use Illuminate\Support\Facades\Route;
use Inertia\Inertia;

/*
|--------------------------------------------------------------------------
| Public Routes
|--------------------------------------------------------------------------
*/
Route::get('/', function () {
    return Inertia::render('Welcome', [
        'canLogin' => Route::has('login'),
        'laravelVersion' => Application::VERSION,
        'phpVersion' => PHP_VERSION,
    ]);
});

/*
|--------------------------------------------------------------------------
| Authenticated & Verified Dashboard Route
|--------------------------------------------------------------------------
*/
Route::get('/dashboard', [DashboardController::class, 'index'])
    ->middleware(['auth', 'active', 'permission:dashboard.view'])
    ->name('dashboard');

/*
|--------------------------------------------------------------------------
| Main Authenticated Protected Routes Group
|--------------------------------------------------------------------------
*/
Route::middleware(['auth', 'active', 'audit.operational'])->group(function () {
    Route::patch('/notifikasi/baca-semua', [NotificationController::class, 'readAll'])
        ->name('notifications.read-all');
    Route::patch('/notifikasi/{recipient}/baca', [NotificationController::class, 'read'])
        ->name('notifications.read');

    Route::prefix('administrasi')->name('administrasi.')->group(function () {
        Route::prefix('akun')->name('akun.')->group(function () {
            Route::get('/', [UserManagementController::class, 'index'])->middleware('permission:users.view')->name('index');
            Route::get('/tambah', [UserManagementController::class, 'create'])->middleware('permission:users.create')->name('create');
            Route::post('/', [UserManagementController::class, 'store'])->middleware('permission:users.create')->name('store');
            Route::get('/{user}/edit', [UserManagementController::class, 'edit'])->middleware('permission:users.update')->name('edit');
            Route::put('/{user}', [UserManagementController::class, 'update'])->middleware('permission:users.update')->name('update');
            Route::patch('/{user}/status', [UserManagementController::class, 'toggleActive'])->middleware('permission:users.activate')->name('toggle-active');
            Route::put('/{user}/password', [UserManagementController::class, 'resetPassword'])->middleware(['permission:users.reset-password', 'throttle:5,1'])->name('reset-password');
        });

        Route::get('/role-permission', [RolePermissionController::class, 'index'])
            ->middleware('permission:permissions.manage')->name('role-permission.index');
        Route::put('/role-permission/{role}', [RolePermissionController::class, 'update'])
            ->middleware('permission:permissions.manage')->name('role-permission.update');

        Route::get('/log-aktivitas', [ActivityLogController::class, 'index'])
            ->middleware('permission:activity-log.view')->name('log-aktivitas.index');
        Route::get('/log-aktivitas/export', [ActivityLogController::class, 'export'])
            ->middleware('permission:activity-log.view')->name('log-aktivitas.export');
        Route::get('/keamanan', [SecurityDashboardController::class, 'index'])
            ->middleware('permission:permissions.manage')->name('keamanan.index');
    });

    // ================= PROFILE ROUTES =================
    Route::get('/profile', [ProfileController::class, 'edit'])->name('profile.edit');
    Route::patch('/profile', [ProfileController::class, 'update'])->name('profile.update');
    Route::delete('/profile', [ProfileController::class, 'destroy'])->name('profile.destroy');

    // ================= MASTER DATA: SKPD =================
    Route::prefix('skpd')->name('skpd.')->group(function () {
        Route::get('/', [SkpdController::class, 'index'])->middleware('permission:skpd.view')->name('index');
    });

    // ================= MASTER DATA: BENDAHARA =================
    Route::prefix('bendahara')->name('bendahara.')->group(function () {
        Route::get('/', [BendaharaController::class, 'index'])->middleware('permission:bendahara.view')->name('index');
        Route::get('/create', [BendaharaController::class, 'create'])->middleware('permission:bendahara.manage')->name('create');
        Route::post('/', [BendaharaController::class, 'store'])->middleware('permission:bendahara.manage')->name('store');
        Route::get('/{id}/edit', [BendaharaController::class, 'edit'])->middleware('permission:bendahara.manage')->name('edit');
        Route::put('/{id}', [BendaharaController::class, 'update'])->middleware('permission:bendahara.manage')->name('update');
        Route::delete('/{id}', [BendaharaController::class, 'destroy'])->middleware('permission:bendahara.manage')->name('destroy');
    });

    // ================= MASTER DATA: BUD =================
    Route::prefix('bud')->name('bud.')->group(function () {
        Route::get('/', [BudController::class, 'index'])->middleware('permission:bud.view')->name('index');
        Route::get('/create', [BudController::class, 'create'])->middleware('permission:bud.manage')->name('create');
        Route::post('/', [BudController::class, 'store'])->middleware('permission:bud.manage')->name('store');
        Route::get('/{id}/edit', [BudController::class, 'edit'])->middleware('permission:bud.manage')->name('edit');
        Route::put('/{id}', [BudController::class, 'update'])->middleware('permission:bud.manage')->name('update');
        Route::delete('/{id}', [BudController::class, 'destroy'])->middleware('permission:bud.manage')->name('destroy');
    });

    // ================= ICSA: PENGELUARAN =================
    Route::prefix('icsa/pengeluaran')->name('icsa.pengeluaran.')->group(function () {
        Route::prefix('import-data')->name('import-data.')->middleware('permission:icsa-rekon.create')->group(function () {
            Route::get('/', [ImportRegisterSp2dController::class, 'index'])->name('index');
            Route::post('/register-sp2d', [ImportRegisterSp2dController::class, 'upload'])->name('register-sp2d.upload');
            Route::get('/register-sp2d/{batch}/preview', [ImportRegisterSp2dController::class, 'preview'])->name('register-sp2d.preview');
            Route::post('/register-sp2d/{batch}/confirm', [ImportRegisterSp2dController::class, 'confirm'])->name('register-sp2d.confirm');
            Route::delete('/register-sp2d/{batch}', [ImportRegisterSp2dController::class, 'cancel'])->name('register-sp2d.cancel');
            Route::post('/laporan-realisasi', [ImportLaporanRealisasiController::class, 'upload'])->name('laporan-realisasi.upload');
            Route::get('/laporan-realisasi/{batch}/preview', [ImportLaporanRealisasiController::class, 'preview'])->name('laporan-realisasi.preview');
            Route::post('/laporan-realisasi/{batch}/confirm', [ImportLaporanRealisasiController::class, 'confirm'])->name('laporan-realisasi.confirm');
            Route::delete('/laporan-realisasi/{batch}', [ImportLaporanRealisasiController::class, 'cancel'])->name('laporan-realisasi.cancel');
        });

        Route::prefix('rekonsiliasi')->name('rekonsiliasi.')->group(function () {
            Route::get('/', [PengeluaranController::class, 'index'])->middleware('permission:icsa-rekon.view')->name('index');
            Route::get('/scan-ba', [PengeluaranController::class, 'scanBa'])->middleware('permission:icsa-rekon.view')->name('scan-ba');
            Route::get('/create', [PengeluaranController::class, 'create'])->middleware('permission:icsa-rekon.create')->name('create');
            Route::post('/', [PengeluaranController::class, 'store'])->middleware('permission:icsa-rekon.create')->name('store');

            // Regex handler untuk nomor rekon bergaris miring (/)
            // Dokumen Cetak & Excel
            Route::get('/{no_rekon}/cetak', [PengeluaranController::class, 'cetak'])->middleware('permission:icsa-rekon.print')->name('cetak')->where('no_rekon', '.*');
            Route::get('/{no_rekon}/excel', [PengeluaranController::class, 'excel'])->middleware('permission:icsa-rekon.export')->name('excel')->where('no_rekon', '.*');

            Route::get('/{no_rekon}/edit', [PengeluaranController::class, 'edit'])->middleware('permission:icsa-rekon.update')->name('edit')->where('no_rekon', '.*');
            Route::put('/{no_rekon}', [PengeluaranController::class, 'update'])->middleware('permission:icsa-rekon.update')->name('update')->where('no_rekon', '.*');
            Route::delete('/{no_rekon}', [PengeluaranController::class, 'destroy'])->middleware('permission:icsa-rekon.delete')->name('destroy')->where('no_rekon', '.*');
        });

        Route::prefix('rekap-data')->name('rekap-data.')->group(function () {
            Route::get('/', [PengeluaranController::class, 'rekapdata'])->middleware('permission:icsa-rekap.view')->name('index');
            Route::get('/export', [PengeluaranController::class, 'exportExcel'])->middleware('permission:laporan.export')->name('export');
        });

        Route::get('/rekap-monitoring', [PengeluaranController::class, 'rekapmonitoring'])->middleware('permission:icsa-rekap.view')->name('rekap-monitoring.index');
    });

    // ================= KASDA: IMPORT DATA =================
    Route::prefix('kasda/import')->name('kasda.import.')->middleware('permission:kasda-import.execute')->group(function () {
        Route::get('/', [KasdaController::class, 'importIndex'])->name('index');

        // BKU Pemda
        Route::get('/bku', [KasdaController::class, 'bkuForm'])->name('bku.form');
        Route::post('/bku/preview', [KasdaController::class, 'bkuPreview'])->name('bku.preview');
        Route::post('/bku/store', [KasdaController::class, 'bkuStore'])->name('bku.store');

        // Mutasi Rekening
        Route::get('/mutasi', [KasdaController::class, 'mutasiForm'])->name('mutasi.form');
        Route::post('/mutasi/preview', [KasdaController::class, 'mutasiPreview'])->name('mutasi.preview');
        Route::post('/mutasi/store', [KasdaController::class, 'mutasiStore'])->name('mutasi.store');
    });

    // ================= KASDA: SALDO AWAL =================
    Route::prefix('kasda/saldo-awal')->name('kasda.saldo-awal.')->group(function () {
        Route::get('/', [KasdaController::class, 'saldoAwalIndex'])->middleware('permission:kasda-saldo-awal.view')->name('index');
        Route::post('/', [KasdaController::class, 'saveSaldoAwal'])->middleware('permission:kasda-saldo-awal.manage')->name('store');
    });

    // ================= KASDA: PENCOCOKAN HARIAN =================
    Route::prefix('kasda/pencocokan-harian')->name('kasda.pencocokan-harian.')->group(function () {
        Route::get('/', [KasdaController::class, 'pencocokanHarian'])->middleware('permission:kasda-matching.view')->name('index');
        Route::post('/proses', [KasdaController::class, 'prosesPencocokanHarian'])->middleware('permission:kasda-matching.execute')->name('proses');
        Route::post('/manual', [KasdaController::class, 'manualMatch'])->middleware('permission:kasda-matching.execute')->name('manual');
        Route::post('/unmatch', [KasdaController::class, 'unmatchGroup'])->middleware('permission:kasda-matching.undo')->name('unmatch');
        Route::post('/delete', [KasdaController::class, 'deletePencocokanHarian'])->middleware('permission:kasda-matching.delete')->name('delete');
        Route::post('/hapus-periode', [KasdaController::class, 'deletePencocokanPeriode'])->middleware('permission:kasda-matching.delete')->name('delete-periode');
    });

    // ================= KASDA: MONITORING PERIODE =================
    Route::get('/kasda/monitoring-periode', [KasdaController::class, 'monitoringPeriode'])->middleware('permission:kasda-monitoring.view')->name('kasda.monitoring-periode.index');

    Route::prefix('kasda')->name('kasda.')->group(function () {

        // 1. Halaman Index (Daftar Rekon)
        Route::get('/rekonsiliasi', [KasdaController::class, 'rekonIndex'])->middleware('permission:kasda-rekon.view')->name('rekon.index');

        // 2. Halaman Form Tambah Rekon
        Route::get('/rekonsiliasi/create', [KasdaController::class, 'rekonCreate'])->middleware('permission:kasda-rekon.manage')->name('rekon.create');

        // 7. (DIPINDAHKAN KE ATAS & PERBAIKAN URL) API Endpoint untuk ambil data via Fetch
        // URL asli yang terbentuk: /kasda/rekonsiliasi/create/get-data
        Route::get('/rekonsiliasi/create/get-data', [KasdaController::class, 'getDataPeriode'])->middleware('permission:kasda-rekon.manage')->name('rekon.create.get-data');

        // 3. Proses Simpan Data Rekon Baru
        Route::post('/rekonsiliasi', [KasdaController::class, 'rekonStore'])->middleware('permission:kasda-rekon.manage')->name('rekon.store');

        // 4. Halaman Detail Berita Acara Rekon (Parameter {id} harus di bawah agar tidak menabrak URL lain)
        Route::get('/rekonsiliasi/{id}', [KasdaController::class, 'rekonShow'])->middleware('permission:kasda-rekon.view')->name('rekon.show');

        // 5. Cetak PDF Berita Acara
        Route::get('/rekonsiliasi/{id}/print', [KasdaController::class, 'rekonPrint'])->middleware('permission:kasda-rekon.print')->name('rekon.print');

        // 6. Proses Hapus Data Rekon
        Route::delete('/rekonsiliasi/{id}', [KasdaController::class, 'rekonDestroy'])->middleware('permission:kasda-rekon.manage')->name('rekon.destroy');
    });

    Route::get('/kasda/transaksi-belum-cocok', [KasdaController::class, 'transaksiBelumCocok'])
        ->middleware('permission:kasda-matching.view')
        ->name('kasda.transaksi-belum-cocok.index');

});

require __DIR__.'/auth.php';
