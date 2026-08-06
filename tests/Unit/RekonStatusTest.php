<?php

use App\Support\RekonStatus;

test('rekonsiliasi yang belum pernah disimpan berstatus belum', function () {
    expect(RekonStatus::determine(false, 0, null, 0, null))->toBe('BELUM');
});

test('rekonsiliasi selesai ketika tab B dan tab C balance', function () {
    expect(RekonStatus::determine(true, 0, null, 0, null))->toBe('SUDAH');
});

test('rekonsiliasi selesai ketika setiap selisih memiliki keterangannya sendiri', function () {
    expect(RekonStatus::determine(true, 100, 'Selisih pencatatan BKU', 200, 'Kas dalam perjalanan'))->toBe('SUDAH');
});

test('rekonsiliasi tetap proses ketika salah satu tab belum diselesaikan', function () {
    expect(RekonStatus::determine(true, 100, null, 0, null))->toBe('PROSES')
        ->and(RekonStatus::determine(true, 0, null, 200, null))->toBe('PROSES')
        ->and(RekonStatus::determine(true, 100, 'Sudah dijelaskan', 200, '   '))->toBe('PROSES');
});

test('selisih di bawah toleransi dianggap balance', function () {
    expect(RekonStatus::determine(true, 0.009, null, -0.009, null))->toBe('SUDAH');
});
