<?php

namespace App\Http\Controllers;

use Illuminate\Http\Request;
use App\Models\Skpd;
use Inertia\Inertia; // 1. Wajib import class Inertia

class SkpdController extends Controller
{
    public function index()
    {
        // Jalankan logika session tahun seperti biasa
        $tahun = session('tahun'); 

        $list = Skpd::where('tahun', $tahun)->get();

        // 2. Ubah return view menjadi Inertia::render
        return Inertia::render('master/skpd/Index', [
            'title' => 'Data SKPD',
            'list' => $list
        ]);
    }
}