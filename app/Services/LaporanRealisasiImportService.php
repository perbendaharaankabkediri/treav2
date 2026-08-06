<?php

namespace App\Services;

use App\Models\ImportLaporanRealisasi;
use Carbon\CarbonImmutable;
use Illuminate\Http\UploadedFile;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Storage;
use Illuminate\Support\Str;
use Illuminate\Validation\ValidationException;
use PhpOffice\PhpSpreadsheet\IOFactory;
use Throwable;

class LaporanRealisasiImportService
{
    private const HEADERS = [
        'Kode SKPD', 'Nama SKPD', 'Kode Sub SKPD', 'Nama Sub SKPD',
        'Kode Fungsi', 'Nama Fungsi', 'Kode Sub Fungsi', 'Nama Sub Fungsi',
        'Kode Urusan', 'Nama Urusan', 'Kode Bidang Urusan', 'Nama Bidang Urusan',
        'Kode Program', 'Nama Program', 'Kode Kegiatan', 'Nama Kegiatan',
        'Kode Sub Kegiatan', 'Nama Sub Kegiatan', 'Kode Rekening', 'Nama Rekening',
        'Nomor Dokumen', 'Jenis Dokumen', 'Jenis Transaksi', 'Nomor DPT',
        'Tanggal Dokumen', 'Keterangan Dokumen', 'Nilai Realisasi', 'Nilai Setoran',
        'NIP Pegawai', 'Nama Pegawai', 'Tanggal Simpan', 'Nomor SPD', 'Periode SPD',
        'Nilai SPD', 'Tahapan SPD', 'Nama Sub Tahapan Jadwal', 'Tahapan APBD',
        'Nomor SPP', 'Tanggal SPP', 'Nomor SPM', 'Tanggal SPM', 'Nomor SP2D',
        'Tanggal SP2D', 'Tanggal Transfer', 'Nilai SP2D',
    ];

    private const MONTHS = [
        'januari' => 1, 'februari' => 2, 'maret' => 3, 'april' => 4,
        'mei' => 5, 'juni' => 6, 'juli' => 7, 'agustus' => 8,
        'september' => 9, 'oktober' => 10, 'november' => 11, 'desember' => 12,
    ];

    public function createPreview(UploadedFile $file, int $userId): ImportLaporanRealisasi
    {
        $this->extendExecutionTime();

        $checksum = hash_file('sha256', $file->getRealPath());
        $temporaryPath = $file->storeAs(
            'imports/laporan-realisasi/temp',
            Str::uuid().'.'.$file->getClientOriginalExtension(),
        );

        try {
            $result = $this->parseAndStore(
                Storage::path($temporaryPath),
                $file->getClientOriginalName(),
                $temporaryPath,
                $checksum,
                $userId,
            );

            $finalPath = sprintf(
                'imports/laporan-realisasi/%d/%02d/%s',
                $result->tahun,
                $result->bulan,
                basename($temporaryPath),
            );
            Storage::move($temporaryPath, $finalPath);
            $result->update(['lokasi_file' => $finalPath]);

            return $result->fresh();
        } catch (Throwable $exception) {
            Storage::delete($temporaryPath);

            throw $exception;
        }
    }

    public function activate(ImportLaporanRealisasi $batch): void
    {
        DB::transaction(function () use ($batch) {
            $lockedBatch = ImportLaporanRealisasi::query()->lockForUpdate()->findOrFail($batch->id);

            if ($lockedBatch->status !== 'preview') {
                throw ValidationException::withMessages([
                    'batch' => 'Batch ini sudah diproses dan tidak dapat dikonfirmasi kembali.',
                ]);
            }

            ImportLaporanRealisasi::query()
                ->where('tahun', $lockedBatch->tahun)
                ->where('bulan', $lockedBatch->bulan)
                ->where('is_active', true)
                ->update([
                    'status' => 'superseded',
                    'is_active' => false,
                    'updated_at' => now(),
                ]);

            $lockedBatch->update([
                'status' => 'completed',
                'is_active' => true,
                'confirmed_at' => now(),
            ]);
        });
    }

    public function cancel(ImportLaporanRealisasi $batch): void
    {
        if ($batch->status !== 'preview') {
            throw ValidationException::withMessages([
                'batch' => 'Hanya batch preview yang dapat dibatalkan.',
            ]);
        }

        $batch->update(['status' => 'cancelled']);
    }

    private function parseAndStore(
        string $path,
        string $originalName,
        string $storedPath,
        string $checksum,
        int $userId,
    ): ImportLaporanRealisasi {
        try {
            $reader = IOFactory::createReaderForFile($path);
            $reader->setReadDataOnly(true);
            $spreadsheet = $reader->load($path);
        } catch (Throwable) {
            throw ValidationException::withMessages([
                'file_laporan_realisasi' => 'Berkas Excel tidak dapat dibaca atau rusak.',
            ]);
        }

        $sheet = $spreadsheet->getSheetByName('Data Realisasi Dokumen') ?? $spreadsheet->getSheet(0);
        $headers = [];
        for ($column = 1; $column <= count(self::HEADERS); $column++) {
            $headers[] = $this->cleanText($sheet->getCell([$column, 1])->getValue());
        }

        if ($headers !== self::HEADERS) {
            $spreadsheet->disconnectWorksheets();
            throw ValidationException::withMessages([
                'file_laporan_realisasi' => 'Header Excel tidak sesuai dengan format Laporan Realisasi Per Dokumen.',
            ]);
        }

        try {
            return DB::transaction(function () use (
                $sheet,
                $spreadsheet,
                $originalName,
                $storedPath,
                $checksum,
                $userId,
            ) {
                $batch = null;
                $activeHashes = [];
                $seenKeys = [];
                $seenSp2d = [];
                $chunk = [];
                $errors = [];
                $counts = ['new' => 0, 'changed' => 0, 'unchanged' => 0];
                $totals = ['realisasi' => 0.0, 'setoran' => 0.0, 'sp2d' => 0.0];
                $period = null;
                $rowCount = 0;

                foreach ($sheet->getRowIterator(2) as $excelRowObject) {
                    $raw = [];
                    $excelRow = $excelRowObject->getRowIndex();
                    for ($column = 1; $column <= count(self::HEADERS); $column++) {
                        $raw[] = $sheet->getCell([$column, $excelRow])->getCalculatedValue();
                    }

                    if (collect($raw)->every(fn ($value) => $value === null || trim((string) $value) === '')) {
                        continue;
                    }

                    try {
                        $row = $this->normalizeRow($raw, $excelRow);
                    } catch (\InvalidArgumentException $exception) {
                        $errors[] = $exception->getMessage();
                        if (count($errors) >= 20) {
                            break;
                        }

                        continue;
                    }

                    $periodDate = $this->periodDate($row);
                    $rowPeriod = substr($periodDate, 0, 7);
                    if ($period !== null && $period !== $rowPeriod) {
                        $errors[] = "Baris {$excelRow}: tanggal periode berbeda dengan baris data sebelumnya. Gunakan Tanggal Transfer untuk SPP-LS dan Tanggal Dokumen untuk jenis lainnya.";
                        break;
                    }

                    if ($batch === null) {
                        $period = $rowPeriod;
                        [$tahun, $bulan] = array_map('intval', explode('-', $period));
                        $active = ImportLaporanRealisasi::query()
                            ->where('tahun', $tahun)
                            ->where('bulan', $bulan)
                            ->where('is_active', true)
                            ->first();

                        if ($active) {
                            DB::table('tabel_laporan_realisasi')
                                ->where('import_laporan_realisasi_id', $active->id)
                                ->select([
                                    'nomor_dokumen',
                                    'jenis_dokumen',
                                    'jenis_transaksi',
                                    'nomor_sp2d',
                                    'nomor_spd',
                                    'nomor_dpt',
                                    'kode_sub_kegiatan',
                                    'kode_rekening',
                                    'row_hash',
                                ])
                                ->orderBy('id')
                                ->each(function (object $old) use (&$activeHashes) {
                                    $activeHashes[$this->businessKey(
                                        $old->nomor_dokumen,
                                        $old->jenis_dokumen,
                                        $old->jenis_transaksi,
                                        $old->nomor_sp2d,
                                        $old->nomor_spd,
                                        $old->nomor_dpt,
                                        $old->kode_sub_kegiatan,
                                        $old->kode_rekening,
                                    )] = $old->row_hash;
                                });
                        }

                        $batch = ImportLaporanRealisasi::query()->create([
                            'tahun' => $tahun,
                            'bulan' => $bulan,
                            'nama_file_asli' => $originalName,
                            'lokasi_file' => $storedPath,
                            'checksum_file' => $checksum,
                            'status' => 'processing',
                            'is_active' => false,
                            'imported_by' => $userId,
                        ]);
                    }

                    $key = $this->businessKey(
                        $row['nomor_dokumen'],
                        $row['jenis_dokumen'],
                        $row['jenis_transaksi'],
                        $row['nomor_sp2d'],
                        $row['nomor_spd'],
                        $row['nomor_dpt'],
                        $row['kode_sub_kegiatan'],
                        $row['kode_rekening'],
                    );
                    if (isset($seenKeys[$key])) {
                        $keyColumns = $this->businessKeyColumns($row);
                        $errors[] = "Baris {$excelRow}: kombinasi {$keyColumns} duplikat dengan baris {$seenKeys[$key]}.";

                        continue;
                    }
                    $seenKeys[$key] = $excelRow;

                    $oldHash = $activeHashes[$key] ?? null;
                    if ($oldHash === null) {
                        $counts['new']++;
                    } elseif (hash_equals($oldHash, $row['row_hash'])) {
                        $counts['unchanged']++;
                    } else {
                        $counts['changed']++;
                    }

                    $totals['realisasi'] += (float) $row['nilai_realisasi'];
                    $totals['setoran'] += (float) $row['nilai_setoran'];
                    if ($row['nomor_sp2d'] && ! isset($seenSp2d[$row['nomor_sp2d']])) {
                        $seenSp2d[$row['nomor_sp2d']] = true;
                        $totals['sp2d'] += (float) ($row['nilai_sp2d'] ?? 0);
                    }

                    $now = now();
                    $chunk[] = [
                        ...$row,
                        'import_laporan_realisasi_id' => $batch->id,
                        'created_at' => $now,
                        'updated_at' => $now,
                    ];
                    $rowCount++;

                    if (count($chunk) >= 250) {
                        DB::table('tabel_laporan_realisasi')->insert($chunk);
                        $chunk = [];
                    }
                }

                $spreadsheet->disconnectWorksheets();

                if ($errors !== []) {
                    throw ValidationException::withMessages([
                        'file_laporan_realisasi' => implode(' ', array_slice($errors, 0, 8)).
                            (count($errors) > 8 ? ' Terdapat lebih banyak kesalahan.' : ''),
                    ]);
                }

                if ($batch === null || $rowCount === 0) {
                    throw ValidationException::withMessages([
                        'file_laporan_realisasi' => 'Berkas tidak memiliki baris data.',
                    ]);
                }

                if ($chunk !== []) {
                    DB::table('tabel_laporan_realisasi')->insert($chunk);
                }

                $removed = count(array_diff_key($activeHashes, $seenKeys));
                $batch->update([
                    'jumlah_baris' => $rowCount,
                    'jumlah_data_baru' => $counts['new'],
                    'jumlah_data_berubah' => $counts['changed'],
                    'jumlah_data_tetap' => $counts['unchanged'],
                    'jumlah_data_dihapus' => $removed,
                    'jumlah_data_error' => 0,
                    'total_realisasi' => number_format($totals['realisasi'], 2, '.', ''),
                    'total_setoran' => number_format($totals['setoran'], 2, '.', ''),
                    'total_sp2d_unik' => number_format($totals['sp2d'], 2, '.', ''),
                    'status' => 'preview',
                ]);

                return $batch;
            });
        } finally {
            if (isset($spreadsheet)) {
                $spreadsheet->disconnectWorksheets();
            }
        }
    }

    private function normalizeRow(array $raw, int $row): array
    {
        $requiredText = fn (int $index, string $name) => $this->requiredText($raw[$index] ?? null, $row, $name);
        $optionalText = fn (int $index) => $this->optionalText($raw[$index] ?? null);

        $data = [
            'nomor_baris' => $row,
            'kode_skpd' => $requiredText(0, 'Kode SKPD'),
            'nama_skpd' => $requiredText(1, 'Nama SKPD'),
            'kode_sub_skpd' => $requiredText(2, 'Kode Sub SKPD'),
            'nama_sub_skpd' => $requiredText(3, 'Nama Sub SKPD'),
            'kode_fungsi' => $requiredText(4, 'Kode Fungsi'),
            'nama_fungsi' => $requiredText(5, 'Nama Fungsi'),
            'kode_sub_fungsi' => $requiredText(6, 'Kode Sub Fungsi'),
            'nama_sub_fungsi' => $requiredText(7, 'Nama Sub Fungsi'),
            'kode_urusan' => $requiredText(8, 'Kode Urusan'),
            'nama_urusan' => $requiredText(9, 'Nama Urusan'),
            'kode_bidang_urusan' => $requiredText(10, 'Kode Bidang Urusan'),
            'nama_bidang_urusan' => $requiredText(11, 'Nama Bidang Urusan'),
            'kode_program' => $requiredText(12, 'Kode Program'),
            'nama_program' => $requiredText(13, 'Nama Program'),
            'kode_kegiatan' => $requiredText(14, 'Kode Kegiatan'),
            'nama_kegiatan' => $requiredText(15, 'Nama Kegiatan'),
            'kode_sub_kegiatan' => $requiredText(16, 'Kode Sub Kegiatan'),
            'nama_sub_kegiatan' => $requiredText(17, 'Nama Sub Kegiatan'),
            'kode_rekening' => $requiredText(18, 'Kode Rekening'),
            'nama_rekening' => $requiredText(19, 'Nama Rekening'),
            'nomor_dokumen' => $requiredText(20, 'Nomor Dokumen'),
            'jenis_dokumen' => Str::upper($requiredText(21, 'Jenis Dokumen')),
            'jenis_transaksi' => Str::upper($requiredText(22, 'Jenis Transaksi')),
            'nomor_dpt' => $optionalText(23),
            'tanggal_dokumen' => $this->parseDate($raw[24] ?? null, $row, 'Tanggal Dokumen', true),
            'keterangan_dokumen' => $requiredText(25, 'Keterangan Dokumen'),
            'nilai_realisasi' => $this->parseAmount($raw[26] ?? null, $row, 'Nilai Realisasi', true),
            'nilai_setoran' => $this->parseAmount($raw[27] ?? null, $row, 'Nilai Setoran', true),
            'nip_pegawai' => $optionalText(28),
            'nama_pegawai' => $optionalText(29),
            'tanggal_simpan' => $this->parseDate($raw[30] ?? null, $row, 'Tanggal Simpan'),
            'nomor_spd' => $optionalText(31),
            'periode_spd' => $optionalText(32),
            'nilai_spd' => $this->parseAmount($raw[33] ?? null, $row, 'Nilai SPD'),
            'tahapan_spd' => $optionalText(34),
            'nama_sub_tahapan_jadwal' => $optionalText(35),
            'tahapan_apbd' => $optionalText(36),
            'nomor_spp' => $optionalText(37),
            'tanggal_spp' => $this->parseDate($raw[38] ?? null, $row, 'Tanggal SPP'),
            'nomor_spm' => $optionalText(39),
            'tanggal_spm' => $this->parseDate($raw[40] ?? null, $row, 'Tanggal SPM'),
            'nomor_sp2d' => $optionalText(41),
            'tanggal_sp2d' => $this->parseDate($raw[42] ?? null, $row, 'Tanggal SP2D'),
            'tanggal_transfer' => $this->parseDate($raw[43] ?? null, $row, 'Tanggal Transfer'),
            'nilai_sp2d' => $this->parseAmount($raw[44] ?? null, $row, 'Nilai SP2D'),
        ];

        if ($this->usesTransferDate($data) && $data['tanggal_transfer'] === null) {
            throw new \InvalidArgumentException("Baris {$row}: Tanggal Transfer wajib diisi untuk Jenis Dokumen SPP dan Jenis Transaksi LS.");
        }
        if ($this->usesTransferDate($data) && $data['nomor_sp2d'] === null) {
            throw new \InvalidArgumentException("Baris {$row}: Nomor SP2D wajib diisi untuk Jenis Dokumen SPP dan Jenis Transaksi LS.");
        }
        if ($this->isTbpKkpd($data['jenis_dokumen']) && $data['nomor_dpt'] === null) {
            throw new \InvalidArgumentException("Baris {$row}: Nomor DPT wajib diisi untuk Jenis Dokumen TBP-KKPD.");
        }

        $hashData = $data;
        unset($hashData['nomor_baris']);
        $data['row_hash'] = hash('sha256', json_encode($hashData, JSON_UNESCAPED_UNICODE));

        return $data;
    }

    private function periodDate(array $row): string
    {
        return $this->usesTransferDate($row)
            ? $row['tanggal_transfer']
            : $row['tanggal_dokumen'];
    }

    private function usesTransferDate(array $row): bool
    {
        return $this->isSppLs($row['jenis_dokumen'], $row['jenis_transaksi']);
    }

    private function parseDate(mixed $value, int $row, string $column, bool $required = false): ?string
    {
        $text = $this->cleanText($value);
        if ($text === '' && ! $required) {
            return null;
        }
        if (! preg_match('/^(\d{1,2})\s+([[:alpha:]]+)\s+(\d{4})$/u', $text, $matches)) {
            throw new \InvalidArgumentException("Baris {$row}: {$column} tidak valid.");
        }
        $month = self::MONTHS[mb_strtolower($matches[2])] ?? null;
        if (! $month || ! checkdate($month, (int) $matches[1], (int) $matches[3])) {
            throw new \InvalidArgumentException("Baris {$row}: {$column} tidak valid.");
        }

        return CarbonImmutable::create((int) $matches[3], $month, (int) $matches[1])->toDateString();
    }

    private function parseAmount(mixed $value, int $row, string $column, bool $required = false): ?string
    {
        if (($value === null || $value === '') && ! $required) {
            return null;
        }
        if (! is_numeric($value)) {
            throw new \InvalidArgumentException("Baris {$row}: {$column} harus berupa angka.");
        }

        return number_format(round((float) $value, 2), 2, '.', '');
    }

    private function requiredText(mixed $value, int $row, string $column): string
    {
        $text = $this->cleanText($value);
        if ($text === '') {
            throw new \InvalidArgumentException("Baris {$row}: {$column} wajib diisi.");
        }

        return $text;
    }

    private function optionalText(mixed $value): ?string
    {
        $text = $this->cleanText($value);

        return $text === '' ? null : $text;
    }

    private function cleanText(mixed $value): string
    {
        return trim((string) preg_replace('/\s+/u', ' ', str_replace("\u{00A0}", ' ', (string) $value)));
    }

    private function businessKey(
        string $document,
        string $documentType,
        string $transactionType,
        ?string $sp2d,
        ?string $spd,
        ?string $dpt,
        string $subActivity,
        string $account,
    ): string {
        $reference = $this->isSppLs($documentType, $transactionType)
            ? (string) $sp2d
            : $document;

        $key = Str::upper(trim($reference)).'|'.Str::upper(trim($subActivity)).'|'.Str::upper(trim($account));

        if ($this->isTbpKkpd($documentType)) {
            return $key.'|'.Str::upper(trim((string) $spd)).'|'.Str::upper(trim((string) $dpt));
        }

        return $this->isTbpSpdTransaction($documentType, $transactionType)
            ? $key.'|'.Str::upper(trim((string) $spd))
            : $key;
    }

    private function businessKeyColumns(array $row): string
    {
        if ($this->usesTransferDate($row)) {
            return 'Nomor SP2D, Kode Sub Kegiatan, dan Kode Rekening';
        }

        if ($this->isTbpKkpd($row['jenis_dokumen'])) {
            return 'Nomor Dokumen, Kode Sub Kegiatan, Kode Rekening, Nomor SPD, dan Nomor DPT';
        }

        if ($this->isTbpSpdTransaction($row['jenis_dokumen'], $row['jenis_transaksi'])) {
            return 'Nomor Dokumen, Kode Sub Kegiatan, Kode Rekening, dan Nomor SPD';
        }

        return 'Nomor Dokumen, Kode Sub Kegiatan, dan Kode Rekening';
    }

    private function isSppLs(string $documentType, string $transactionType): bool
    {
        return $this->normalizeCategory($documentType) === 'SPP'
            && $this->normalizeCategory($transactionType) === 'LS';
    }

    private function isTbpSpdTransaction(string $documentType, string $transactionType): bool
    {
        return $this->normalizeCategory($documentType) === 'TBP'
            && in_array($this->normalizeCategory($transactionType), ['UP', 'GU', 'TU', 'GU KKPD'], true);
    }

    private function isTbpKkpd(string $documentType): bool
    {
        return $this->normalizeCategory($documentType) === 'TBP KKPD';
    }

    private function normalizeCategory(string $value): string
    {
        return trim((string) preg_replace('/[\s_-]+/', ' ', Str::upper(trim($value))));
    }

    private function extendExecutionTime(): void
    {
        $seconds = (int) config('imports.max_execution_time', 600);

        if ($seconds > 0 && function_exists('set_time_limit')) {
            set_time_limit($seconds);
        }
    }
}
