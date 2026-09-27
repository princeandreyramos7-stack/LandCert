<?php

use App\Models\User;

test('login screen can be rendered', function () {
    $response = $this->get('/login');

    $response->assertStatus(200);
});

test('a right password signs the user in directly, with no texted code involved', function () {
    $user = User::factory()->create();

    $response = $this->realLogin($user->email, 'password');

    $this->assertAuthenticatedAs($user);
    $response->assertRedirect(route('dashboard', absolute: false));
});

test('users can not authenticate with invalid password', function () {
    $user = User::factory()->create();

    $this->post('/login', [
        'email' => $user->email,
        'password' => 'wrong-password',
    ]);

    $this->assertGuest();
});

test('staff land on their own dashboard after signing in', function () {
    $admin = User::factory()->create(['user_type' => 'admin']);
    $this->realLogin($admin->email, 'password')->assertRedirect(route('admin.dashboard'));

    $superAdmin = User::factory()->create(['user_type' => 'super_admin']);
    $this->post('/logout');
    $this->realLogin($superAdmin->email, 'password')->assertRedirect(route('super-admin.dashboard'));
});

test('users can logout', function () {
    $user = User::factory()->create();

    $response = $this->actingAs($user)->post('/logout');

    $this->assertGuest();
    $response->assertRedirect('/');
});
