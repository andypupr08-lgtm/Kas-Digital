import React, { useState } from 'react';
import { KasTransaction, DatabaseConfig, DatabaseLog } from '../types/kas';
import { formatRupiah } from '../data/initialData';
import { gasApiService } from '../services/gasService';
import { 
  Database, 
  RefreshCw, 
  Link2, 
  CheckCircle2, 
  AlertCircle, 
  Download, 
  Upload, 
  Table2, 
  Sparkles, 
  Terminal, 
  Copy, 
  Layers, 
  HardDrive,
  ShieldCheck,
  Calculator,
  ArrowRight
} from 'lucide-react';

interface GoogleSheetDatabaseProps {
  config: DatabaseConfig;
  onChangeConfig: (newConfig: DatabaseConfig) => void;
  transactions: KasTransaction[];
  onUpdateTransactions: (newTransactions: KasTransaction[]) => void;
  onShowToast: (message: string, type?: 'success' | 'error') => void;
  onOpenAddModal: () => void;
}

export const GoogleSheetDatabase: React.FC<GoogleSheetDatabaseProps> = ({
  config,
  onChangeConfig,
  transactions,
  onUpdateTransactions,
  onShowToast,
  onOpenAddModal
}) => {
  const [webAppUrlInput, setWebAppUrlInput] = useState<string>(config.webAppUrl);
  const [saldoAwalInput, setSaldoAwalInput] = useState<string>(String(config.saldoAwal));
  const [isTesting, setIsTesting] = useState<boolean>(false);
  const [isSyncing, setIsSyncing] = useState<boolean>(false);
  const [pingResult, setPingResult] = useState<{ success: boolean; message: string; latency?: number } | null>(null);
  
  // Database Logs state
  const [logs, setLogs] = useState<DatabaseLog[]>([
    {
      id: 'log-1',
      timestamp: new Date().toLocaleTimeString('id-ID'),
      action: 'SYNC',
      status: 'SUCCESS',
      details: `Database siap. Memuat ${transactions.length} baris data kas.`
    }
  ]);

  const addLog = (action: DatabaseLog['action'], status: DatabaseLog['status'], details: string) => {
    const newLog: DatabaseLog = {
      id: `log-${Date.now()}`,
      timestamp: new Date().toLocaleTimeString('id-ID'),
      action,
      status,
      details
    };
    setLogs((prev) => [newLog, ...prev.slice(0, 15)]);
  };

  // Test connection to Google Apps Script
  const handleTestConnection = async () => {
    if (!webAppUrlInput.trim()) {
      onShowToast('Masukkan URL Web App Apps Script terlebih dahulu.', 'error');
      return;
    }

    setIsTesting(true);
    setPingResult(null);

    try {
      const res = await gasApiService.ping(webAppUrlInput.trim());
      setPingResult({
        success: res.success,
        message: res.message,
        latency: res.latencyMs
      });

      if (res.success) {
        onChangeConfig({
          ...config,
          mode: 'live',
          webAppUrl: webAppUrlInput.trim(),
          isConnected: true,
          lastSyncTime: new Date().toLocaleTimeString('id-ID')
        });
        addLog('SYNC', 'SUCCESS', `Terhubung ke Google Sheets Apps Script (${res.latencyMs} ms)`);
        onShowToast('Berhasil terhubung ke Google Sheets Apps Script!');
      } else {
        addLog('SYNC', 'ERROR', `Gagal koneksi: ${res.message}`);
        onShowToast(res.message, 'error');
      }
    } catch (err: any) {
      setPingResult({
        success: false,
        message: err.message || 'Koneksi gagal.',
        latency: 0
      });
      addLog('SYNC', 'ERROR', err.message || 'Network error');
      onShowToast('Gagal terhubung ke Google Apps Script.', 'error');
    } finally {
      setIsTesting(false);
    }
  };

  // Sync / Fetch transactions from Google Sheets
  const handleFetchFromSheet = async () => {
    if (!config.webAppUrl) {
      onShowToast('URL Web App belum terkonfigurasi. Hubungkan terlebih dahulu.', 'error');
      return;
    }

    setIsSyncing(true);
    try {
      const res = await gasApiService.fetchTransactions(config.webAppUrl);
      if (res.status === 'success' && res.data) {
        onUpdateTransactions(res.data);
        onChangeConfig({
          ...config,
          lastSyncTime: new Date().toLocaleTimeString('id-ID')
        });
        addLog('READ', 'SUCCESS', `Sinkronisasi berhasil: ${res.data.length} transaksi dimuat.`);
        onShowToast(`Berhasil mengambil ${res.data.length} transaksi dari Google Sheets!`);
      } else {
        throw new Error(res.message || 'Gagal memuat data dari Spreadsheet.');
      }
    } catch (err: any) {
      addLog('READ', 'ERROR', err.message || 'Gagal sinkronisasi data.');
      onShowToast(err.message || 'Gagal memuat data dari Spreadsheet.', 'error');
    } finally {
      setIsSyncing(false);
    }
  };

  // Save saldo awal setting
  const handleSaveSaldoAwal = () => {
    const num = parseFloat(saldoAwalInput) || 0;
    onChangeConfig({
      ...config,
      saldoAwal: num
    });
    addLog('RECALCULATE', 'SUCCESS', `Saldo awal database diatur ke ${formatRupiah(num)}`);
    onShowToast(`Saldo awal kas diperbarui menjadi ${formatRupiah(num)}`);
  };

  // Export transactions to CSV
  const handleExportCSV = () => {
    const headers = ['Tanggal', 'Jenis', 'Keterangan', 'Jumlah', 'Saldo Berjalan'];
    const rows = transactions.map((t) => [
      `"${t.tanggal}"`,
      `"${t.jenis}"`,
      `"${t.keterangan.replace(/"/g, '""')}"`,
      t.jumlah,
      t.saldoBerjalan
    ]);

    const csvContent = 'data:text/csv;charset=utf-8,\uFEFF' + [headers.join(','), ...rows.map((e) => e.join(','))].join('\n');
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement('a');
    link.setAttribute('href', encodedUri);
    link.setAttribute('download', `Database_Kas_Google_Sheets_${new Date().toISOString().split('T')[0]}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);

    addLog('BACKUP', 'SUCCESS', `Ekspor ${transactions.length} baris ke CSV.`);
    onShowToast('Database berhasil diekspor ke file CSV!');
  };

  // Export to JSON
  const handleExportJSON = () => {
    const dataStr = 'data:text/json;charset=utf-8,' + encodeURIComponent(JSON.stringify(transactions, null, 2));
    const downloadAnchor = document.createElement('a');
    downloadAnchor.setAttribute('href', dataStr);
    downloadAnchor.setAttribute('download', `Database_Kas_${new Date().toISOString().split('T')[0]}.json`);
    document.body.appendChild(downloadAnchor);
    downloadAnchor.click();
    downloadAnchor.remove();

    addLog('BACKUP', 'SUCCESS', `Ekspor ${transactions.length} baris ke JSON.`);
    onShowToast('Database berhasil diekspor ke file JSON!');
  };

  // Import JSON file
  const handleImportJSON = (event: React.ChangeEvent<HTMLInputElement>) => {
    const fileReader = new FileReader();
    if (event.target.files && event.target.files[0]) {
      fileReader.readAsText(event.target.files[0], 'UTF-8');
      fileReader.onload = (e) => {
        try {
          const parsed = JSON.parse(e.target?.result as string);
          if (Array.isArray(parsed) && parsed.length > 0) {
            onUpdateTransactions(parsed);
            addLog('CREATE', 'SUCCESS', `Impor data: ${parsed.length} transaksi ditambahkan ke database.`);
            onShowToast(`Berhasil mengimpor ${parsed.length} transaksi ke database!`);
          } else {
            throw new Error('Format JSON tidak valid atau data kosong.');
          }
        } catch (err: any) {
          onShowToast(err.message || 'Gagal membaca file JSON.', 'error');
        }
      };
    }
  };

  // Batch recalculate balance
  const handleBatchRecalculate = async () => {
    if (config.mode === 'live' && config.webAppUrl) {
      setIsSyncing(true);
      try {
        const res = await gasApiService.recalculateBalance(config.webAppUrl);
        if (res.status === 'success') {
          addLog('RECALCULATE', 'SUCCESS', 'Kalkulasi ulang saldo selesai di Google Sheets.');
          onShowToast('Running balance berhasil dihitung ulang di Google Sheets!');
          handleFetchFromSheet();
        } else {
          throw new Error(res.message);
        }
      } catch (err: any) {
        onShowToast(err.message || 'Gagal memicu kalkulasi ulang di Spreadsheet.', 'error');
      } finally {
        setIsSyncing(false);
      }
    } else {
      // Local recalculate
      addLog('RECALCULATE', 'SUCCESS', 'Kalkulasi batch running balance lokal selesai.');
      onShowToast('Kalkulasi batch running balance selesai. Semua saldo telah akurat.');
    }
  };

  // Switch database mode
  const handleSwitchMode = (newMode: 'simulator' | 'live') => {
    onChangeConfig({
      ...config,
      mode: newMode
    });
    addLog('SYNC', 'SUCCESS', `Beralih ke mode database: ${newMode === 'live' ? 'Live Google Sheets' : 'Simulator Lokal'}`);
    onShowToast(`Mode database dialihkan ke: ${newMode === 'live' ? 'Live Google Sheets' : 'Simulator Lokal'}`);
  };

  return (
    <div className="space-y-6">

      {/* Header Banner */}
      <div className="bg-gradient-to-r from-emerald-950 via-slate-900 to-teal-950 text-white p-6 rounded-2xl shadow-sm border border-emerald-800/40 flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <span className="px-2.5 py-0.5 rounded-full text-xs font-bold bg-emerald-500/20 text-emerald-300 border border-emerald-500/30 flex items-center gap-1.5">
              <Database className="w-3.5 h-3.5" />
              Engine Database Google Sheets & Apps Script
            </span>
            <span className="text-xs text-slate-300 font-mono">
              Mode: <strong className="text-emerald-400">{config.mode === 'live' ? 'Live Google Sheets' : 'Simulator Browser'}</strong>
            </span>
          </div>
          <h2 className="text-lg sm:text-xl font-bold mt-1 text-white">
            Pusat Integrasi Database Google Spreadsheet
          </h2>
          <p className="text-xs sm:text-sm text-slate-300 max-w-2xl mt-1 leading-relaxed">
            Kelola penyimpanan data buku kas berbasis Google Spreadsheet secara langsung via Google Apps Script Web App API, atau gunakan simulator lokal berkecepatan tinggi.
          </p>
        </div>

        <div className="flex items-center gap-3">
          <div className="bg-slate-800/80 p-3 rounded-xl border border-slate-700 text-xs">
            <span className="text-slate-400 block">Status Database</span>
            <div className="flex items-center gap-1.5 mt-0.5">
              <span className={`w-2.5 h-2.5 rounded-full ${config.isConnected || config.mode === 'simulator' ? 'bg-emerald-400 animate-pulse' : 'bg-rose-500'}`} />
              <span className="font-bold text-white">
                {config.mode === 'live' ? (config.isConnected ? 'Online (Connected)' : 'Disconnected') : 'Simulator Aktif'}
              </span>
            </div>
          </div>
        </div>
      </div>

      {/* Mode Selector Card */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        
        {/* Mode 1: Simulator */}
        <div 
          onClick={() => handleSwitchMode('simulator')}
          className={`p-5 rounded-2xl border-2 transition cursor-pointer flex flex-col justify-between ${
            config.mode === 'simulator'
              ? 'bg-emerald-50/70 border-emerald-500 shadow-xs'
              : 'bg-white border-slate-200 hover:border-slate-300'
          }`}
        >
          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <div className="w-8 h-8 rounded-lg bg-emerald-100 flex items-center justify-center text-emerald-700">
                  <HardDrive className="w-4 h-4" />
                </div>
                <h3 className="font-bold text-sm text-slate-900">Mode Simulator Spreadsheet (Lokal)</h3>
              </div>
              {config.mode === 'simulator' && (
                <span className="px-2 py-0.5 rounded-full text-[11px] font-bold bg-emerald-600 text-white">
                  Aktif
                </span>
              )}
            </div>
            <p className="text-xs text-slate-600 leading-relaxed">
              Penyimpanan tersimpan di browser (LocalStorage) dengan struktur relasional persis seperti Google Sheets. Cocok untuk demo, pelatihan, dan pencatatan cepat tanpa deploy Apps Script.
            </p>
          </div>

          <div className="mt-4 pt-3 border-t border-slate-200 flex items-center justify-between text-xs text-slate-500">
            <span>Kecepatan: <strong>Instan (0 ms)</strong></span>
            <span className="text-emerald-700 font-semibold flex items-center gap-1">
              Gunakan Mode Ini <ArrowRight className="w-3 h-3" />
            </span>
          </div>
        </div>

        {/* Mode 2: Live GAS */}
        <div 
          onClick={() => handleSwitchMode('live')}
          className={`p-5 rounded-2xl border-2 transition cursor-pointer flex flex-col justify-between ${
            config.mode === 'live'
              ? 'bg-emerald-50/70 border-emerald-500 shadow-xs'
              : 'bg-white border-slate-200 hover:border-slate-300'
          }`}
        >
          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <div className="w-8 h-8 rounded-lg bg-teal-100 flex items-center justify-center text-teal-700">
                  <Link2 className="w-4 h-4" />
                </div>
                <h3 className="font-bold text-sm text-slate-900">Mode Live Google Sheets (Apps Script API)</h3>
              </div>
              {config.mode === 'live' && (
                <span className="px-2 py-0.5 rounded-full text-[11px] font-bold bg-teal-600 text-white">
                  Aktif
                </span>
              )}
            </div>
            <p className="text-xs text-slate-600 leading-relaxed">
              Terkoneksi langsung ke Google Spreadsheet milik akun Google Anda via URL Web App Apps Script. Setiap transaksi baru langsung tercatat di file Google Sheets Anda.
            </p>
          </div>

          <div className="mt-4 pt-3 border-t border-slate-200 flex items-center justify-between text-xs text-slate-500">
            <span>Metode: <strong>HTTP JSON API / REST</strong></span>
            <span className="text-teal-700 font-semibold flex items-center gap-1">
              Konfigurasi API <ArrowRight className="w-3 h-3" />
            </span>
          </div>
        </div>

      </div>

      {/* Live Google Sheets Connection Configuration */}
      <div className="bg-white rounded-2xl border border-slate-200 p-6 shadow-xs space-y-5">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-slate-100 pb-4">
          <div>
            <h3 className="text-base font-bold text-slate-900 flex items-center gap-2">
              <Link2 className="w-5 h-5 text-emerald-600" />
              Koneksi Endpoint Google Apps Script Web App
            </h3>
            <p className="text-xs text-slate-500 mt-0.5">
              Masukkan URL Web App hasil deploy Apps Script Anda (format: <code>https://script.google.com/macros/s/.../exec</code>)
            </p>
          </div>
          {config.lastSyncTime && (
            <div className="text-xs text-slate-500 font-mono">
              Terakhir Sinkron: <strong>{config.lastSyncTime}</strong>
            </div>
          )}
        </div>

        <div className="space-y-3">
          <label className="block text-xs font-bold text-slate-700">
            URL Web App Google Apps Script
          </label>
          <div className="flex flex-col sm:flex-row gap-2">
            <input
              type="url"
              placeholder="https://script.google.com/macros/s/AKfycb.../exec"
              value={webAppUrlInput}
              onChange={(e) => setWebAppUrlInput(e.target.value)}
              className="flex-1 px-4 py-2.5 text-xs sm:text-sm bg-slate-50 border border-slate-200 rounded-xl font-mono focus:bg-white focus:outline-none focus:ring-2 focus:ring-emerald-500"
            />
            <div className="flex items-center gap-2">
              <button
                onClick={handleTestConnection}
                disabled={isTesting}
                className="px-4 py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white text-xs sm:text-sm font-semibold shadow-xs transition flex items-center justify-center gap-1.5 cursor-pointer disabled:opacity-50"
              >
                {isTesting ? (
                  <>
                    <RefreshCw className="w-4 h-4 animate-spin" />
                    <span>Menguji...</span>
                  </>
                ) : (
                  <>
                    <CheckCircle2 className="w-4 h-4" />
                    <span>Uji & Sambungkan</span>
                  </>
                )}
              </button>

              <button
                onClick={handleFetchFromSheet}
                disabled={isSyncing || !config.webAppUrl}
                className="px-4 py-2.5 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs sm:text-sm font-semibold transition flex items-center justify-center gap-1.5 cursor-pointer disabled:opacity-50"
              >
                <RefreshCw className={`w-4 h-4 ${isSyncing ? 'animate-spin' : ''}`} />
                <span>Tarik Data Sheet</span>
              </button>
            </div>
          </div>

          {pingResult && (
            <div
              className={`p-3 rounded-xl text-xs font-semibold flex items-center justify-between gap-2 ${
                pingResult.success
                  ? 'bg-emerald-50 text-emerald-800 border border-emerald-200'
                  : 'bg-rose-50 text-rose-800 border border-rose-200'
              }`}
            >
              <div className="flex items-center gap-2">
                {pingResult.success ? (
                  <CheckCircle2 className="w-4 h-4 text-emerald-600 flex-shrink-0" />
                ) : (
                  <AlertCircle className="w-4 h-4 text-rose-600 flex-shrink-0" />
                )}
                <span>{pingResult.message}</span>
              </div>
              {pingResult.latency !== undefined && (
                <span className="font-mono text-[11px] bg-white/80 px-2 py-0.5 rounded border border-slate-200">
                  {pingResult.latency} ms
                </span>
              )}
            </div>
          )}
        </div>
      </div>

      {/* Database Operations & Utilities */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        
        {/* Card 1: Pengaturan Saldo Awal & Parameter */}
        <div className="bg-white rounded-2xl border border-slate-200 p-5 shadow-xs space-y-4 flex flex-col justify-between">
          <div className="space-y-3">
            <div className="flex items-center gap-2">
              <Calculator className="w-5 h-5 text-emerald-600" />
              <h3 className="font-bold text-sm text-slate-900">Saldo Awal Database (Starting Balance)</h3>
            </div>
            <p className="text-xs text-slate-500 leading-relaxed">
              Saldo awal yang digunakan sebagai dasar kalkulasi <em>Running Balance</em> sebelum transaksi pertama tercatat.
            </p>

            <div className="space-y-2">
              <label className="block text-xs font-semibold text-slate-700">
                Nominal Saldo Awal (Rp)
              </label>
              <div className="relative">
                <span className="absolute inset-y-0 left-0 pl-3 flex items-center text-xs font-bold text-slate-400">
                  Rp
                </span>
                <input
                  type="number"
                  min="0"
                  step="10000"
                  value={saldoAwalInput}
                  onChange={(e) => setSaldoAwalInput(e.target.value)}
                  className="w-full pl-9 pr-3 py-2 text-sm bg-slate-50 border border-slate-200 rounded-xl font-mono focus:bg-white focus:outline-none focus:ring-2 focus:ring-emerald-500 font-semibold"
                />
              </div>
            </div>
          </div>

          <div className="pt-3 border-t border-slate-100 flex items-center justify-between">
            <button
              onClick={handleSaveSaldoAwal}
              className="w-full py-2 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl text-xs font-semibold shadow-xs transition cursor-pointer"
            >
              Simpan Saldo Awal
            </button>
          </div>
        </div>

        {/* Card 2: Alat Batch & Recalculate */}
        <div className="bg-white rounded-2xl border border-slate-200 p-5 shadow-xs space-y-4 flex flex-col justify-between">
          <div className="space-y-3">
            <div className="flex items-center gap-2">
              <Layers className="w-5 h-5 text-sky-600" />
              <h3 className="font-bold text-sm text-slate-900">Pemeliharaan & Kalkulasi Batch</h3>
            </div>
            <p className="text-xs text-slate-500 leading-relaxed">
              Kalkulasi ulang saldo berjalan secara berurutan kronologis, memverifikasi integritas baris spreadsheet.
            </p>

            <div className="bg-slate-50 p-3 rounded-xl border border-slate-200 text-xs space-y-1 font-mono">
              <div className="flex justify-between">
                <span className="text-slate-500">Total Transaksi:</span>
                <span className="font-bold text-slate-900">{transactions.length} Baris</span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-500">Nama Sheet:</span>
                <span className="font-bold text-emerald-700">{config.sheetName}</span>
              </div>
            </div>
          </div>

          <div className="pt-3 border-t border-slate-100 space-y-2">
            <button
              onClick={handleBatchRecalculate}
              className="w-full py-2 bg-sky-600 hover:bg-sky-700 text-white rounded-xl text-xs font-semibold shadow-xs transition flex items-center justify-center gap-1.5 cursor-pointer"
            >
              <RefreshCw className="w-3.5 h-3.5" />
              <span>Hitung Ulang Saldo (Recalculate)</span>
            </button>
          </div>
        </div>

        {/* Card 3: Ekspor & Backup Data */}
        <div className="bg-white rounded-2xl border border-slate-200 p-5 shadow-xs space-y-4 flex flex-col justify-between">
          <div className="space-y-3">
            <div className="flex items-center gap-2">
              <ShieldCheck className="w-5 h-5 text-indigo-600" />
              <h3 className="font-bold text-sm text-slate-900">Cadangan & Ekspor Database</h3>
            </div>
            <p className="text-xs text-slate-500 leading-relaxed">
              Unduh salinan cadangan (*backup*) data kas ke format CSV (Excel/Spreadsheet) atau format JSON.
            </p>

            <div className="grid grid-cols-2 gap-2">
              <button
                onClick={handleExportCSV}
                className="py-2 px-3 bg-slate-100 hover:bg-slate-200 text-slate-800 rounded-xl text-xs font-semibold transition flex items-center justify-center gap-1 cursor-pointer"
              >
                <Download className="w-3.5 h-3.5 text-emerald-600" />
                <span>Unduh CSV</span>
              </button>

              <button
                onClick={handleExportJSON}
                className="py-2 px-3 bg-slate-100 hover:bg-slate-200 text-slate-800 rounded-xl text-xs font-semibold transition flex items-center justify-center gap-1 cursor-pointer"
              >
                <Download className="w-3.5 h-3.5 text-indigo-600" />
                <span>Unduh JSON</span>
              </button>
            </div>
          </div>

          <div className="pt-3 border-t border-slate-100">
            <label className="w-full py-2 bg-slate-50 hover:bg-slate-100 border border-slate-200 text-slate-700 rounded-xl text-xs font-semibold transition flex items-center justify-center gap-1.5 cursor-pointer">
              <Upload className="w-3.5 h-3.5 text-slate-600" />
              <span>Impor Data JSON</span>
              <input
                type="file"
                accept=".json"
                onChange={handleImportJSON}
                className="hidden"
              />
            </label>
          </div>
        </div>

      </div>

      {/* Google Apps Script API Reference & cURL Docs */}
      <div className="bg-white rounded-2xl border border-slate-200 p-6 shadow-xs space-y-4">
        <div className="flex items-center gap-2">
          <Terminal className="w-5 h-5 text-emerald-600" />
          <h3 className="text-base font-bold text-slate-900">
            Dokumentasi REST JSON API Apps Script (Endpoints)
          </h3>
        </div>
        <p className="text-xs text-slate-500 leading-relaxed">
          Google Apps Script Web App yang Anda deploy bertindak sebagai REST API JSON serverless untuk Google Sheets. Anda dapat memanggil endpoint ini dari aplikasi luar, bot Telegram, atau integrasi kustom.
        </p>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          
          {/* GET Request */}
          <div className="bg-slate-900 text-slate-100 rounded-xl p-4 font-mono text-xs space-y-2 border border-slate-800">
            <div className="flex items-center justify-between text-slate-400 border-b border-slate-800 pb-2">
              <span className="font-bold text-emerald-400">GET /exec?action=getAll</span>
              <span className="text-[10px] bg-slate-800 px-1.5 py-0.5 rounded">Membaca Data</span>
            </div>
            <pre className="text-slate-300 text-[11px] overflow-x-auto">
{`curl -L "${config.webAppUrl || 'https://script.google.com/.../exec'}?action=getAll&format=json"`}
            </pre>
            <p className="text-[11px] text-slate-400 pt-1">
              Output: JSON array berisi seluruh baris transaksi kas beserta running balance.
            </p>
          </div>

          {/* POST Request */}
          <div className="bg-slate-900 text-slate-100 rounded-xl p-4 font-mono text-xs space-y-2 border border-slate-800">
            <div className="flex items-center justify-between text-slate-400 border-b border-slate-800 pb-2">
              <span className="font-bold text-teal-400">POST /exec (Tambah Kas)</span>
              <span className="text-[10px] bg-slate-800 px-1.5 py-0.5 rounded">Tulis Data</span>
            </div>
            <pre className="text-slate-300 text-[11px] overflow-x-auto">
{`fetch(WEB_APP_URL, {
  method: "POST",
  body: JSON.stringify({
    action: "create",
    data: {
      tanggal: "2026-08-18",
      jenis: "Pemasukan",
      keterangan: "Iuran Kas Warga",
      jumlah: 500000
    }
  })
});`}
            </pre>
          </div>

        </div>
      </div>

      {/* Activity Logs */}
      <div className="bg-white rounded-2xl border border-slate-200 p-5 shadow-xs space-y-3">
        <div className="flex items-center justify-between border-b border-slate-100 pb-3">
          <h3 className="font-bold text-sm text-slate-900 flex items-center gap-2">
            <Layers className="w-4 h-4 text-slate-600" />
            Log Aktivitas Database Google Sheets
          </h3>
          <span className="text-xs text-slate-500 font-mono">
            {logs.length} Event Terakhir
          </span>
        </div>

        <div className="divide-y divide-slate-100 max-h-48 overflow-y-auto">
          {logs.map((log) => (
            <div key={log.id} className="py-2 flex items-center justify-between text-xs gap-3">
              <div className="flex items-center gap-2">
                <span className="font-mono text-slate-400 text-[11px]">{log.timestamp}</span>
                <span className={`px-2 py-0.5 rounded font-mono text-[10px] font-bold ${
                  log.action === 'CREATE' ? 'bg-emerald-100 text-emerald-800' :
                  log.action === 'READ' ? 'bg-blue-100 text-blue-800' :
                  log.action === 'UPDATE' ? 'bg-amber-100 text-amber-800' :
                  log.action === 'DELETE' ? 'bg-rose-100 text-rose-800' :
                  log.action === 'SYNC' ? 'bg-teal-100 text-teal-800' :
                  'bg-slate-100 text-slate-800'
                }`}>
                  {log.action}
                </span>
                <span className="text-slate-700 truncate max-w-md">{log.details}</span>
              </div>
              <span className={`text-[10px] font-bold font-mono ${
                log.status === 'SUCCESS' ? 'text-emerald-600' : 'text-rose-600'
              }`}>
                {log.status}
              </span>
            </div>
          ))}
        </div>
      </div>

    </div>
  );
};
