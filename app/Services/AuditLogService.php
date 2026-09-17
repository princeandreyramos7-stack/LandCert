<?php

namespace App\Services;

use App\Models\AuditLog;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\Request;

class AuditLogService
{
    /**
     * Log an action
     */
    public static function log(
        string $action,
        string $description,
        ?string $modelType = null,
        ?int $modelId = null,
        ?array $oldValues = null,
        ?array $newValues = null,
        ?array $metadata = null
    ) {
        $user = Auth::user();

        return AuditLog::create([
            'user_id' => $user?->id,
            'user_name' => $user?->name,
            'user_email' => $user?->email,
            'user_type' => $user?->user_type,
            'action' => $action,
            'model_type' => $modelType,
            'model_id' => $modelId,
            'description' => $description,
            'old_values' => $oldValues,
            'new_values' => $newValues,
            'ip_address' => Request::ip(),
            'user_agent' => Request::userAgent(),
            'url' => Request::fullUrl(),
            'method' => Request::method(),
            'metadata' => $metadata,
        ]);
    }

    /**
     * Log a create action
     */
    public static function logCreate(string $modelType, ?int $modelId, array $values, string $description = null)
    {
        return self::log(
            'created',
            $description ?? "Created new {$modelType}",
            $modelType,
            $modelId,
            null,
            $values
        );
    }

    /**
     * Log an update action
     */
    public static function logUpdate(string $modelType, ?int $modelId, array $oldValues, array $newValues, string $description = null)
    {
        return self::log(
            'updated',
            $description ?? "Updated {$modelType}",
            $modelType,
            $modelId,
            $oldValues,
            $newValues
        );
    }

    /**
     * Log a delete action
     */
    public static function logDelete(string $modelType, ?int $modelId, array $values, string $description = null)
    {
        return self::log(
            'deleted',
            $description ?? "Deleted {$modelType}",
            $modelType,
            $modelId,
            $values,
            null
        );
    }

    /**
     * Log a view action
     */
    public static function logView(string $modelType, ?int $modelId, string $description = null)
    {
        return self::log(
            'viewed',
            $description ?? "Viewed {$modelType}",
            $modelType,
            $modelId
        );
    }

    /**
     * Log an export action
     */
    public static function logExport(string $exportType, int $recordCount, string $format = 'pdf')
    {
        return self::log(
            'exported',
            "Exported {$recordCount} {$exportType} records as {$format}",
            $exportType,
            null,
            null,
            null,
            ['record_count' => $recordCount, 'format' => $format]
        );
    }

    /**
     * Log a login action
     */
    public static function logLogin()
    {
        return self::log(
            'login',
            'User logged in',
            'User',
            Auth::id()
        );
    }

    /**
     * Log a logout action
     */
    public static function logLogout()
    {
        return self::log(
            'logout',
            'User logged out',
            'User',
            Auth::id()
        );
    }

    /**
     * Log a failed login attempt
     */
    /**
     * @param  int         $attempt   Which failed try this is from this address (1-based).
     * @param  int         $limit     How many are allowed before the sign-in is locked.
     * @param  string|null $reason    'wrong_password' or 'unknown_email' - the office may
     *                                see which; the person at the login form is not told.
     * @param  int|null    $userId    The account the attempt was against, if it exists.
     */
    public static function logFailedLogin(string $email, int $attempt = 1, int $limit = 5, ?string $reason = null, ?int $userId = null)
    {
        $why = match ($reason) {
            'wrong_password' => 'wrong password',
            'unknown_email' => 'no account with this email',
            default => 'invalid credentials',
        };

        $log = new AuditLog();
        $log->user_id = $userId;
        $log->user_name = $email;
        $log->user_email = $email;
        $log->action = 'failed_login';
        $log->description = "Failed login attempt for {$email} ({$why}) - attempt {$attempt} of {$limit} from this address";
        $log->ip_address = Request::ip();
        $log->user_agent = Request::userAgent();
        $log->url = Request::fullUrl();
        $log->method = Request::method();
        $log->metadata = [
            'email' => $email,
            'reason' => $reason ?? 'invalid_credentials',
            'attempt' => $attempt,
            'limit' => $limit,
            'remaining' => max(0, $limit - $attempt),
        ];
        $log->save();

        return $log;
    }

    /**
     * Too many wrong passwords in a row: the sign-in for this email and
     * address is locked for a while. One entry per lockout, not one per
     * refused try during it.
     */
    public static function logLoginLocked(string $email, int $attempts, int $seconds, ?int $userId = null)
    {
        $log = new AuditLog();
        $log->user_id = $userId;
        $log->user_name = $email;
        $log->user_email = $email;
        $log->action = 'login_locked';
        $log->description = "Sign-in for {$email} locked for {$seconds} seconds after {$attempts} failed attempts (too many wrong passwords)";
        $log->ip_address = Request::ip();
        $log->user_agent = Request::userAgent();
        $log->url = Request::fullUrl();
        $log->method = Request::method();
        $log->metadata = [
            'email' => $email,
            'attempts' => $attempts,
            'locked_for_seconds' => $seconds,
        ];
        $log->save();

        return $log;
    }

    /**
     * Log bulk action
     */
    public static function logBulkAction(string $action, string $modelType, array $ids, string $description = null)
    {
        return self::log(
            "bulk_{$action}",
            $description ?? "Bulk {$action} on " . count($ids) . " {$modelType} records",
            $modelType,
            null,
            null,
            null,
            ['affected_ids' => $ids, 'count' => count($ids)]
        );
    }
}
