<?php

namespace App\Services;

use App\Models\ImportRegisterSp2d;
use Carbon\CarbonImmutable;
use Illuminate\Http\UploadedFile;
use Illuminate\Support\Collection;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Storage;
use Illuminate\Support\Str;
use Illuminate\Validation\ValidationException;
use PhpOffice\PhpSpreadsheet\IOFactory;
use Throwable;

class RegisterSp2dImportService
{
    private const HEADERS = [
        'No',
        'Tanggal Pembuatan',
        'Tanggal Pencairan',
        'Nomor SP2D',
        'SKPD',
        'Nama Penerima',
        'Keterangan',
        'Jenis SP2D',
        'Bruto',
        'Potongan',
        'Neto',
    ];

    private const MONTHS = [
        'januari' => 1,
        'februari' => 2,
        'maret' => 3,
        'april' => 4,
        'mei' => 5,
        'juni' => 6,
        'juli' => 7,
        'agustus' => 8,
        'september' => 9,
        'oktober' => 10,
        'november' => 11,
        'desember' => 12,
    ];

    public function createPreview(UploadedFile $file, int $userId): ImportRegisterSp2d
    {
        $this->extendExecutionTime();

        $parsed = $this->parse($file->getRealPath());
        $tahun = $parsed['tahun'];
        $bulan = $parsed['bulan'];
        $checksum = hash_file('sha256', $file->getRealPath());
        $path = $file->storeAs(
            sprintf('imports/register-sp2d/%d/%02d', $tahun, $bulan),
            Str::uuid().'.'.$file->getClientOriginalExtension(),
        );

        try {
            return DB::transaction(function () use ($file, $path, $checksum, $parsed, $tahun, $bulan, $userId) {
                $active = ImportRegisterSp2d::query()
                    ->where('tahun', $tahun)
                    ->where('bulan', $bulan)
                    ->where('is_active', true)
                    ->with('details')
                    ->first();

                $comparison = $this->compare($parsed['rows'], $active?->details ?? collect());

                $batch = ImportRegisterSp2d::query()->create([
                    'tahun' => $tahun,
                    'bulan' => $bulan,
                    'nama_file_asli' => $file->getClientOriginalName(),
                    'lokasi_file' => $path,
                    'checksum_file' => $checksum,
                    'jumlah_baris' => count($parsed['rows']),
                    'jumlah_data_baru' => $comparison['new'],
                    'jumlah_data_berubah' => $comparison['changed'],
                    'jumlah_data_tetap' => $comparison['unchanged'],
                    'jumlah_data_dihapus' => $comparison['removed'],
                    'jumlah_data_error' => 0,
                    'total_bruto' => $parsed['totals']['bruto'],
                    'total_potongan' => $parsed['totals']['potongan'],
                    'total_netto' => $parsed['totals']['netto'],
                    'status' => 'preview',
                    'is_active' => false,
                    'imported_by' => $userId,
                ]);

                foreach (array_chunk($parsed['rows'], 250) as $chunk) {
                    $now = now();
                    DB::table('tabel_register_sp2d')->insert(array_map(
                        fn (array $row) => [
                            ...$row,
                            'import_register_sp2d_id' => $batch->id,
                            'created_at' => $now,
                            'updated_at' => $now,
                        ],
                        $chunk,
                    ));
                }

                return $batch->fresh();
            });
        } catch (Throwable $exception) {
            Storage::delete($path);

            throw $exception;
        }
    }

    private function extendExecutionTime(): void
    {
        $seconds = (int) config('imports.max_execution_time', 600);

        if ($seconds > 0 && function_exists('set_time_limit')) {
            set_time_limit($seconds);
        }
    }

    public function activate(ImportRegisterSp2d $batch): void
    {
        DB::transaction(function () use ($batch) {
            $lockedBatch = ImportRegisterSp2d::query()
                ->lockForUpdate()
                ->findOrFail($batch->id);

            if ($lockedBatch->status !== 'preview') {
                throw ValidationException::withMessages([
                    'batch' => 'Batch ini sudah diproses dan tidak dapat dikonfirmasi kembali.',
                ]);
            }

            ImportRegisterSp2d::query()
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

    public function cancel(ImportRegisterSp2d $batch): void
    {
        if ($batch->status !== 'preview') {
            throw ValidationException::withMessages([
                'batch' => 'Hanya batch preview yang dapat dibatalkan.',
            ]);
        }

        $batch->update(['status' => 'cancelled']);
    }

    private function parse(string $path): array
    {
        try {
            $spreadsheet = IOFactory::load($path);
        } catch (Throwable) {
            throw ValidationException::withMessages([
                'file_register_sp2d' => 'Berkas Excel tidak dapat dibaca atau rusak.',
            ]);
        }

        $sheet = $spreadsheet->getSheetByName('Data Realisasi') ?? $spreadsheet->getSheet(0);
        $lastRow = $sheet->getHighestDataRow();
        $headers = [];

        for ($column = 1; $column <= count(self::HEADERS); $column++) {
            $headers[] = $this->cleanText($sheet->getCell([$column, 1])->getValue());
        }

        if ($headers !== self::HEADERS) {
            throw ValidationException::withMessages([
                'file_register_sp2d' => 'Header Excel tidak sesuai. Gunakan urutan: '.implode(', ', self::HEADERS).'.',
            ]);
        }

        $rows = [];
        $numbers = [];
        $periods = [];
        $errors = [];
        $totals = ['bruto' => 0.0, 'potongan' => 0.0, 'netto' => 0.0];
        $skpdMap = $this->skpdMap();

        for ($excelRow = 2; $excelRow <= $lastRow; $excelRow++) {
            $raw = [];
            for ($column = 1; $column <= count(self::HEADERS); $column++) {
                $raw[] = $sheet->getCell([$column, $excelRow])->getCalculatedValue();
            }

            if (collect($raw)->every(fn ($value) => $value === null || trim((string) $value) === '')) {
                continue;
            }

            try {
                $tanggalPembuatan = $this->parseDate($raw[1], $excelRow, 'Tanggal Pembuatan');
                $tanggalPencairan = $this->parseDate($raw[2], $excelRow, 'Tanggal Pencairan');
                $nomorSp2d = $this->requiredText($raw[3], $excelRow, 'Nomor SP2D');
                $namaSkpd = $this->requiredText($raw[4], $excelRow, 'SKPD');
                $namaPenerima = $this->requiredText($raw[5], $excelRow, 'Nama Penerima');
                $keterangan = $this->requiredText($raw[6], $excelRow, 'Keterangan');
                $jenisSp2d = Str::upper($this->requiredText($raw[7], $excelRow, 'Jenis SP2D'));
                $bruto = $this->parseAmount($raw[8], $excelRow, 'Bruto');
                $potongan = $this->parseAmount($raw[9], $excelRow, 'Potongan');
                $netto = $this->parseAmount($raw[10], $excelRow, 'Neto');

                if (abs(($bruto - $potongan) - $netto) > 0.009) {
                    throw new \InvalidArgumentException("Baris {$excelRow}: Neto harus sama dengan Bruto dikurangi Potongan.");
                }

                $normalizedNumber = Str::upper($nomorSp2d);
                if (isset($numbers[$normalizedNumber])) {
                    throw new \InvalidArgumentException(
                        "Baris {$excelRow}: Nomor SP2D duplikat dengan baris {$numbers[$normalizedNumber]}.",
                    );
                }

                $numbers[$normalizedNumber] = $excelRow;
                $periods[$tanggalPembuatan->format('Y-m')] = true;
                $kodeSkpd = $skpdMap[$this->normalizeKey($namaSkpd)] ?? null;

                $hashPayload = [
                    $tanggalPembuatan->toDateString(),
                    $tanggalPencairan->toDateString(),
                    $normalizedNumber,
                    $this->normalizeKey($namaSkpd),
                    $this->normalizeKey($namaPenerima),
                    $this->normalizeKey($keterangan),
                    $jenisSp2d,
                    number_format($bruto, 2, '.', ''),
                    number_format($potongan, 2, '.', ''),
                    number_format($netto, 2, '.', ''),
                ];

                $rows[] = [
                    'nomor_baris' => $excelRow,
                    'nomor_urut_sumber' => is_numeric($raw[0]) ? (int) $raw[0] : null,
                    'tanggal_pembuatan' => $tanggalPembuatan->toDateString(),
                    'tanggal_pencairan' => $tanggalPencairan->toDateString(),
                    'nomor_sp2d' => $nomorSp2d,
                    'kode_skpd' => $kodeSkpd,
                    'nama_skpd' => $namaSkpd,
                    'nama_penerima' => $namaPenerima,
                    'keterangan' => $keterangan,
                    'jenis_sp2d' => $jenisSp2d,
                    'bruto' => number_format($bruto, 2, '.', ''),
                    'potongan' => number_format($potongan, 2, '.', ''),
                    'netto' => number_format($netto, 2, '.', ''),
                    'row_hash' => hash('sha256', json_encode($hashPayload, JSON_UNESCAPED_UNICODE)),
                ];

                $totals['bruto'] += $bruto;
                $totals['potongan'] += $potongan;
                $totals['netto'] += $netto;
            } catch (\InvalidArgumentException $exception) {
                $errors[] = $exception->getMessage();
            }
        }

        $spreadsheet->disconnectWorksheets();

        if ($errors !== []) {
            $shown = array_slice($errors, 0, 8);
            $suffix = count($errors) > count($shown) ? ' Terdapat '.count($errors).' kesalahan seluruhnya.' : '';
            throw ValidationException::withMessages([
                'file_register_sp2d' => implode(' ', $shown).$suffix,
            ]);
        }

        if ($rows === []) {
            throw ValidationException::withMessages([
                'file_register_sp2d' => 'Berkas tidak memiliki baris data.',
            ]);
        }

        if (count($periods) !== 1) {
            throw ValidationException::withMessages([
                'file_register_sp2d' => 'Tanggal Pembuatan harus berada dalam satu bulan dan satu tahun yang sama.',
            ]);
        }

        [$tahun, $bulan] = array_map('intval', explode('-', array_key_first($periods)));

        return [
            'tahun' => $tahun,
            'bulan' => $bulan,
            'rows' => $rows,
            'totals' => array_map(fn ($value) => number_format($value, 2, '.', ''), $totals),
        ];
    }

    private function compare(array $rows, Collection $oldRows): array
    {
        $old = $oldRows->keyBy(fn ($row) => Str::upper(trim($row->nomor_sp2d)));
        $newNumbers = [];
        $result = ['new' => 0, 'changed' => 0, 'unchanged' => 0, 'removed' => 0];

        foreach ($rows as $row) {
            $key = Str::upper($row['nomor_sp2d']);
            $newNumbers[$key] = true;
            $previous = $old->get($key);

            if (! $previous) {
                $result['new']++;
            } elseif (hash_equals($previous->row_hash, $row['row_hash'])) {
                $result['unchanged']++;
            } else {
                $result['changed']++;
            }
        }

        $result['removed'] = $old->keys()->reject(fn ($key) => isset($newNumbers[$key]))->count();

        return $result;
    }

    private function skpdMap(): array
    {
        return DB::table('tabel_skpd')
            ->whereNotNull('skpd')
            ->whereNotNull('kode_skpd')
            ->orderByDesc('tahun')
            ->get(['kode_skpd', 'skpd'])
            ->reduce(function (array $map, object $row) {
                $map[$this->normalizeKey($row->skpd)] ??= $row->kode_skpd;

                return $map;
            }, []);
    }

    private function parseDate(mixed $value, int $row, string $column): CarbonImmutable
    {
        $text = $this->cleanText($value);
        if (! preg_match('/^(\d{1,2})\s+([[:alpha:]]+)\s+(\d{4})$/u', $text, $matches)) {
            throw new \InvalidArgumentException("Baris {$row}: {$column} tidak valid.");
        }

        $month = self::MONTHS[mb_strtolower($matches[2])] ?? null;
        if (! $month || ! checkdate($month, (int) $matches[1], (int) $matches[3])) {
            throw new \InvalidArgumentException("Baris {$row}: {$column} tidak valid.");
        }

        return CarbonImmutable::create((int) $matches[3], $month, (int) $matches[1])->startOfDay();
    }

    private function parseAmount(mixed $value, int $row, string $column): float
    {
        if (! is_numeric($value)) {
            throw new \InvalidArgumentException("Baris {$row}: {$column} harus berupa angka.");
        }

        $amount = round((float) $value, 2);
        if ($amount < 0) {
            throw new \InvalidArgumentException("Baris {$row}: {$column} tidak boleh negatif.");
        }

        return $amount;
    }

    private function requiredText(mixed $value, int $row, string $column): string
    {
        $text = $this->cleanText($value);
        if ($text === '') {
            throw new \InvalidArgumentException("Baris {$row}: {$column} wajib diisi.");
        }

        return $text;
    }

    private function cleanText(mixed $value): string
    {
        return trim((string) preg_replace('/\s+/u', ' ', str_replace("\u{00A0}", ' ', (string) $value)));
    }

    private function normalizeKey(mixed $value): string
    {
        return mb_strtolower($this->cleanText($value));
    }
}
