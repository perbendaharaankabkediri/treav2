<?php

use App\Models\ActivityLog;
use App\Models\User;
use Database\Seeders\AuthorizationSeeder;
use Illuminate\Support\Facades\DB;

beforeEach(function () {
    $this->seed(AuthorizationSeeder::class);
});

it('records standardized operational audit metadata without request secrets', function () {
    DB::table('tabel_jenis_bendahara')->insert([
        'jenis_bendahara' => '001',
        'bendahara' => 'Bendahara Pengeluaran',
    ]);

    $admin = User::factory()->create();
    $admin->assignRole('admin');

    $this->actingAs($admin)->withSession(['tahun' => 2026])->post(route('bendahara.store'), [
        'kode_skpd' => '1.01.01',
        'nama' => 'Bendahara Audit',
        'nip' => '123456789012345678',
        'jenis_bendahara' => '001',
        'password' => 'must-not-be-logged',
    ])->assertRedirect(route('bendahara.index'));

    $log = ActivityLog::query()->where('action', 'bendahara.created')->firstOrFail();

    expect($log->module)->toBe('bendahara')
        ->and($log->kode_skpd)->toBe('1.01.01')
        ->and($log->metadata['route'])->toBe('bendahara.store')
        ->and($log->metadata['input'])->not->toHaveKey('password');
});

it('records failed operational attempts', function () {
    $admin = User::factory()->create();
    $admin->assignRole('admin');

    $this->actingAs($admin)->withSession(['tahun' => 2026])
        ->post(route('bendahara.store'), [])
        ->assertSessionHasErrors(['kode_skpd', 'nama', 'nip', 'jenis_bendahara']);

    $this->assertDatabaseHas('activity_logs', [
        'user_id' => $admin->id,
        'action' => 'bendahara.created',
        'status' => 'failed',
    ]);
});

it('revokes database sessions and remember tokens when an account is disabled', function () {
    config()->set('session.driver', 'database');

    $superadmin = User::factory()->create();
    $superadmin->assignRole('superadmin');
    $operator = User::factory()->create(['remember_token' => 'remember-me']);
    $operator->assignRole('operator');

    DB::table('sessions')->insert([
        'id' => 'operator-session',
        'user_id' => $operator->id,
        'ip_address' => '127.0.0.1',
        'user_agent' => 'Pest',
        'payload' => 'payload',
        'last_activity' => now()->timestamp,
    ]);

    $this->actingAs($superadmin)
        ->patch(route('administrasi.akun.toggle-active', $operator))
        ->assertRedirect();

    expect($operator->fresh()->is_active)->toBeFalse()
        ->and($operator->fresh()->remember_token)->not->toBe('remember-me');
    $this->assertDatabaseMissing('sessions', ['id' => 'operator-session']);
});

it('rate limits repeated administrative password resets', function () {
    $superadmin = User::factory()->create();
    $superadmin->assignRole('superadmin');
    $operator = User::factory()->create();
    $operator->assignRole('operator');

    foreach (range(1, 5) as $attempt) {
        $this->actingAs($superadmin)->put(route('administrasi.akun.reset-password', $operator), [
            'password' => "Password{$attempt}!",
            'password_confirmation' => "Password{$attempt}!",
        ])->assertRedirect();
    }

    $this->actingAs($superadmin)->put(route('administrasi.akun.reset-password', $operator), [
        'password' => 'Password6!',
        'password_confirmation' => 'Password6!',
    ])->assertStatus(429);
});

it('blocks operator access to direct mutation endpoints', function () {
    $operator = User::factory()->create();
    $operator->assignRole('operator');

    $this->actingAs($operator)->withSession(['tahun' => 2026])
        ->post(route('bendahara.store'), [
            'kode_skpd' => '1.01.01',
            'nama' => 'Tidak Boleh',
            'nip' => '123456789012345678',
            'jenis_bendahara' => '001',
        ])->assertForbidden();

    $this->actingAs($operator)->withSession(['tahun' => 2026])
        ->post(route('kasda.saldo-awal.store'), [
            'tahun' => 2026,
            'saldo_awal' => 1000,
        ])->assertForbidden();
});
