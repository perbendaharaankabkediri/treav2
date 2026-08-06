<?php

namespace App\Services;

use App\Models\ActivityLog;
use App\Models\User;
use Illuminate\Http\Request;
use Illuminate\Support\Str;
use Throwable;

class ActivityLogger
{
    public function __construct(private readonly ActivityNotificationService $notifications) {}

    public function record(
        Request $request,
        string $action,
        string $module,
        string $status = 'success',
        ?User $user = null,
        array $context = [],
    ): void {
        try {
            $actor = $user ?? $request->user();

            $log = ActivityLog::query()->create([
                'user_id' => $actor?->id,
                'user_name' => $actor?->name,
                'role_name' => $actor?->getRoleNames()->first(),
                'action' => $action,
                'module' => $module,
                'subject_type' => $context['subject_type'] ?? null,
                'subject_id' => $context['subject_id'] ?? null,
                'kode_skpd' => $context['kode_skpd'] ?? null,
                'tahun' => isset($context['tahun']) ? (string) $context['tahun'] : null,
                'description' => $context['description'] ?? null,
                'old_values' => $context['old_values'] ?? null,
                'new_values' => $context['new_values'] ?? null,
                'metadata' => $context['metadata'] ?? null,
                'ip_address' => $request->ip(),
                'user_agent' => Str::limit((string) $request->userAgent(), 1000, ''),
                'request_id' => (string) Str::uuid(),
                'status' => $status,
            ]);

            $this->notifications->createFor($log);
        } catch (Throwable) {
            // Audit logging must never break the primary application flow.
        }
    }
}
