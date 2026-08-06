<?php

use App\Models\ImportRegisterSp2d;
use App\Models\User;
use Database\Seeders\AuthorizationSeeder;
use Illuminate\Http\UploadedFile;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Storage;
use PhpOffice\PhpSpreadsheet\Spreadsheet;
use PhpOffice\PhpSpreadsheet\Writer\Xlsx;

beforeEach(function () {
    Storage::fake('local');
    $this->seed(AuthorizationSeeder::class);

    DB::table('tabel_skpd')->insert([
        'tahun' => 2026,
        'kode_skpd' => '1.01.01',
        'skpd' => 'Dinas Pendidikan',
    ]);
});

it('imports and atomically replaces a monthly Register SP2D snapshot', function () {
    $admin = User::factory()->create();
    $admin->assignRole('admin');

    $firstFile = registerSp2dFile([
        registerSp2dRow(1, 'SP2D-001', 1000, 100, 900),
        registerSp2dRow(2, 'SP2D-002', 2000, 200, 1800),
    ]);

    $this->actingAs($admin)
        ->post(route('icsa.pengeluaran.import-data.register-sp2d.upload'), [
            'file_register_sp2d' => $firstFile,
        ])
        ->assertRedirect();

    $firstBatch = ImportRegisterSp2d::query()->firstOrFail();

    expect($firstBatch->status)->toBe('preview')
        ->and($firstBatch->jumlah_baris)->toBe(2)
        ->and($firstBatch->jumlah_data_baru)->toBe(2)
        ->and($firstBatch->details()->count())->toBe(2);

    $this->actingAs($admin)
        ->post(route('icsa.pengeluaran.import-data.register-sp2d.confirm', $firstBatch))
        ->assertRedirect(route('icsa.pengeluaran.import-data.index'));

    expect($firstBatch->fresh()->status)->toBe('completed')
        ->and($firstBatch->fresh()->is_active)->toBeTrue();

    $replacementFile = registerSp2dFile([
        registerSp2dRow(1, 'SP2D-001', 1200, 100, 1100),
        registerSp2dRow(2, 'SP2D-003', 3000, 300, 2700),
    ]);

    $this->actingAs($admin)
        ->post(route('icsa.pengeluaran.import-data.register-sp2d.upload'), [
            'file_register_sp2d' => $replacementFile,
        ])
        ->assertRedirect();

    $replacement = ImportRegisterSp2d::query()->latest('id')->firstOrFail();

    expect($replacement->jumlah_data_baru)->toBe(1)
        ->and($replacement->jumlah_data_berubah)->toBe(1)
        ->and($replacement->jumlah_data_tetap)->toBe(0)
        ->and($replacement->jumlah_data_dihapus)->toBe(1);

    $this->actingAs($admin)
        ->post(route('icsa.pengeluaran.import-data.register-sp2d.confirm', $replacement))
        ->assertRedirect(route('icsa.pengeluaran.import-data.index'));

    expect($firstBatch->fresh()->status)->toBe('superseded')
        ->and($firstBatch->fresh()->is_active)->toBeFalse()
        ->and($replacement->fresh()->status)->toBe('completed')
        ->and($replacement->fresh()->is_active)->toBeTrue()
        ->and(ImportRegisterSp2d::query()->where('tahun', 2026)->where('bulan', 6)->where('is_active', true)->count())->toBe(1);
});

it('rejects a file containing more than one Tanggal Pembuatan period', function () {
    $admin = User::factory()->create();
    $admin->assignRole('admin');

    $file = registerSp2dFile([
        registerSp2dRow(1, 'SP2D-001', 1000, 100, 900),
        registerSp2dRow(2, 'SP2D-002', 2000, 200, 1800, '1 Juli 2026'),
    ]);

    $this->actingAs($admin)
        ->from(route('icsa.pengeluaran.import-data.index'))
        ->post(route('icsa.pengeluaran.import-data.register-sp2d.upload'), [
            'file_register_sp2d' => $file,
        ])
        ->assertRedirect(route('icsa.pengeluaran.import-data.index'))
        ->assertSessionHasErrors('file_register_sp2d');

    expect(ImportRegisterSp2d::query()->count())->toBe(0);
});

function registerSp2dRow(
    int $number,
    string $sp2d,
    float $bruto,
    float $potongan,
    float $netto,
    string $tanggalPembuatan = '1 Juni 2026',
): array {
    return [
        (string) $number,
        $tanggalPembuatan,
        '1 Juni 2026',
        $sp2d,
        'Dinas Pendidikan',
        'Penerima',
        'Keterangan pembayaran',
        'LS',
        $bruto,
        $potongan,
        $netto,
    ];
}

function registerSp2dFile(array $rows): UploadedFile
{
    $spreadsheet = new Spreadsheet;
    $sheet = $spreadsheet->getActiveSheet();
    $sheet->setTitle('Data Realisasi');
    $sheet->fromArray([
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
    ], null, 'A1');
    $sheet->fromArray($rows, null, 'A2');

    $temporaryPath = tempnam(sys_get_temp_dir(), 'register-sp2d-');
    (new Xlsx($spreadsheet))->save($temporaryPath);
    $spreadsheet->disconnectWorksheets();
    $contents = file_get_contents($temporaryPath);
    unlink($temporaryPath);

    return UploadedFile::fake()->createWithContent('Register SP2D.xlsx', $contents);
}
