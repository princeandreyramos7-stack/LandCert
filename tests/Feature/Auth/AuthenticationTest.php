<?php

use App\Models\User;

test('login screen can be rendered', function () {
    $response = $this->get('/login');

    $response->assertStatus(200);
});

test('a right password alone does not sign the user in', function () {
    $user = User::factory()->create();

    $response = $this->post('/login', [
        'email' => $user->email,
        'password' => 'password',
    ]);

    // The session stays a guest's until the texted code is confirmed too.
    $this->assertGuest();
    $response->assertRedirect(route('two-factor.challenge'));
});

test('users can authenticate using the login screen and its texted code', function () {
    $user = User::factory()->create();

    $response = $this->loginThroughTwoFactor($user->email, 'password');

    $this->assertAuthenticated();
    $response->assertRedirect(route('dashboard', absolute: false));
});

test('a wrong verification code does not sign the user in', function () {
    $user = User::factory()->create();

    $this->post('/login', ['email' => $user->email, 'password' => 'password']);

    $response = $this->post('/two-factor-challenge', ['code' => '000000']);

    $this->assertGuest();
    $response->assertSessionHasErrors('code');
});

test('users can not authenticate with invalid password', function () {
    $user = User::factory()->create();

    $this->post('/login', [
        'email' => $user->email,
        'password' => 'wrong-password',
    ]);

    $this->assertGuest();
});

test('users can logout', function () {
    $user = User::factory()->create();

    $response = $this->actingAs($user)->post('/logout');

    $this->assertGuest();
    $response->assertRedirect('/');
});
