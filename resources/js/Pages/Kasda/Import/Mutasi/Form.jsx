// import React from 'react';
// import { Head, Link, useForm, usePage } from '@inertiajs/react';
// import AuthenticatedLayout from '@/layouts/AuthenticatedLayout';

// export default function Form({ title }) {
//     const { flash } = usePage().props;
//     const { data, setData, post, processing, errors } = useForm({
//         file_mutasi: null,
//     });

//     const handleSubmitPreview = (e) => {
//         e.preventDefault();
//         post(route('kasda.import.mutasi.preview'));
//     };

//     return (
//         <AuthenticatedLayout header={<span>{title}</span>}>
//             <Head title={title} />

//             <div className="max-w-2xl mx-auto space-y-5">
                
//                 {/* ─── NOTIFIKASI ERROR NAMA FILE ─── */}
//                 {flash?.error && (
//                     <div className="flex items-start gap-2.5 bg-rose-50 border border-rose-200 text-rose-700 px-4 py-3.5 rounded-xl text-xs font-medium shadow-sm">
//                         <span className="flex-shrink-0 text-sm">⚠️</span>
//                         <div className="leading-relaxed">{flash.error}</div>
//                     </div>
//                 )}

//                 {/* ─── CARD FORM UPLOAD ─── */}
//                 <div className="bg-white rounded-xl shadow-sm border border-slate-200 overflow-hidden">
                    
//                     {/* Header Card */}
//                     <div className="border-b border-slate-100 px-6 py-5">
//                         <h1 className="text-sm font-semibold tracking-tight text-gray-900">
//                             Upload File Mutasi Rekening
//                         </h1>
//                         <p className="mt-1 text-xs text-gray-500">
//                             Unggah data koran bank Kas Daerah untuk pencocokan saldo harian dan bulanan
//                         </p>
//                     </div>

//                     {/* Form Utama */}
//                     <form onSubmit={handleSubmitPreview} className="p-6 space-y-5">
//                         <div>
//                             <label className="block text-xs font-medium text-gray-400 uppercase tracking-wider mb-2">
//                                 File Excel Mutasi Rekening
//                             </label>
                            
//                             {/* Area Upload File (Dropzone Style) */}
//                             <div className="group mt-1 flex justify-center px-6 pt-6 pb-7 border-2 border-slate-200 border-dashed rounded-xl hover:border-blue-400 hover:bg-slate-50/50 transition-all duration-200 cursor-pointer relative">
//                                 <div className="space-y-2 text-center">
//                                     <div className="mx-auto h-10 w-10 text-slate-400 group-hover:text-blue-500 transition-colors flex items-center justify-center text-3xl">
//                                         📊
//                                     </div>
//                                     <div className="flex text-xs text-slate-600 justify-center">
//                                         <label htmlFor="file_mutasi" className="relative cursor-pointer font-semibold text-blue-600 hover:text-blue-700 focus-within:outline-none">
//                                             <span>Pilih berkas excel</span>
//                                             <input 
//                                                 id="file_mutasi" 
//                                                 name="file_mutasi" 
//                                                 type="file" 
//                                                 accept=".xls,.xlsx"
//                                                 className="sr-only" 
//                                                 onChange={e => setData('file_mutasi', e.target.files[0])}
//                                                 required
//                                             />
//                                         </label>
//                                     </div>
//                                     <p className="text-[11px] text-slate-400">Format yang didukung hanya dokumen .xls / .xlsx</p>
//                                 </div>
//                             </div>
                            
//                             {/* State: Menampilkan nama file terpilih */}
//                             {data.file_mutasi && (
//                                 <div className="mt-4 text-xs bg-blue-50/60 text-blue-700 font-medium px-3.5 py-2.5 rounded-lg border border-blue-100 flex items-center gap-2">
//                                     <span className="text-sm">📎</span> 
//                                     <span>Terpilih: <strong className="font-semibold text-blue-900">{data.file_mutasi.name}</strong></span>
//                                 </div>
//                             )}
                            
//                             {errors.file_mutasi && (
//                                 <p className="text-red-500 text-[10px] mt-1.5 font-medium">{errors.file_mutasi}</p>
//                             )}
//                         </div>

//                         {/* ─── TOMBOL AKSI (BOTTOM BAR) ─── */}
//                         <div className="flex justify-between items-center border-t border-slate-100 pt-5 mt-2">
//                             <Link 
//                                 href={route('kasda.import.index')} 
//                                 className="inline-flex items-center justify-center px-3.5 py-2 rounded-lg text-xs font-medium text-slate-600 bg-slate-100 hover:bg-slate-200 transition-colors shadow-sm"
//                             >
//                                 &larr; Kembali
//                             </Link>

//                             <button
//                                 type="submit"
//                                 disabled={processing}
//                                 className="inline-flex items-center justify-center px-4 py-2 rounded-lg text-xs font-semibold text-white bg-blue-600 hover:bg-blue-700 disabled:bg-blue-400 transition-colors shadow-sm"
//                             >
//                                 {processing ? 'Membaca Excel...' : 'Upload & Preview'}
//                             </button>
//                         </div>
//                     </form>

//                 </div>
//             </div>
//         </AuthenticatedLayout>
//     );
// }