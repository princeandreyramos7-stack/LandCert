<?php

use App\Events\TwoFactorCodeIssued;
use Illuminate\Support\Facades\Event;

test('registration screen can be rendered', function () {
    $response = $this->get('/register');

    $response->assertStatus(200);
});

test('new users can register but are not signed in until they confirm their phone', function () {
    $response = $this->post('/register', [
        'consent' => '1',
        'name' => 'Test User',
        'email' => 'test@example.com',
        'password' => 'password',
        'password_confirmation' => 'password',
        'contact_number' => '09171234567',
    ]);

    $this->assertGuest();
    $response->assertRedirect(route('two-factor.challenge'));
});

test('registration finishes once the texted code is confirmed', function () {
    Event::fake([TwoFactorCodeIssued::class]);

    $this->post('/register', [
        'consent' => '1',
        'name' => 'Test User',
        'email' => 'test@example.com',
        'password' => 'password',
        'password_confirmation' => 'password',
        'contact_number' => '09171234567',
    ]);

    $code = null;
    Event::assertDispatched(TwoFactorCodeIssued::class, function ($event) use (&$code) {
        $code = $event->code;
        return $event->user->email === 'test@example.com';
    });

    $this->post('/two-factor-challenge', ['code' => $code])
        ->assertRedirect(route('dashboard', absolute: false));

    $this->assertAuthenticated();
});
