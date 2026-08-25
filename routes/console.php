<?php

use Illuminate\Foundation\Inspiring;
use Illuminate\Support\Facades\Artisan;
use Illuminate\Support\Facades\Schedule;

Artisan::command('inspire', function () {
    $this->comment(Inspiring::quote());
})->purpose('Display an inspiring quote');

// Schedule automated reminders to run hourly
Schedule::command('reminders:send')->hourly();

// Database + uploaded files backup, once a day
Schedule::command('backup:run')->dailyAt('02:00');

// Clean up old backups according to the retention strategy in config/backup.php
Schedule::command('backup:clean')->dailyAt('03:00');
