<!DOCTYPE html>
<html>
<head>
    <meta charset="utf-8">
    <title>{{ $title }}</title>
    <style>
        /* ================= GLOBAL ================= */
        body {
            font-family: Arial, sans-serif;
            font-size: 10.5pt; /* Sedikit dikecilkan dari 11pt agar lebih muat */
            line-height: 1.2;  /* Dirapatkan dari 1.3 */
            color: #000;
        }

        .center { text-align: center; }
        .bold { font-weight: bold; }
        .section { margin-top: 8px; } /* Dirapatkan dari 12px */
        .section-title {
            display: block;
            page-break-after: avoid;
        }

        /*
         * Jaga kelompok informasi agar perpindahan halaman mengikuti konteks,
         * bukan memisahkan label dari isi keterangannya.
         */
        .reconciliation-note {
            page-break-inside: avoid;
            break-inside: avoid;
            margin-top: 2px;
        }

        .section-c {
            page-break-inside: avoid;
            break-inside: avoid;
        }

        /* ================= PAGE ================= */
        @page {
            size: 210mm 330mm; /* F4 */
            margin: 10mm 12mm; /* Margin atas-bawah dikecilkan agar ruang lebih luas */
        }

        /* ================= BARIS DATA ================= */
        .line {
            display: table;
            width: 100%;
            margin: 0; /* Menghilangkan margin antar baris */
        }

        .label, .colon, .value {
            display: table-cell;
            vertical-align: top;
            padding-bottom: 1px; /* Jarak antar baris yang sangat tipis */
        }

        .label { width: 65%; }
        .colon { width: 3%; text-align: center; }
        .value { width: 32%; text-align: right; white-space: nowrap; }

        .sub .label { padding-left: 15px; }

        /* Garis nominal standar akuntansi */
        .total-nominal .value {
            border-top: 1.5px solid #000;
            padding-top: 1px;
            margin-top: 1px;
        }

        /* ================= TANDA TANGAN (AUTO ADJUST) ================= */
        .signature-wrapper {
            page-break-inside: avoid; /* Kunci agar tidak terpotong */
            margin-top: 20px; /* Jarak sebelum TTD diperkecil */
        }

        .signature {
            display: table;
            width: 100%;
        }

        .sig-block {
            display: table-cell;
            width: 50%;
            text-align: center;
            vertical-align: top;
        }

        .sig-header { height: 45px; } /* Diperpendek agar hemat ruang */
        .sig-space { height: 65px; }  /* Ruang TTD diperpendek sedikit */
        .double-total .value {
            border-top: 1.5px solid #000;
            border-bottom: 3px double #000; /* Garis dua di bawah nominal */
            padding: 2px 0;
        }

        .line .value.wrap-text {
            white-space: normal;
            word-wrap: break-word;
            text-align: justify;
            line-height: 1.3;
        }

        .note-label {
            margin-bottom: 3px;
            font-weight: bold;
        }

        .note-content {
            min-height: 16px;
            padding: 5px 7px;
            border: 1px solid #b8b8b8;
            background: #f7f7f7;
            line-height: 1.3;
            text-align: justify;
            white-space: normal;
            word-wrap: break-word;
        }
    </style>
</head>
<body>

@php
function rupiah($n){
    return number_format((float)($n ?? 0), 2, ',', '.');
}
@endphp

<div class="print-wrapper">
    <div class="center bold">
        BERITA ACARA REKONSILIASI SALDO KAS<br>
        UNTUK BULAN {{ strtoupper($bulanNama) }} {{ $rekon->tahun }}
    </div>

    <div class="center" style="margin-top: 10px;">
        Pada hari ini <b>{{ $hari }}</b> tanggal <b>{{ $tanggal->format('d') }}</b> bulan <b>{{ $bulanCetak }}</b>
        tahun <b>{{ $rekon->tahun }}</b><br>
        telah dilakukan rekonsiliasi saldo kas
        untuk bulan <b>{{ $bulanNama }} {{ $rekon->tahun }}</b>
        antara Bidang Perbendaharaan dan<br>
        <b>{{ $skpdNama }}</b>, dengan hasil sebagai berikut:
    </div>

    {{-- ================= TAB A ================= --}}
    <div class="section">
        <b class="section-title">A. Realisasi Penerimaan dan Pengeluaran</b>
        <div class="line">
            <span class="label">1. Saldo Awal</span>
            <span class="colon">:</span>
            <span class="value">Rp{{ rupiah($tabA['saldo_awal']) }}</span>
        </div>
        <div class="line"><span class="label">2. Penerimaan</span></div>
        <div class="line sub"><span class="label">a. SP2D LS</span><span class="colon">:</span><span class="value">Rp{{ rupiah($dataA['penerimaan']['ls'] ?? 0) }}</span></div>
        <div class="line sub"><span class="label">b. SP2D UP / GU</span><span class="colon">:</span><span class="value">Rp{{ rupiah($dataA['penerimaan']['up_gu'] ?? 0) }}</span></div>
        <div class="line sub"><span class="label">c. SP2D TU</span><span class="colon">:</span><span class="value">Rp{{ rupiah($dataA['penerimaan']['tu'] ?? 0) }}</span></div>
        <div class="line sub"><span class="label">d. SP2D GU KKPD</span><span class="colon">:</span><span class="value">Rp{{ rupiah($dataA['penerimaan']['gukkpd'] ?? 0) }}</span></div>
        <div class="line bold total-nominal">
            <span class="label">Jumlah Penerimaan</span><span class="colon">:</span><span class="value">Rp{{ rupiah($tabA['penerimaan']) }}</span>
        </div>

        <div class="line"><span class="label">3. Pengeluaran</span></div>
        <div class="line sub"><span class="label">a. SPJ LS</span><span class="colon">:</span><span class="value">Rp{{ rupiah($dataA['pengeluaran']['spj_ls'] ?? 0) }}</span></div>
        <div class="line sub"><span class="label">b. SPJ UP / GU</span><span class="colon">:</span><span class="value">Rp{{ rupiah($dataA['pengeluaran']['spj_up_gu'] ?? 0) }}</span></div>
        <div class="line sub"><span class="label">c. SPJ TU</span><span class="colon">:</span><span class="value">Rp{{ rupiah($dataA['pengeluaran']['spj_tu'] ?? 0) }}</span></div>
        <div class="line sub"><span class="label">d. SPJ GU KKPD</span><span class="colon">:</span><span class="value">Rp{{ rupiah($dataA['pengeluaran']['spj_gukkpd'] ?? 0) }}</span></div>
        <div class="line sub"><span class="label">e. STS UP / GU</span><span class="colon">:</span><span class="value">Rp{{ rupiah($dataA['pengeluaran']['sts_up_gu'] ?? 0) }}</span></div>
        <div class="line sub"><span class="label">f. STS TU</span><span class="colon">:</span><span class="value">Rp{{ rupiah($dataA['pengeluaran']['sts_tu'] ?? 0) }}</span></div>
        <div class="line sub"><span class="label">g. Pengembalian Belanja LS</span><span class="colon">:</span><span class="value">Rp{{ rupiah($dataA['pengeluaran']['cp_ls'] ?? 0) }}</span></div>
        <div class="line sub"><span class="label">h. Pengembalian Belanja UP / GU</span><span class="colon">:</span><span class="value">Rp{{ rupiah($dataA['pengeluaran']['cp_up_gu'] ?? 0) }}</span></div>
        <div class="line sub"><span class="label">i. Pengembalian Belanja TU</span><span class="colon">:</span><span class="value">Rp{{ rupiah($dataA['pengeluaran']['cp_tu'] ?? 0) }}</span></div>
        <div class="line bold total-nominal">
            <span class="label">Jumlah Pengeluaran</span><span class="colon">:</span><span class="value">Rp{{ rupiah($tabA['pengeluaran']) }}</span>
        </div>
        <div class="line bold total-nominal">
            <span class="label">4. Saldo Kas</span><span class="colon">:</span><span class="value">Rp{{ rupiah($tabA['saldo_kas']) }}</span>
        </div>
    </div>

    {{-- ================= TAB B ================= --}}
    <div class="section">
        <b class="section-title">B. Buku Kas Umum (BKU) SKPD</b>
        <div class="line"><span class="label">1. Saldo Awal</span><span class="colon">:</span><span class="value">Rp{{ rupiah($saldoAwalBku) }}</span></div>
        <div class="line"><span class="label">2. Penerimaan</span><span class="colon">:</span><span class="value">Rp{{ rupiah($tabB['penerimaan'] ?? 0) }}</span></div>
        <div class="line"><span class="label">3. Pengeluaran</span><span class="colon">:</span><span class="value">Rp{{ rupiah($tabB['pengeluaran'] ?? 0) }}</span></div>
        <div class="line bold total-nominal">
            <span class="label">4. Saldo Kas</span><span class="colon">:</span><span class="value">Rp{{ rupiah($saldoAkhirBku) }}</span>
        </div>
        <div class="reconciliation-note">
            <div class="line">
                <span class="label">Selisih Saldo Kas (A - B)</span><span class="colon">:</span><span class="value">Rp{{ rupiah($selisihAB) }}</span>
            </div>
            <div class="note-label">Keterangan Selisih:</div>
            <div class="note-content">{!! nl2br(e($ketSelisihB ?: '-')) !!}</div>
        </div>
    </div>

    {{-- ================= TAB C ================= --}}
    <div class="section section-c">
        <b class="section-title">C. Rekapitulasi Posisi Saldo Kas</b>
        <div class="line bold"><span class="label">1. Kas Tunai</span></div>
        <div class="line sub"><span class="label">BP & BPP</span><span class="colon">:</span><span class="value">Rp{{ rupiah($kasTunaiBP + $kasTunaiBPP) }}</span></div>
        <div class="line bold"><span class="label">2. Kas di Bank</span></div>
        @foreach($kasBank as $b)
        <div class="line sub"><span class="label">{{ $b['label'] }}</span><span class="colon">:</span><span class="value">Rp{{ rupiah($b['nilai']) }}</span></div>
        @endforeach
        <div class="line bold total-nominal">
            <span class="label">3. Jumlah Kas</span><span class="colon">:</span><span class="value">Rp{{ rupiah($jumlahKas) }}</span>
        </div>
        <div class="reconciliation-note">
            <div class="line">
                <span class="label">Selisih Saldo Kas (A - C)</span><span class="colon">:</span><span class="value">Rp{{ rupiah($selisihAC) }}</span>
            </div>
            <div class="note-label">Keterangan Selisih:</div>
            <div class="note-content">{!! nl2br(e($ketSelisihC ?: '-')) !!}</div>
        </div>
    </div>

    {{-- ================= TTD (MENYATU) ================= --}}
    <div class="signature-wrapper">
        <div class="signature">
            <div class="sig-block">
                <div class="sig-header">Mengetahui,<br>{{ $kabid->jabatan }}</div>
                <div class="sig-space"></div>
                <b>{{ $kabid->nama }}</b><br>NIP. {{ $kabid->nip }}
            </div>
            <div class="sig-block">
                <div class="sig-header">Bendahara Pengeluaran<br>{{ $skpdNama }}</div>
                <div class="sig-space"></div>
                <b>{{ $bendahara->nama }}</b><br>NIP. {{ $bendahara->nip }}
            </div>
        </div>
    </div>
</div>

</body>
</html>
