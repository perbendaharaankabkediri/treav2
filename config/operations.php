<?php

return [
    'activity_log_retention_days' => (int) env('ACTIVITY_LOG_RETENTION_DAYS', 365),
    'scheduler_heartbeat_ttl_minutes' => (int) env('SCHEDULER_HEARTBEAT_TTL_MINUTES', 10),
    'csp_report_only' => env('SECURITY_CSP_REPORT_ONLY', true),
    'force_https' => env('FORCE_HTTPS', false) || env('RENDER', false),
];
