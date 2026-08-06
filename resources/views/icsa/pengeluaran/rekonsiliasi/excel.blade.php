@php
function rupiah($n){
    return (float)($n ?? 0);
}
@endphp

<table>
    {{-- JUDUL --}}
    <tr>
        <td colspan="3" style="text-align: center; font-weight: bold;">BERITA ACARA REKONSILIASI SALDO KAS</td>
    </tr>
    <tr>
        <td colspan="3" style="text-align: center; font-weight: bold;">UNTUK BULAN {{ strtoupper($bulanNama) }} {{ $rekon->tahun }}</td>
    </tr>
    <tr><td></td><td></td><td></td></tr>

    <tr>
        <td colspan="3" style="vertical-align: top; text-align: justify;">
            Pada hari ini {{ $hari }} tanggal {{ $tanggal->format('d') }} bulan {{ $bulanCetak }} tahun {{ $rekon->tahun }} telah dilakukan rekonsiliasi saldo kas untuk bulan {{ $bulanNama }} {{ $rekon->tahun }} antara Bidang Perbendaharaan dan {{ $skpdNama }}, dengan hasil sebagai berikut:
        </td>
    </tr>
    <tr><td></td><td></td><td></td></tr>

    {{-- BAGIAN A --}}
    <tr><td colspan="3" style="font-weight: bold;">A. Realisasi Penerimaan dan Pengeluaran</td></tr>
    <tr>
        <td>1. Saldo Awal</td>
        <td>:</td>
        <td style="text-align: right;">{{ rupiah($tabA['saldo_awal']) }}</td>
    </tr>
    <tr><td>2. Penerimaan</td><td></td><td></td></tr>
    <tr><td>&nbsp;&nbsp;&nbsp;a. SP2D LS</td><td>:</td><td style="text-align: right;">{{ rupiah($dataA['penerimaan']['ls'] ?? 0) }}</td></tr>
    <tr><td>&nbsp;&nbsp;&nbsp;b. SP2D UP / GU</td><td>:</td><td style="text-align: right;">{{ rupiah($dataA['penerimaan']['up_gu'] ?? 0) }}</td></tr>
    <tr><td>&nbsp;&nbsp;&nbsp;c. SP2D TU</td><td>:</td><td style="text-align: right;">{{ rupiah($dataA['penerimaan']['tu'] ?? 0) }}</td></tr>
    <tr><td>&nbsp;&nbsp;&nbsp;d. SP2D GU KKPD</td><td>:</td><td style="text-align: right;">{{ rupiah($dataA['penerimaan']['gukkpd'] ?? 0) }}</td></tr>
    <tr>
        <td style="font-weight: bold;">Jumlah Penerimaan</td>
        <td style="font-weight: bold;">:</td>
        <td style="border-top: 1px solid #000; text-align: right; font-weight: bold;">{{ rupiah($tabA['penerimaan']) }}</td>
    </tr>

    <tr><td>3. Pengeluaran</td><td></td><td></td></tr>
    <tr><td>&nbsp;&nbsp;&nbsp;a. SPJ LS</td><td>:</td><td style="text-align: right;">{{ rupiah($dataA['pengeluaran']['spj_ls'] ?? 0) }}</td></tr>
    <tr><td>&nbsp;&nbsp;&nbsp;b. SPJ UP / GU</td><td>:</td><td style="text-align: right;">{{ rupiah($dataA['pengeluaran']['spj_up_gu'] ?? 0) }}</td></tr>
    <tr><td>&nbsp;&nbsp;&nbsp;c. SPJ TU</td><td>:</td><td style="text-align: right;">{{ rupiah($dataA['pengeluaran']['spj_tu'] ?? 0) }}</td></tr>
    <tr><td>&nbsp;&nbsp;&nbsp;d. SPJ GU KKPD</td><td>:</td><td style="text-align: right;">{{ rupiah($dataA['pengeluaran']['spj_gukkpd'] ?? 0) }}</td></tr>
    <tr><td>&nbsp;&nbsp;&nbsp;e. STS UP / GU</td><td>:</td><td style="text-align: right;">{{ rupiah($dataA['pengeluaran']['sts_up_gu'] ?? 0) }}</td></tr>
    <tr><td>&nbsp;&nbsp;&nbsp;f. STS TU</td><td>:</td><td style="text-align: right;">{{ rupiah($dataA['pengeluaran']['sts_tu'] ?? 0) }}</td></tr>
    <tr><td>&nbsp;&nbsp;&nbsp;g. Pengembalian Belanja LS</td><td>:</td><td style="text-align: right;">{{ rupiah($dataA['pengeluaran']['cp_ls'] ?? 0) }}</td></tr>
    <tr><td>&nbsp;&nbsp;&nbsp;h. Pengembalian Belanja UP / GU</td><td>:</td><td style="text-align: right;">{{ rupiah($dataA['pengeluaran']['cp_up_gu'] ?? 0) }}</td></tr>
    <tr><td>&nbsp;&nbsp;&nbsp;i. Pengembalian Belanja TU</td><td>:</td><td style="text-align: right;">{{ rupiah($dataA['pengeluaran']['cp_tu'] ?? 0) }}</td></tr>
    <tr>
        <td style="font-weight: bold;">Jumlah Pengeluaran</td>
        <td style="font-weight: bold;">:</td>
        <td style="border-top: 1px solid #000; text-align: right; font-weight: bold;">{{ rupiah($tabA['pengeluaran']) }}</td>
    </tr>
    <tr>
        <td style="font-weight: bold;">4. Saldo Kas</td>
        <td style="font-weight: bold;">:</td>
        <td style="border-top: 1px solid #000; text-align: right; font-weight: bold;">{{ rupiah($tabA['saldo_kas']) }}</td>
    </tr>
    <tr><td></td><td></td><td></td></tr>

    {{-- BAGIAN B --}}
    <tr><td colspan="3" style="font-weight: bold;">B. Buku Kas Umum (BKU) SKPD</td></tr>
    <tr><td>1. Saldo Awal</td><td>:</td><td style="text-align: right;">{{ rupiah($saldoAwalBku) }}</td></tr>
    <tr><td>2. Penerimaan</td><td>:</td><td style="text-align: right;">{{ rupiah($tabB['penerimaan'] ?? 0) }}</td></tr>
    <tr><td>3. Pengeluaran</td><td>:</td><td style="text-align: right;">{{ rupiah($tabB['pengeluaran'] ?? 0) }}</td></tr>
    <tr>
        <td style="font-weight: bold;">4. Saldo Kas</td>
        <td style="font-weight: bold;">:</td>
        <td style="border-top: 1px solid #000; text-align: right; font-weight: bold;">{{ rupiah($saldoAkhirBku) }}</td>
    </tr>
    <tr><td>Selisih Saldo Kas (A - B)</td><td>:</td><td style="text-align: right;">{{ rupiah($selisihAB) }}</td></tr>
    <tr>
        <td style="vertical-align: top;">Keterangan Selisih</td>
        <td style="vertical-align: top;">:</td>
        <td style="wrap-text: true; vertical-align: top;">{{ $ketSelisihB ?? '-' }}</td>
    </tr>
    <tr><td></td><td></td><td></td></tr>

    {{-- BAGIAN C --}}
    <tr><td colspan="3" style="font-weight: bold;">C. Rekapitulasi Posisi Saldo Kas</td></tr>
    <tr>
        <td style="font-weight: bold;">1. Kas Tunai</td><td></td><td></td>
    </tr>
    <tr><td>&nbsp;&nbsp;&nbsp;BP &amp; BPP</td><td>:</td><td style="text-align: right;">{{ rupiah($kasTunaiBP + $kasTunaiBPP) }}</td></tr>

    <tr>
        <td style="font-weight: bold;">2. Kas di Bank</td><td></td><td></td>
    </tr>
    @foreach($kasBank as $b)
    <tr>
        <td>&nbsp;&nbsp;&nbsp;{{ $b['label'] }}</td>
        <td>:</td>
        <td style="text-align: right;">{{ rupiah($b['nilai']) }}</td>
    </tr>
    @endforeach

    <tr>
        <td style="font-weight: bold;">3. Jumlah Kas</td>
        <td style="font-weight: bold;">:</td>
        <td style="text-align: right; font-weight: bold; border-top: 1px solid black;">{{ rupiah($jumlahKas) }}</td>
    </tr>

    <tr>
        <td style="font-weight: bold;">Selisih Saldo Kas (A - C)</td>
        <td style="font-weight: bold;">:</td>
        <td style="text-align: right; font-weight: bold;">{{ rupiah($selisihAC) }}</td>
    </tr>
    <tr>
        <td style="vertical-align: top;">Keterangan Selisih</td>
        <td style="vertical-align: top;">:</td>
        <td style="wrap-text: true; vertical-align: top;">{{ $ketSelisihC ?? '-' }}</td>
    </tr>
    {{-- TANDA TANGAN --}}
    <tr><td></td><td></td><td></td></tr>
    <tr>
        <td style="text-align: center;">Mengetahui,</td>
        <td></td>
        <td style="text-align: center;">Bendahara Pengeluaran</td>
    </tr>
    <tr>
        <td style="text-align: center;">{{ $kabid->jabatan }}</td>
        <td></td>
        <td style="text-align: center;">{{ $skpdNama }}</td>
    </tr>
    <tr><td colspan="3" style="height: 50px;"></td></tr>
    <tr>
        <td style="text-align: center; font-weight: bold;">{{ $kabid->nama }}</td>
        <td></td>
        <td style="text-align: center; font-weight: bold;">{{ $bendahara->nama }}</td>
    </tr>
    <tr>
        <td style="text-align: center;">NIP. {{ $kabid->nip }}</td>
        <td></td>
        <td style="text-align: center;">NIP. {{ $bendahara->nip }}</td>
    </tr>
</table>
