import React, { useState } from 'react';
import { KasTransaction, UserRole } from '../types/kas';
import { formatRupiah } from '../data/initialData';
import { 
  ArrowUpRight, 
  ArrowDownLeft, 
  Clock, 
  PlusCircle, 
  Inbox,
  Edit3,
  Trash2,
  Lock,
  ChevronDown,
  ChevronUp
} from 'lucide-react';

interface DashboardRecentTransactionsProps {
  transactions: KasTransaction[];
  onOpenAddModal: () => void;
  onEdit?: (transaction: KasTransaction) => void;
  onDelete?: (id: string) => void;
  userRole?: UserRole;
}

export const DashboardRecentTransactions: React.FC<DashboardRecentTransactionsProps> = ({
  transactions,
  onOpenAddModal,
  onEdit,
  onDelete,
  userRole = 'admin'
}) => {
  const isAdmin = userRole === 'admin';
  const [showAll, setShowAll] = useState(false);

  // Sort latest first
  const sortedList = [...transactions].sort((a, b) => b.tanggal.localeCompare(a.tanggal));
  const displayedList = showAll ? sortedList : sortedList.slice(0, 10);

  return (
    <div className="bg-white rounded-2xl border border-slate-200/80 shadow-xs overflow-hidden">
      {/* Header */}
      <div className="p-4 sm:p-5 border-b border-slate-100 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div>
          <div className="flex items-center gap-2">
            <Clock className="w-4 h-4 text-emerald-600" />
            <h3 className="text-base font-bold text-slate-900">Daftar Transaksi Kas</h3>
            <span className="text-xs px-2 py-0.5 bg-slate-100 text-slate-700 font-semibold rounded-full">
              {transactions.length} Total
            </span>
          </div>
          <p className="text-xs text-slate-500 mt-0.5">
            Pencatatan kas masuk dan kas keluar dengan fitur edit dan hapus
          </p>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={onOpenAddModal}
            className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white text-xs sm:text-sm font-semibold shadow-xs transition active:scale-95 cursor-pointer"
          >
            <PlusCircle className="w-4 h-4" />
            <span>Catat Kas Baru</span>
          </button>
        </div>
      </div>

      {/* Transaction Items List */}
      <div className="divide-y divide-slate-100">
        {displayedList.length === 0 ? (
          <div className="py-12 text-center text-slate-400">
            <Inbox className="w-10 h-10 mx-auto text-slate-300 mb-2" />
            <p className="text-sm font-semibold text-slate-600">Belum ada transaksi kas</p>
            <p className="text-xs text-slate-400 mt-0.5">Klik tombol "Catat Kas Baru" untuk menambahkan transaksi pertama.</p>
          </div>
        ) : (
          displayedList.map((item) => {
            const isMasuk = item.jenis === 'Pemasukan';
            return (
              <div 
                key={item.id} 
                className="p-4 sm:px-6 hover:bg-slate-50/80 transition flex flex-col sm:flex-row sm:items-center justify-between gap-3 sm:gap-4 group"
              >
                {/* Left Info: Icon & Details */}
                <div className="flex items-center gap-3.5 min-w-0 flex-1">
                  <div className={`w-10 h-10 rounded-xl flex items-center justify-center flex-shrink-0 ${
                    isMasuk 
                      ? 'bg-emerald-50 text-emerald-700 border border-emerald-200' 
                      : 'bg-rose-50 text-rose-700 border border-rose-200'
                  }`}>
                    {isMasuk ? (
                      <ArrowDownLeft className="w-5 h-5" />
                    ) : (
                      <ArrowUpRight className="w-5 h-5" />
                    )}
                  </div>
                  
                  <div className="min-w-0 flex-1">
                    <p className="text-sm font-bold text-slate-900 truncate">
                      {item.keterangan || (isMasuk ? 'Pemasukan Kas' : 'Pengeluaran Kas')}
                    </p>
                    
                    <div className="flex items-center gap-2 text-xs text-slate-500 mt-1 flex-wrap">
                      <span className="font-semibold text-slate-700">{item.tanggal}</span>
                      <span>•</span>

                      <span className={`px-2.5 py-0.5 rounded-full text-[11px] font-bold ${
                        isMasuk ? 'bg-emerald-50 text-emerald-700 border border-emerald-200' : 'bg-rose-50 text-rose-700 border border-rose-200'
                      }`}>
                        {item.jenis}
                      </span>
                    </div>
                  </div>
                </div>

                {/* Right Side: Nominal, Saldo, & Action Buttons (Edit / Delete) */}
                <div className="flex items-center justify-between sm:justify-end gap-3 sm:gap-4 pl-13 sm:pl-0 pt-1 sm:pt-0 border-t sm:border-t-0 border-slate-100">
                  
                  <div className="text-left sm:text-right flex-shrink-0">
                    <div className={`text-sm sm:text-base font-extrabold ${
                      isMasuk ? 'text-emerald-600' : 'text-rose-600'
                    }`}>
                      {isMasuk ? '+ ' : '- '}{formatRupiah(item.jumlah)}
                    </div>
                    <div className="text-[11px] text-slate-400 font-medium">
                      Saldo: <span className="font-bold text-slate-700">{formatRupiah(item.saldoBerjalan)}</span>
                    </div>
                  </div>

                  {/* Action Buttons: Edit & Hapus */}
                  <div className="flex items-center gap-1.5 flex-shrink-0">
                    {isAdmin ? (
                      <>
                        {onEdit && (
                          <button
                            onClick={() => onEdit(item)}
                            className="inline-flex items-center gap-1 px-2.5 py-1.5 rounded-xl bg-slate-100 hover:bg-emerald-50 text-slate-600 hover:text-emerald-700 border border-slate-200 hover:border-emerald-200 text-xs font-semibold transition cursor-pointer"
                            title="Edit Transaksi Ini"
                          >
                            <Edit3 className="w-3.5 h-3.5" />
                            <span className="hidden md:inline">Edit</span>
                          </button>
                        )}
                        {onDelete && (
                          <button
                            onClick={() => onDelete(item.id)}
                            className="inline-flex items-center gap-1 px-2.5 py-1.5 rounded-xl bg-slate-100 hover:bg-rose-50 text-slate-600 hover:text-rose-700 border border-slate-200 hover:border-rose-200 text-xs font-semibold transition cursor-pointer"
                            title="Hapus Transaksi Ini"
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                            <span className="hidden md:inline">Hapus</span>
                          </button>
                        )}
                      </>
                    ) : (
                      <span 
                        className="inline-flex items-center gap-1 px-2 py-1 rounded-lg bg-slate-100 text-slate-400 text-[11px] font-medium"
                        title="Akun User hanya memiliki akses input data"
                      >
                        <Lock className="w-3 h-3" />
                        <span>Input Saja</span>
                      </span>
                    )}
                  </div>

                </div>

              </div>
            );
          })
        )}
      </div>

      {/* Show More / Show Less Button if > 10 items */}
      {sortedList.length > 10 && (
        <div className="p-3 bg-slate-50 border-t border-slate-100 text-center">
          <button
            onClick={() => setShowAll(!showAll)}
            className="text-xs font-bold text-emerald-700 hover:text-emerald-800 inline-flex items-center gap-1.5 transition cursor-pointer"
          >
            {showAll ? (
              <>
                <span>Tampilkan Lebih Sedikit</span>
                <ChevronUp className="w-3.5 h-3.5" />
              </>
            ) : (
              <>
                <span>Tampilkan Seluruh {sortedList.length} Transaksi</span>
                <ChevronDown className="w-3.5 h-3.5" />
              </>
            )}
          </button>
        </div>
      )}

    </div>
  );
};
