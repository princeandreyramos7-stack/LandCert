<?php

use App\Models\AuditLog;
use App\Models\User;
use Illuminate\Support\Facades\RateLimiter;

/**
 * Every wrong password is in the audit trail, numbered, and a string of
 * them ending in a lockout is written once as its own entry.
 */

beforeEach(fn () => RateLimiter::clear(strtolower('juan@example.com') . '|127.0.0.1'));

test('a wrong password is logged with which attempt it was and why it failed', function () {
    $user = User::factory()->create(['email' => 'juan@example.com']);

    $this->post('/login', ['email' => 'juan@example.com', 'password' => 'wrong-password']);
    $this->post('/login', ['email' => 'juan@example.com', 'password' => 'still-wrong']);

    $logs = AuditLog::where('action', 'failed_login')->orderBy('id')->get();
    expect($logs)->toHaveCount(2);
    expect($logs[0]->user_id)->toBe($user->id);
    expect($logs[0]->metadata['attempt'])->toBe(1);
    expect($logs[0]->metadata['reason'])->toBe('wrong_password');
    expect($logs[1]->metadata['attempt'])->toBe(2);
    expect($logs[1]->description)->toContain('attempt 2 of 5');
});

test('an email with no account is logged as such, without inventing a user', function () {
    $this->post('/login', ['email' => 'nobody@example.com', 'password' => 'whatever']);

    $log = AuditLog::where('action', 'failed_login')->firstOrFail();
    expect($log->user_id)->toBeNull();
    expect($log->user_email)->toBe('nobody@example.com');
    expect($log->metadata['reason'])->toBe('unknown_email');
});

test('too many wrong passwords writes one lockout entry', function () {
    $user = User::factory()->create(['email' => 'juan@example.com']);

    foreach (range(1, 5) as $i) {
        $this->post('/login', ['email' => 'juan@example.com', 'password' => 'wrong-password']);
    }
    // Locked now: these are refused before the password is even checked.
    $this->post('/login', ['email' => 'juan@example.com', 'password' => 'wrong-password'])
        ->assertSessionHasErrors('email');
    $this->post('/login', ['email' => 'juan@example.com', 'password' => 'password'])
        ->assertSessionHasErrors('email');
    $this->assertGuest();

    expect(AuditLog::where('action', 'failed_login')->count())->toBe(5);

    $locked = AuditLog::where('action', 'login_locked')->get();
    expect($locked)->toHaveCount(1);
    expect($locked[0]->user_id)->toBe($user->id);
    expect($locked[0]->metadata['attempts'])->toBe(5);
    expect($locked[0]->description)->toContain('too many wrong passwords');
});

test('the audit log page counts lockouts', function () {
    AuditLog::create(['action' => 'login_locked', 'description' => 'x', 'user_email' => 'a@b.c', 'user_name' => 'a@b.c']);
    AuditLog::create(['action' => 'failed_login', 'description' => 'x', 'user_email' => 'a@b.c', 'user_name' => 'a@b.c']);

    $this->actingAs(User::factory()->create(['user_type' => 'super_admin']))
        ->get('/audit-logs')
        ->assertInertia(fn ($page) => $page
            ->where('stats.failed_logins', 1)
            ->where('stats.lockouts', 1));
});
