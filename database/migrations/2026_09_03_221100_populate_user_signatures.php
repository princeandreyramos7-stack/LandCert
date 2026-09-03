<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Support\Facades\DB;

return new class extends Migration
{
    /**
     * Run the migrations.
     * Populate signature URLs for all users
     */
    public function up(): void
    {
        $signatures = [
            'crisanta@cpdo.com' => '/images/E-signitures/ENGR. CRISANTA D. CONCEPCION, EnP.png',
            'jeff@cpdo.com' => '/images/E-signitures/Jeffrey Paguig.png',
            'kay@cpdo.com' => '/images/E-signitures/Kay B. Aggarao.png',
            'april@cpdo.com' => '/images/E-signitures/April U. Cuntapay.png',
            'admin@cpdo.com' => '/images/E-signitures/Mary Jane P. Bulauan.png',
        ];

        foreach ($signatures as $email => $signaturePath) {
            DB::table('users')
                ->where('email', $email)
                ->update(['signature_url' => $signaturePath]);
        }
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        DB::table('users')
            ->whereIn('email', [
                'crisanta@cpdo.com',
                'jeff@cpdo.com',
                'kay@cpdo.com',
                'april@cpdo.com',
                'admin@cpdo.com',
            ])
            ->update(['signature_url' => null]);
    }
};
