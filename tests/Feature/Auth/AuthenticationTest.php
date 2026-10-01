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

test('an applicant who never finished the registration code is sent back into it, not signed in', function () {
    $user = User::factory()->unverifiedPhone()->create();

    $this->realLogin($user->email, 'password')
        ->assertRedirect(route('two-factor.challenge'));

    $this->assertGuest();
});

test('entering the code from there finishes the sign-in and marks the phone verified', function () {
    \Illuminate\Support\Facades\Event::fake([\App\Events\TwoFactorCodeIssued::class]);
    $user = User::factory()->unverifiedPhone()->create();

    $this->realLogin($user->email, 'password');

    $code = null;
    \Illuminate\Support\Facades\Event::assertDispatched(\App\Events\TwoFactorCodeIssued::class, function ($event) use (&$code) {
        $code = $event->code;
        return true;
    });

    $this->post('/two-factor-challenge', ['code' => $code])
        ->assertRedirect(route('dashboard', absolute: false));

    $this->assertAuthenticatedAs($user);
    $this->assertNotNull($user->fresh()->phone_verified_at);
});

test('staff sign in directly even without a texted code - they were never asked for one', function () {
    $admin = User::factory()->unverifiedPhone()->create(['user_type' => 'admin']);

    $this->realLogin($admin->email, 'password')->assertRedirect(route('admin.dashboard'));

    $this->assertAuthenticatedAs($admin);
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
