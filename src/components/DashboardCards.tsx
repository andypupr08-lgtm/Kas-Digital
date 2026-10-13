import React from 'react';
import { 
  Wallet, 
  Banknote, 
  TrendingDown, 
  Receipt,
  ShoppingCart,
  DollarSign,
  BarChart3,
  Users
} from 'lucide-react';
import { KasSummary } from '../types/kas';
import { formatRupiah } from '../data/initialData';

interface DashboardCardsProps {
  summary: KasSummary;
}

export const DashboardCards: React.FC<DashboardCardsProps> = ({ summary }) => {
  const expenseRatio = summary.totalPemasukan > 0 
    ? Math.min(100, Math.round((summary.totalPengeluaran / summary.totalPemasukan) * 100))
    : 0;

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-5">
      
      {/* Card 1: Saldo Kas Berjalan (Green Accent) */}
      <div className="bg-white p-5 rounded-lg border border-slate-200/80 shadow-xs flex flex-col justify-between group hover:shadow-md transition">
        <div className="flex items-start justify-between">
          <div>
            <div className="text-xl sm:text-2xl font-bold text-slate-800 tracking-tight">
              {formatRupiah(summary.saldoTotal)}
            </div>
            <p className="text-xs text-slate-400 mt-1 font-medium">
              Saldo Kas Berjalan
            </p>
          </div>
          <div className="text-slate-400 p-2 group-hover:text-emerald-600 transition">
            <Wallet className="w-8 h-8 stroke-[1.5]" />
          </div>
        </div>

        {/* Bottom Color Accent Bar (Green) */}
        <div className="mt-4 pt-2">
          <div className="w-full h-2 bg-slate-100 rounded-full overflow-hidden">
            <div className="h-full bg-[#2ecc71] rounded-full w-3/4" />
          </div>
        </div>
      </div>

      {/* Card 2: Total Kas Masuk (Cyan/Blue Accent) */}
      <div className="bg-white p-5 rounded-lg border border-slate-200/80 shadow-xs flex flex-col justify-between group hover:shadow-md transition">
        <div className="flex items-start justify-between">
          <div>
            <div className="text-xl sm:text-2xl font-bold text-slate-800 tracking-tight">
              {formatRupiah(summary.totalPemasukan)}
            </div>
            <p className="text-xs text-slate-400 mt-1 font-medium">
              Total Kas Masuk
            </p>
          </div>
          <div className="text-slate-400 p-2 group-hover:text-sky-600 transition">
            <Banknote className="w-8 h-8 stroke-[1.5]" />
          </div>
        </div>

        {/* Bottom Color Accent Bar (Cyan / Blue) */}
        <div className="mt-4 pt-2">
          <div className="w-full h-2 bg-slate-100 rounded-full overflow-hidden">
            <div className="h-full bg-[#3498db] rounded-full w-1/2" />
          </div>
        </div>
      </div>

      {/* Card 3: Total Kas Keluar (Red/Coral Accent) */}
      <div className="bg-white p-5 rounded-lg border border-slate-200/80 shadow-xs flex flex-col justify-between group hover:shadow-md transition">
        <div className="flex items-start justify-between">
          <div>
            <div className="text-xl sm:text-2xl font-bold text-slate-800 tracking-tight">
              {formatRupiah(summary.totalPengeluaran)}
            </div>
            <p className="text-xs text-slate-400 mt-1 font-medium">
              Total Kas Keluar
            </p>
          </div>
          <div className="text-slate-400 p-2 group-hover:text-rose-600 transition">
            <BarChart3 className="w-8 h-8 stroke-[1.5]" />
          </div>
        </div>

        {/* Bottom Color Accent Bar (Red / Coral) */}
        <div className="mt-4 pt-2">
          <div className="w-full h-2 bg-slate-100 rounded-full overflow-hidden">
            <div 
              className="h-full bg-[#e74c3c] rounded-full transition-all" 
              style={{ width: `${Math.max(15, expenseRatio)}%` }} 
            />
          </div>
        </div>
      </div>

      {/* Card 4: Total Transaksi Tercatat (Orange/Amber Accent) */}
      <div className="bg-white p-5 rounded-lg border border-slate-200/80 shadow-xs flex flex-col justify-between group hover:shadow-md transition">
        <div className="flex items-start justify-between">
          <div>
            <div className="text-xl sm:text-2xl font-bold text-slate-800 tracking-tight">
              {summary.jumlahTransaksi}
            </div>
            <p className="text-xs text-slate-400 mt-1 font-medium">
              Transaksi Tercatat
            </p>
          </div>
          <div className="text-slate-400 p-2 group-hover:text-amber-600 transition">
            <Users className="w-8 h-8 stroke-[1.5]" />
          </div>
        </div>

        {/* Bottom Color Accent Bar (Orange / Amber) */}
        <div className="mt-4 pt-2">
          <div className="w-full h-2 bg-slate-100 rounded-full overflow-hidden">
            <div className="h-full bg-[#f39c12] rounded-full w-4/5" />
          </div>
        </div>
      </div>

    </div>
  );
};
