import React, { useState } from 'react';
import { 
  Database, 
  Plus, 
  Check, 
  Copy, 
  ExternalLink, 
  RefreshCw, 
  Trash2, 
  Edit3, 
  CheckCircle2, 
  AlertCircle, 
  X, 
  Link2, 
  Sparkles,
  FileSpreadsheet,
  HelpCircle,
  Activity,
  ArrowRight,
  Upload,
  Download
} from 'lucide-react';
import { GoogleSheetDatabaseProfile, DatabaseConfig } from '../types/kas';
import { gasApiService } from '../services/gasService';
import { formatRupiah } from '../data/initialData';
import { gasFiles } from '../data/gasCode';

interface DatabaseManagerModalProps {
  isOpen: boolean;
  onClose: () => void;
  savedProfiles: GoogleSheetDatabaseProfile[];
  activeProfileId: string;
  onSelectProfile: (profile: GoogleSheetDatabaseProfile) => void;
  onSaveProfile: (profile: GoogleSheetDatabaseProfile, makeActive: boolean) => void;
  onDeleteProfile: (id: string) => void;
  onSyncData: (profile: GoogleSheetDatabaseProfile) => Promise<void>;
  onPushLocalDataToSheet?: (profile: GoogleSheetDatabaseProfile) => Promise<void>;
}

export const DatabaseManagerModal: React.FC<DatabaseManagerModalProps> = ({
  isOpen,
  onClose,
  savedProfiles,
  activeProfileId,
  onSelectProfile,
  onSaveProfile,
  onDeleteProfile,
  onSyncData,
  onPushLocalDataToSheet
}) => {
  const [activeTab, setActiveTab] = useState<'list' | 'add' | 'guide'>('list');
  const [editingProfileId, setEditingProfileId] = useState<string | null>(null);

  // Form State
  const [name, setName] = useState('');
  const [webAppUrl, setWebAppUrl] = useState('');
  const [spreadsheetUrl, setSpreadsheetUrl] = useState('');
  const [sheetName, setSheetName] = useState('Transaksi');
  const [saldoAwal, setSaldoAwal] = useState<number>(0);
  const [description, setDescription] = useState('');
  const [isLive, setIsLive] = useState(true);

  // Testing Connection State
  const [isTesting, setIsTesting] = useState(false);
  const [testResult, setTestResult] = useState<{ success: boolean; message: string; latencyMs?: number } | null>(null);
  const [syncingId, setSyncingId] = useState<string | null>(null);
  const [pushingId, setPushingId] = useState<string | null>(null);
  const [copiedFile, setCopiedFile] = useState<string | null>(null);

  if (!isOpen) return null;

  const resetForm = () => {
    setName('');
    setWebAppUrl('');
    setSpreadsheetUrl('');
    setSheetName('Transaksi');
    setSaldoAwal(0);
    setDescription('');
    setIsLive(true);
    setTestResult(null);
    setEditingProfileId(null);
  };

  const handleStartAdd = () => {
    resetForm();
    setActiveTab('add');
  };

  const handleStartEdit = (profile: GoogleSheetDatabaseProfile) => {
    setEditingProfileId(profile.id);
    setName(profile.name);
    setWebAppUrl(profile.webAppUrl || '');
    setSpreadsheetUrl(profile.spreadsheetUrl || '');
    setSheetName(profile.sheetName || 'Transaksi');
    setSaldoAwal(profile.saldoAwal || 0);
    setDescription(profile.description || '');
    setIsLive(profile.isLive);
    setTestResult(null);
    setActiveTab('add');
  };

  // Test Connection Ping
  const handleTestConnection = async () => {
    if (!webAppUrl.trim()) {
      setTestResult({
        success: false,
        message: 'Masukkan URL Web App Apps Script terlebih dahulu.'
      });
      return;
    }

    setIsTesting(true);
    setTestResult(null);

    const res = await gasApiService.ping(webAppUrl.trim());
    setIsTesting(false);
    setTestResult(res);
  };

  // Submit Add / Edit
  const handleSubmitForm = (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim()) return;

    let spreadsheetId = '';
    if (spreadsheetUrl) {
      const match = spreadsheetUrl.match(/\/d\/([a-zA-Z0-9-_]+)/);
      if (match && match[1]) {
        spreadsheetId = match[1];
      }
    }

    const profileData: GoogleSheetDatabaseProfile = {
      id: editingProfileId || `db-${Date.now()}`,
      name: name.trim(),
      webAppUrl: webAppUrl.trim(),
      spreadsheetUrl: spreadsheetUrl.trim(),
      spreadsheetId: spreadsheetId || undefined,
      sheetName: sheetName.trim() || 'Transaksi',
      saldoAwal: Number(saldoAwal) || 0,
      description: description.trim() || undefined,
      createdAt: new Date().toISOString().split('T')[0],
      isLive: isLive && !!webAppUrl.trim()
    };

    onSaveProfile(profileData, true);
    resetForm();
    setActiveTab('list');
  };

  // Copy Single File
  const handleCopyCode = (fileName: string, code: string) => {
    navigator.clipboard.writeText(code);
    setCopiedFile(fileName);
    setTimeout(() => setCopiedFile(null), 2500);
  };

  // Trigger Sync for a profile
  const handleTriggerSync = async (profile: GoogleSheetDatabaseProfile) => {
    setSyncingId(profile.id);
    try {
      await onSyncData(profile);
    } finally {
      setSyncingId(null);
    }
  };

  // Trigger Push local data to sheet
  const handleTriggerPush = async (profile: GoogleSheetDatabaseProfile) => {
    if (!onPushLocalDataToSheet) return;
    setPushingId(profile.id);
    try {
      await onPushLocalDataToSheet(profile);
    } finally {
      setPushingId(null);
    }
  };

  return (
    <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-3 sm:p-4 overflow-y-auto animate-in fade-in duration-200">
      <div className="bg-white w-full max-w-4xl rounded-2xl shadow-2xl border border-slate-200 overflow-hidden flex flex-col max-h-[90vh]">
        
        {/* MODAL HEADER */}
        <div className="px-5 sm:px-6 py-4 border-b border-slate-100 flex items-center justify-between bg-slate-50">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-emerald-600 flex items-center justify-center text-white shadow-xs">
              <Database className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-base sm:text-lg font-bold text-slate-900">
                Pusat Database Google Sheets & Apps Script
              </h2>
              <p className="text-xs text-slate-500">
                Hubungkan beberapa database Spreadsheet untuk kas RT, Masjid, Organisasi, atau Usaha
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="text-slate-400 hover:text-slate-700 p-2 rounded-xl hover:bg-slate-200/60 transition cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* MODAL TABS NAVIGATION */}
        <div className="px-5 sm:px-6 border-b border-slate-200 bg-white flex items-center justify-between gap-2 overflow-x-auto">
          <div className="flex gap-1 py-2">
            <button
              onClick={() => setActiveTab('list')}
              className={`flex items-center gap-2 px-3.5 py-2 rounded-xl text-xs font-bold transition cursor-pointer ${
                activeTab === 'list'
                  ? 'bg-emerald-50 text-emerald-800 border border-emerald-200'
                  : 'text-slate-600 hover:bg-slate-100'
              }`}
            >
              <Database className="w-4 h-4" />
              <span>Daftar Database ({savedProfiles.length})</span>
            </button>

            <button
              onClick={handleStartAdd}
              className={`flex items-center gap-2 px-3.5 py-2 rounded-xl text-xs font-bold transition cursor-pointer ${
                activeTab === 'add'
                  ? 'bg-emerald-50 text-emerald-800 border border-emerald-200'
                  : 'text-slate-600 hover:bg-slate-100'
              }`}
            >
              <Plus className="w-4 h-4" />
              <span>{editingProfileId ? 'Ubah Database' : '+ Tambah Database Baru'}</span>
            </button>

            <button
              onClick={() => setActiveTab('guide')}
              className={`flex items-center gap-2 px-3.5 py-2 rounded-xl text-xs font-bold transition cursor-pointer ${
                activeTab === 'guide'
                  ? 'bg-emerald-50 text-emerald-800 border border-emerald-200'
                  : 'text-slate-600 hover:bg-slate-100'
              }`}
            >
              <HelpCircle className="w-4 h-4" />
              <span>Panduan Setup Google Sheet</span>
            </button>
          </div>

          {activeTab === 'list' && (
            <button
              onClick={handleStartAdd}
              className="hidden sm:inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold shadow-xs transition cursor-pointer"
            >
              <Plus className="w-3.5 h-3.5" />
              <span>Tambah Database</span>
            </button>
          )}
        </div>

        {/* MODAL CONTENT BODY */}
        <div className="p-5 sm:p-6 overflow-y-auto flex-1 space-y-6">

          {/* ================= TAB 1: DAFTAR DATABASE TERSIMPAN ================= */}
          {activeTab === 'list' && (
            <div className="space-y-4">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                <p className="text-xs text-slate-600 font-medium">
                  Pilih database yang ingin diaktifkan untuk pencatatan dan laporan kas:
                </p>
                <span className="text-[11px] text-slate-400 font-mono">
                  Aktif: {savedProfiles.find(p => p.id === activeProfileId)?.name || 'Simulator'}
                </span>
              </div>

              <div className="grid grid-cols-1 gap-3.5">
                {savedProfiles.map((profile) => {
                  const isActive = profile.id === activeProfileId;
                  const isSimulator = !profile.isLive || !profile.webAppUrl;

                  return (
                    <div
                      key={profile.id}
                      className={`p-4 sm:p-5 rounded-2xl border transition relative flex flex-col gap-3 ${
                        isActive
                          ? 'border-emerald-500 bg-emerald-50/40 ring-1 ring-emerald-500/20 shadow-xs'
                          : 'border-slate-200 hover:border-slate-300 bg-white'
                      }`}
                    >
                      <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-3">
                        <div className="flex items-start gap-3">
                          <div className={`w-10 h-10 rounded-xl flex items-center justify-center font-bold text-sm shadow-xs flex-shrink-0 ${
                            isActive
                              ? 'bg-emerald-600 text-white'
                              : isSimulator
                              ? 'bg-slate-100 text-slate-600'
                              : 'bg-teal-50 text-teal-700 border border-teal-200'
                          }`}>
                            {isSimulator ? (
                              <Database className="w-5 h-5" />
                            ) : (
                              <FileSpreadsheet className="w-5 h-5" />
                            )}
                          </div>

                          <div>
                            <div className="flex flex-wrap items-center gap-2">
                              <h3 className="text-sm sm:text-base font-bold text-slate-900">
                                {profile.name}
                              </h3>

                              {isActive && (
                                <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[11px] font-bold bg-emerald-100 text-emerald-800 border border-emerald-300">
                                  <Check className="w-3 h-3" />
                                  Database Aktif
                                </span>
                              )}

                              <span className={`inline-flex items-center px-2 py-0.5 rounded-md text-[10px] font-bold border ${
                                isSimulator
                                  ? 'bg-slate-100 text-slate-700 border-slate-200'
                                  : 'bg-teal-50 text-teal-700 border-teal-200'
                              }`}>
                                {isSimulator ? 'Simulator Lokal' : 'Google Sheets API'}
                              </span>

                              <span className="text-[11px] text-slate-500 font-mono">
                                Sheet: [{profile.sheetName || 'Transaksi'}]
                              </span>
                            </div>

                            {profile.description && (
                              <p className="text-xs text-slate-600 mt-1">
                                {profile.description}
                              </p>
                            )}

                            {profile.webAppUrl && (
                              <div className="mt-2 flex flex-wrap items-center gap-3 text-[11px] text-slate-500 font-mono">
                                <span className="truncate max-w-xs sm:max-w-md bg-slate-100 px-2 py-0.5 rounded">
                                  URL: {profile.webAppUrl}
                                </span>
                              </div>
                            )}

                            {profile.saldoAwal > 0 && (
                              <p className="text-xs text-slate-500 mt-1">
                                Saldo Awal: <strong className="text-slate-800">{formatRupiah(profile.saldoAwal)}</strong>
                              </p>
                            )}
                          </div>
                        </div>

                        {/* Action buttons on card */}
                        <div className="flex flex-wrap items-center gap-2 self-start sm:self-auto">
                          {!isActive && (
                            <button
                              onClick={() => onSelectProfile(profile)}
                              className="px-3 py-1.5 rounded-xl bg-slate-900 hover:bg-emerald-700 text-white text-xs font-bold transition cursor-pointer shadow-xs"
                            >
                              Gunakan Database Ini
                            </button>
                          )}

                          {profile.isLive && profile.webAppUrl && (
                            <>
                              <button
                                onClick={() => handleTriggerSync(profile)}
                                disabled={syncingId === profile.id}
                                className="px-2.5 py-1.5 rounded-xl bg-teal-50 hover:bg-teal-100 text-teal-800 border border-teal-200 text-xs font-semibold transition cursor-pointer flex items-center gap-1"
                                title="Tarik data terbaru dari Google Sheets"
                              >
                                <RefreshCw className={`w-3.5 h-3.5 ${syncingId === profile.id ? 'animate-spin text-teal-600' : ''}`} />
                                <span className="hidden sm:inline">Tarik Sheet</span>
                              </button>

                              {onPushLocalDataToSheet && (
                                <button
                                  onClick={() => handleTriggerPush(profile)}
                                  disabled={pushingId === profile.id}
                                  className="px-2.5 py-1.5 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-semibold transition cursor-pointer flex items-center gap-1"
                                  title="Kirim data lokal saat ini ke Google Sheets"
                                >
                                  <Upload className={`w-3.5 h-3.5 ${pushingId === profile.id ? 'animate-pulse' : ''}`} />
                                  <span className="hidden sm:inline">Kirim ke Sheet</span>
                                </button>
                              )}
                            </>
                          )}

                          {profile.spreadsheetUrl && (
                            <a
                              href={profile.spreadsheetUrl}
                              target="_blank"
                              rel="noreferrer"
                              className="p-1.5 text-slate-500 hover:text-emerald-700 hover:bg-slate-100 rounded-lg transition"
                              title="Buka Google Sheets di tab baru"
                            >
                              <ExternalLink className="w-4 h-4" />
                            </a>
                          )}

                          {profile.id !== 'db-local-simulator' && (
                            <>
                              <button
                                onClick={() => handleStartEdit(profile)}
                                className="p-1.5 text-slate-500 hover:text-slate-800 hover:bg-slate-100 rounded-lg transition cursor-pointer"
                                title="Ubah Konfigurasi"
                              >
                                <Edit3 className="w-4 h-4" />
                              </button>

                              <button
                                onClick={() => onDeleteProfile(profile.id)}
                                className="p-1.5 text-slate-400 hover:text-rose-600 hover:bg-rose-50 rounded-lg transition cursor-pointer"
                                title="Hapus Database"
                              >
                                <Trash2 className="w-4 h-4" />
                              </button>
                            </>
                          )}
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>

              {/* Callout Info */}
              <div className="p-4 rounded-xl bg-slate-50 border border-slate-200 flex flex-col sm:flex-row items-center justify-between gap-3 text-xs text-slate-600">
                <div className="flex items-center gap-2">
                  <Sparkles className="w-4 h-4 text-emerald-600 flex-shrink-0" />
                  <span>
                    Ingin membuat Google Spreadsheet baru dan menghubungkannya?
                  </span>
                </div>
                <button
                  onClick={() => setActiveTab('guide')}
                  className="font-bold text-emerald-700 hover:text-emerald-900 underline flex items-center gap-1 cursor-pointer"
                >
                  <span>Lihat Panduan & Salin Script</span>
                  <ArrowRight className="w-3 h-3" />
                </button>
              </div>
            </div>
          )}

          {/* ================= TAB 2: TAMBAH / EDIT DATABASE ================= */}
          {activeTab === 'add' && (
            <form onSubmit={handleSubmitForm} className="space-y-4">
              <div className="bg-emerald-50/70 border border-emerald-200/80 p-4 rounded-2xl">
                <h3 className="text-xs font-bold uppercase tracking-wider text-emerald-900 mb-1">
                  {editingProfileId ? 'Edit Konfigurasi Database' : 'Hubungkan Database Google Spreadsheet Baru'}
                </h3>
                <p className="text-xs text-emerald-800">
                  Data kas akan disinkronkan secara dua arah antara aplikasi ini dan Google Spreadsheet melalui Google Apps Script Web App.
                </p>
              </div>

              {/* Nama Database & Tipe */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">
                    Nama Database Kas *
                  </label>
                  <input
                    type="text"
                    required
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    placeholder="Contoh: Kas RT 05 Blok C, Kas Masjid Al-Falah"
                    className="w-full px-3.5 py-2 text-sm border border-slate-200 rounded-xl focus:bg-white focus:outline-none focus:ring-2 focus:ring-emerald-500 font-medium"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">
                    Nama Sheet / Tab Spreadsheet
                  </label>
                  <input
                    type="text"
                    value={sheetName}
                    onChange={(e) => setSheetName(e.target.value)}
                    placeholder="Transaksi"
                    className="w-full px-3.5 py-2 text-sm border border-slate-200 rounded-xl focus:bg-white focus:outline-none focus:ring-2 focus:ring-emerald-500 font-mono"
                  />
                </div>
              </div>

              {/* Google Apps Script Web App URL */}
              <div>
                <div className="flex items-center justify-between mb-1">
                  <label className="block text-xs font-semibold text-slate-700">
                    URL Web App Google Apps Script (REST API) *
                  </label>
                  <span className="text-[11px] text-slate-400">
                    Format: https://script.google.com/macros/s/.../exec
                  </span>
                </div>
                <div className="flex gap-2">
                  <div className="relative flex-1">
                    <input
                      type="url"
                      value={webAppUrl}
                      onChange={(e) => {
                        setWebAppUrl(e.target.value);
                        setTestResult(null);
                      }}
                      placeholder="https://script.google.com/macros/s/AKfycb.../exec"
                      className="w-full pl-9 pr-3 py-2 text-xs sm:text-sm font-mono border border-slate-200 rounded-xl focus:bg-white focus:outline-none focus:ring-2 focus:ring-emerald-500"
                    />
                    <Link2 className="w-4 h-4 text-slate-400 absolute left-3 top-2.5" />
                  </div>

                  <button
                    type="button"
                    onClick={handleTestConnection}
                    disabled={isTesting || !webAppUrl.trim()}
                    className="px-4 py-2 rounded-xl bg-slate-100 hover:bg-emerald-50 hover:text-emerald-800 text-slate-700 border border-slate-200 text-xs font-bold transition flex items-center gap-1.5 cursor-pointer disabled:opacity-50"
                  >
                    <Activity className={`w-4 h-4 ${isTesting ? 'animate-spin text-emerald-600' : ''}`} />
                    <span>{isTesting ? 'Menguji...' : 'Uji Koneksi'}</span>
                  </button>
                </div>

                {/* Test Result Message */}
                {testResult && (
                  <div className={`mt-2.5 p-3 rounded-xl text-xs flex items-start gap-2 border animate-in fade-in ${
                    testResult.success
                      ? 'bg-emerald-50 text-emerald-800 border-emerald-200'
                      : 'bg-rose-50 text-rose-800 border-rose-200'
                  }`}>
                    {testResult.success ? (
                      <CheckCircle2 className="w-4 h-4 text-emerald-600 flex-shrink-0 mt-0.5" />
                    ) : (
                      <AlertCircle className="w-4 h-4 text-rose-600 flex-shrink-0 mt-0.5" />
                    )}
                    <div>
                      <p className="font-semibold">{testResult.message}</p>
                      {testResult.latencyMs !== undefined && testResult.latencyMs > 0 && (
                        <p className="text-[11px] opacity-80 mt-0.5">Latensi response: {testResult.latencyMs} ms</p>
                      )}
                    </div>
                  </div>
                )}
              </div>

              {/* URL Google Spreadsheet (Opsional) & Saldo Awal */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">
                    Link URL Google Sheets (Opsional)
                  </label>
                  <input
                    type="url"
                    value={spreadsheetUrl}
                    onChange={(e) => setSpreadsheetUrl(e.target.value)}
                    placeholder="https://docs.google.com/spreadsheets/d/.../edit"
                    className="w-full px-3.5 py-2 text-xs font-mono border border-slate-200 rounded-xl focus:bg-white focus:outline-none focus:ring-2 focus:ring-emerald-500"
                  />
                  <p className="text-[11px] text-slate-400 mt-1">
                    Memudahkan tombol shortcut untuk membuka spreadsheet langsung di tab baru.
                  </p>
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">
                    Saldo Awal Kas (Rp)
                  </label>
                  <div className="relative">
                    <span className="absolute left-3.5 top-2 text-xs font-bold text-slate-400">Rp</span>
                    <input
                      type="number"
                      min="0"
                      step="1000"
                      value={saldoAwal || ''}
                      onChange={(e) => setSaldoAwal(Number(e.target.value) || 0)}
                      placeholder="0"
                      className="w-full pl-10 pr-3.5 py-2 text-sm border border-slate-200 rounded-xl focus:bg-white focus:outline-none focus:ring-2 focus:ring-emerald-500 font-semibold"
                    />
                  </div>
                  <span className="text-[11px] text-slate-400 mt-1 block">
                    Saldo awal yang belum tercatat pada baris transaksi: {formatRupiah(saldoAwal)}
                  </span>
                </div>
              </div>

              {/* Deskripsi */}
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  Keterangan / Catatan Tambahan
                </label>
                <textarea
                  rows={2}
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  placeholder="Contoh: Kas pengurus periode 2026 - 2027, bendahara: Ibu Siti"
                  className="w-full px-3.5 py-2 text-xs sm:text-sm border border-slate-200 rounded-xl focus:bg-white focus:outline-none focus:ring-2 focus:ring-emerald-500"
                />
              </div>

              {/* Buttons */}
              <div className="flex items-center justify-end gap-3 pt-3 border-t border-slate-100">
                <button
                  type="button"
                  onClick={() => {
                    resetForm();
                    setActiveTab('list');
                  }}
                  className="px-4 py-2 text-xs font-semibold text-slate-600 hover:bg-slate-100 rounded-xl transition cursor-pointer"
                >
                  Batal
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 text-xs font-bold text-white bg-emerald-600 hover:bg-emerald-700 rounded-xl shadow-xs transition cursor-pointer flex items-center gap-1.5"
                >
                  <Check className="w-4 h-4" />
                  <span>{editingProfileId ? 'Simpan Perubahan' : 'Simpan & Aktifkan Database'}</span>
                </button>
              </div>
            </form>
          )}

          {/* ================= TAB 3: PANDUAN SETUP GOOGLE SHEET ================= */}
          {activeTab === 'guide' && (
            <div className="space-y-5">
              <div className="p-4 rounded-2xl bg-emerald-50 border border-emerald-200">
                <h3 className="text-sm font-bold text-emerald-900 mb-1">
                  3 Langkah Cepat Membuat & Menghubungkan Google Sheet:
                </h3>
                <p className="text-xs text-emerald-800">
                  Google Apps Script bertindak sebagai backend serverless gratis yang menyimpan seluruh data kas di Google Spreadsheet akun Google Anda sendiri.
                </p>
              </div>

              <div className="space-y-4">
                {/* Step 1 */}
                <div className="p-4 rounded-xl border border-slate-200 bg-white space-y-2">
                  <div className="flex items-center gap-2 text-xs font-bold text-slate-900">
                    <span className="w-6 h-6 rounded-full bg-emerald-600 text-white flex items-center justify-center text-xs">1</span>
                    <span>Buat Google Spreadsheet Baru</span>
                  </div>
                  <p className="text-xs text-slate-600 pl-8">
                    Buka <a href="https://sheets.new" target="_blank" rel="noreferrer" className="text-emerald-600 font-bold underline inline-flex items-center gap-0.5">sheets.new <ExternalLink className="w-3 h-3" /></a> di browser Anda dan beri nama Spreadsheet (misal: <em>Buku Kas RT 05</em>).
                  </p>
                </div>

                {/* Step 2 */}
                <div className="p-4 rounded-xl border border-slate-200 bg-white space-y-2">
                  <div className="flex items-center gap-2 text-xs font-bold text-slate-900">
                    <span className="w-6 h-6 rounded-full bg-emerald-600 text-white flex items-center justify-center text-xs">2</span>
                    <span>Buka Apps Script & Salin Kode Backend</span>
                  </div>
                  <p className="text-xs text-slate-600 pl-8">
                    Di Google Sheets, klik menu <strong>Ekstensi &gt; Apps Script</strong>. Hapus isi file <code>Code.gs</code> bawaan, lalu tempel kode lengkap di bawah ini:
                  </p>
                  <div className="pl-8 pt-1">
                    <button
                      onClick={() => handleCopyCode('Code.gs', gasFiles.find(f => f.name === 'Code.gs')?.code || '')}
                      className="inline-flex items-center gap-2 px-3.5 py-2 rounded-xl bg-slate-900 hover:bg-emerald-700 text-white text-xs font-bold transition shadow-xs cursor-pointer"
                    >
                      {copiedFile === 'Code.gs' ? <Check className="w-4 h-4 text-emerald-400" /> : <Copy className="w-4 h-4" />}
                      <span>{copiedFile === 'Code.gs' ? 'Kode Code.gs Berhasil Disalin!' : 'Salin Kode Code.gs Otomatis'}</span>
                    </button>
                  </div>
                </div>

                {/* Step 3 */}
                <div className="p-4 rounded-xl border border-slate-200 bg-white space-y-2">
                  <div className="flex items-center gap-2 text-xs font-bold text-slate-900">
                    <span className="w-6 h-6 rounded-full bg-emerald-600 text-white flex items-center justify-center text-xs">3</span>
                    <span>Deploy sebagai Web App (Akses: Anyone)</span>
                  </div>
                  <p className="text-xs text-slate-600 pl-8">
                    Di halaman Apps Script:
                  </p>
                  <ul className="text-xs text-slate-600 list-disc pl-12 space-y-1">
                    <li>Klik tombol biru <strong>Deploy &gt; New deployment</strong></li>
                    <li>Pilih jenis deployment: <strong>Web app</strong></li>
                    <li>Pada opsi <em>Execute as</em>, pilih <strong>Me (email Anda)</strong></li>
                    <li>Pada opsi <em>Who has access</em>, pilih <strong>Anyone</strong> (Wajib agar API dapat diakses)</li>
                    <li>Klik <strong>Deploy</strong>, izinkan permissions (Review Permissions &gt; Advanced &gt; Go to Untitled), lalu salin <strong>Web App URL</strong> yang dihasilkan.</li>
                  </ul>
                  <div className="pl-8 pt-2">
                    <button
                      onClick={() => {
                        resetForm();
                        setActiveTab('add');
                      }}
                      className="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold shadow-xs cursor-pointer"
                    >
                      <Plus className="w-3.5 h-3.5" />
                      <span>Masukkan URL Web App ke Aplikasi</span>
                    </button>
                  </div>
                </div>
              </div>
            </div>
          )}

        </div>

        {/* MODAL FOOTER */}
        <div className="px-6 py-3.5 border-t border-slate-100 bg-slate-50 flex items-center justify-between text-xs text-slate-500">
          <span>Tersinkronisasi otomatis dengan Google Apps Script & Sheets</span>
          <button
            onClick={onClose}
            className="font-semibold text-slate-700 hover:text-slate-900 cursor-pointer"
          >
            Tutup
          </button>
        </div>

      </div>
    </div>
  );
};
