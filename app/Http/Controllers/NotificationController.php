<?php

namespace App\Http\Controllers;

use App\Models\ActivityNotificationRecipient;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;

class NotificationController extends Controller
{
    public function read(Request $request, ActivityNotificationRecipient $recipient): RedirectResponse
    {
        abort_unless($recipient->user_id === $request->user()->id, 403);
        $recipient->update(['read_at' => $recipient->read_at ?: now()]);

        return back();
    }

    public function readAll(Request $request): RedirectResponse
    {
        ActivityNotificationRecipient::query()
            ->where('user_id', $request->user()->id)
            ->whereNull('read_at')
            ->update(['read_at' => now()]);

        return back();
    }
}
