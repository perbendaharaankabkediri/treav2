<?php

namespace App\Exports;

use Illuminate\Contracts\View\View;
use Maatwebsite\Excel\Concerns\FromView;
use Maatwebsite\Excel\Concerns\ShouldAutoSize;
use Maatwebsite\Excel\Concerns\WithEvents;
use Maatwebsite\Excel\Events\AfterSheet;
use PhpOffice\PhpSpreadsheet\Style\Alignment;
use PhpOffice\PhpSpreadsheet\Style\NumberFormat;
use PhpOffice\PhpSpreadsheet\Worksheet\PageSetup;

class RekonKasExport implements FromView, ShouldAutoSize, WithEvents
{
    protected $data;

    public function __construct(array $data)
    {
        $this->data = $data;
    }

    public function view(): View
    {
        return view('icsa.pengeluaran.rekonsiliasi.excel', $this->data);
    }

    public function registerEvents(): array
    {
        return [
            AfterSheet::class => function (AfterSheet $event) {
                $sheet = $event->sheet->getDelegate();
                $highestRow = $sheet->getHighestRow();

                // Samakan tipografi dasar dengan berita acara PDF.
                $sheet->getStyle("A1:C{$highestRow}")->getFont()
                    ->setName('Arial')
                    ->setSize(10.5);
                $sheet->getStyle("A1:C{$highestRow}")->getAlignment()
                    ->setVertical(Alignment::VERTICAL_TOP)
                    ->setWrapText(true);
                $sheet->getStyle("C1:C{$highestRow}")->getNumberFormat()
                    ->setFormatCode('"Rp"#,##0.00');

                // --- Kolom A lebih lebar (label), C lebih lebar (nilai) ---
                $sheet->getColumnDimension('A')->setAutoSize(false)->setWidth(45);
                $sheet->getColumnDimension('B')->setAutoSize(false)->setWidth(3);
                $sheet->getColumnDimension('C')->setAutoSize(false)->setWidth(20);

                // Folio/F4 8,5 x 13 inci, portrait, satu halaman selebar kertas.
                $sheet->getPageSetup()
                    ->setOrientation(PageSetup::ORIENTATION_PORTRAIT)
                    ->setPaperSize(PageSetup::PAPERSIZE_FOLIO)
                    ->setFitToPage(true)
                    ->setFitToWidth(1)
                    ->setFitToHeight(0); // 0 = auto banyak halaman

                // Margin aman printer kantor, mendekati PDF: 10 mm atas-bawah,
                // 12 mm kiri-kanan. Header/footer diperkecil karena tidak dipakai.
                $sheet->getPageMargins()
                    ->setTop(0.4)
                    ->setBottom(0.4)
                    ->setLeft(0.47)
                    ->setRight(0.47)
                    ->setHeader(0.2)
                    ->setFooter(0.2);

                // --- Print area otomatis sesuai data ---
                $sheet->getPageSetup()->setPrintArea("A1:C{$highestRow}");

                // --- Gridlines tidak dicetak ---
                $sheet->setShowGridlines(false);
                $sheet->setPrintGridlines(false);
            },
        ];
    }
}
