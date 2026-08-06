<?php

namespace App\Http\Middleware;

use App\Services\ActivityLogger;
use Closure;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Symfony\Component\HttpFoundation\Response;

class EnsureUserIsActive
{
    public function __construct(private readonly ActivityLogger $activityLogger) {}

    public function handle(Request $request, Closure $next): Response
    {
        $user = $request->user();

        if (! $user || $user->is_active !== false) {
            return $next($request);
        }

        $this->activityLogger->record(
            $request,
            'session.revoked',
            'authentication',
            'failed',
            $user,
            ['description' => 'Sesi dihentikan karena akun tidak aktif.'],
        );

        Auth::guard('web')->logout();
        $request->session()->invalidate();
        $request->session()->regenerateToken();

        return redirect()->route('login')
            ->withErrors(['username' => 'Akun Anda sudah dinonaktifkan.']);
    }
}
