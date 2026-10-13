import React from 'react';
import { KasTransaction } from '../types/kas';
import { formatRupiah } from '../data/initialData';
import { BarChart3, TrendingUp } from 'lucide-react';

interface MonthlyChartProps {
  transactions: KasTransaction[];
}

export const MonthlyChart: React.FC<MonthlyChartProps> = ({ transactions }) => {
  // Aggregate data by month
  const monthlyData: { [key: string]: { pemasukan: number; pengeluaran: number } } = {};

  transactions.forEach((t) => {
    if (!t.tanggal) return;
    const monthKey = t.tanggal.substring(0, 7); // YYYY-MM
    if (!monthlyData[monthKey]) {
      monthlyData[monthKey] = { pemasukan: 0, pengeluaran: 0 };
    }
    if (t.jenis === 'Pemasukan') {
      monthlyData[monthKey].pemasukan += t.jumlah;
    } else {
      monthlyData[monthKey].pengeluaran += t.jumlah;
    }
  });

  const sortedMonths = Object.keys(monthlyData).sort();

  // Find maximum value to scale the bars
  let maxAmount = 100000;
  sortedMonths.forEach((m) => {
    const p = monthlyData[m].pemasukan;
    const k = monthlyData[m].pengeluaran;
    if (p > maxAmount) maxAmount = p;
    if (k > maxAmount) maxAmount = k;
  });

  return (
    <div className="bg-white p-5 sm:p-6 rounded-2xl border border-slate-200/80 shadow-xs space-y-4">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div className="flex items-center gap-2.5">
          <div className="p-2 rounded-xl bg-slate-100 text-slate-700">
            <BarChart3 className="w-5 h-5" />
          </div>
          <div>
            <h2 className="text-base font-bold text-slate-900">Tren Pemasukan vs Pengeluaran</h2>
            <p className="text-xs text-slate-500">Perbandingan arus kas masuk dan keluar per periode bulan</p>
          </div>
        </div>

        {/* Legend */}
        <div className="flex items-center gap-4 text-xs font-semibold">
          <div className="flex items-center gap-1.5 text-emerald-700">
            <span className="w-3 h-3 rounded-md bg-emerald-500 shadow-xs"></span>
            <span>Pemasukan</span>
          </div>
          <div className="flex items-center gap-1.5 text-rose-700">
            <span className="w-3 h-3 rounded-md bg-rose-500 shadow-xs"></span>
            <span>Pengeluaran</span>
          </div>
        </div>
      </div>

      {/* Chart Visualization */}
      {sortedMonths.length === 0 ? (
        <div className="h-48 flex items-center justify-center text-slate-400 text-sm">
          Belum ada data transaksi untuk ditampilkan
        </div>
      ) : (
        <div className="space-y-4 pt-2">
          {sortedMonths.map((m) => {
            const parts = m.split('-');
            const dateObj = new Date(parseInt(parts[0]), parseInt(parts[1]) - 1);
            const monthLabel = dateObj.toLocaleDateString('id-ID', { month: 'long', year: 'numeric' });
            
            const pemasukan = monthlyData[m].pemasukan;
            const pengeluaran = monthlyData[m].pengeluaran;
            const selisih = pemasukan - pengeluaran;

            const pPct = Math.min(100, Math.round((pemasukan / maxAmount) * 100));
            const kPct = Math.min(100, Math.round((pengeluaran / maxAmount) * 100));

            return (
              <div key={m} className="p-3.5 rounded-xl bg-slate-50 border border-slate-100 space-y-2">
                <div className="flex items-center justify-between text-xs">
                  <span className="font-bold text-slate-800">{monthLabel}</span>
                  <span className={`font-semibold ${selisih >= 0 ? 'text-emerald-700' : 'text-rose-700'}`}>
                    Net: {selisih >= 0 ? '+' : ''}{formatRupiah(selisih)}
                  </span>
                </div>

                {/* Bar Pemasukan */}
                <div className="space-y-1">
                  <div className="flex justify-between text-[11px] text-slate-600">
                    <span className="font-medium">Kas Masuk</span>
                    <span className="font-semibold text-emerald-700">{formatRupiah(pemasukan)}</span>
                  </div>
                  <div className="h-2.5 w-full bg-slate-200 rounded-full overflow-hidden">
                    <div
                      className="h-full bg-emerald-500 rounded-full transition-all duration-500"
                      style={{ width: `${Math.max(4, pPct)}%` }}
                    ></div>
                  </div>
                </div>

                {/* Bar Pengeluaran */}
                <div className="space-y-1">
                  <div className="flex justify-between text-[11px] text-slate-600">
                    <span className="font-medium">Kas Keluar</span>
                    <span className="font-semibold text-rose-700">{formatRupiah(pengeluaran)}</span>
                  </div>
                  <div className="h-2.5 w-full bg-slate-200 rounded-full overflow-hidden">
                    <div
                      className="h-full bg-rose-500 rounded-full transition-all duration-500"
                      style={{ width: `${Math.max(4, kPct)}%` }}
                    ></div>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
};
