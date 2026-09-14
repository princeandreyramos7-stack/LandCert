<?php

namespace App\Support;

use Illuminate\Support\Carbon;
use Illuminate\Support\Facades\Storage;

/**
 * When the automatic backup runs, as the Zoning Administrator has set it.
 *
 * Kept in a small JSON file under storage/app rather than a table: it is one
 * setting, read by the scheduler on every tick, and a table would be a
 * migration for a single row. The scheduler (routes/console.php) reads it,
 * the Backups page writes it, and the last run's outcome is recorded beside
 * it so the page can say whether the last backup actually worked.
 */
class BackupSchedule
{
    private const SETTINGS = 'backup-schedule.json';
    private const LAST_RUN = 'backup-last-run.json';

    public const DEFAULTS = [
        'frequency' => 'daily',   // daily | weekly
        'time' => '02:00',        // 24h, in the app's timezone
        'day' => 0,               // for weekly: 0 = Sunday ... 6 = Saturday
    ];

    public static function current(): array
    {
        $stored = self::read(self::SETTINGS);

        $settings = array_merge(self::DEFAULTS, array_intersect_key($stored, self::DEFAULTS));
        $settings['frequency'] = in_array($settings['frequency'], ['daily', 'weekly'], true) ? $settings['frequency'] : 'daily';
        $settings['time'] = preg_match('/^([01]\d|2[0-3]):[0-5]\d$/', (string) $settings['time']) ? $settings['time'] : '02:00';
        $settings['day'] = max(0, min(6, (int) $settings['day']));

        return $settings;
    }

    public static function save(array $settings): array
    {
        $settings = array_merge(self::current(), array_intersect_key($settings, self::DEFAULTS));
        Storage::disk('local')->put(self::SETTINGS, json_encode($settings, JSON_PRETTY_PRINT));

        return self::current();
    }

    /** The next time the schedule will fire, from now. */
    public static function nextRun(?array $settings = null): Carbon
    {
        $settings ??= self::current();
        [$hour, $minute] = array_map('intval', explode(':', $settings['time']));

        $next = now()->setTime($hour, $minute, 0);

        if ($settings['frequency'] === 'weekly') {
            // Carbon's dayOfWeek is 0 = Sunday, the same as the setting.
            while ($next->dayOfWeek !== $settings['day'] || $next->lessThanOrEqualTo(now())) {
                $next->addDay()->setTime($hour, $minute, 0);
            }

            return $next;
        }

        return $next->lessThanOrEqualTo(now()) ? $next->addDay() : $next;
    }

    /** Record how the last run went - the page reads this. */
    public static function recordRun(bool $ok, ?string $message = null, string $trigger = 'schedule'): void
    {
        Storage::disk('local')->put(self::LAST_RUN, json_encode([
            'ok' => $ok,
            'message' => $message,
            'trigger' => $trigger,
            'at' => now()->toIso8601String(),
        ], JSON_PRETTY_PRINT));
    }

    public static function lastRun(): ?array
    {
        $run = self::read(self::LAST_RUN);

        return $run ? $run + ['ok' => false, 'message' => null, 'trigger' => null, 'at' => null] : null;
    }

    private static function read(string $file): array
    {
        if (!Storage::disk('local')->exists($file)) {
            return [];
        }

        $decoded = json_decode((string) Storage::disk('local')->get($file), true);

        return is_array($decoded) ? $decoded : [];
    }
}
