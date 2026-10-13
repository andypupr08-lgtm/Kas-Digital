import React from 'react';
import { 
  CheckCircle2, 
  ArrowRight, 
  FileCode, 
  Globe, 
  ShieldCheck, 
  HelpCircle, 
  Zap, 
  ExternalLink,
  ChevronRight
} from 'lucide-react';

export const DeployGuide: React.FC = () => {
  const steps = [
    {
      step: '1',
      title: 'Buat Google Spreadsheet Baru',
      desc: 'Buka browser dan kunjungi https://sheets.new atau buat spreadsheet baru di Google Drive Anda. Beri nama file misalnya: "Buku Kas RT 05" atau "Kas Keuangan Organisasi".'
    },
    {
      step: '2',
      title: 'Buka Google Apps Script Editor',
      desc: 'Di menu atas Google Spreadsheet, klik menu: "Ekstensi" (Extensions) ➔ pilih "Apps Script". Tab editor Google Apps Script akan terbuka di browser Anda.'
    },
    {
      step: '3',
      title: 'Buat & Salin 4 File Script',
      desc: 'Di panel sisi kiri editor Apps Script (Files / File):',
      substeps: [
        'Buka file "Code.gs", hapus isinya, dan tempelkan seluruh isi dari tab Kode Apps Script (Code.gs).',
        'Klik tombol tanda tambah (+) di samping "Files" ➔ pilih "HTML" ➔ beri nama "Index" ➔ tempelkan kode Index.html.',
        'Klik tanda tambah (+) lagi ➔ pilih "HTML" ➔ beri nama "Stylesheet" ➔ tempelkan kode Stylesheet.html.',
        'Klik tanda tambah (+) lagi ➔ pilih "HTML" ➔ beri nama "JavaScript" ➔ tempelkan kode JavaScript.html.',
        'Klik ikon disket 💾 (Save project / Simpan) atau tekan Ctrl+S.'
      ]
    },
    {
      step: '4',
      title: 'Jalankan Inisialisasi Sheet Awal',
      desc: 'Di bar atas editor Apps Script, pada dropdown fungsi pilih "setupInitialSheet", lalu klik tombol "Run" (Jalankan). Saat muncul dialog otorisasi "Authorization Required", klik "Review Permissions", pilih akun Google Anda, klik "Advanced" (Lanjutan), lalu klik "Go to ... (unsafe)" dan izinkan (Allow). Sheet "Transaksi" dengan header warna gelap akan otomatis terbuat di spreadsheet.'
    },
    {
      step: '5',
      title: 'Deploy sebagai Web App',
      desc: 'Untuk mendapatkan link antarmuka web yang bisa dibuka di HP atau laptop:',
      substeps: [
        'Klik tombol biru "Deploy" (Terapkan) di pojok kanan atas ➔ pilih "New deployment" (Penerapan baru).',
        'Klik ikon gerigi ⚙️ di samping "Select type" ➔ pilih "Web app".',
        'Isi Description: "Web App Kas v1".',
        'Pilih Execute as: "Me (email Anda)".',
        'Pilih Who has access: "Anyone" (Siapa saja) atau "Anyone with Google Account".',
        'Klik tombol "Deploy". Salin Web App URL yang dihasilkan!'
      ]
    },
    {
      step: '6',
      title: 'Akses Langsung dari Menu Spreadsheet',
      desc: 'Buka kembali tab Google Sheets Anda dan muat ulang (refresh) halaman. Menu kustom baru bernama "📊 Buku Kas" akan muncul di deretan menu atas dengan opsi: "🚀 Buka Web App", "📋 Buka Sidebar Kas", dan "🔄 Hitung Ulang Saldo Berjalan".'
    }
  ];

  return (
    <div className="space-y-6 max-w-4xl mx-auto">
      
      {/* Header Banner */}
      <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-xs space-y-3">
        <div className="flex items-center gap-2 text-emerald-700">
          <Zap className="w-5 h-5" />
          <span className="text-xs font-bold uppercase tracking-wider">Panduan Lengkap (Bahasa Indonesia)</span>
        </div>
        <h2 className="text-xl sm:text-2xl font-bold text-slate-900">
          Langkah Mudah Pasang & Deploy ke Google Spreadsheet
        </h2>
        <p className="text-xs sm:text-sm text-slate-600 leading-relaxed">
          Ikuti 6 langkah mudah berikut untuk menjalankan sistem kas ini di akun Google Anda sendiri tanpa biaya hosting dan tanpa server terpisah.
        </p>
      </div>

      {/* Step by Step Cards */}
      <div className="space-y-4">
        {steps.map((s) => (
          <div key={s.step} className="bg-white p-5 sm:p-6 rounded-2xl border border-slate-200/80 shadow-xs space-y-3">
            <div className="flex items-start gap-4">
              <div className="w-9 h-9 rounded-xl bg-emerald-600 text-white font-bold flex items-center justify-center flex-shrink-0 text-sm shadow-xs">
                {s.step}
              </div>
              <div className="space-y-2 flex-1">
                <h3 className="text-base font-bold text-slate-900">
                  {s.title}
                </h3>
                <p className="text-xs sm:text-sm text-slate-600 leading-relaxed">
                  {s.desc}
                </p>

                {s.substeps && (
                  <ul className="space-y-2 pt-2 text-xs sm:text-sm text-slate-700">
                    {s.substeps.map((sub, idx) => (
                      <li key={idx} className="flex items-start gap-2">
                        <ChevronRight className="w-4 h-4 text-emerald-600 flex-shrink-0 mt-0.5" />
                        <span>{sub}</span>
                      </li>
                    ))}
                  </ul>
                )}
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* FAQ & Troubleshooting Box */}
      <div className="bg-slate-900 text-slate-200 p-6 rounded-2xl border border-slate-800 space-y-4">
        <div className="flex items-center gap-2 text-emerald-400">
          <HelpCircle className="w-5 h-5" />
          <h3 className="text-base font-bold text-white">Tips & Pertanyaan Umum (FAQ)</h3>
        </div>

        <div className="space-y-3 text-xs sm:text-sm text-slate-300">
          <div className="p-3.5 rounded-xl bg-slate-800/80 border border-slate-700">
            <h4 className="font-bold text-white mb-1">Q: Mengapa muncul peringatan "Google hasn't verified this app" saat otorisasi?</h4>
            <p className="text-slate-300 text-xs">
              Hal ini wajar karena script dibuat oleh Anda sendiri di akun Anda. Klik tombol <strong>Advanced</strong> (Lanjutan) lalu klik <strong>Go to Buku Kas (unsafe)</strong> untuk memberikan izin pada script Anda sendiri membaca/menulis spreadsheet tersebut.
            </p>
          </div>

          <div className="p-3.5 rounded-xl bg-slate-800/80 border border-slate-700">
            <h4 className="font-bold text-white mb-1">Q: Bagaimana jika ada baris transaksi yang dihapus langsung di Sheet?</h4>
            <p className="text-slate-300 text-xs">
              Cukup buka menu spreadsheet <strong>📊 Buku Kas ➔ 🔄 Hitung Ulang Saldo Berjalan</strong>. Apps Script akan memproses seluruh baris secara batch dan memformat ulang saldo berjalan dengan benar.
            </p>
          </div>

          <div className="p-3.5 rounded-xl bg-slate-800/80 border border-slate-700">
            <h4 className="font-bold text-white mb-1">Q: Apakah Web App bisa dibuka di smartphone warga / pengurus?</h4>
            <p className="text-slate-300 text-xs">
              Ya! URL Web App yang Anda dapatkan saat Deploy responsif dan bisa langsung dibagikan atau disimpan sebagai bookmark / shortcut di layar utama HP (Add to Home Screen).
            </p>
          </div>
        </div>
      </div>

    </div>
  );
};
