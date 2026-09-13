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

// Database + uploaded files backup, once a day
Schedule::command('backup:run')->dailyAt('02:00');

// Clean up old backups according to the retention strategy in config/backup.php
Schedule::command('backup:clean')->dailyAt('03:00');
