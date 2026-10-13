import React from 'react';
import { Trash2, Loader2 } from 'lucide-react';
import { KasTransaction } from '../types/kas';
import { formatRupiah } from '../data/initialData';

interface DeleteConfirmModalProps {
  isOpen: boolean;
  onClose: () => void;
  onConfirm: () => void;
  transaction: KasTransaction | null;
  isDeleting?: boolean;
}

export const DeleteConfirmModal: React.FC<DeleteConfirmModalProps> = ({
  isOpen,
  onClose,
  onConfirm,
  transaction,
  isDeleting = false
}) => {
  if (!isOpen || !transaction) return null;

  return (
    <div className="fixed inset-0 z-50 bg-slate-900/50 backdrop-blur-xs flex items-center justify-center p-4">
      <div className="bg-white w-full max-w-sm rounded-2xl shadow-xl p-6 text-center border border-slate-100 animate-in fade-in zoom-in duration-200">
        
        <div className="w-12 h-12 rounded-2xl bg-rose-100 text-rose-600 mx-auto flex items-center justify-center mb-3.5">
          <Trash2 className="w-6 h-6" />
        </div>

        <h3 className="text-base font-bold text-slate-900 mb-1">
          Hapus Transaksi Ini?
        </h3>

        <div className="my-3 p-3 bg-slate-50 rounded-xl border border-slate-100 text-left text-xs space-y-1.5">
          <div className="flex justify-between">
            <span className="text-slate-500">Tanggal:</span>
            <span className="font-semibold text-slate-800">{transaction.tanggal}</span>
          </div>
          <div className="flex justify-between">
            <span className="text-slate-500">Jenis:</span>
            <span className={`font-semibold ${transaction.jenis === 'Pemasukan' ? 'text-emerald-700' : 'text-rose-700'}`}>
              {transaction.jenis}
            </span>
          </div>
          <div className="flex justify-between">
            <span className="text-slate-500">Keterangan:</span>
            <span className="font-medium text-slate-700 truncate max-w-[170px]">{transaction.keterangan || '-'}</span>
          </div>
          <div className="flex justify-between">
            <span className="text-slate-500">Jumlah:</span>
            <span className={`font-bold ${transaction.jenis === 'Pemasukan' ? 'text-emerald-700' : 'text-rose-700'}`}>
              {formatRupiah(transaction.jumlah)}
            </span>
          </div>
        </div>

        <p className="text-xs text-slate-500 mb-5 leading-relaxed">
          Data akan segera dihapus permanen dari buku kas dan saldo akan dihitung ulang seketika.
        </p>

        <div className="flex items-center justify-center gap-3">
          <button
            type="button"
            onClick={onClose}
            disabled={isDeleting}
            className="flex-1 py-2 text-xs sm:text-sm font-semibold text-slate-600 hover:bg-slate-100 rounded-xl transition disabled:opacity-50"
          >
            Batal
          </button>
          <button
            type="button"
            onClick={onConfirm}
            disabled={isDeleting}
            className="flex-1 py-2 text-xs sm:text-sm font-bold text-white bg-rose-600 hover:bg-rose-700 rounded-xl shadow-xs transition active:scale-95 cursor-pointer disabled:opacity-75 flex items-center justify-center gap-1.5"
          >
            {isDeleting ? (
              <>
                <Loader2 className="w-3.5 h-3.5 animate-spin" />
                <span>Menghapus...</span>
              </>
            ) : (
              <span>Ya, Hapus</span>
            )}
          </button>
        </div>

      </div>
    </div>
  );
};
