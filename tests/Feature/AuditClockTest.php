<?php

use App\Models\AuditLog;
use App\Services\AuditLogService;
use Carbon\Carbon;

/**
 * An audit entry is stamped with the application's clock, not the database
 * server's - the two differ by eight hours on the live host.
 */
test('an audit entry is stamped by the application clock', function () {
    Carbon::setTestNow('2026-09-17 12:22:00');

    AuditLogService::logFailedLogin('x@example.com');
    $log = AuditLog::latest('id')->firstOrFail();

    expect($log->created_at->format('Y-m-d H:i:s'))->toBe('2026-09-17 12:22:00');

    Carbon::setTestNow();
});

test('the clock fix shifts only the entries from before the fix', function () {
    AuditLog::forceCreate(['action' => 'old', 'description' => 'x', 'created_at' => '2026-09-17 04:22:00']);
    AuditLog::forceCreate(['action' => 'new', 'description' => 'x', 'created_at' => '2026-09-17 14:00:00']);

    $this->artisan('audit:fix-clock --hours=8 --before="2026-09-17 13:00:00" --dry-run')->assertSuccessful();
    expect(AuditLog::where('action', 'old')->value('created_at')->format('H:i'))->toBe('04:22');

    $this->artisan('audit:fix-clock --hours=8 --before="2026-09-17 13:00:00"')
        ->expectsConfirmation('Shift them now? This cannot be told apart from real times afterwards, so run it only once.', 'yes')
        ->assertSuccessful();

    expect(AuditLog::where('action', 'old')->value('created_at')->format('Y-m-d H:i'))->toBe('2026-09-17 12:22');
    expect(AuditLog::where('action', 'new')->value('created_at')->format('H:i'))->toBe('14:00');
});
