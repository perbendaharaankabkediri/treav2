<?php

namespace App\Http\Controllers\Auth;

use App\Http\Controllers\Controller;
use App\Http\Requests\Auth\LoginRequest;
use App\Services\ActivityLogger;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Inertia\Inertia;
use Inertia\Response;

class AuthenticatedSessionController extends Controller
{
    public function __construct(private readonly ActivityLogger $activityLogger) {}

    /**
     * Display the login view.
     */
    public function create(): Response
    {
        return Inertia::render('Auth/Login', [
            'status' => session('status'),
        ]);
    }

    /**
     * Handle an incoming authentication request.
     */
    public function store(LoginRequest $request): RedirectResponse
    {
        // 1. Validasi input tahun secara ringkas
        $request->validate([
            'tahun' => 'required|integer',
        ]);

        // 2. Proses login username dan password.
        $request->authenticate();

        // 3. Regenerasi session untuk keamanan
        $request->session()->regenerate();

        // 4. SIMPAN TAHUN KE DALAM SESSION UTAMA LARAVEL 🚀
        session(['tahun' => $request->tahun]);

        $request->user()->forceFill([
            'last_login_at' => now(),
            'last_login_ip' => $request->ip(),
        ])->save();

        $this->activityLogger->record(
            $request,
            'login.success',
            'authentication',
            context: [
                'tahun' => $request->tahun,
                'description' => 'User berhasil login.',
            ],
        );

        // 5. Alihkan ke halaman dashboard bawaan
        return redirect()->intended(route('dashboard', absolute: false));
    }

    /**
     * Destroy an authenticated session.
     */
    public function destroy(Request $request): RedirectResponse
    {
        $this->activityLogger->record(
            $request,
            'logout',
            'authentication',
            context: ['description' => 'User keluar dari aplikasi.'],
        );

        Auth::guard('web')->logout();

        $request->session()->invalidate();

        $request->session()->regenerateToken();

        return redirect('/login');
    }
}
