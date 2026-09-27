<?php

namespace Tests\Feature;

use App\Models\User;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Illuminate\Support\Facades\Storage;
use Tests\TestCase;

/**
 * The safe-to-run half of restore's own safeguards: who can even reach the
 * route, and that a wrong password or confirmation phrase is refused
 * before anything destructive happens - never even reaching the safety
 * backup or maintenance mode, let alone the database import.
 *
 * The restore mechanics themselves (importing a dump, placing files back
 * under storage/app) are deliberately not exercised here: a real run calls
 * backup:run for its own safety net and toggles real maintenance-mode
 * state, both of which are too slow and too stateful to run inside the
 * shared, possibly-parallel test suite. That path was verified by hand
 * instead - see the picture-captcha-login-style note this session's memory
 * carries for how.
 */
class RestoreControllerTest extends TestCase
{
    use RefreshDatabase;

    private function fakeBackupFile(string $name): void
    {
        Storage::fake('backups');
        Storage::disk('backups')->put($name, 'not a real zip, but the route never reads this far in these tests');
    }

    public function test_an_applicant_cannot_reach_the_restore_route(): void
    {
        $applicant = $this->userOf('applicant');
        $this->fakeBackupFile('backup.zip');

        $this->actingAs($applicant)
            ->postJson(route('super-admin.backups.restore', 'backup.zip'), [
                'password' => 'password',
                'confirmation' => 'RESTORE',
            ])
            ->assertForbidden();

        $this->assertFalse(app()->isDownForMaintenance());
    }

    public function test_an_admin_cannot_reach_the_restore_route(): void
    {
        $admin = $this->userOf('admin');
        $this->fakeBackupFile('backup.zip');

        $this->actingAs($admin)
            ->postJson(route('super-admin.backups.restore', 'backup.zip'), [
                'password' => 'password',
                'confirmation' => 'RESTORE',
            ])
            ->assertForbidden();

        $this->assertFalse(app()->isDownForMaintenance());
    }

    public function test_a_super_admin_with_the_wrong_password_is_refused_before_anything_is_touched(): void
    {
        $superAdmin = $this->userOf('super_admin');
        $this->fakeBackupFile('backup.zip');

        $this->actingAs($superAdmin)
            ->postJson(route('super-admin.backups.restore', 'backup.zip'), [
                'password' => 'not-the-right-password',
                'confirmation' => 'RESTORE',
            ])
            ->assertStatus(422)
            ->assertJson(['message' => 'That password is not correct.']);

        $this->assertFalse(app()->isDownForMaintenance());
    }

    public function test_the_right_password_but_wrong_confirmation_phrase_is_refused(): void
    {
        $superAdmin = $this->userOf('super_admin');
        $this->fakeBackupFile('backup.zip');

        $this->actingAs($superAdmin)
            ->postJson(route('super-admin.backups.restore', 'backup.zip'), [
                'password' => 'password',
                'confirmation' => 'please restore this',
            ])
            ->assertStatus(422)
            ->assertJson(['message' => 'Type RESTORE, in capitals, to confirm.']);

        $this->assertFalse(app()->isDownForMaintenance());
    }

    public function test_the_confirmation_phrase_is_case_and_whitespace_insensitive(): void
    {
        // Accepted at the validation stage - it is the file-not-found abort
        // that stops this one, proving the phrase itself was fine and
        // execution moved on to actually locating the backup.
        $superAdmin = $this->userOf('super_admin');

        $this->actingAs($superAdmin)
            ->postJson(route('super-admin.backups.restore', 'does-not-exist.zip'), [
                'password' => 'password',
                'confirmation' => '  restore  ',
            ])
            ->assertNotFound();
    }

    public function test_a_missing_backup_file_is_a_404(): void
    {
        Storage::fake('backups');
        $superAdmin = $this->userOf('super_admin');

        $this->actingAs($superAdmin)
            ->postJson(route('super-admin.backups.restore', 'does-not-exist.zip'), [
                'password' => 'password',
                'confirmation' => 'RESTORE',
            ])
            ->assertNotFound();

        $this->assertFalse(app()->isDownForMaintenance());
    }

    public function test_a_path_outside_the_backups_folder_is_refused(): void
    {
        Storage::fake('backups');
        $superAdmin = $this->userOf('super_admin');

        $this->actingAs($superAdmin)
            ->postJson(route('super-admin.backups.restore', '..%2F..%2F.env'), [
                'password' => 'password',
                'confirmation' => 'RESTORE',
            ])
            ->assertNotFound();
    }
}
