<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

/**
 * One change of an application's status: what it became, from what, who
 * did it and when. Written by App\Support\ProcessingSla from the Request and
 * Report model hooks; read for "days in stage" and the processing-time
 * report.
 */
class RequestStatusHistory extends Model
{
    protected $table = 'request_status_history';

    public $timestamps = false;

    protected $fillable = ['request_id', 'status', 'previous_status', 'changed_by', 'changed_at'];

    protected $casts = ['changed_at' => 'datetime'];

    public function request(): BelongsTo
    {
        return $this->belongsTo(Request::class);
    }

    public function changedBy(): BelongsTo
    {
        return $this->belongsTo(User::class, 'changed_by');
    }
}
