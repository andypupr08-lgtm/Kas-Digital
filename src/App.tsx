import React, { useState, useEffect } from 'react';
import { KasTransaction, KasSummary, DatabaseConfig, AuthUser } from './types/kas';
import { 
  INITIAL_TRANSACTIONS, 
  DEFAULT_DATABASE_CONFIG,
  DEFAULT_DATABASE_PROFILES,
  calculateRunningBalances,
  formatRupiah
} from './data/initialData';
import { gasApiService } from './services/gasService';
import { LoginPage } from './components/LoginPage';
import { Sidebar } from './components/Sidebar';
import { TopHeader } from './components/TopHeader';
import { DashboardCards } from './components/DashboardCards';
import { DashboardRecentTransactions } from './components/DashboardRecentTransactions';
import { TransactionFormModal } from './components/TransactionFormModal';
import { DeleteConfirmModal } from './components/DeleteConfirmModal';
import { SpreadsheetView } from './components/SpreadsheetView';
import { 
  CheckCircle2, 
  AlertCircle
} from 'lucide-react';
import { OfflineIndicator } from './components/OfflineIndicator';
import { PWAInstallButton } from './components/PWAInstallButton';
import { PWAIconModal } from './components/PWAIconModal';

const STORAGE_KEY = 'gas_kas_transactions_v3';
const DB_CONFIG_KEY = 'gas_kas_db_config_v3';
const AUTH_USER_KEY = 'gas_kas_auth_user_v1';
const DELETED_IDS_KEY = 'gas_kas_deleted_ids_v3';

export default function App() {
  // Authentication State: null means show Login Page
  const [currentUser, setCurrentUser] = useState<AuthUser | null>(() => {
    try {
      const savedUser = localStorage.getItem(AUTH_USER_KEY);
      if (savedUser) {
        return JSON.parse(savedUser);
      }
    } catch (e) {
      console.error(e);
    }
    return null;
  });

  // Active Navigation Tab: 'dashboard' | 'sheet'
  const [activeTab, setActiveTab] = useState<'dashboard' | 'sheet'>('dashboard');
  
  // Mobile Sidebar Drawer State
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);

  // PWA Icon Manager Modal State
  const [isIconModalOpen, setIsIconModalOpen] = useState(false);

  // Deleted IDs Tracker to prevent remote sync resurrection
  const [deletedIds, setDeletedIds] = useState<Set<string>>(() => {
    try {
      const saved = localStorage.getItem(DELETED_IDS_KEY);
      if (saved) {
        return new Set(JSON.parse(saved));
      }
    } catch (e) {
      console.error(e);
    }
    return new Set<string>();
  });

  // Hardcoded Primary Profile
  const activeProfile = DEFAULT_DATABASE_PROFILES[0];

  // Database Configuration State (Directly Connected to Provided Google Sheets)
  const [dbConfig, setDbConfig] = useState<DatabaseConfig>(() => {
    try {
      const saved = localStorage.getItem(DB_CONFIG_KEY);
      if (saved) {
        return { ...DEFAULT_DATABASE_CONFIG, ...JSON.parse(saved) };
      }
    } catch (e) {
      console.error(e);
    }
    return DEFAULT_DATABASE_CONFIG;
  });

  // Transaction State
  const [transactions, setTransactions] = useState<KasTransaction[]>(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEY);
      if (saved) {
        return JSON.parse(saved);
      }
    } catch (e) {
      console.error(e);
    }
    return calculateRunningBalances(INITIAL_TRANSACTIONS, DEFAULT_DATABASE_CONFIG.saldoAwal);
  });

  // Modal States
  const [isFormModalOpen, setIsFormModalOpen] = useState(false);
  const [editingTransaction, setEditingTransaction] = useState<KasTransaction | null>(null);
  const [deleteTargetId, setDeleteTargetId] = useState<string | null>(null);
  const [isDeletingTx, setIsDeletingTx] = useState(false);
  const [isQuickSyncing, setIsQuickSyncing] = useState(false);

  // Toast Alert
  const [toast, setToast] = useState<{ message: string; type: 'success' | 'error' } | null>(null);

  const showToast = (message: string, type: 'success' | 'error' = 'success') => {
    setToast({ message, type });
    setTimeout(() => setToast(null), 3500);
  };

  // Handle Login
  const handleLogin = (user: AuthUser) => {
    setCurrentUser(user);
    try {
      localStorage.setItem(AUTH_USER_KEY, JSON.stringify(user));
    } catch (e) {
      console.error(e);
    }
    setActiveTab('dashboard');
    showToast(`Selamat datang, ${user.nama} (${user.role === 'admin' ? 'Administrator' : 'User'})!`);
  };

  // Handle Logout
  const handleLogout = () => {
    setCurrentUser(null);
    try {
      localStorage.removeItem(AUTH_USER_KEY);
    } catch (e) {
      console.error(e);
    }
    showToast('Anda telah keluar dari aplikasi kas.');
  };

  // Sync to LocalStorage
  useEffect(() => {
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(transactions));
    } catch (e) {
      console.error(e);
    }
  }, [transactions]);

  // Sync DB Config to LocalStorage
  useEffect(() => {
    try {
      localStorage.setItem(DB_CONFIG_KEY, JSON.stringify(dbConfig));
    } catch (e) {
      console.error(e);
    }
  }, [dbConfig]);

  // If user role is not admin, prevent accessing admin-only tabs
  useEffect(() => {
    if (currentUser && currentUser.role !== 'admin') {
      if (activeTab === 'sheet') {
        setActiveTab('dashboard');
      }
    }
  }, [currentUser, activeTab]);

  // Handle Sync Data from Google Sheets (Two-Way Synchronization)
  const handleSyncData = async (silent: boolean = false) => {
    const targetUrl = dbConfig.webAppUrl || DEFAULT_DATABASE_CONFIG.webAppUrl;
    if (!targetUrl) return;

    if (!silent) setIsQuickSyncing(true);
    try {
      const response = await gasApiService.fetchTransactions(targetUrl);
      if (response.status === 'success' && Array.isArray(response.data)) {
        // Filter out any locally deleted IDs to prevent resurrection
        const validRemoteData = response.data.filter(t => !deletedIds.has(t.id));
        const calculated = calculateRunningBalances(validRemoteData, dbConfig.saldoAwal);
        setTransactions(calculated);
        try {
          localStorage.setItem(STORAGE_KEY, JSON.stringify(calculated));
        } catch (e) {
          console.error(e);
        }
        if (!silent) {
          showToast(`Sinkronisasi berhasil! ${calculated.length} data kas termutakhir.`);
        }
      }
    } catch (err: any) {
      if (!silent) {
        showToast(err.message || 'Gagal menyinkronkan data dengan Google Sheets.', 'error');
      }
    } finally {
      if (!silent) setIsQuickSyncing(false);
    }
  };

  // Initial Sync & Event-Driven 2-Way Sync
  useEffect(() => {
    if (currentUser) {
      handleSyncData(true);

      const handleFocus = () => handleSyncData(true);
      const handleVisibilityChange = () => {
        if (document.visibilityState === 'visible') {
          handleSyncData(true);
        }
      };

      window.addEventListener('focus', handleFocus);
      document.addEventListener('visibilitychange', handleVisibilityChange);

      const intervalId = setInterval(() => {
        handleSyncData(true);
      }, 8000);

      return () => {
        window.removeEventListener('focus', handleFocus);
        document.removeEventListener('visibilitychange', handleVisibilityChange);
        clearInterval(intervalId);
      };
    }
  }, [currentUser, dbConfig.webAppUrl, deletedIds]);

  // Calculate Summary
  const summary: KasSummary = React.useMemo(() => {
    const totalPemasukan = transactions
      .filter((t) => t.jenis === 'Pemasukan')
      .reduce((sum, t) => sum + (Number(t.jumlah) || 0), 0);
    const totalPengeluaran = transactions
      .filter((t) => t.jenis === 'Pengeluaran')
      .reduce((sum, t) => sum + (Number(t.jumlah) || 0), 0);
    const saldoTotal = (Number(dbConfig.saldoAwal) || 0) + totalPemasukan - totalPengeluaran;

    return {
      totalPemasukan,
      totalPengeluaran,
      saldoTotal,
      jumlahTransaksi: transactions.length
    };
  }, [transactions, dbConfig.saldoAwal]);

  // Handle Save Transaction (Add / Edit) with Live Google Sheets Sync
  const handleSaveTransaction = async (txData: Omit<KasTransaction, 'saldoBerjalan'> & { id?: string }) => {
    const isEdit = !!txData.id;

    const cleanTx: KasTransaction = {
      id: isEdit ? txData.id! : `TRX-${Date.now()}-${Math.floor(Math.random() * 1000)}`,
      tanggal: txData.tanggal,
      jenis: txData.jenis,
      keterangan: txData.keterangan || (txData.jenis === 'Pemasukan' ? 'Pemasukan Kas' : 'Pengeluaran Kas'),
      jumlah: Number(txData.jumlah) || 0,
      kategori: txData.kategori || 'Umum',
      saldoBerjalan: 0
    };

    // Remove from deletedIds if present
    if (deletedIds.has(cleanTx.id)) {
      setDeletedIds(prev => {
        const next = new Set(prev);
        next.delete(cleanTx.id);
        try {
          localStorage.setItem(DELETED_IDS_KEY, JSON.stringify(Array.from(next)));
        } catch (e) {
          console.error(e);
        }
        return next;
      });
    }

    let updatedList: KasTransaction[];
    if (isEdit) {
      updatedList = transactions.map((t) => (t.id === cleanTx.id ? cleanTx : t));
    } else {
      updatedList = [cleanTx, ...transactions];
    }

    const calculated = calculateRunningBalances(updatedList, dbConfig.saldoAwal);
    setTransactions(calculated);
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(calculated));
    } catch (e) {
      console.error(e);
    }
    setIsFormModalOpen(false);
    setEditingTransaction(null);

    const targetUrl = dbConfig.webAppUrl || DEFAULT_DATABASE_CONFIG.webAppUrl;
    if (targetUrl) {
      try {
        if (isEdit) {
          const res = await gasApiService.updateTransaction(targetUrl, cleanTx);
          if (res.status === 'success') {
            showToast('Transaksi berhasil diperbarui dan tersimpan ke Google Sheets!');
          }
        } else {
          const res = await gasApiService.createTransaction(targetUrl, cleanTx);
          if (res.status === 'success') {
            showToast('Transaksi berhasil dicatat dan disinkronkan ke Google Sheets!');
          }
        }
      } catch (err: any) {
        showToast(err.message || 'Tersimpan lokal, sinkronisasi Google Sheets tertunda.', 'error');
      }
    } else {
      showToast(isEdit ? 'Transaksi berhasil diperbarui!' : 'Transaksi berhasil dicatat!');
    }
  };

  // Handle Delete Confirmation with Instant UI update and Live Google Sheets Sync
  const handleDeleteConfirm = async () => {
    if (!deleteTargetId) return;
    const idToDelete = deleteTargetId;
    setIsDeletingTx(true);

    try {
      // 1. Instantly remove from local transaction list & recalculate running balances
      const updatedList = transactions.filter((t) => t.id !== idToDelete);
      const calculated = calculateRunningBalances(updatedList, dbConfig.saldoAwal);
      setTransactions(calculated);
      
      // 2. Persist immediately to localStorage
      try {
        localStorage.setItem(STORAGE_KEY, JSON.stringify(calculated));
      } catch (e) {
        console.error(e);
      }

      // 3. Mark in deletedIds set to prevent background polling from resurrecting it
      setDeletedIds(prev => {
        const next = new Set(prev);
        next.add(idToDelete);
        try {
          localStorage.setItem(DELETED_IDS_KEY, JSON.stringify(Array.from(next)));
        } catch (e) {
          console.error(e);
        }
        return next;
      });

      // 4. Close modal and inform user
      setDeleteTargetId(null);
      showToast('Transaksi berhasil segera dihapus dari buku kas.');

      // 5. Send delete command to Google Apps Script Web App in background
      const targetUrl = dbConfig.webAppUrl || DEFAULT_DATABASE_CONFIG.webAppUrl;
      if (targetUrl) {
        gasApiService.deleteTransaction(targetUrl, idToDelete).then(res => {
          if (res.status === 'success') {
            console.log('Berhasil dihapus dari Google Sheets:', idToDelete);
          }
        }).catch(err => {
          console.warn('Sync delete tertunda:', err);
        });
      }
    } finally {
      setIsDeletingTx(false);
    }
  };

  const targetDeleteTx = transactions.find((t) => t.id === deleteTargetId) || null;
  const isAdmin = currentUser?.role === 'admin';

  // If user is not logged in, render the Login Page first
  if (!currentUser) {
    return (
      <>
        <LoginPage onLogin={handleLogin} />
        <OfflineIndicator />
        <PWAInstallButton variant="floating" />
      </>
    );
  }

  return (
    <div className="min-h-screen bg-[#EDF2F6] text-slate-800 flex font-sans selection:bg-[#348fe2]/20 selection:text-[#348fe2]">
      
      {/* Dark Sidebar (Matches uploaded admin screenshot palette) */}
      <Sidebar
        currentUser={currentUser}
        activeTab={activeTab}
        onChangeTab={setActiveTab}
        onOpenAddModal={() => {
          setEditingTransaction(null);
          setIsFormModalOpen(true);
        }}
        onQuickSync={handleSyncData}
        isSyncing={isQuickSyncing}
        onLogout={handleLogout}
        dbConfig={dbConfig}
        isOpen={isSidebarOpen}
        onCloseMobile={() => setIsSidebarOpen(false)}
        onOpenIconModal={() => setIsIconModalOpen(true)}
      />

      {/* Main Content Area (Offset for desktop sidebar) */}
      <div className="flex-1 flex flex-col min-h-screen lg:pl-64 w-full">
        
        {/* Top Header Bar */}
        <TopHeader
          currentUser={currentUser}
          activeTab={activeTab}
          onToggleSidebar={() => setIsSidebarOpen(!isSidebarOpen)}
          onOpenAddModal={() => {
            setEditingTransaction(null);
            setIsFormModalOpen(true);
          }}
          onQuickSync={handleSyncData}
          isSyncing={isQuickSyncing}
          dbConfig={dbConfig}
          totalTransactionsCount={transactions.length}
          onOpenIconModal={() => setIsIconModalOpen(true)}
        />

        {/* Main Canvas Body */}
        <main className="p-4 sm:p-6 lg:p-8 flex-1 space-y-6 max-w-7xl w-full mx-auto">

          {/* Toast Alert Notification */}
          {toast && (
            <div
              className={`fixed bottom-5 right-5 z-50 p-4 rounded-xl shadow-xl border text-xs sm:text-sm font-semibold flex items-center gap-2.5 transition-all animate-in fade-in slide-in-from-bottom-3 ${
                toast.type === 'success'
                  ? 'bg-slate-900 text-white border-slate-700'
                  : 'bg-rose-900 text-white border-rose-700'
              }`}
            >
              {toast.type === 'success' ? (
                <CheckCircle2 className="w-5 h-5 text-emerald-400 flex-shrink-0" />
              ) : (
                <AlertCircle className="w-5 h-5 text-rose-400 flex-shrink-0" />
              )}
              <span>{toast.message}</span>
            </div>
          )}

          {/* ========================================================= */}
          {/* HALAMAN 1: DASHBOARD PEMASUKAN & PENGELUARAN */}
          {/* ========================================================= */}
          {activeTab === 'dashboard' && (
            <div className="space-y-6 animate-in fade-in duration-200">

              {/* 4 Metric Summary Cards */}
              <DashboardCards summary={summary} />

              {/* Recent Transactions Widget with Edit & Delete */}
              <DashboardRecentTransactions
                transactions={transactions}
                userRole={currentUser.role}
                onOpenAddModal={() => {
                  setEditingTransaction(null);
                  setIsFormModalOpen(true);
                }}
                onEdit={(tx) => {
                  if (isAdmin) {
                    setEditingTransaction(tx);
                    setIsFormModalOpen(true);
                  } else {
                    showToast('Akses Ditolak: Hanya Admin yang dapat mengedit data transaksi.', 'error');
                  }
                }}
                onDelete={(id) => {
                  if (isAdmin) {
                    setDeleteTargetId(id);
                  } else {
                    showToast('Akses Ditolak: Hanya Admin yang dapat menghapus data transaksi.', 'error');
                  }
                }}
              />

            </div>
          )}

          {/* ========================================================= */}
          {/* HALAMAN 2: DATABASE SPREADSHEET (ADMIN ONLY) */}
          {/* ========================================================= */}
          {activeTab === 'sheet' && isAdmin && (
            <div className="animate-in fade-in duration-200">
              <SpreadsheetView 
                transactions={transactions} 
                config={dbConfig}
              />
            </div>
          )}

        </main>

        {/* Bottom Footer */}
        <footer className="bg-white border-t border-slate-200 py-4 px-6 text-center text-xs text-slate-400 mt-auto">
          <div className="max-w-7xl mx-auto flex flex-col sm:flex-row items-center justify-between gap-2">
            <div>
              <span>Buku Kas Digital • Terhubung Google Sheets</span>
            </div>
            <div>
              <span>Login sebagai: <strong>{currentUser.nama}</strong> ({currentUser.role.toUpperCase()})</span>
            </div>
          </div>
        </footer>

      </div>

      {/* Transaction Form Modal (Add / Edit) */}
      <TransactionFormModal
        isOpen={isFormModalOpen}
        onClose={() => {
          setIsFormModalOpen(false);
          setEditingTransaction(null);
        }}
        onSave={handleSaveTransaction}
        initialData={editingTransaction}
      />

      {/* Delete Confirmation Modal (Admin only) */}
      {isAdmin && (
        <DeleteConfirmModal
          isOpen={!!deleteTargetId}
          onClose={() => {
            if (!isDeletingTx) setDeleteTargetId(null);
          }}
          onConfirm={handleDeleteConfirm}
          transaction={targetDeleteTx}
          isDeleting={isDeletingTx}
        />
      )}

      {/* Offline Indicator & Floating PWA Install Prompt */}
      <OfflineIndicator />
      <PWAInstallButton variant="floating" />

      {/* PWA Icon Manager & Converter Modal */}
      <PWAIconModal
        isOpen={isIconModalOpen}
        onClose={() => setIsIconModalOpen(false)}
      />

    </div>
  );
}
