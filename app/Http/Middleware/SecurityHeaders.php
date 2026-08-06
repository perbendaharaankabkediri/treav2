<?php

namespace App\Http\Middleware;

use Closure;
use Illuminate\Http\Request;
use Symfony\Component\HttpFoundation\Response;

class SecurityHeaders
{
    public function handle(Request $request, Closure $next): Response
    {
        $response = $next($request);

        $response->headers->set('X-Content-Type-Options', 'nosniff');
        $response->headers->set('X-Frame-Options', 'SAMEORIGIN');
        $response->headers->set('Referrer-Policy', 'strict-origin-when-cross-origin');
        $response->headers->set('Permissions-Policy', 'camera=(), microphone=(), geolocation=()');

        if ($request->isSecure() || in_array($request->getHost(), ['localhost', '127.0.0.1', '::1'], true)) {
            $response->headers->set('Cross-Origin-Opener-Policy', 'same-origin');
        }

        if (config('operations.csp_report_only')) {
            $viteOrigin = $this->viteDevServerOrigin();
            $developmentSource = $viteOrigin ? " {$viteOrigin}" : '';

            $response->headers->set(
                'Content-Security-Policy-Report-Only',
                "default-src 'self'; img-src 'self' data: blob:{$developmentSource}; font-src 'self' data:{$developmentSource}; style-src 'self' 'unsafe-inline'{$developmentSource}; script-src 'self' 'unsafe-inline' 'unsafe-eval'{$developmentSource}; connect-src 'self' ws: wss:{$developmentSource};",
            );
        }

        if ($request->isSecure() && app()->isProduction()) {
            $response->headers->set('Strict-Transport-Security', 'max-age=31536000; includeSubDomains');
        }

        return $response;
    }

    private function viteDevServerOrigin(): ?string
    {
        $hotFile = public_path('hot');

        if (! is_file($hotFile)) {
            return null;
        }

        $url = trim((string) file_get_contents($hotFile));
        $parts = parse_url($url);

        if (! isset($parts['scheme'], $parts['host'])) {
            return null;
        }

        $port = isset($parts['port']) ? ':'.$parts['port'] : '';

        return $parts['scheme'].'://'.$parts['host'].$port;
    }
}
