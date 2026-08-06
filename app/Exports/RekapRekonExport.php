<?php

namespace App\Exports;

use Illuminate\Contracts\View\View;
use Maatwebsite\Excel\Concerns\FromView;
use Maatwebsite\Excel\Concerns\ShouldAutoSize;

class RekapRekonExport implements FromView, ShouldAutoSize
{
    protected $data;
    protected $grandTotal;

    public function __construct($data, $grandTotal)
    {
        $this->data = $data;
        $this->grandTotal = $grandTotal;
    }

    public function view(): View
    {
        // SEBELUMNYA: return view('exports.rekap_rekon', [
        // DIUBAH MENJADI:
        return view('icsa.pengeluaran.rekap-data.excel', [
            'dataRealisasi' => $this->data,
            'grandTotal' => $this->grandTotal
        ]);
    }
}
