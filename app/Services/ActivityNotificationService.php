<?php

namespace App\Services;

use App\Models\ActivityLog;
use App\Models\ActivityNotification;
use App\Models\User;
use Illuminate\Support\Collection;

class ActivityNotificationService
{
    public function createFor(ActivityLog $log): void
    {
        $classification = $this->classification($log);

        if (! $classification) {
            return;
        }

        [$severity, $title] = $classification;
        $notification = ActivityNotification::query()->create([
            'activity_log_id' => $log->id,
            'type' => $log->action,
            'severity' => $severity,
            'title' => $title,
            'message' => $log->description ?: $this->fallbackMessage($log),
        ]);

        $this->recipients($log)->each(fn (User $user) => $notification->recipients()->create([
            'user_id' => $user->id,
        ]));
    }

    private function classification(ActivityLog $log): ?array
    {
        $action = mb_strtolower($log->action);

        if ($log->status === 'failed') {
            return ['critical', 'Aktivitas gagal'];
        }

        if (str_contains($action, 'permission') || str_contains($action, 'password')
            || str_contains($action, 'status-updated')) {
            return ['critical', 'Perubahan keamanan'];
        }

        if (str_contains($action, 'deleted') || str_contains($action, 'reverted')
            || str_contains($action, 'cancelled')) {
            return ['warning', 'Data dihapus atau dibatalkan'];
        }

        if (str_contains($action, 'imported') || str_contains($action, 'exported')
            || str_contains($action, 'manual-created')) {
            return ['warning', 'Proses data penting'];
        }

        return null;
    }

    private function recipients(ActivityLog $log): Collection
    {
        $recipients = User::query()->where('is_active', true)->role('superadmin')->get();

        if ($log->role_name === 'operator') {
            $recipients = $recipients->merge(
                User::query()->where('is_active', true)->role('admin')->get()
            );
        }

        if ($log->user_id) {
            $actor = User::query()->where('is_active', true)->find($log->user_id);
            if ($actor) {
                $recipients->push($actor);
            }
        }

        return $recipients->unique('id')->values();
    }

    private function fallbackMessage(ActivityLog $log): string
    {
        return sprintf('%s menjalankan %s pada modul %s.', $log->user_name ?: 'Sistem', $log->action, $log->module);
    }
}
