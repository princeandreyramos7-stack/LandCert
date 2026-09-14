<?php

namespace App\Http\Controllers;

use App\Services\AuditLogService;
use App\Support\BackupSchedule;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Carbon;
use Illuminate\Support\Facades\Artisan;
use Illuminate\Support\Facades\Storage;

/**
 * The backups folder, for the Zoning Administrator.
 *
 * The backup itself is spatie/laravel-backup: a dump of the database and a
 * copy of every uploaded file, zipped onto the "backups" disk, run by the
 * scheduler. There is no page for it - the administrator opens the folder
 * from the sidebar, on whatever page they are on, and sees the files in it,
 * how the last run went and when the next is due; takes one now, downloads
 * or deletes one, and picks daily or weekly. Everything here answers in JSON
 * to that folder.
 */
class BackupController extends Controller
{
    /** The folder's contents. */
    public function index(): JsonResponse
    {
        return response()->json($this->folder());
    }

    /** Take a backup now. Synchronous: the office waits a few seconds and sees the file appear. */
    public function run(): JsonResponse
    {
        try {
            // Notifications are mail, and mail is not something a backup should
            // depend on; the outcome is recorded for the folder instead.
            $code = Artisan::call('backup:run', ['--disable-notifications' => true]);
            $output = trim(Artisan::output());

            if ($code !== 0 || str_contains($output, 'Backup failed')) {
                BackupSchedule::recordRun(false, self::lastLine($output), 'manual');

                return response()->json(['message' => 'The backup did not complete: ' . self::lastLine($output)] + $this->folder(), 500);
            }

            BackupSchedule::recordRun(true, 'Backup completed', 'manual');
            AuditLogService::log('backup_created', 'Manual backup taken from the Backups folder', 'Backup', null);

            return response()->json(['message' => 'Backup completed.'] + $this->folder());
        } catch (\Throwable $e) {
            BackupSchedule::recordRun(false, $e->getMessage(), 'manual');

            return response()->json(['message' => 'The backup did not complete: ' . $e->getMessage()] + $this->folder(), 500);
        }
    }

    public function download(string $file)
    {
        $path = $this->locate($file);

        return Storage::disk('backups')->download($path, basename($path));
    }

    public function destroy(string $file): JsonResponse
    {
        $path = $this->locate($file);
        Storage::disk('backups')->delete($path);
        AuditLogService::log('backup_deleted', "Backup {$file} deleted", 'Backup', null);

        return response()->json(['message' => 'Backup deleted.'] + $this->folder());
    }

    public function schedule(Request $request): JsonResponse
    {
        $validated = $request->validate([
            'frequency' => 'required|in:daily,weekly',
            'time' => ['required', 'regex:/^([01]\d|2[0-3]):[0-5]\d$/'],
            'day' => 'required_if:frequency,weekly|integer|min:0|max:6',
        ]);

        $saved = BackupSchedule::save($validated);
        AuditLogService::log('backup_schedule_updated', "Automatic backup set to {$saved['frequency']} at {$saved['time']}", 'Backup', null);

        return response()->json(['message' => 'Schedule saved.'] + $this->folder());
    }

    private function folder(): array
    {
        $disk = Storage::disk('backups');
        $files = collect($disk->allFiles())
            ->filter(fn ($path) => str_ends_with(strtolower($path), '.zip'))
            ->map(fn ($path) => [
                'name' => basename($path),
                'size' => $disk->size($path),
                'created_at' => Carbon::createFromTimestamp($disk->lastModified($path))->toIso8601String(),
            ])
            ->sortByDesc('created_at')
            ->values();

        $schedule = BackupSchedule::current();

        return [
            'backups' => $files,
            'totalSize' => $files->sum('size'),
            'schedule' => $schedule,
            'nextRun' => BackupSchedule::nextRun($schedule)->toIso8601String(),
            'lastRun' => BackupSchedule::lastRun(),
            'keepDays' => (int) config('backup.cleanup.default_strategy.keep_all_backups_for_days', 7),
        ];
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
