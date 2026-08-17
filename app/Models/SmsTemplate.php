<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Support\Facades\Cache;

class SmsTemplate extends Model
{
    protected $fillable = ['event_key', 'event_label', 'message', 'enabled', 'variables'];

    protected $casts = [
        'enabled'   => 'boolean',
        'variables' => 'array',
    ];

    /**
     * Get a template by event key (cached for 60s).
     */
    public static function forEvent(string $key): ?self
    {
        return Cache::remember("sms_tpl_{$key}", 60, fn () =>
            static::where('event_key', $key)->where('enabled', true)->first()
        );
    }

    /**
     * Render the template message with given variables.
     */
    public function render(array $vars): string
    {
        $search  = array_keys($vars);
        $replace = array_values($vars);
        return str_replace($search, $replace, $this->message);
    }

    /**
     * Clear the cache for this template.
     */
    public function clearCache(): void
    {
        Cache::forget("sms_tpl_{$this->event_key}");
    }
}
