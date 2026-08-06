<?php

use App\Models\User;
use Database\Seeders\AuthorizationSeeder;

test('guests are redirected to the login page', function () {
    $this->get('/dashboard')->assertRedirect('/login');
});

test('authenticated users can visit the dashboard', function () {
    $this->seed(AuthorizationSeeder::class);
    $this->actingAs($user = User::factory()->create());
    $user->assignRole('admin');

    $this->get('/dashboard')->assertOk();
});
