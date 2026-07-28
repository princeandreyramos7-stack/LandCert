<?php

namespace App\Console\Commands;

use Illuminate\Console\Command;
use App\Services\ReminderService;

class SendScheduledSmsReminders extends Command
{
    /**
     * The name and signature of the console command.
     *
     * @var string
     */
    protected $signature = 'sms:send-reminders';

    /**
     * The console command description.
     *
     * @var string
     */
    protected $description = 'Send scheduled SMS and email reminders to users';

    /**
     * Execute the console command.
     */
    public function handle(ReminderService $reminderService)
    {
        $this->info('Starting to send scheduled reminders...');
        
        $sent = $reminderService->sendPendingReminders();
        
        $this->info("Successfully sent {$sent} reminder(s).");
        
        return Command::SUCCESS;
    }
}
