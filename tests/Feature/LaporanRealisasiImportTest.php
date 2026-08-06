<?php

use App\Models\ImportLaporanRealisasi;
use App\Models\User;
use Database\Seeders\AuthorizationSeeder;
use Illuminate\Http\UploadedFile;
use Illuminate\Support\Facades\Storage;
use PhpOffice\PhpSpreadsheet\Spreadsheet;
use PhpOffice\PhpSpreadsheet\Writer\Xlsx;

beforeEach(function () {
    Storage::fake('local');
    $this->seed(AuthorizationSeeder::class);
});

it('imports and replaces a monthly Laporan Realisasi snapshot', function () {
    $admin = User::factory()->create();
    $admin->assignRole('admin');

    $this->actingAs($admin)
        ->post(route('icsa.pengeluaran.import-data.laporan-realisasi.upload'), [
            'file_laporan_realisasi' => laporanRealisasiFile([
                laporanRealisasiRow('DOC-001', '5.1.01.01', 1000, 'SP2D-001', 3000),
                laporanRealisasiRow('DOC-001', '5.1.01.02', 2000, 'SP2D-001', 3000),
            ]),
        ])
        ->assertSessionHasNoErrors()
        ->assertRedirect();

    $first = ImportLaporanRealisasi::query()->firstOrFail();

    expect($first->tahun)->toBe(2026)
        ->and($first->bulan)->toBe(1)
        ->and($first->jumlah_baris)->toBe(2)
        ->and($first->jumlah_data_baru)->toBe(2)
        ->and($first->total_realisasi)->toBe('3000.00')
        ->and($first->total_sp2d_unik)->toBe('3000.00');

    $this->actingAs($admin)
        ->post(route('icsa.pengeluaran.import-data.laporan-realisasi.confirm', $first))
        ->assertRedirect(route('icsa.pengeluaran.import-data.index'));

    $this->actingAs($admin)
        ->post(route('icsa.pengeluaran.import-data.laporan-realisasi.upload'), [
            'file_laporan_realisasi' => laporanRealisasiFile([
                laporanRealisasiRow('DOC-001', '5.1.01.01', 1200, 'SP2D-001', 3200),
                laporanRealisasiRow('DOC-002', '5.1.01.03', -100, 'SP2D-002', 100),
            ]),
        ])
        ->assertRedirect();

    $replacement = ImportLaporanRealisasi::query()->latest('id')->firstOrFail();

    expect($replacement->jumlah_data_baru)->toBe(1)
        ->and($replacement->jumlah_data_berubah)->toBe(1)
        ->and($replacement->jumlah_data_tetap)->toBe(0)
        ->and($replacement->jumlah_data_dihapus)->toBe(1)
        ->and($replacement->total_realisasi)->toBe('1100.00');

    $this->actingAs($admin)
        ->post(route('icsa.pengeluaran.import-data.laporan-realisasi.confirm', $replacement))
        ->assertRedirect(route('icsa.pengeluaran.import-data.index'));

    expect($first->fresh()->status)->toBe('superseded')
        ->and($first->fresh()->is_active)->toBeFalse()
        ->and($replacement->fresh()->status)->toBe('completed')
        ->and($replacement->fresh()->is_active)->toBeTrue()
        ->and(ImportLaporanRealisasi::query()->where('tahun', 2026)->where('bulan', 1)->where('is_active', true)->count())->toBe(1);
});

it('rejects mixed effective periods for non SPP-LS documents', function () {
    $admin = User::factory()->create();
    $admin->assignRole('admin');

    $januaryRow = laporanRealisasiRow('DOC-001', '5.1.01.01', 1000, 'SP2D-001', 1000);
    $januaryRow[21] = 'TBP';
    $januaryRow[22] = 'UP';

    $februaryRow = laporanRealisasiRow('DOC-002', '5.1.01.02', 2000, 'SP2D-002', 2000, '1 Februari 2026');
    $februaryRow[21] = 'TBP';
    $februaryRow[22] = 'UP';

    $this->actingAs($admin)
        ->from(route('icsa.pengeluaran.import-data.index'))
        ->post(route('icsa.pengeluaran.import-data.laporan-realisasi.upload'), [
            'file_laporan_realisasi' => laporanRealisasiFile([
                $januaryRow,
                $februaryRow,
            ]),
        ])
        ->assertRedirect(route('icsa.pengeluaran.import-data.index'))
        ->assertSessionHasErrors('file_laporan_realisasi');

    expect(ImportLaporanRealisasi::query()->count())->toBe(0);
});

it('uses Tanggal Transfer as the period for SPP-LS', function () {
    $admin = User::factory()->create();
    $admin->assignRole('admin');

    $sppLs = laporanRealisasiRow(
        'DOC-LS',
        '5.1.01.01',
        1000,
        'SP2D-LS',
        1000,
        '31 Januari 2026',
    );
    $sppLs[43] = '1 Februari 2026';

    $otherDocument = laporanRealisasiRow(
        'DOC-UP',
        '5.1.01.02',
        2000,
        'SP2D-UP',
        2000,
        '2 Februari 2026',
    );
    $otherDocument[21] = 'TBP';
    $otherDocument[22] = 'UP';
    $otherDocument[43] = '1 Januari 2026';

    $this->actingAs($admin)
        ->post(route('icsa.pengeluaran.import-data.laporan-realisasi.upload'), [
            'file_laporan_realisasi' => laporanRealisasiFile([$sppLs, $otherDocument]),
        ])
        ->assertSessionHasNoErrors()
        ->assertRedirect();

    $batch = ImportLaporanRealisasi::query()->firstOrFail();

    expect($batch->tahun)->toBe(2026)
        ->and($batch->bulan)->toBe(2)
        ->and($batch->jumlah_baris)->toBe(2);
});

it('requires Tanggal Transfer for SPP-LS', function () {
    $admin = User::factory()->create();
    $admin->assignRole('admin');

    $row = laporanRealisasiRow('DOC-LS', '5.1.01.01', 1000, 'SP2D-LS', 1000);
    $row[43] = '';

    $this->actingAs($admin)
        ->from(route('icsa.pengeluaran.import-data.index'))
        ->post(route('icsa.pengeluaran.import-data.laporan-realisasi.upload'), [
            'file_laporan_realisasi' => laporanRealisasiFile([$row]),
        ])
        ->assertRedirect(route('icsa.pengeluaran.import-data.index'))
        ->assertSessionHasErrors('file_laporan_realisasi');

    expect(ImportLaporanRealisasi::query()->count())->toBe(0);
});

it('uses Nomor SP2D instead of Nomor Dokumen in the SPP-LS business key', function () {
    $admin = User::factory()->create();
    $admin->assignRole('admin');

    $this->actingAs($admin)
        ->post(route('icsa.pengeluaran.import-data.laporan-realisasi.upload'), [
            'file_laporan_realisasi' => laporanRealisasiFile([
                laporanRealisasiRow('DOC-SAMA', '5.1.01.01', 1000, 'SP2D-001', 1000),
                laporanRealisasiRow('DOC-SAMA', '5.1.01.01', 2000, 'SP2D-002', 2000),
            ]),
        ])
        ->assertSessionHasNoErrors()
        ->assertRedirect();

    $batch = ImportLaporanRealisasi::query()->firstOrFail();

    expect($batch->jumlah_baris)->toBe(2)
        ->and($batch->jumlah_data_baru)->toBe(2);
});

it('rejects duplicate SPP-LS rows based on Nomor SP2D', function () {
    $admin = User::factory()->create();
    $admin->assignRole('admin');

    $this->actingAs($admin)
        ->from(route('icsa.pengeluaran.import-data.index'))
        ->post(route('icsa.pengeluaran.import-data.laporan-realisasi.upload'), [
            'file_laporan_realisasi' => laporanRealisasiFile([
                laporanRealisasiRow('DOC-001', '5.1.01.01', 1000, 'SP2D-SAMA', 3000),
                laporanRealisasiRow('DOC-002', '5.1.01.01', 2000, 'SP2D-SAMA', 3000),
            ]),
        ])
        ->assertRedirect(route('icsa.pengeluaran.import-data.index'))
        ->assertSessionHasErrors('file_laporan_realisasi');

    expect(ImportLaporanRealisasi::query()->count())->toBe(0);
});

it('allows TBP rows with the same document key when Nomor SPD differs', function () {
    $admin = User::factory()->create();
    $admin->assignRole('admin');
    $rows = [];

    foreach (['UP', 'GU', 'TU', 'GU-KKPD'] as $index => $transaction) {
        $first = laporanRealisasiRow("DOC-TBP-{$index}", '5.1.01.01', 1000, "SP2D-{$index}-1", 1000);
        $first[21] = 'TBP';
        $first[22] = $transaction;
        $first[31] = "SPD-{$index}-1";

        $second = laporanRealisasiRow("DOC-TBP-{$index}", '5.1.01.01', 2000, "SP2D-{$index}-2", 2000);
        $second[21] = 'TBP';
        $second[22] = $transaction;
        $second[31] = "SPD-{$index}-2";

        $rows[] = $first;
        $rows[] = $second;
    }

    $this->actingAs($admin)
        ->post(route('icsa.pengeluaran.import-data.laporan-realisasi.upload'), [
            'file_laporan_realisasi' => laporanRealisasiFile($rows),
        ])
        ->assertSessionHasNoErrors()
        ->assertRedirect();

    $batch = ImportLaporanRealisasi::query()->firstOrFail();

    expect($batch->jumlah_baris)->toBe(8)
        ->and($batch->jumlah_data_baru)->toBe(8);
});

it('rejects duplicate TBP rows when Nomor SPD is also the same', function () {
    $admin = User::factory()->create();
    $admin->assignRole('admin');

    $first = laporanRealisasiRow('DOC-TBP', '5.1.01.01', 1000, 'SP2D-001', 1000);
    $first[21] = 'TBP';
    $first[22] = 'UP';
    $first[31] = 'SPD-SAMA';

    $second = laporanRealisasiRow('DOC-TBP', '5.1.01.01', 2000, 'SP2D-002', 2000);
    $second[21] = 'TBP';
    $second[22] = 'UP';
    $second[31] = 'SPD-SAMA';

    $response = $this->actingAs($admin)
        ->from(route('icsa.pengeluaran.import-data.index'))
        ->post(route('icsa.pengeluaran.import-data.laporan-realisasi.upload'), [
            'file_laporan_realisasi' => laporanRealisasiFile([$first, $second]),
        ])
        ->assertRedirect(route('icsa.pengeluaran.import-data.index'))
        ->assertSessionHasErrors('file_laporan_realisasi');

    expect($response->getSession()->get('errors')->first('file_laporan_realisasi'))->toContain('Nomor SPD')
        ->and(ImportLaporanRealisasi::query()->count())->toBe(0);
});

it('allows TBP-KKPD rows with the same SPD key when Nomor DPT differs', function () {
    $admin = User::factory()->create();
    $admin->assignRole('admin');

    $first = laporanRealisasiRow('DOC-KKPD', '5.1.01.01', 1000, 'SP2D-001', 1000);
    $first[21] = 'TBP-KKPD';
    $first[22] = 'GU-KKPD';
    $first[23] = 'DPT-001';
    $first[31] = 'SPD-SAMA';

    $second = laporanRealisasiRow('DOC-KKPD', '5.1.01.01', 2000, 'SP2D-002', 2000);
    $second[21] = 'TBP KKPD';
    $second[22] = 'GU KKPD';
    $second[23] = 'DPT-002';
    $second[31] = 'SPD-SAMA';

    $this->actingAs($admin)
        ->post(route('icsa.pengeluaran.import-data.laporan-realisasi.upload'), [
            'file_laporan_realisasi' => laporanRealisasiFile([$first, $second]),
        ])
        ->assertSessionHasNoErrors()
        ->assertRedirect();

    $batch = ImportLaporanRealisasi::query()->firstOrFail();

    expect($batch->jumlah_baris)->toBe(2)
        ->and($batch->jumlah_data_baru)->toBe(2);
});

it('rejects duplicate TBP-KKPD rows when Nomor DPT is also the same', function () {
    $admin = User::factory()->create();
    $admin->assignRole('admin');

    $first = laporanRealisasiRow('DOC-KKPD', '5.1.01.01', 1000, 'SP2D-001', 1000);
    $first[21] = 'TBP-KKPD';
    $first[22] = 'GU-KKPD';
    $first[23] = 'DPT-SAMA';
    $first[31] = 'SPD-SAMA';

    $second = laporanRealisasiRow('DOC-KKPD', '5.1.01.01', 2000, 'SP2D-002', 2000);
    $second[21] = 'TBP-KKPD';
    $second[22] = 'GU-KKPD';
    $second[23] = 'DPT-SAMA';
    $second[31] = 'SPD-SAMA';

    $response = $this->actingAs($admin)
        ->from(route('icsa.pengeluaran.import-data.index'))
        ->post(route('icsa.pengeluaran.import-data.laporan-realisasi.upload'), [
            'file_laporan_realisasi' => laporanRealisasiFile([$first, $second]),
        ])
        ->assertRedirect(route('icsa.pengeluaran.import-data.index'))
        ->assertSessionHasErrors('file_laporan_realisasi');

    expect($response->getSession()->get('errors')->first('file_laporan_realisasi'))->toContain('Nomor DPT')
        ->and(ImportLaporanRealisasi::query()->count())->toBe(0);
});

it('requires Nomor DPT for TBP-KKPD', function () {
    $admin = User::factory()->create();
    $admin->assignRole('admin');

    $row = laporanRealisasiRow('DOC-KKPD', '5.1.01.01', 1000, 'SP2D-001', 1000);
    $row[21] = 'TBP_KKPD';
    $row[22] = 'GU_KKPD';
    $row[23] = '';

    $response = $this->actingAs($admin)
        ->from(route('icsa.pengeluaran.import-data.index'))
        ->post(route('icsa.pengeluaran.import-data.laporan-realisasi.upload'), [
            'file_laporan_realisasi' => laporanRealisasiFile([$row]),
        ])
        ->assertRedirect(route('icsa.pengeluaran.import-data.index'))
        ->assertSessionHasErrors('file_laporan_realisasi');

    expect($response->getSession()->get('errors')->first('file_laporan_realisasi'))->toContain('Nomor DPT wajib diisi')
        ->and(ImportLaporanRealisasi::query()->count())->toBe(0);
});

function laporanRealisasiRow(
    string $document,
    string $account,
    float $realization,
    string $sp2d,
    float $sp2dValue,
    string $documentDate = '2 Januari 2026',
): array {
    return [
        '1.01.01', 'Dinas Pendidikan', '1.01.01', 'Dinas Pendidikan',
        '01', 'Pelayanan Umum', '04', 'Eksekutif',
        '1', 'Urusan Wajib', '1.01', 'Pendidikan',
        '1.01.01', 'Program', '1.01.01.2.02', 'Kegiatan',
        '1.01.01.2.02.0001', 'Sub Kegiatan', $account, 'Nama Rekening',
        $document, 'SPP', 'LS', '',
        $documentDate, 'Keterangan dokumen', $realization, 0,
        '199001012020011001', 'Pegawai', '1 Januari 2026',
        'SPD-001', 'Semester 1', 10000,
        'Penetapan APBD', 'Penetapan APBD 2026', 'Murni',
        'SPP-001', '2 Januari 2026', 'SPM-001', '2 Januari 2026',
        $sp2d, '2 Januari 2026', '2 Januari 2026', $sp2dValue,
    ];
}

function laporanRealisasiFile(array $rows): UploadedFile
{
    $spreadsheet = new Spreadsheet;
    $sheet = $spreadsheet->getActiveSheet();
    $sheet->setTitle('Data Realisasi Dokumen');
    $sheet->fromArray([
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
    ], null, 'A1');
    $sheet->fromArray($rows, null, 'A2', true);

    $temporaryPath = tempnam(sys_get_temp_dir(), 'laporan-realisasi-');
    (new Xlsx($spreadsheet))->save($temporaryPath);
    $spreadsheet->disconnectWorksheets();
    $contents = file_get_contents($temporaryPath);
    unlink($temporaryPath);

    return UploadedFile::fake()->createWithContent('Laporan Realisasi.xlsx', $contents);
}
