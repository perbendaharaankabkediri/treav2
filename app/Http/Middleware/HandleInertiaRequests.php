<?php

namespace App\Http\Middleware;

use App\Models\ActivityLog;
use App\Models\ActivityNotificationRecipient;
use App\Services\UserAccessContext;
use Illuminate\Database\Eloquent\Builder;
use Illuminate\Http\Request;
use Inertia\Inertia;
use Inertia\Middleware;

class HandleInertiaRequests extends Middleware
{
    /**
     * The root template that is loaded on the first page visit.
     *
     * @var string
     */
    protected $rootView = 'app';

    /**
     * Determine the current asset version.
     */
    public function version(Request $request): ?string
    {
        return parent::version($request);
    }

    /**
     * Define the props that are shared by default.
     *
     * @return array<string, mixed>
     */
    public function share(Request $request): array
    {
        $user = $request->user();
        $access = $user ? app(UserAccessContext::class)->for($user) : null;

        return array_merge(parent::share($request), [
            'auth' => [
                'user' => $user ? [
                    'id' => $user->id,
                    'name' => $user->name,
                    'username' => $user->username,
                    'is_active' => $user->is_active,
                    'role' => $access['role'],
                    'permissions' => $access['permissions'],
                    'skpd_codes' => $access['skpd_codes'],
                ] : null,
            ],

            'flash' => [
                'success' => fn () => $request->session()->get('success'),
                'error' => fn () => $request->session()->get('error'),
            ],
            // The activity lists are relatively expensive and are not needed to
            // render a page. They are requested explicitly when the user opens
            // the activity panel.
            'activityCenter' => Inertia::optional(
                fn () => $user ? $this->activityCenter($user) : null,
            ),
            'activityUnreadCount' => fn () => $user
                ? ActivityNotificationRecipient::query()
                    ->where('user_id', $user->id)
                    ->whereNull('read_at')
                    ->count()
                : 0,
            // 🚀 BAGIKAN SESSION TAHUN KE REACT DI SINI
            'tahun' => session('tahun'),
        ]);
    }

    private function activityCenter($user): array
    {
        $notifications = ActivityNotificationRecipient::query()
            ->where('user_id', $user->id)
            ->with(['notification.activityLog:id,user_name,role_name,module,action,created_at'])
            ->latest()
            ->limit(10)
            ->get()
            ->map(fn ($recipient) => [
                'id' => $recipient->id,
                'title' => $recipient->notification->title,
                'message' => $recipient->notification->message,
                'severity' => $recipient->notification->severity,
                'read_at' => $recipient->read_at,
                'created_at' => $recipient->created_at,
                'actor' => $recipient->notification->activityLog?->user_name,
                'module' => $recipient->notification->activityLog?->module,
            ]);

        $logs = ActivityLog::query()
            ->when($user->hasRole('admin'), fn (Builder $query) => $query
                ->where('module', '!=', 'authorization')
                ->where(fn (Builder $query) => $query->whereNull('role_name')->orWhere('role_name', '!=', 'superadmin')))
            ->when($user->hasRole('operator'), fn (Builder $query) => $query->where('user_id', $user->id))
            ->latest()
            ->limit(10)
            ->get(['id', 'user_name', 'role_name', 'action', 'module', 'description', 'status', 'created_at']);

        return [
            'unread_count' => ActivityNotificationRecipient::query()
                ->where('user_id', $user->id)->whereNull('read_at')->count(),
            'notifications' => $notifications,
            'logs' => $logs,
            'can_view_all_logs' => $user->can('activity-log.view'),
        ];
    }
}
