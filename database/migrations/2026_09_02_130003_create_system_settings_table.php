<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;
use Illuminate\Support\Facades\DB;

return new class extends Migration
{
    /**
     * Create system_settings table for configurable system parameters
     * Allows admins to modify system behavior without code changes
     */
    public function up(): void
    {
        Schema::create('system_settings', function (Blueprint $table) {
            $table->id();
            $table->string('key')->unique(); // Setting identifier
            $table->string('category', 50); // General, Payments, Certificates, Email, SMS, etc.
            $table->string('label'); // Human-readable name
            $table->text('description')->nullable(); // What this setting does
            $table->text('value')->nullable(); // The actual value
            $table->string('type', 20)->default('text'); // text, number, boolean, json, email, url
            $table->text('options')->nullable(); // JSON array of valid options for select/radio
            $table->boolean('is_public')->default(false); // Visible to non-admins
            $table->timestamps();
            
            $table->index('category');
            $table->index('is_public');
        });

        // Seed default settings
        $settings = [
            [
                'key' => 'payment_deadline_days',
                'category' => 'Payments',
                'label' => 'Payment Deadline (Days)',
                'description' => 'Number of days applicant has to pay after approval',
                'value' => '30',
                'type' => 'number',
                'is_public' => true,
            ],
            [
                'key' => 'certificate_expiry_months',
                'category' => 'Certificates',
                'label' => 'Certificate Validity (Months)',
                'description' => 'How many months until certificate expires',
                'value' => '12',
                'type' => 'number',
                'is_public' => true,
            ],
            [
                'key' => 'reminder_days_before_deadline',
                'category' => 'Notifications',
                'label' => 'Payment Reminder Days',
                'description' => 'Send reminder X days before payment deadline',
                'value' => '7,3,1',
                'type' => 'text',
                'is_public' => false,
            ],
            [
                'key' => 'office_hours',
                'category' => 'General',
                'label' => 'Office Hours',
                'description' => 'CPDO office operating hours',
                'value' => 'Monday to Friday, 8:00 AM - 5:00 PM',
                'type' => 'text',
                'is_public' => true,
            ],
            [
                'key' => 'contact_email',
                'category' => 'General',
                'label' => 'Contact Email',
                'description' => 'Official CPDO contact email',
                'value' => 'cpdo@ilagan.gov.ph',
                'type' => 'email',
                'is_public' => true,
            ],
            [
                'key' => 'contact_phone',
                'category' => 'General',
                'label' => 'Contact Phone',
                'description' => 'Official CPDO contact number',
                'value' => '(078) 123-4567',
                'type' => 'text',
                'is_public' => true,
            ],
            [
                'key' => 'max_file_size_mb',
                'category' => 'Uploads',
                'label' => 'Maximum File Size (MB)',
                'description' => 'Maximum file size for document uploads',
                'value' => '10',
                'type' => 'number',
                'is_public' => true,
            ],
            [
                'key' => 'allowed_file_types',
                'category' => 'Uploads',
                'label' => 'Allowed File Types',
                'description' => 'Comma-separated list of allowed file extensions',
                'value' => 'pdf,jpg,jpeg,png',
                'type' => 'text',
                'is_public' => true,
            ],
            [
                'key' => 'maintenance_mode',
                'category' => 'System',
                'label' => 'Maintenance Mode',
                'description' => 'Enable to show maintenance page to applicants',
                'value' => 'false',
                'type' => 'boolean',
                'is_public' => false,
            ],
            [
                'key' => 'maintenance_message',
                'category' => 'System',
                'label' => 'Maintenance Message',
                'description' => 'Message shown during maintenance mode',
                'value' => 'System is under maintenance. Please check back later.',
                'type' => 'text',
                'is_public' => false,
            ],
        ];

        foreach ($settings as $setting) {
            DB::table('system_settings')->insert(array_merge($setting, [
                'created_at' => now(),
                'updated_at' => now(),
            ]));
        }
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('system_settings');
    }
};
