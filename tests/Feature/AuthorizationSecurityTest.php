<?php

use App\Models\ActivityLog;
use App\Models\User;
use Database\Seeders\AuthorizationSeeder;
use Illuminate\Support\Facades\DB;

beforeEach(function () {
    $this->seed(AuthorizationSeeder::class);
});

it('rejects login for an inactive account and records the attempt', function () {
    $user = User::factory()->create(['is_active' => false]);

    $this->post('/login', [
        'username' => $user->username,
        'password' => 'password',
        'tahun' => now()->year,
    ])->assertSessionHasErrors('username');

    $this->assertGuest();

    expect(ActivityLog::query()
        ->where('action', 'login.failed')
        ->where('status', 'failed')
        ->exists())->toBeTrue();
});

it('revokes an existing session when the account becomes inactive', function () {
    $user = User::factory()->create(['is_active' => false]);

    $this->actingAs($user)
        ->get('/profile')
        ->assertRedirect(route('login'));

    $this->assertGuest();
});

it('prevents an operator from opening admin and mutation routes', function () {
    $operator = User::factory()->create();
    $operator->assignRole('operator');

    $this->actingAs($operator)
        ->withSession(['tahun' => 2026])
        ->get('/kasda/import')
        ->assertForbidden();

    $this->actingAs($operator)
        ->withSession(['tahun' => 2026])
        ->get('/icsa/pengeluaran/rekonsiliasi/create')
        ->assertForbidden();
});

it('limits an operator to assigned skpd filters', function () {
    DB::table('tabel_skpd')->insert([
        [
            'tahun' => '2026',
            'kode_skpd' => '1.01.01',
            'skpd' => 'SKPD Satu',
        ],
        [
            'tahun' => '2026',
            'kode_skpd' => '1.02.01',
            'skpd' => 'SKPD Dua',
        ],
    ]);

    $operator = User::factory()->create();
    $operator->assignRole('operator');
    $operator->skpdAssignments()->create(['kode_skpd' => '1.01.01']);

    $this->actingAs($operator)
        ->withSession(['tahun' => 2026])
        ->get('/icsa/pengeluaran/rekonsiliasi?kode_skpd=1.01.01')
        ->assertOk()
        ->assertInertia(fn ($page) => $page
            ->where('selectedSkpd', '1.01.01')
            ->has('listSkpd', 1)
            ->where('listSkpd.0.kode_skpd', '1.01.01'));

    $this->actingAs($operator)
        ->withSession(['tahun' => 2026])
        ->get('/icsa/pengeluaran/rekonsiliasi?kode_skpd=1.02.01')
        ->assertForbidden();
});

it('prevents a superadmin from deleting their own account', function () {
    $superadmin = User::factory()->create();
    $superadmin->assignRole('superadmin');

    $this->actingAs($superadmin)
        ->from('/profile')
        ->delete('/profile', ['password' => 'password'])
        ->assertSessionHasErrors('password')
        ->assertRedirect('/profile');

    expect($superadmin->fresh())->not->toBeNull();
});
