import React from 'react';
import { 
  Menu, 
  Home, 
  ChevronRight, 
  PlusCircle, 
  FileSpreadsheet, 
  ExternalLink
} from 'lucide-react';
import { AuthUser, DatabaseConfig } from '../types/kas';
import { DEFAULT_DATABASE_CONFIG } from '../data/initialData';
import { PWAInstallButton } from './PWAInstallButton';

interface TopHeaderProps {
  currentUser: AuthUser;
  activeTab: 'dashboard' | 'sheet';
  onToggleSidebar: () => void;
  onOpenAddModal: () => void;
  onQuickSync: () => void;
  isSyncing: boolean;
  dbConfig?: DatabaseConfig;
  totalTransactionsCount: number;
  onOpenIconModal?: () => void;
}

export const TopHeader: React.FC<TopHeaderProps> = ({
  currentUser,
  activeTab,
  onToggleSidebar,
  onOpenAddModal,
  onQuickSync,
  isSyncing,
  dbConfig,
  totalTransactionsCount,
  onOpenIconModal
}) => {
  const isAdmin = currentUser.role === 'admin';
  const pageTitle = activeTab === 'dashboard' ? 'Dashboard' : 'Database Spreadsheet';
  const spreadsheetUrl = dbConfig?.spreadsheetUrl || DEFAULT_DATABASE_CONFIG.spreadsheetUrl;

  return (
    <header className="bg-white border-b border-slate-200 sticky top-0 z-30 shadow-xs">
      <div className="px-4 sm:px-6 lg:px-8 py-3 sm:py-4 flex items-center justify-between gap-4">
        
        {/* Left: Mobile Toggle & Page Title */}
        <div className="flex items-center gap-3">
          <button
            onClick={onToggleSidebar}
            className="p-2 rounded-lg text-slate-600 hover:bg-slate-100 lg:hidden cursor-pointer"
            title="Buka Menu Navigasi"
          >
            <Menu className="w-5 h-5" />
          </button>

          <div>
            <h2 className="text-xl sm:text-2xl font-semibold text-slate-700 tracking-tight">
              {pageTitle}
            </h2>
          </div>
        </div>

        {/* Right: Breadcrumb Trail & Quick Actions */}
        <div className="flex items-center gap-2 sm:gap-3">
          
          {/* Breadcrumb */}
          <div className="hidden md:flex items-center gap-1.5 text-xs text-slate-400 font-medium">
            <Home className="w-3.5 h-3.5 text-slate-400" />
            <span>Home</span>
            <ChevronRight className="w-3 h-3 text-slate-300" />
            <span className="text-slate-600 font-semibold">{pageTitle}</span>
          </div>

          {/* PWA Icon Manager Modal Button */}
          {onOpenIconModal && (
            <button
              onClick={onOpenIconModal}
              className="inline-flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg border border-slate-200 hover:border-emerald-300 bg-white hover:bg-emerald-50 text-slate-700 hover:text-emerald-700 text-xs font-semibold shadow-2xs transition cursor-pointer"
              title="Lihat & Kelola Seluruh Ukuran Icon PWA"
            >
              <div className="w-4 h-4 rounded-sm overflow-hidden flex items-center justify-center">
                <img 
                  src="/pwa-512x512.png" 
                  onError={(e) => { e.currentTarget.src = '/PWA-512.png'; }}
                  alt="PWA Icon" 
                  className="w-full h-full object-contain" 
                />
              </div>
              <span className="hidden xl:inline">Icon PWA</span>
            </button>
          )}

          {/* PWA Install Button */}
          <PWAInstallButton variant="header" />

          {/* Menuju Google Sheet Button */}
          {spreadsheetUrl && (
            <a
              href={spreadsheetUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-emerald-50 hover:bg-emerald-100 text-emerald-700 border border-emerald-300/80 text-xs font-bold shadow-xs transition active:scale-95"
              title="Buka Spreadsheet di Google Sheets"
            >
              <FileSpreadsheet className="w-4 h-4 text-emerald-600" />
              <span className="hidden sm:inline">Google Sheet</span>
              <ExternalLink className="w-3 h-3 text-emerald-600" />
            </a>
          )}

          {/* Catat Kas Baru Button */}
          <button
            onClick={onOpenAddModal}
            className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-[#348fe2] hover:bg-[#2c7ec9] text-white text-xs font-bold shadow-xs transition active:scale-95 cursor-pointer"
          >
            <PlusCircle className="w-4 h-4" />
            <span className="hidden sm:inline">Catat Kas</span>
          </button>
        </div>

      </div>
    </header>
  );
};
