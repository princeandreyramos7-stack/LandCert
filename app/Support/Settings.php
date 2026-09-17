<?php

namespace App\Support;

use Illuminate\Support\Facades\Cache;
use Illuminate\Support\Facades\DB;

/**
 * The system_settings table, read one key at a time with a short cache. A
 * missing table (a fresh install mid-migration) or a missing key gives the
 * default, so nothing that reads a setting can fail because of one.
 */
class Settings
{
    public static function get(string $key, mixed $default = null): mixed
    {
        return Cache::remember("settings.$key", now()->addMinutes(5), function () use ($key, $default) {
            try {
                $value = DB::table('system_settings')->where('key', $key)->value('value');
            } catch (\Throwable $e) {
                return $default;
            }
            return $value === null || $value === '' ? $default : $value;
        });
    }

    public static function forget(string $key): void
    {
        Cache::forget("settings.$key");
    }
}
