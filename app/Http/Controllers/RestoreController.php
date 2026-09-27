<?php

namespace App\Http\Controllers;

use App\Services\AuditLogService;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Artisan;
use Illuminate\Support\Facades\Hash;
use Illuminate\Support\Facades\Storage;
use RuntimeException;
use Symfony\Component\Process\Process;
use Throwable;
use ZipArchive;

/**
 * Restoring a backup - the most destructive action this system exposes, so
 * every safeguard the Backups folder's own design settled on lives here:
 *
 *  - Reachable only from the same super-admin-only route group as the rest
 *    of the Backups folder (see routes/web.php).
 *  - The requester's current password, re-checked fresh for this one
 *    action - not trusted from whenever they last signed in - plus a typed
 *    "RESTORE" phrase, so a stray click can never be the whole story.
 *  - A fresh safety backup taken immediately before anything is touched;
 *    if that fails, the restore never starts at all.
 *  - The site placed into maintenance for the duration, so no write from
 *    anyone else lands mid-restore.
 *
 * What "restore" actually does: the database dump inside the chosen backup
 * is imported wholesale (the dump itself carries DROP TABLE IF EXISTS
 * before each CREATE TABLE, so this is a full replace of every table it
 * contains, not a merge) and every file the backup carries is written back
 * under storage/app, overwriting whatever is there now. Deliberately not a
 * full wipe-then-restore of storage/app: a file created after the backup
 * was taken is left alone rather than deleted, since getting a destructive
 * recursive wipe wrong has a far worse failure mode than leaving one extra
 * file behind. The safety backup taken first is the real undo path if a
 * restore turns out to be the wrong one.
 */
class RestoreController extends Controller
{
    public function restore(Request $request, string $file): JsonResponse
    {
        $request->validate([
            'password' => ['required', 'string'],
            'confirmation' => ['required', 'string'],
        ]);

        if (!Hash::check($request->string('password'), $request->user()->password)) {
            return response()->json(['message' => 'That password is not correct.'], 422);
        }

        if (strtoupper(trim($request->string('confirmation'))) !== 'RESTORE') {
            return response()->json(['message' => 'Type RESTORE, in capitals, to confirm.'], 422);
        }

        $path = $this->locate($file);

        // Generous enough for a large database dump plus copying every
        // uploaded file back - both the safety backup about to run and the
        // restore itself need the room, not just the restore half.
        set_time_limit(600);

        // A restore that cannot even take its own safety net first must not
        // proceed - continuing without one defeats the entire point of it.
        // One retry, same as BackupController's own manual "back up now":
        // the database connection can fail to open for reasons that have
        // nothing to do with the backup itself - Windows briefly refusing a
        // new TCP socket under load is the one actually seen on this
        // project - and a second attempt a moment later routinely succeeds.
        try {
            $code = Artisan::call('backup:run', ['--disable-notifications' => true]);
            $output = Artisan::output();

            if (($code !== 0 || str_contains($output, 'Backup failed')) && BackupController::isTransient($output)) {
                $code = Artisan::call('backup:run', ['--disable-notifications' => true]);
                $output = Artisan::output();
            }

            if ($code !== 0 || str_contains($output, 'Backup failed')) {
                throw new RuntimeException('the safety backup did not complete, so nothing has been touched.');
            }
        } catch (Throwable $e) {
            return response()->json([
                'message' => 'Restore was not started: ' . $e->getMessage(),
            ], 500);
        }

        AuditLogService::log('backup_restore_started', "Restore started from backup {$file}", 'Backup', null);

        Artisan::call('down', ['--retry' => 60]);

        try {
            $this->applyBackup($path);

            AuditLogService::log('backup_restored', "Restored from backup {$file}", 'Backup', null);

            return response()->json([
                'message' => 'Restore completed. The site is back online. A safety backup taken just before this restore is in the folder if you need to undo it.',
            ]);
        } catch (Throwable $e) {
            AuditLogService::log('backup_restore_failed', "Restore from {$file} failed: {$e->getMessage()}", 'Backup', null);

            return response()->json([
                'message' => 'Restore failed: ' . $e->getMessage() . ' A safety backup taken immediately before this attempt is in the folder, unaffected.',
            ], 500);
        } finally {
            Artisan::call('up');
        }
    }

    /**
     * Downloads the chosen backup to a scratch directory, imports the
     * database dump it contains, writes every other entry back under
     * storage/app, then cleans the scratch directory up - success or
     * failure, the temporary copy never lingers.
     */
    private function applyBackup(string $diskPath): void
    {
        $disk = Storage::disk('backups');
        $tempDir = storage_path('backup-temp/restore-' . uniqid());

        if (!@mkdir($tempDir, 0755, true) && !is_dir($tempDir)) {
            throw new RuntimeException('could not create a scratch directory to extract the backup into.');
        }

        try {
            $localZip = $tempDir . '/backup.zip';
            $stream = $disk->readStream($diskPath);
            if ($stream === null) {
                throw new RuntimeException('the backup file could not be read from disk.');
            }
            file_put_contents($localZip, $stream);
            if (is_resource($stream)) {
                fclose($stream);
            }

            $zip = new ZipArchive();
            if ($zip->open($localZip) !== true) {
                throw new RuntimeException('the backup file could not be opened - it may be corrupt.');
            }

            try {
                $dumpEntry = $this->findDatabaseDump($zip);
                if ($dumpEntry === null) {
                    throw new RuntimeException('this backup has no database dump inside it.');
                }

                $sqlPath = $tempDir . '/dump.sql';
                $sql = $zip->getFromName($dumpEntry);
                if ($sql === false) {
                    throw new RuntimeException('the database dump inside this backup could not be read.');
                }
                file_put_contents($sqlPath, $sql);

                $this->importSql($sqlPath);
                $this->restoreFiles($zip, $dumpEntry);
            } finally {
                $zip->close();
            }
        } finally {
            $this->removeDirectory($tempDir);
        }
    }

    private function findDatabaseDump(ZipArchive $zip): ?string
    {
        for ($i = 0; $i < $zip->numFiles; $i++) {
            $name = str_replace('\\', '/', $zip->getNameIndex($i));
            if (str_starts_with($name, 'db-dumps/')) {
                return $zip->getNameIndex($i);
            }
        }

        return null;
    }

    /**
     * Every entry that is not the database dump is a file that belongs
     * under storage/app - located by finding that segment in the entry's
     * own path rather than assuming a fixed prefix, since a backup taken
     * before config/backup.php's relative_path setting was changed carries
     * the full absolute path of whatever machine took it (see that
     * config's own comment), while one taken after carries a path already
     * relative to the app root. Both end in the same storage/app/... tail,
     * which is all that is actually needed to place the file correctly on
     * this machine.
     */
    private function restoreFiles(ZipArchive $zip, string $dumpEntry): void
    {
        $appStorage = storage_path('app');
        $anchor = 'storage/app/';

        for ($i = 0; $i < $zip->numFiles; $i++) {
            $name = $zip->getNameIndex($i);
            if ($name === $dumpEntry) {
                continue;
            }

            $normalized = str_replace('\\', '/', $name);
            $pos = strripos($normalized, $anchor);
            if ($pos === false) {
                continue; // Not a storage/app entry - nothing else belongs in this zip, but skip rather than guess.
            }

            $relative = substr($normalized, $pos + strlen($anchor));
            if ($relative === '') {
                continue;
            }

            $target = $appStorage . '/' . $relative;

            if (str_ends_with($normalized, '/')) {
                @mkdir($target, 0755, true);
                continue;
            }

            @mkdir(dirname($target), 0755, true);
            $bytes = $zip->getFromIndex($i);
            if ($bytes !== false) {
                file_put_contents($target, $bytes);
            }
        }
    }

    /**
     * Imports a raw mysqldump-produced .sql file via the mysql client
     * directly, rather than splitting it into statements in PHP - a real
     * dump can carry semicolons inside string literals, definer clauses
     * and the like that a naive split would break on. Reuses DB_DUMP_PATH,
     * the same setting the backup itself already relies on to find
     * mysqldump, since mysql.exe/mysql normally lives right beside it.
     */
    private function importSql(string $sqlPath): void
    {
        $connectionName = config('database.default');
        $config = config("database.connections.{$connectionName}");

        if (($config['driver'] ?? null) !== 'mysql') {
            throw new RuntimeException('restoring is only implemented for a MySQL database connection.');
        }

        $binDir = $config['dump']['dump_binary_path'] ?? null;
        $binary = $binDir ? rtrim($binDir, '\\/') . DIRECTORY_SEPARATOR . 'mysql' : 'mysql';

        $handle = fopen($sqlPath, 'r');
        if ($handle === false) {
            throw new RuntimeException('the database dump could not be opened for import.');
        }

        try {
            $process = new Process(
                [
                    $binary,
                    '--host=' . $config['host'],
                    '--port=' . (string) $config['port'],
                    '--user=' . $config['username'],
                    '--default-character-set=utf8mb4',
                    $config['database'],
                ],
                null,
                // The password travels as an environment variable, not a
                // command-line argument - argv is visible to anything else
                // on the box that can list processes; the environment of a
                // specific child process is not.
                ['MYSQL_PWD' => $config['password'] ?? ''],
                $handle,
                600
            );
            $process->run();

            if (!$process->isSuccessful()) {
                throw new RuntimeException('the database import failed: ' . trim($process->getErrorOutput() ?: $process->getOutput()));
            }
        } finally {
            fclose($handle);
        }
    }

    private function removeDirectory(string $dir): void
    {
        if (!is_dir($dir)) {
            return;
        }

        $items = @scandir($dir) ?: [];
        foreach ($items as $item) {
            if ($item === '.' || $item === '..') {
                continue;
            }
            $path = $dir . DIRECTORY_SEPARATOR . $item;
            if (is_dir($path)) {
                $this->removeDirectory($path);
            } else {
                @unlink($path);
            }
        }
        @rmdir($dir);
    }

    /**
     * The one file on the backups disk with this name. Names only - a path
     * with a directory in it is refused - so the disk cannot be walked.
     * Mirrors BackupController::locate() exactly.
     */
    private function locate(string $file): string
    {
        abort_if($file !== basename($file) || !str_ends_with(strtolower($file), '.zip'), 404);

        $disk = Storage::disk('backups');
        $match = collect($disk->allFiles())->first(fn ($path) => basename($path) === $file);
        abort_if(!$match, 404);

        return $match;
    }
}
