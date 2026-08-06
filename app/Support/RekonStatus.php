<?php

namespace App\Support;

final class RekonStatus
{
    public const TOLERANCE = 0.01;

    public static function determine(
        bool $hasBeenSaved,
        float $selisihBku,
        ?string $keteranganBku,
        float $selisihPosisiKas,
        ?string $keteranganPosisiKas,
    ): string {
        if (! $hasBeenSaved) {
            return 'BELUM';
        }

        $tabBResolved = self::isResolved($selisihBku, $keteranganBku);
        $tabCResolved = self::isResolved($selisihPosisiKas, $keteranganPosisiKas);

        return $tabBResolved && $tabCResolved ? 'SUDAH' : 'PROSES';
    }

    public static function isResolved(float $selisih, ?string $keterangan): bool
    {
        return abs($selisih) < self::TOLERANCE || trim((string) $keterangan) !== '';
    }
}
