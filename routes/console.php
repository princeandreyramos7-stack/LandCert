<?php

use Illuminate\Foundation\Inspiring;
use Illuminate\Support\Facades\Artisan;
use Illuminate\Support\Facades\Schedule;

Artisan::command('inspire', function () {
    $this->comment(Inspiring::quote());
})->purpose('Display an inspiring quote');

/*
 | Drain the queue.
 |
 | Every mailable in app/Mail implements ShouldQueue and QUEUE_CONNECTION is
 | "database", so Mail::send() only writes a row to the jobs table — the message
 | is not sent until a worker picks it up. There is no long-running worker on
 | this host, so nothing was ever delivered: no error, no bounce, just a queue
 | growing quietly. The controllers even logged "sent successfully".
 |
 | This rides on the same cron as the rest of the schedule. --stop-when-empty
 | lets it exit instead of running forever, --max-time keeps it inside the
 | minute so runs cannot pile up on each other, and withoutOverlapping means a
 | slow batch does not get a second worker on top of it.
 |
 | Requires the host cron to run `php artisan schedule:run` every minute.
 */
Schedule::command('queue:work --stop-when-empty --max-time=50 --tries=3')
    ->everyMinute()
    ->withoutOverlapping();

// Schedule automated reminders to run hourly
Schedule::command('reminders:send')->hourly();

// Closed applications older than the Charter's archive age leave the board
// (they stay on file). Monthly, in the small hours.
Schedule::command('applications:archive')->monthlyOn(1, '02:30');

// Database + uploaded files backup, daily or weekly as set on the Backups
// page (App\Support\BackupSchedule), and a daily prune of old ones. Both
// with notifications off: those go by mail, and a backup must not depend on
// mail working. The outcome is recorded for the page by AppServiceProvider.
$backupSchedule = \App\Support\BackupSchedule::current();
$backupRun = Schedule::command('backup:run --disable-notifications')->withoutOverlapping();
if ($backupSchedule['frequency'] === 'weekly') {
    $backupRun->weeklyOn($backupSchedule['day'], $backupSchedule['time']);
} else {
    $backupRun->dailyAt($backupSchedule['time']);
}
Schedule::command('backup:clean --disable-notifications')->dailyAt('03:30');

