<?php

return [
    /*
    |--------------------------------------------------------------------------
    | Import execution time
    |--------------------------------------------------------------------------
    |
    | Import Excel berjalan sinkron agar pengguna dapat langsung melihat
    | preview. Beri waktu lebih panjang hanya untuk proses import, tanpa
    | mengubah batas waktu request aplikasi lainnya. Nilai 0 berarti tidak
    | mengubah batas waktu yang ditentukan PHP/web server.
    |
    */
    'max_execution_time' => (int) env('IMPORT_MAX_EXECUTION_TIME', 600),
];
