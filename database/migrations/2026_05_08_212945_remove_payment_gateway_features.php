<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    /**
     * Run the migrations.
     */
    public function up(): void
    {
        // NOTE: We do NOT drop certificates and payments tables - they are needed for physical document tracking
        // These tables were moved to a separate workflow outside of the online payment gateway
        
        // Drop foreign keys first if tables exist
        if (Schema::hasTable('certificates')) {
            Schema::table('certificates', function (Blueprint $table) {
                // Check if foreign key exists before dropping
                try {
                    $table->dropForeign(['payment_id']);
                } catch (\Exception $e) {
                    // Foreign key might not exist, continue
                }
            });
        }

        // DO NOT drop certificates table - it's used for physical document tracking
        // Schema::dropIfExists('certificates');

        // DO NOT drop payments table - it's used for physical payment tracking
        // Schema::dropIfExists('payments');

        // Remove payment-related columns from requests table if they exist
        if (Schema::hasTable('requests')) {
            Schema::table('requests', function (Blueprint $table) {
                // Check and drop payment-related columns if they exist
                if (Schema::hasColumn('requests', 'payment_status')) {
                    $table->dropColumn('payment_status');
                }
                if (Schema::hasColumn('requests', 'payment_amount')) {
                    $table->dropColumn('payment_amount');
                }
                if (Schema::hasColumn('requests', 'payment_method')) {
                    $table->dropColumn('payment_method');
                }
                if (Schema::hasColumn('requests', 'payment_date')) {
                    $table->dropColumn('payment_date');
                }
                if (Schema::hasColumn('requests', 'payment_receipt_path')) {
                    $table->dropColumn('payment_receipt_path');
                }
            });
        }

        // Remove payment-related columns from applications table if they exist
        if (Schema::hasTable('applications')) {
            Schema::table('applications', function (Blueprint $table) {
                if (Schema::hasColumn('applications', 'payment_status')) {
                    $table->dropColumn('payment_status');
                }
                if (Schema::hasColumn('applications', 'payment_verified_at')) {
                    $table->dropColumn('payment_verified_at');
                }
            });
        }

        // Remove workflow status from reports table (simplify to just evaluation)
        if (Schema::hasTable('reports')) {
            Schema::table('reports', function (Blueprint $table) {
                if (Schema::hasColumn('reports', 'workflow_status')) {
                    $table->dropColumn('workflow_status');
                }
                if (Schema::hasColumn('reports', 'payment_order_sent_at')) {
                    $table->dropColumn('payment_order_sent_at');
                }
                if (Schema::hasColumn('reports', 'payment_verified_at')) {
                    $table->dropColumn('payment_verified_at');
                }
                if (Schema::hasColumn('reports', 'certificate_generated_at')) {
                    $table->dropColumn('certificate_generated_at');
                }
            });
        }

        // Drop status_history table (was used for payment workflow tracking)
        Schema::dropIfExists('status_history');

        // Drop reminders table (was used for payment reminders)
        Schema::dropIfExists('reminders');
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        // Recreate payments table
        Schema::create('payments', function (Blueprint $table) {
            $table->id();
            $table->unsignedBigInteger('request_id');
            $table->unsignedInteger('application_id')->nullable();
            $table->decimal('amount', 10, 2);
            $table->enum('payment_method', ['cash', 'bank_transfer', 'gcash', 'paymaya', 'check', 'other'])->default('cash');
            $table->string('receipt_number')->nullable();
            $table->string('receipt_file_path')->nullable();
            $table->date('payment_date');
            $table->enum('payment_status', ['pending', 'verified', 'rejected'])->default('pending');
            $table->unsignedInteger('verified_by')->nullable();
            $table->timestamp('verified_at')->nullable();
            $table->text('rejection_reason')->nullable();
            $table->text('notes')->nullable();
            $table->timestamps();

            $table->foreign('request_id')->references('id')->on('requests')->onDelete('cascade');
            $table->foreign('application_id')->references('id')->on('applications')->onDelete('set null');
            $table->foreign('verified_by')->references('id')->on('users')->onDelete('set null');
        });

        // Recreate certificates table
        Schema::create('certificates', function (Blueprint $table) {
            $table->id();
            $table->unsignedBigInteger('request_id');
            $table->unsignedInteger('application_id')->nullable();
            $table->unsignedBigInteger('payment_id')->nullable();
            $table->string('certificate_number')->unique();
            $table->string('certificate_file_path')->nullable();
            $table->unsignedInteger('issued_by')->nullable();
            $table->timestamp('issued_at')->nullable();
            $table->date('valid_until')->nullable();
            $table->enum('status', ['generated', 'sent', 'collected'])->default('generated');
            $table->text('notes')->nullable();
            $table->timestamps();

            $table->foreign('request_id')->references('id')->on('requests')->onDelete('cascade');
            $table->foreign('application_id')->references('id')->on('applications')->onDelete('set null');
            $table->foreign('payment_id')->references('id')->on('payments')->onDelete('set null');
            $table->foreign('issued_by')->references('id')->on('users')->onDelete('set null');
        });

        // Recreate status_history table
        Schema::create('status_history', function (Blueprint $table) {
            $table->id();
            $table->unsignedBigInteger('request_id');
            $table->unsignedInteger('application_id')->nullable();
            $table->string('status');
            $table->text('notes')->nullable();
            $table->unsignedInteger('changed_by')->nullable();
            $table->timestamps();

            $table->foreign('request_id')->references('id')->on('requests')->onDelete('cascade');
            $table->foreign('application_id')->references('id')->on('applications')->onDelete('set null');
            $table->foreign('changed_by')->references('id')->on('users')->onDelete('set null');
        });

        // Recreate reminders table
        Schema::create('reminders', function (Blueprint $table) {
            $table->id();
            $table->unsignedBigInteger('request_id');
            $table->unsignedInteger('application_id')->nullable();
            $table->enum('reminder_type', ['payment_due', 'document_pending', 'certificate_expiry']);
            $table->timestamp('scheduled_at');
            $table->timestamp('sent_at')->nullable();
            $table->enum('status', ['pending', 'sent', 'failed'])->default('pending');
            $table->text('message')->nullable();
            $table->timestamps();

            $table->foreign('request_id')->references('id')->on('requests')->onDelete('cascade');
            $table->foreign('application_id')->references('id')->on('applications')->onDelete('set null');
        });
    }
};
