<!DOCTYPE html>
<html lang="id">
<head>
    <meta charset="UTF-8">
    <title>Cetak Berita Acara Rekonsiliasi Bank - {{ $rekon->id }}</title>
    <style>
        /* Reset margin standar untuk PDF */
        @page {
            margin: 1.5cm 2cm 1.5cm 2cm; /* Atas, Kanan, Bawah, Kiri */
        }
        
        body {
            font-family: 'Helvetica', 'Arial', sans-serif; /* Font bersih mirip di gambar */
            font-size: 11pt; /* Ukuran font standar dokumen */
            line-height: 1.3;
            color: #000;
        }

        /* Styling Header (Kop Dokumen) */
        .header-container {
            width: 100%;
            position: relative;
            margin-bottom: 10px;
        }
        
        /* Logo diletakkan di absolut kiri */
        .header-logo {
            position: absolute;
            top: 0;
            left: 0;
            width: 70px; /* Sesuaikan ukuran logo */
            height: auto;
        }
        
        /* Teks header diletakkan di tengah */
        .header-text {
            text-align: center;
            width: 100%;
            font-weight: bold;
            text-transform: uppercase; /* Membuat teks jadi kapital semua */
        }
        
        .header-text p {
            margin: 0; /* Menghilangkan margin bawaan paragraf */
            padding: 2px 0;
        }

        /* Garis ganda di bawah kop */
        .double-line {
            border-top: 2px solid #000;
            border-bottom: 1px solid #000;
            height: 2px;
            margin-top: 15px;
            margin-bottom: 20px;
        }

        /* Styling Informasi Periode (Kiri) */
        .periode-info {
            margin-bottom: 25px;
        }

        /* Styling Tabel Utama (Perbandingan Saldo) - GARIS VERTIKAL DIHAPUS */
        .table-saldo {
            width: 100%;
            border-collapse: collapse;
            margin-bottom: 30px;
        }

        /* Kolom No dan Keterangan */
        .table-saldo td:nth-child(1),
        .table-saldo td:nth-child(2) {
            border: none; /* Bagian kiri tidak ada border vertikal */
            padding: 5px;
        }
        
        .col-no { width: 4%; vertical-align: top; }
        .col-ket { width: 61%; }

        /* Kolom Nilai - GARIS VERTIKAL DIHAPUS, TERSISA GARIS PENJUMLAHAN */
        .table-saldo td.col-nilai,
        .table-saldo th.col-nilai {
            width: 35%;
            text-align: right;
            border: none; /* GARIS VERTIKAL DIHAPUS */
            padding: 5px 10px;
            white-space: nowrap; /* Mencegah angka turun baris */
        }

        /* Styling Baris Selisih - HANYA GARIS DI ATAS */
        .row-selisih td {
            font-weight: bold;
            padding-top: 10px !important;
        }
        
        .row-selisih td.col-nilai {
            border-top: 2px solid #000; /* Garis tebal HANYA di atas angka selisih */
            border-bottom: none; /* Menghilangkan garis bawah */
        }

        /* Styling Bagian Keterangan Selisih (Bawah) */
        .ket-selisih-title {
            font-weight: bold;
            margin-bottom: 10px;
            padding-left: 5px;
        }

        /* Styling Tabel Detail - GARIS VERTIKAL DIHAPUS */
        .table-detail {
            width: 100%;
            border-collapse: collapse;
        }

        /* Kolom No, Keterangan, Nilai di Detail */
        .table-detail td:nth-child(1),
        .table-detail td:nth-child(2) {
            border: none;
            padding: 3px 5px;
        }
        
        .table-detail td.col-nilai {
            text-align: right;
            border: none; /* GARIS VERTIKAL DIHAPUS */
            padding: 3px 10px;
            white-space: nowrap;
        }

        /* Styling Baris Jumlah - HANYA GARIS DI ATAS */
        .row-jumlah td {
            font-weight: bold;
            padding-top: 10px !important;
        }
        
        .row-jumlah td.col-nilai {
            border-top: 2px solid #000; /* Garis tebal HANYA di atas angka jumlah */
            border-bottom: none; /* Menghilangkan garis bawah */
        }

        .footer-sign {
            margin-top: 50px;
            width: 100%;
        }

        .sign-box {
            float: right; /* Posisi di kanan sesuai lingkaran hijau */
            width: 45%;
            text-align: center;
        }

        .sign-space {
            height: 80px; /* Ruang untuk tanda tangan dan stempel */
        }

        .sign-name {
            font-weight: bold;
            text-decoration: underline;
        }
    </style>
</head>
<body>

    {{-- 1. HEADER / KOP DOKUMEN (PERSIS POSISINYA, TERSISA LOGO DI KIRI, TEKS TENGAH) --}}
    <div class="header-container">
        {{-- Logo diletakkan di absolut kiri --}}
        <img src="{{ public_path('/logo_kediri.png') }}" class="header-logo" alt="Logo">
        
        {{-- Teks header diletakkan di tengah --}}
        <div class="header-text">
            <p>PEMERINTAH KABUPATEN KEDIRI</p>
            <p>REKONSILIASI BANK</p>
            <p>TAHUN ANGGARAN {{ $rekon->tahun ?? \Carbon\Carbon::parse($rekon->periode_rekon)->year }}</p>
        </div>
    </div>

    {{-- GARIS GANDA --}}
    <div class="double-line"></div>

    {{-- 2. INFORMASI PERIODE (KIRI) - BULAN BAHASA INDONESIA --}}
    <div class="periode-info">
        <strong>Periode:</strong> {{ \Carbon\Carbon::parse($rekon->periode_rekon)->translatedFormat('F') }}
    </div>

    {{-- 3. TABEL UTAMA PERBANDINGAN SALDO - GARIS VERTIKAL DIHAPUS, TERSISA GARIS PENJUMLAHAN --}}
    <table class="table-saldo">
        <tbody>
            <tr>
                <td class="col-no">1.</td>
                <td class="col-ket">Saldo Kas Umum Daerah menurut Buku</td>
                <td class="col-nilai">Rp{{ number_format($rekon->saldo_buku_akhir, 2, ',', '.') }}</td>
            </tr>
            <tr>
                <td class="col-no">2.</td>
                <td class="col-ket">Saldo Kas Umum Daerah menurut Bank</td>
                <td class="col-nilai">Rp{{ number_format($rekon->saldo_bank_akhir, 2, ',', '.') }}</td>
            </tr>
            <tr class="row-selisih">
                <td class="col-no"></td>
                <td class="col-ket">Selisih</td>
                <td class="col-nilai">Rp{{ number_format($rekon->selisih, 2, ',', '.') }}</td>
            </tr>
        </tbody>
    </table>

    {{-- 4. KETERANGAN SELISIH (PENJELASAN ITEM) --}}
    <div class="ket-selisih-title">Keterangan Selisih:</div>

    <table class="table-detail">
        <tbody>
            @php $totalPenjelasan = 0; @endphp
            @forelse($rekon->details as $key => $detail)
            <tr>
                <td class="col-no text-center">{{ $key + 1 }}.</td>
                <td class="col-ket">
                    {{ $detail->keterangan_item }} 
                    {{-- Format: No. Ref - Tanggal (Tanggal tetap dalam kurung) --}}
                    @if($detail->nomor_referensi) 
                        <span style="margin-left: 5px;">{{ $detail->nomor_referensi }}</span> 
                    @endif
                    <span style="margin-left: 5px;">({{ \Carbon\Carbon::parse($detail->tanggal_transaksi)->translatedFormat('d F Y') }})</span>
                </td>
                <td class="col-nilai">
                    {{-- Logika Angka Minus dalam Kurung --}}
                    @if($detail->nominal < 0)
                        (Rp{{ number_format(abs($detail->nominal), 2, ',', '.') }})
                    @else
                        Rp{{ number_format($detail->nominal, 2, ',', '.') }}
                    @endif
                </td>
            </tr>
            @php $totalPenjelasan += $detail->nominal; @endphp
        @empty
            {{-- ... --}}
        @endforelse

        {{-- Baris Jumlah Total --}}
        <tr class="row-jumlah">
            <td class="col-no"></td>
            <td class="col-ket text-center">Jumlah</td>
            <td class="col-nilai">
                @if($totalPenjelasan < 0)
                    (Rp{{ number_format(abs($totalPenjelasan), 2, ',', '.') }})
                @else
                    Rp{{ number_format($totalPenjelasan, 2, ',', '.') }}
                @endif
            </td>
        </tr>
        </tbody>
    </table>    

    <div class="footer-sign">
        <div class="sign-box">
            <p>BENDAHARA UMUM DAERAH</p>
            <div class="sign-space"></div>
            
            @if($bud)
                <p class="sign-name">{{ $bud->nama }}</p>
                <p>NIP. {{ $bud->nip }}</p>
            @else
                <p class="sign-name">..........................................</p>
                <p>NIP. ..........................................</p>
            @endif
        </div>
        <div style="clear: both;"></div>
    </div>

</body>
</html>