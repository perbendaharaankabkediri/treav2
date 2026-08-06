<?php

namespace App\Http\Controllers;

use App\Models\Bendahara;
use App\Models\JenisBendahara;
use App\Models\Skpd;
use App\Support\SkpdAccess;
use Illuminate\Http\Request;
use Inertia\Inertia;

class BendaharaController extends Controller
{
    public function index()
    {
        $tahun = session('tahun');

        $query = Bendahara::with([
            'skpd' => function ($q) use ($tahun) {
                $q->where('tahun', $tahun);
            },
            'jenis',
        ])
            ->where('tahun', $tahun);

        $list = SkpdAccess::apply($query, request()->user())->get();

        return Inertia::render('master/bendahara/Index', [
            'title' => 'Data Bendahara',
            'list' => $list,
        ]);
    }

    public function create()
    {
        $tahun = session('tahun');

        $listSkpd = Skpd::where('tahun', $tahun)->get();
        $jenis = JenisBendahara::all();

        return Inertia::render('master/bendahara/Create', [
            'title' => 'Tambah Bendahara',
            'listSkpd' => $listSkpd,
            'jenis' => $jenis,
        ]);
    }

    public function store(Request $request)
    {
        $data = $request->validate([
            'kode_skpd' => 'required',
            'nama' => 'required',
            'nip' => 'required|numeric',
            'jenis_bendahara' => 'required',
            'bidang_bendahara' => 'nullable',
        ]);

        $tahun = session('tahun');

        // Rule: BP (001) Hanya boleh 1 per SKPD per Tahun
        if ($data['jenis_bendahara'] === '001') {
            $exists = Bendahara::where('tahun', $tahun)
                ->where('kode_skpd', $data['kode_skpd'])
                ->where('jenis_bendahara', '001')
                ->exists();

            if ($exists) {
                return back()->withErrors([
                    'jenis_bendahara' => 'Bendahara Pengeluaran (BP) sudah terdaftar untuk SKPD ini.',
                ]);
            }
        }

        // Rule: BPP (002) Wajib mengisi bidang_bendahara
        if ($data['jenis_bendahara'] === '002' && empty($data['bidang_bendahara'])) {
            return back()->withErrors([
                'bidang_bendahara' => 'Bidang wajib diisi untuk Bendahara Pengeluaran Pembantu (BPP).',
            ]);
        }

        $data['tahun'] = $tahun;
        Bendahara::create($data);

        return redirect()->route('bendahara.index')
            ->with('success', 'Data bendahara berhasil disimpan.');
    }

    public function edit($id)
    {
        $tahun = session('tahun');

        $bendahara = Bendahara::where('tahun', $tahun)->findOrFail($id);
        $listSkpd = Skpd::where('tahun', $tahun)->get();
        $jenis = JenisBendahara::all();

        return Inertia::render('master/bendahara/Edit', [
            'title' => 'Edit Bendahara',
            'bendahara' => $bendahara,
            'listSkpd' => $listSkpd,
            'jenis' => $jenis,
        ]);
    }

    public function update(Request $request, $id)
    {
        $tahun = session('tahun');
        $bendahara = Bendahara::where('tahun', $tahun)->findOrFail($id);

        $data = $request->validate([
            'kode_skpd' => 'required',
            'nama' => 'required',
            'nip' => 'required|numeric',
            'jenis_bendahara' => 'required',
            'bidang_bendahara' => 'nullable',
        ]);

        // Cek BP Duplikat (Kecuali milik dia sendiri)
        if ($data['jenis_bendahara'] === '001') {
            $exists = Bendahara::where('tahun', $tahun)
                ->where('kode_skpd', $data['kode_skpd'])
                ->where('jenis_bendahara', '001')
                ->where('id', '!=', $bendahara->id)
                ->exists();

            if ($exists) {
                return back()->withErrors([
                    'jenis_bendahara' => 'Bendahara Pengeluaran (BP) sudah terdaftar untuk SKPD ini.',
                ]);
            }
        }

        // Cek Isian Bidang untuk BPP
        if ($data['jenis_bendahara'] === '002' && empty($data['bidang_bendahara'])) {
            return back()->withErrors([
                'bidang_bendahara' => 'Bidang wajib diisi untuk Bendahara Pengeluaran Pembantu (BPP).',
            ]);
        }

        $bendahara->update($data);

        return redirect()->route('bendahara.index')
            ->with('success', 'Data bendahara berhasil diperbarui.');
    }

    public function destroy($id)
    {
        $tahun = session('tahun');
        $bendahara = Bendahara::where('tahun', $tahun)->findOrFail($id);
        $bendahara->delete();

        return redirect()->route('bendahara.index')
            ->with('success', 'Data bendahara berhasil dihapus.');
    }
}
