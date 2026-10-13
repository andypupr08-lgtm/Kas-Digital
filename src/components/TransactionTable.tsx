import React, { useState } from 'react';
import { 
  KasTransaction, 
  FilterOptions, 
  TransactionType,
  UserRole
} from '../types/kas';
import { 
  formatRupiah 
} from '../data/initialData';
import { 
  Search, 
  Filter, 
  Edit3, 
  Trash2, 
  ArrowUpDown, 
  Download, 
  RotateCcw,
  CheckCircle2,
  Inbox,
  Copy,
  Lock,
  ShieldCheck
} from 'lucide-react';

interface TransactionTableProps {
  transactions: KasTransaction[];
  onEdit?: (transaction: KasTransaction) => void;
  onDelete?: (id: string) => void;
  userRole?: UserRole;
}

export const TransactionTable: React.FC<TransactionTableProps> = ({
  transactions,
  onEdit,
  onDelete,
  userRole = 'admin'
}) => {
  const isAdmin = userRole === 'admin';
  const [filters, setFilters] = useState<FilterOptions>({
    search: '',
    jenis: 'Semua',
    startDate: '',
    endDate: '',
    sortBy: 'tanggal-desc'
  });

  const handleResetFilters = () => {
    setFilters({
      search: '',
      jenis: 'Semua',
      startDate: '',
      endDate: '',
      sortBy: 'tanggal-desc'
    });
  };

  // Filter & Search Evaluation
  const filteredList = transactions.filter((t) => {
    // Filter Jenis
    if (filters.jenis !== 'Semua' && t.jenis !== filters.jenis) return false;
    // Filter Tanggal
    if (filters.startDate && t.tanggal < filters.startDate) return false;
    if (filters.endDate && t.tanggal > filters.endDate) return false;
    // Search
    if (filters.search) {
      const q = filters.search.toLowerCase();
      const combined = `${t.keterangan} ${t.jumlah}`.toLowerCase();
      if (!combined.includes(q)) return false;
    }
    return true;
  });

  // Sorting
  const sortedList = [...filteredList].sort((a, b) => {
    if (filters.sortBy === 'tanggal-desc') {
      return b.tanggal.localeCompare(a.tanggal);
    } else if (filters.sortBy === 'tanggal-asc') {
      return a.tanggal.localeCompare(b.tanggal);
    } else if (filters.sortBy === 'jumlah-desc') {
      return b.jumlah - a.jumlah;
    } else if (filters.sortBy === 'jumlah-asc') {
      return a.jumlah - b.jumlah;
    }
    return 0;
  });

  // Export to CSV
  const handleExportCSV = () => {
    const headers = ['Tanggal', 'Jenis', 'Keterangan', 'Jumlah (Rp)', 'Saldo Berjalan (Rp)'];
    const rows = sortedList.map((t) => [
      `"${t.tanggal}"`,
      `"${t.jenis}"`,
      `"${t.keterangan.replace(/"/g, '""')}"`,
      t.jumlah,
      t.saldoBerjalan
    ]);

    const csvContent = 'data:text/csv;charset=utf-8,\uFEFF' + [headers.join(','), ...rows.map(e => e.join(','))].join('\n');
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement('a');
    link.setAttribute('href', encodedUri);
    link.setAttribute('download', `laporan_kas_${new Date().toISOString().slice(0, 10)}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  return (
    <div className="space-y-4">
      
      {/* FILTER CONTROLS TOOLBAR */}
      <div className="bg-white p-5 rounded-2xl border border-slate-200/80 shadow-xs space-y-4">
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-3">
          
          <div className="flex items-center gap-2.5">
            <Filter className="w-4 h-4 text-emerald-600" />
            <h2 className="text-base font-bold text-slate-900">Riwayat & Filter Transaksi</h2>
            <span className={`inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[11px] font-bold border ${
              isAdmin 
                ? 'bg-emerald-50 text-emerald-800 border-emerald-200' 
                : 'bg-slate-100 text-slate-700 border-slate-200'
            }`}>
              {isAdmin ? (
                <>
                  <ShieldCheck className="w-3 h-3 text-emerald-600" />
                  <span>Admin: Akses Penuh</span>
                </>
              ) : (
                <>
                  <Lock className="w-3 h-3 text-slate-500" />
                  <span>User: Hanya Input & Lihat</span>
                </>
              )}
            </span>
          </div>

          {/* Quick Jenis Toggle */}
          <div className="inline-flex p-1 bg-slate-100 rounded-xl text-xs font-semibold self-start lg:self-auto">
            {(['Semua', 'Pemasukan', 'Pengeluaran'] as const).map((jenis) => (
              <button
                key={jenis}
                onClick={() => setFilters({ ...filters, jenis })}
                className={`px-3 py-1.5 rounded-lg transition ${
                  filters.jenis === jenis
                    ? 'bg-white text-slate-900 shadow-xs'
                    : 'text-slate-600 hover:text-slate-900'
                }`}
              >
                {jenis}
              </button>
            ))}
          </div>

        </div>

        {/* Input Filters Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3 pt-1">
          {/* Search Box */}
          <div className="relative lg:col-span-2">
            <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-3" />
            <input
              type="text"
              value={filters.search}
              onChange={(e) => setFilters({ ...filters, search: e.target.value })}
              placeholder="Cari keterangan atau nominal..."
              className="w-full pl-9 pr-3.5 py-2 text-xs sm:text-sm bg-slate-50 border border-slate-200 rounded-xl focus:bg-white focus:outline-none focus:ring-2 focus:ring-emerald-500"
            />
          </div>

          {/* Start Date */}
          <div>
            <input
              type="date"
              value={filters.startDate}
              onChange={(e) => setFilters({ ...filters, startDate: e.target.value })}
              className="w-full px-3 py-2 text-xs sm:text-sm bg-slate-50 border border-slate-200 rounded-xl focus:bg-white focus:outline-none focus:ring-2 focus:ring-emerald-500"
              title="Dari Tanggal"
            />
          </div>

          {/* End Date */}
          <div>
            <input
              type="date"
              value={filters.endDate}
              onChange={(e) => setFilters({ ...filters, endDate: e.target.value })}
              className="w-full px-3 py-2 text-xs sm:text-sm bg-slate-50 border border-slate-200 rounded-xl focus:bg-white focus:outline-none focus:ring-2 focus:ring-emerald-500"
              title="Sampai Tanggal"
            />
          </div>
        </div>

        {/* Second Row: Sort & Export */}
        <div className="flex flex-wrap items-center justify-between gap-3 pt-2 border-t border-slate-100 text-xs">
          <div className="flex items-center gap-2">
            <span className="text-slate-500 font-medium">Urutkan:</span>
            <select
              value={filters.sortBy}
              onChange={(e) => setFilters({ ...filters, sortBy: e.target.value as any })}
              className="bg-transparent font-semibold text-slate-800 border-none focus:ring-0 cursor-pointer"
            >
              <option value="tanggal-desc">Tanggal Terbaru</option>
              <option value="tanggal-asc">Tanggal Terlama</option>
              <option value="jumlah-desc">Nominal Terbesar</option>
              <option value="jumlah-asc">Nominal Terkecil</option>
            </select>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={handleResetFilters}
              className="inline-flex items-center gap-1 text-slate-500 hover:text-slate-800 px-2.5 py-1.5 rounded-lg hover:bg-slate-100 transition"
            >
              <RotateCcw className="w-3.5 h-3.5" />
              <span>Reset Filter</span>
            </button>

            <button
              onClick={handleExportCSV}
              className="inline-flex items-center gap-1.5 bg-slate-900 hover:bg-slate-800 text-white px-3 py-1.5 rounded-lg font-medium shadow-xs transition"
            >
              <Download className="w-3.5 h-3.5" />
              <span>Unduh CSV</span>
            </button>
          </div>
        </div>

      </div>

      {/* TRANSACTION DATA TABLE */}
      <div className="bg-white rounded-2xl border border-slate-200/80 shadow-xs overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs sm:text-sm text-slate-600">
            <thead className="bg-slate-50 text-slate-700 font-semibold uppercase text-[11px] tracking-wider border-b border-slate-200">
              <tr>
                <th className="py-3.5 px-4">Tanggal</th>
                <th className="py-3.5 px-4">Jenis</th>
                <th className="py-3.5 px-4">Keterangan</th>
                <th className="py-3.5 px-4 text-right">Jumlah</th>
                <th className="py-3.5 px-4 text-right">Saldo Berjalan</th>
                <th className="py-3.5 px-4 text-center">{isAdmin ? 'Aksi Admin' : 'Hak Akses'}</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {sortedList.length === 0 ? (
                <tr>
                  <td colSpan={6} className="py-12 text-center text-slate-400">
                    <div className="flex flex-col items-center justify-center gap-2">
                      <Inbox className="w-10 h-10 text-slate-300" />
                      <p className="font-semibold text-slate-600 text-sm">Tidak ada transaksi yang sesuai filter</p>
                      <p className="text-xs text-slate-400">Coba ubah kata kunci pencarian atau tanggal.</p>
                    </div>
                  </td>
                </tr>
              ) : (
                sortedList.map((item) => {
                  const isMasuk = item.jenis === 'Pemasukan';
                  return (
                    <tr key={item.id} className="hover:bg-slate-50/80 transition group">
                      
                      {/* Tanggal */}
                      <td className="py-3 px-4 whitespace-nowrap">
                        <div className="font-semibold text-slate-800">{item.tanggal}</div>
                      </td>

                      {/* Jenis Badge */}
                      <td className="py-3 px-4 whitespace-nowrap">
                        <span
                          className={`inline-flex items-center px-2.5 py-1 rounded-full text-xs font-semibold ${
                            isMasuk
                              ? 'bg-emerald-50 text-emerald-700 border border-emerald-200'
                              : 'bg-rose-50 text-rose-700 border border-rose-200'
                          }`}
                        >
                          {item.jenis}
                        </span>
                      </td>

                      {/* Keterangan */}
                      <td className="py-3 px-4 text-slate-700 max-w-sm font-medium">
                        {item.keterangan || '-'}
                      </td>

                      {/* Jumlah Nominal */}
                      <td className={`py-3 px-4 text-right whitespace-nowrap font-bold ${
                        isMasuk ? 'text-emerald-600' : 'text-rose-600'
                      }`}>
                        {isMasuk ? '+ ' : '- '}{formatRupiah(item.jumlah)}
                      </td>

                      {/* Saldo Berjalan */}
                      <td className="py-3 px-4 text-right whitespace-nowrap font-extrabold text-slate-900">
                        {formatRupiah(item.saldoBerjalan)}
                      </td>

                      {/* Aksi (Admin: Edit/Delete, User: Restricted badge) */}
                      <td className="py-3 px-4 text-center whitespace-nowrap">
                        {isAdmin ? (
                          <div className="flex items-center justify-center gap-1.5">
                            {onEdit && (
                              <button
                                onClick={() => onEdit(item)}
                                className="p-1.5 text-slate-400 hover:text-emerald-700 hover:bg-emerald-50 rounded-lg transition"
                                title="Edit Transaksi (Admin)"
                              >
                                <Edit3 className="w-4 h-4" />
                              </button>
                            )}
                            {onDelete && (
                              <button
                                onClick={() => onDelete(item.id)}
                                className="p-1.5 text-slate-400 hover:text-rose-700 hover:bg-rose-50 rounded-lg transition"
                                title="Hapus Transaksi (Admin)"
                              >
                                <Trash2 className="w-4 h-4" />
                              </button>
                            )}
                          </div>
                        ) : (
                          <span 
                            className="inline-flex items-center gap-1 px-2 py-0.5 rounded-md bg-slate-100 text-slate-500 text-[11px] font-medium"
                            title="Akun User hanya dapat input data baru, tidak dapat edit/hapus"
                          >
                            <Lock className="w-3 h-3 text-slate-400" />
                            <span>Hanya Lihat</span>
                          </span>
                        )}
                      </td>

                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>

        {/* Table Footer Summary */}
        <div className="p-4 bg-slate-50 border-t border-slate-100 flex flex-col sm:flex-row items-center justify-between gap-2 text-xs text-slate-500">
          <span>Menampilkan <strong>{sortedList.length}</strong> dari <strong>{transactions.length}</strong> total transaksi</span>
          <span className="text-slate-400">
            {isAdmin 
              ? '*Admin memiliki izin penuh untuk mengedit data dan menghapus transaksi.'
              : '*Akun User hanya diizinkan untuk input transaksi baru. Hak edit & hapus dibatasi untuk Admin.'}
          </span>
        </div>

      </div>

    </div>
  );
};
