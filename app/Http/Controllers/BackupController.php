<?php

namespace App\Http\Controllers;

use App\Services\AuditLogService;
use App\Support\BackupSchedule;
use Illuminate\Http\Request;
use Illuminate\Support\Carbon;
use Illuminate\Support\Facades\Artisan;
use Illuminate\Support\Facades\Storage;
use Inertia\Inertia;
use Inertia\Response;

/**
 * Backups, for the Zoning Administrator.
 *
 * The backup itself is spatie/laravel-backup: a dump of the database and a
 * copy of every uploaded file, zipped onto the "backups" disk, run by the
 * scheduler. It used to run at a fixed hour with no way of knowing, short of
 * looking at the disk, whether it had. This page shows what is on the disk,
 * how the last run went and when the next one is, takes a backup on demand,
 * hands the files out, and lets the office choose daily or weekly.
 */
class BackupController extends Controller
{
    public function index(): Response
    {
        $disk = Storage::disk('backups');
        $files = collect($disk->allFiles())
            ->filter(fn ($path) => str_ends_with(strtolower($path), '.zip'))
            ->map(fn ($path) => [
                'name' => basename($path),
                'path' => $path,
                'size' => $disk->size($path),
                'created_at' => Carbon::createFromTimestamp($disk->lastModified($path))->toIso8601String(),
            ])
            ->sortByDesc('created_at')
            ->values();

        $schedule = BackupSchedule::current();

        return Inertia::render('SuperAdmin/Backups', [
            'backups' => $files,
            'totalSize' => $files->sum('size'),
            'schedule' => $schedule,
            'nextRun' => BackupSchedule::nextRun($schedule)->toIso8601String(),
            'lastRun' => BackupSchedule::lastRun(),
            'keepDays' => (int) config('backup.cleanup.default_strategy.keep_all_backups_for_days', 7),
        ]);
    }

    /** Take a backup now. Synchronous: the office waits a few seconds and sees the result. */
    public function run()
    {
        try {
            // Notifications are mail, and mail is not something a backup should
            // depend on; the outcome is recorded for the page instead.
            $code = Artisan::call('backup:run', ['--disable-notifications' => true]);
            $output = trim(Artisan::output());

            if ($code !== 0 || str_contains($output, 'Backup failed')) {
                BackupSchedule::recordRun(false, self::lastLine($output), 'manual');

                return back()->with('error', 'The backup did not complete: ' . self::lastLine($output));
            }

            BackupSchedule::recordRun(true, 'Backup completed', 'manual');
            AuditLogService::log('backup_created', 'Manual backup taken from the Backups page', 'Backup', null);

            return back()->with('success', 'Backup completed. The file is listed below.');
        } catch (\Throwable $e) {
            BackupSchedule::recordRun(false, $e->getMessage(), 'manual');

            return back()->with('error', 'The backup did not complete: ' . $e->getMessage());
        }
    }

    public function download(string $file)
    {
        $path = $this->locate($file);

        return Storage::disk('backups')->download($path, basename($path));
    }

    public function destroy(string $file)
    {
        $path = $this->locate($file);
        Storage::disk('backups')->delete($path);
        AuditLogService::log('backup_deleted', "Backup {$file} deleted", 'Backup', null);

        return back()->with('success', 'Backup deleted.');
    }

    public function schedule(Request $request)
    {
        $validated = $request->validate([
            'frequency' => 'required|in:daily,weekly',
            'time' => ['required', 'regex:/^([01]\d|2[0-3]):[0-5]\d$/'],
            'day' => 'required_if:frequency,weekly|integer|min:0|max:6',
        ]);

        $saved = BackupSchedule::save($validated);
        AuditLogService::log('backup_schedule_updated', "Automatic backup set to {$saved['frequency']} at {$saved['time']}", 'Backup', null);

        return back()->with('success', 'Backup schedule saved.');
    }

    /**
     * The one file on the backups disk with this name. Names only - a path
     * with a directory in it is refused - so the disk cannot be walked.
     */
    private function locate(string $file): string
    {
        abort_if($file !== basename($file) || !str_ends_with(strtolower($file), '.zip'), 404);

        $disk = Storage::disk('backups');
        $match = collect($disk->allFiles())->first(fn ($path) => basename($path) === $file);
        abort_if(!$match, 404);

        return $match;
    }

    private static function lastLine(string $output): string
    {
        $lines = array_values(array_filter(array_map('trim', explode("\n", $output))));

        return $lines ? end($lines) : 'no output';
    }
}
