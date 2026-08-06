<table>
    <thead>
        <tr>
            <th colspan="23" style="font-weight: bold; text-align: center;">REKAPITULASI REALISASI (SP2D, SPJ, STS)</th>
        </tr>
        <tr>
            <th style="border: 1px solid #000; font-weight: bold;">No</th>
            <th style="border: 1px solid #000; font-weight: bold;">Kode</th>
            <th style="border: 1px solid #000; font-weight: bold;">SKPD</th>
            <th style="border: 1px solid #000; font-weight: bold; background-color: #DDEBF7;">SP2D LS</th>
            <th style="border: 1px solid #000; font-weight: bold; background-color: #DDEBF7;">SP2D UP/GU</th>
            <th style="border: 1px solid #000; font-weight: bold; background-color: #DDEBF7;">SP2D TU</th>
            <th style="border: 1px solid #000; font-weight: bold; background-color: #DDEBF7;">SP2D KKPD</th>
            <th style="border: 1px solid #000; font-weight: bold; background-color: #BCD6ED;">TOTAL SP2D</th>
            <th style="border: 1px solid #000; font-weight: bold; background-color: #E2EFDA;">SPJ LS</th>
            <th style="border: 1px solid #000; font-weight: bold; background-color: #E2EFDA;">SPJ UP/GU</th>
            <th style="border: 1px solid #000; font-weight: bold; background-color: #E2EFDA;">SPJ TU</th>
            <th style="border: 1px solid #000; font-weight: bold; background-color: #E2EFDA;">SPJ KKPD</th>
            <th style="border: 1px solid #000; font-weight: bold; background-color: #C6E0B4;">TOTAL SPJ</th>
            <th style="border: 1px solid #000; font-weight: bold; background-color: #E2EFDA;">STS UP/GU</th>
            <th style="border: 1px solid #000; font-weight: bold; background-color: #E2EFDA;">STS TU</th>
            <th style="border: 1px solid #000; font-weight: bold; background-color: #E2EFDA;">CP LS</th>
            <th style="border: 1px solid #000; font-weight: bold; background-color: #E2EFDA;">CP UP/GU</th>
            <th style="border: 1px solid #000; font-weight: bold; background-color: #E2EFDA;">CP TU</th>
            <th style="border: 1px solid #000; font-weight: bold; background-color: #FFF2CC;">TOTAL STS</th>
            <th style="border: 1px solid #000; font-weight: bold; background-color: #E2D9F3;">KAS SIPD</th>
            <th style="border: 1px solid #000; font-weight: bold; background-color: #E2D9F3;">KAS BANK</th>
            <th style="border: 1px solid #000; font-weight: bold; background-color: #E2D9F3;">KAS TUNAI</th>
            <th style="border: 1px solid #000; font-weight: bold; background-color: #000000; color: #ffffff;">SELISIH</th>
            <th style="border: 1px solid #000; font-weight: bold; background-color: #F2F2F2; text-align: center;">STATUS</th>
        </tr>
    </thead>
    <tbody>
        @foreach($dataRealisasi as $row)
        <tr>
            <td style="border: 1px solid #000; text-align: center;">{{ $loop->iteration }}</td>
            <td style="border: 1px solid #000;">{{ $row->kode_skpd }}</td>
            <td style="border: 1px solid #000;">{{ $row->nama_skpd }}</td>
            <td style="border: 1px solid #000;">{{ $row->sp2d_ls }}</td>
            <td style="border: 1px solid #000;">{{ $row->sp2d_upgu }}</td>
            <td style="border: 1px solid #000;">{{ $row->sp2d_tu }}</td>
            <td style="border: 1px solid #000;">{{ $row->sp2d_gukkpd }}</td>
            <td style="border: 1px solid #000; font-weight: bold;">{{ $row->total_sp2d }}</td>
            <td style="border: 1px solid #000;">{{ $row->spj_ls }}</td>
            <td style="border: 1px solid #000;">{{ $row->spj_upgu }}</td>
            <td style="border: 1px solid #000;">{{ $row->spj_tu }}</td>
            <td style="border: 1px solid #000;">{{ $row->spj_gukkpd }}</td>
            <td style="border: 1px solid #000; font-weight: bold;">{{ $row->total_spj }}</td>
            <td style="border: 1px solid #000;">{{ $row->sts_up_gu }}</td>
            <td style="border: 1px solid #000;">{{ $row->sts_tu }}</td>
            <td style="border: 1px solid #000;">{{ $row->cp_ls }}</td>
            <td style="border: 1px solid #000;">{{ $row->cp_up_gu }}</td>
            <td style="border: 1px solid #000;">{{ $row->cp_tu }}</td>
            <td style="border: 1px solid #000; font-weight: bold;">{{ $row->total_sts }}</td>
            <td style="border: 1px solid #000; font-weight: bold;">{{ $row->kas_sipd }}</td>
            <td style="border: 1px solid #000;">{{ $row->kas_bank }}</td>
            <td style="border: 1px solid #000;">{{ $row->kas_tunai }}</td>
            <td style="border: 1px solid #000; font-weight: bold;">{{ $row->selisih }}</td>
            <td style="border: 1px solid #000; text-align: center; font-weight: bold;">{{ $row->status_rekon }}</td>
        </tr>
        @endforeach

        <tr style="font-weight: bold; background-color: #F2F2F2;">
            <td colspan="3" style="border: 1px solid #000; text-align: center;">GRAND TOTAL</td>
            <td style="border: 1px solid #000;"></td>
            <td style="border: 1px solid #000;"></td>
            <td style="border: 1px solid #000;"></td>
            <td style="border: 1px solid #000;"></td>
            <td style="border: 1px solid #000;">{{ $grandTotal->total_sp2d }}</td>
            <td style="border: 1px solid #000;"></td>
            <td style="border: 1px solid #000;"></td>
            <td style="border: 1px solid #000;"></td>
            <td style="border: 1px solid #000;"></td>
            <td style="border: 1px solid #000;">{{ $grandTotal->total_spj }}</td>
            <td style="border: 1px solid #000;"></td>
            <td style="border: 1px solid #000;"></td>
            <td style="border: 1px solid #000;"></td>
            <td style="border: 1px solid #000;"></td>
            <td style="border: 1px solid #000;"></td>
            <td style="border: 1px solid #000;">{{ $grandTotal->total_sts }}</td>
            <td style="border: 1px solid #000;">{{ $grandTotal->kas_sipd }}</td>
            <td style="border: 1px solid #000;">{{ $grandTotal->kas_bank }}</td>
            <td style="border: 1px solid #000;">{{ $grandTotal->kas_tunai }}</td>
            <td style="border: 1px solid #000;">{{ $grandTotal->selisih }}</td>
            <td style="border: 1px solid #000;"></td>
        </tr>
    </tbody>
</table>
