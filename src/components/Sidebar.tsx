import React from 'react';
import { 
  LayoutDashboard, 
  Table, 
  PlusCircle, 
  RefreshCw, 
  FileSpreadsheet, 
  ExternalLink, 
  LogOut, 
  ShieldCheck, 
  User
} from 'lucide-react';
import { AuthUser, DatabaseConfig } from '../types/kas';
import { DEFAULT_DATABASE_CONFIG } from '../data/initialData';
import { PWAInstallButton } from './PWAInstallButton';

interface SidebarProps {
  currentUser: AuthUser;
  activeTab: 'dashboard' | 'sheet';
  onChangeTab: (tab: 'dashboard' | 'sheet') => void;
  onOpenAddModal: () => void;
  onQuickSync?: () => void;
  isSyncing?: boolean;
  onLogout: () => void;
  dbConfig?: DatabaseConfig;
  isOpen: boolean;
  onCloseMobile: () => void;
  onOpenIconModal?: () => void;
}

export const Sidebar: React.FC<SidebarProps> = ({
  currentUser,
  activeTab,
  onChangeTab,
  onOpenAddModal,
  onQuickSync,
  isSyncing,
  onLogout,
  dbConfig,
  isOpen,
  onCloseMobile,
  onOpenIconModal
}) => {
  const isAdmin = currentUser.role === 'admin';
  const spreadsheetUrl = dbConfig?.spreadsheetUrl || DEFAULT_DATABASE_CONFIG.spreadsheetUrl;

  return (
    <>
      {/* Mobile Backdrop Overlay */}
      {isOpen && (
        <div 
          onClick={onCloseMobile}
          className="fixed inset-0 bg-black/50 z-40 lg:hidden backdrop-blur-xs transition-opacity"
        />
      )}

      {/* Sidebar Container */}
      <aside 
        className={`fixed top-0 bottom-0 left-0 z-50 w-64 bg-[#2B323A] text-slate-300 flex flex-col justify-between border-r border-[#242a31] transition-transform duration-300 ease-in-out lg:translate-x-0 ${
          isOpen ? 'translate-x-0' : '-translate-x-full'
        }`}
      >
        {/* Top Header / App Brand */}
        <div>
          <div className="h-16 px-5 flex items-center gap-3 border-b border-[#242a31] bg-[#242a31]/60">
            <div className="w-9 h-9 rounded-xl overflow-hidden shadow-sm flex items-center justify-center bg-white p-1">
              <img 
                src="/pwa-512x512.png" 
                onError={(e) => { e.currentTarget.src = '/PWA-512.png'; }}
                alt="Google Sheet Icon" 
                className="w-full h-full object-contain" 
              />
            </div>
            <div>
              <h1 className="text-sm font-bold text-white tracking-wide">
                Buku Kas Digital
              </h1>
              <p className="text-[10px] text-emerald-400 font-semibold flex items-center gap-1">
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 inline-block animate-pulse"></span>
                Google Sheet
              </p>
            </div>
          </div>

          {/* Navigation Menu Items */}
          <nav className="p-3 space-y-1">
            
            {/* Menu 1: Dashboard (Pemasukan & Pengeluaran) */}
            <button
              onClick={() => {
                onChangeTab('dashboard');
                onCloseMobile();
              }}
              className={`w-full flex items-center gap-3 px-3.5 py-2.5 rounded-lg text-xs font-semibold transition cursor-pointer text-left ${
                activeTab === 'dashboard'
                  ? 'bg-[#348fe2] text-white font-bold shadow-xs'
                  : 'text-[#A2A8B0] hover:bg-[#232930] hover:text-white'
              }`}
            >
              <LayoutDashboard className="w-4 h-4 flex-shrink-0" />
              <span>Dashboard</span>
            </button>

            {/* Menu 2: Database Spreadsheet */}
            {isAdmin && (
              <button
                onClick={() => {
                  onChangeTab('sheet');
                  onCloseMobile();
                }}
                className={`w-full flex items-center gap-3 px-3.5 py-2.5 rounded-lg text-xs font-semibold transition cursor-pointer text-left ${
                  activeTab === 'sheet'
                    ? 'bg-[#348fe2] text-white font-bold shadow-xs'
                    : 'text-[#A2A8B0] hover:bg-[#232930] hover:text-white'
                }`}
              >
                <Table className="w-4 h-4 flex-shrink-0" />
                <span>Database Spreadsheet</span>
              </button>
            )}

            {/* Direct Open Google Sheets Link */}
            {spreadsheetUrl && (
              <a
                href={spreadsheetUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="w-full flex items-center justify-between px-3.5 py-2.5 rounded-lg text-xs font-semibold text-emerald-400 hover:bg-emerald-950/40 border border-emerald-800/30 hover:border-emerald-700/50 hover:text-emerald-300 transition group"
                title="Buka Google Sheets di tab baru"
              >
                <div className="flex items-center gap-3">
                  <FileSpreadsheet className="w-4 h-4 flex-shrink-0 text-emerald-400 group-hover:scale-110 transition-transform" />
                  <span>Google Sheet</span>
                </div>
                <ExternalLink className="w-3.5 h-3.5 text-emerald-400/70 group-hover:text-emerald-300" />
              </a>
            )}

            {/* Action Item: Catat Kas Baru */}
            <div className="pt-3 pb-1 px-1">
              <span className="text-[10px] uppercase font-bold tracking-wider text-slate-500">
                Aksi Cepat
              </span>
            </div>

            <button
              onClick={() => {
                onOpenAddModal();
                onCloseMobile();
              }}
              className="w-full flex items-center gap-3 px-3.5 py-2.5 rounded-lg text-xs font-semibold text-white bg-[#348fe2] hover:bg-[#2b7bc4] transition cursor-pointer text-left shadow-xs"
            >
              <PlusCircle className="w-4 h-4 flex-shrink-0 text-white" />
              <span>Catat Kas Baru</span>
            </button>

            {/* Action Item: Sinkronisasi Manual */}
            {onQuickSync && (
              <button
                onClick={() => {
                  onQuickSync();
                  onCloseMobile();
                }}
                disabled={isSyncing}
                className="w-full flex items-center gap-3 px-3.5 py-2.5 rounded-lg text-xs font-semibold text-[#A2A8B0] hover:bg-[#232930] hover:text-white transition cursor-pointer text-left disabled:opacity-50"
              >
                <RefreshCw className={`w-4 h-4 flex-shrink-0 text-sky-400 ${isSyncing ? 'animate-spin' : ''}`} />
                <span>{isSyncing ? 'Menyinkronkan...' : 'Sinkronisasi Data'}</span>
              </button>
            )}

            {/* Action Item: Kelola Icon PWA */}
            {onOpenIconModal && (
              <button
                onClick={() => {
                  onOpenIconModal();
                  onCloseMobile();
                }}
                className="w-full flex items-center gap-3 px-3.5 py-2.5 rounded-lg text-xs font-semibold text-emerald-400 hover:bg-emerald-950/40 border border-emerald-900/40 hover:border-emerald-700/60 transition cursor-pointer text-left"
              >
                <div className="w-4 h-4 rounded-xs overflow-hidden flex items-center justify-center flex-shrink-0">
                  <img 
                    src="/pwa-512x512.png" 
                    onError={(e) => { e.currentTarget.src = '/PWA-512.png'; }}
                    alt="PWA Icon" 
                    className="w-full h-full object-contain" 
                  />
                </div>
                <span>Kelola Icon PWA (Semua Ukuran)</span>
              </button>
            )}

            {/* PWA Install Button */}
            <div className="pt-2">
              <PWAInstallButton variant="sidebar" />
            </div>

          </nav>
        </div>

        {/* Bottom Profile Footer */}
        <div className="p-3 border-t border-[#242a31] bg-[#242a31]/40 space-y-2">
          
          <div className="flex items-center gap-3 px-2 py-1.5">
            <div className={`w-8 h-8 rounded-lg flex items-center justify-center text-white font-bold text-xs flex-shrink-0 ${
              isAdmin ? 'bg-emerald-600' : 'bg-slate-600'
            }`}>
              {isAdmin ? <ShieldCheck className="w-4 h-4" /> : <User className="w-4 h-4" />}
            </div>
            <div className="min-w-0 flex-1">
              <p className="text-xs font-bold text-white truncate">
                {currentUser.nama}
              </p>
              <p className="text-[10px] text-slate-400 font-medium">
                {isAdmin ? '👑 Administrator' : '👤 User (Input Saja)'}
              </p>
            </div>
          </div>

          <button
            onClick={onLogout}
            className="w-full flex items-center justify-center gap-2 px-3 py-2 rounded-lg text-xs font-bold text-rose-400 bg-rose-950/30 hover:bg-rose-900/40 border border-rose-900/40 transition cursor-pointer"
          >
            <LogOut className="w-3.5 h-3.5" />
            <span>Keluar Akun</span>
          </button>
        </div>

      </aside>
    </>
  );
};
