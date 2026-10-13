import React from 'react';
import { 
  PlusCircle, 
  RefreshCw,
  FileSpreadsheet,
  ExternalLink,
  LayoutDashboard,
  Table,
  LogOut,
  ShieldCheck,
  User
} from 'lucide-react';
import { AuthUser, DatabaseConfig, GoogleSheetDatabaseProfile } from '../types/kas';

interface NavbarProps {
  currentUser: AuthUser;
  onLogout: () => void;
  activeTab: 'dashboard' | 'sheet';
  onChangeTab: (tab: 'dashboard' | 'sheet') => void;
  onOpenAddModal: () => void;
  onQuickSync?: () => void;
  isSyncing?: boolean;
  activeProfile?: GoogleSheetDatabaseProfile;
  dbConfig?: DatabaseConfig;
}

export const Navbar: React.FC<NavbarProps> = ({
  currentUser,
  onLogout,
  activeTab,
  onChangeTab,
  onOpenAddModal,
  onQuickSync,
  isSyncing,
  activeProfile,
  dbConfig
}) => {
  const isAdmin = currentUser.role === 'admin';
  const spreadsheetUrl = activeProfile?.spreadsheetUrl || dbConfig?.spreadsheetUrl || 'https://docs.google.com/spreadsheets/d/1CFttmq3kV9KyGQKC4-8JbLNN7WWXTiwlMQCMO4rRZF0/edit?gid=1921662302#gid=1921662302';

  return (
    <header className="bg-white border-b border-slate-200 sticky top-0 z-40 shadow-xs">
      {/* Top Header Row */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16 gap-3">
          
          {/* Brand Logo & Title */}
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-emerald-600 flex items-center justify-center text-white shadow-sm font-bold text-lg flex-shrink-0">
              Rp
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h1 className="text-base sm:text-lg font-bold text-slate-900 leading-tight">
                  Buku Kas Digital
                </h1>
                <span className="hidden md:inline-flex items-center gap-1.5 px-2 py-0.5 rounded-full text-[10px] font-bold border bg-emerald-50 text-emerald-800 border-emerald-200">
                  <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
                  <span>Google Sheets</span>
                </span>
              </div>
              <p className="text-[11px] text-slate-500 hidden sm:block">
                Sistem Kas Masuk & Kas Keluar Berbasis Spreadsheet
              </p>
            </div>
          </div>

          {/* User Profile, Actions & Logout */}
          <div className="flex items-center gap-2 sm:gap-3">
            
            {/* User Role Badge */}
            <div className="flex items-center gap-2 bg-slate-50 border border-slate-200/80 px-2.5 py-1 rounded-xl">
              <div className={`w-7 h-7 rounded-lg flex items-center justify-center text-white font-bold text-xs ${
                isAdmin ? 'bg-emerald-600' : 'bg-slate-700'
              }`}>
                {isAdmin ? <ShieldCheck className="w-4 h-4" /> : <User className="w-4 h-4" />}
              </div>
              <div className="text-left hidden sm:block">
                <div className="text-xs font-bold text-slate-800 leading-tight">
                  {currentUser.nama}
                </div>
                <div className="text-[10px] text-slate-500 font-semibold uppercase">
                  {isAdmin ? '👑 Administrator' : '👤 User (Input Saja)'}
                </div>
              </div>
            </div>

            {/* Direct Open Google Sheets Link (ADMIN ONLY) */}
            {isAdmin && spreadsheetUrl && (
              <a
                href={spreadsheetUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="hidden lg:inline-flex items-center gap-1.5 px-3 py-2 rounded-xl text-xs font-bold border border-emerald-200 bg-emerald-50 hover:bg-emerald-100 text-emerald-800 transition"
                title="Buka Google Sheets di tab baru (Khusus Admin)"
              >
                <FileSpreadsheet className="w-3.5 h-3.5 text-emerald-600" />
                <span>Buka Google Sheets</span>
                <ExternalLink className="w-3 h-3 text-emerald-500" />
              </a>
            )}

            {/* Quick Sync Button */}
            {onQuickSync && (
              <button
                onClick={onQuickSync}
                disabled={isSyncing}
                title="Tarik data transaksi terbaru dari Google Sheets"
                className="inline-flex items-center gap-1.5 px-2.5 sm:px-3 py-2 rounded-xl text-xs font-bold border border-slate-200 bg-slate-50 hover:bg-slate-100 text-slate-700 transition cursor-pointer disabled:opacity-50"
              >
                <RefreshCw className={`w-3.5 h-3.5 text-emerald-600 ${isSyncing ? 'animate-spin' : ''}`} />
                <span className="hidden md:inline">{isSyncing ? 'Sinkronisasi...' : 'Tarik Data'}</span>
              </button>
            )}

            {/* Add Transaction Button (Admin & User) */}
            <button
              onClick={onOpenAddModal}
              className="inline-flex items-center gap-1.5 sm:gap-2 bg-emerald-600 hover:bg-emerald-700 text-white px-3 sm:px-4 py-2 rounded-xl text-xs sm:text-sm font-semibold shadow-xs transition active:scale-95 cursor-pointer"
            >
              <PlusCircle className="w-4 h-4" />
              <span className="hidden sm:inline">Catat Kas Baru</span>
              <span className="sm:hidden">Catat</span>
            </button>

            {/* Logout Button */}
            <button
              onClick={onLogout}
              className="inline-flex items-center gap-1.5 p-2 sm:px-3 sm:py-2 rounded-xl text-xs font-bold text-rose-700 bg-rose-50 hover:bg-rose-100 border border-rose-200 transition cursor-pointer"
              title="Keluar / Ganti Akun"
            >
              <LogOut className="w-3.5 h-3.5" />
              <span className="hidden sm:inline">Keluar</span>
            </button>

          </div>

        </div>
      </div>

      {/* Navigation Tabs Bar */}
      <div className="bg-slate-50/80 border-t border-slate-200/80">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <nav className="flex items-center gap-2 py-2 overflow-x-auto no-scrollbar">
            
            {/* Tab 1: Dashboard */}
            <button
              onClick={() => onChangeTab('dashboard')}
              className={`inline-flex items-center gap-2 px-3.5 py-1.5 rounded-xl text-xs font-bold transition cursor-pointer whitespace-nowrap ${
                activeTab === 'dashboard'
                  ? 'bg-emerald-600 text-white shadow-xs'
                  : 'text-slate-600 hover:text-slate-900 hover:bg-slate-200/60'
              }`}
            >
              <LayoutDashboard className="w-4 h-4" />
              <span>Dashboard (Pemasukan & Pengeluaran)</span>
            </button>

            {/* Tab 2: Google Sheets Database (ADMIN ONLY) */}
            {isAdmin && (
              <button
                onClick={() => onChangeTab('sheet')}
                className={`inline-flex items-center gap-2 px-3.5 py-1.5 rounded-xl text-xs font-bold transition cursor-pointer whitespace-nowrap ${
                  activeTab === 'sheet'
                    ? 'bg-emerald-600 text-white shadow-xs'
                    : 'text-slate-600 hover:text-slate-900 hover:bg-slate-200/60'
                }`}
              >
                <Table className="w-4 h-4" />
                <span>Database Spreadsheet (Admin)</span>
              </button>
            )}

          </nav>
        </div>
      </div>
    </header>
  );
};
