<?php

namespace App\Http\Controllers;

use Illuminate\Http\Request;
use App\Models\Bud;
use Inertia\Inertia;

class BudController extends Controller
{
    public function index()
    {
        $tahun = session('tahun', 2026);

        $list = Bud::where('tahun', $tahun)
            ->orderBy('nama', 'asc')
            ->get();

        return Inertia::render('master/bud/Index', [
            'title' => 'Data BUD',
            'list'  => $list
        ]);
    }

    public function create()
    {
        return Inertia::render('master/bud/Create', [
            'title' => 'Tambah BUD'
        ]);
    }

    public function store(Request $request)
    {
        $request->validate([
            'tahun'   => 'required|numeric',
            'nama'    => 'required|string|max:255',
            'nip'     => 'required|string|max:20|unique:tabel_bud,nip',
            'jabatan' => 'nullable|string|max:100',
        ], [
            'nip.unique' => 'NIP sudah terdaftar di database.',
            'nip.required' => 'NIP wajib diisi.',
            'nama.required' => 'Nama wajib diisi.'
        ]);

        Bud::create([
            'tahun'   => $request->tahun,
            'nama'    => $request->nama,
            'nip'     => $request->nip,
            'jabatan' => $request->jabatan,
        ]);

        return redirect()->route('bud.index')->with('success', 'Data BUD berhasil ditambahkan!');
    }

    public function edit($id)
    {
        $bud = Bud::findOrFail($id);

        return Inertia::render('master/bud/Edit', [
            'title' => 'Edit BUD',
            'bud'   => $bud
        ]);
    }

    public function update(Request $request, $id)
    {
        $bud = Bud::findOrFail($id);

        $request->validate([
            'tahun'   => 'required|numeric',
            'nama'    => 'required|string|max:255',
            'nip'     => 'required|string|max:20|unique:tabel_bud,nip,' . $id,
            'jabatan' => 'nullable|string|max:100',
        ], [
            'nip.unique' => 'NIP sudah digunakan oleh pegawai lain.',
            'nip.required' => 'NIP wajib diisi.',
            'nama.required' => 'Nama wajib diisi.'
        ]);

        $bud->update([
            'tahun'   => $request->tahun,
            'nama'    => $request->nama,
            'nip'     => $request->nip,
            'jabatan' => $request->jabatan,
        ]);

        return redirect()->route('bud.index')->with('success', 'Data BUD berhasil diperbarui!');
    }

    public function destroy($id)
    {
        $bud = Bud::findOrFail($id);
        $bud->delete();

        return redirect()->route('bud.index')->with('success', 'Data BUD berhasil dihapus!');
    }
}