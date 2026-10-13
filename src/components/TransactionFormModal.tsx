import React, { useState, useEffect } from 'react';
import { KasTransaction, TransactionType } from '../types/kas';
import { X, ArrowDownCircle, ArrowUpCircle } from 'lucide-react';

interface TransactionFormModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: (data: Omit<KasTransaction, 'saldoBerjalan'> & { id?: string }) => void;
  initialData?: KasTransaction | null;
}

export const TransactionFormModal: React.FC<TransactionFormModalProps> = ({
  isOpen,
  onClose,
  onSave,
  initialData
}) => {
  const [jenis, setJenis] = useState<TransactionType>('Pemasukan');
  const [tanggal, setTanggal] = useState<string>('');
  const [jumlah, setJumlah] = useState<string>('');
  const [keterangan, setKeterangan] = useState<string>('');
  const [errorMessage, setErrorMessage] = useState<string>('');

  useEffect(() => {
    if (isOpen) {
      if (initialData) {
        setJenis(initialData.jenis);
        setTanggal(initialData.tanggal);
        setJumlah(initialData.jumlah.toString());
        setKeterangan(initialData.keterangan || '');
      } else {
        const today = new Date().toISOString().split('T')[0];
        setJenis('Pemasukan');
        setTanggal(today);
        setJumlah('');
        setKeterangan('');
      }
      setErrorMessage('');
    }
  }, [isOpen, initialData]);

  if (!isOpen) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    const numericAmount = parseFloat(jumlah);
    if (isNaN(numericAmount) || numericAmount <= 0) {
      setErrorMessage('Nominal jumlah harus berupa angka lebih dari 0.');
      return;
    }

    if (!tanggal) {
      setErrorMessage('Tanggal transaksi wajib diisi.');
      return;
    }

    if (!keterangan.trim()) {
      setErrorMessage('Keterangan transaksi wajib diisi.');
      return;
    }

    onSave({
      id: initialData?.id,
      tanggal,
      jenis,
      kategori: initialData?.kategori || '-',
      keterangan: keterangan.trim(),
      jumlah: numericAmount
    });

    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs animate-in fade-in">
      <div 
        className="bg-white w-full max-w-lg rounded-2xl shadow-xl border border-slate-100 overflow-hidden flex flex-col max-h-[90vh]"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-slate-100 bg-slate-50/50">
          <div>
            <h3 className="text-base font-bold text-slate-900">
              {initialData ? 'Ubah Transaksi Kas' : 'Catat Transaksi Kas Baru'}
            </h3>
            <p className="text-xs text-slate-500">
              {initialData ? `Mengedit data ${initialData.id}` : 'Data akan tersimpan ke Google Sheets & Web App'}
            </p>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 text-slate-400 hover:text-slate-700 hover:bg-slate-200/60 rounded-xl transition cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Form Body */}
        <form onSubmit={handleSubmit} className="p-6 space-y-4 overflow-y-auto">
          
          {errorMessage && (
            <div className="p-3 rounded-xl bg-rose-50 border border-rose-200 text-xs font-semibold text-rose-700">
              {errorMessage}
            </div>
          )}

          {/* Jenis Transaksi (Tab Switcher) */}
          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1.5">
              Jenis Transaksi <span className="text-rose-500">*</span>
            </label>
            <div className="grid grid-cols-2 gap-3">
              <button
                type="button"
                onClick={() => setJenis('Pemasukan')}
                className={`flex items-center justify-center gap-2 p-3 border-2 rounded-xl font-bold text-xs sm:text-sm transition cursor-pointer ${
                  jenis === 'Pemasukan'
                    ? 'border-emerald-500 bg-emerald-50 text-emerald-700 shadow-xs'
                    : 'border-slate-200 bg-slate-50 text-slate-600 hover:bg-slate-100'
                }`}
              >
                <ArrowDownCircle className="w-4 h-4 text-emerald-600" />
                <span>Kas Masuk (Pemasukan)</span>
              </button>

              <button
                type="button"
                onClick={() => setJenis('Pengeluaran')}
                className={`flex items-center justify-center gap-2 p-3 border-2 rounded-xl font-bold text-xs sm:text-sm transition cursor-pointer ${
                  jenis === 'Pengeluaran'
                    ? 'border-rose-500 bg-rose-50 text-rose-700 shadow-xs'
                    : 'border-slate-200 bg-slate-50 text-slate-600 hover:bg-slate-100'
                }`}
              >
                <ArrowUpCircle className="w-4 h-4 text-rose-600" />
                <span>Kas Keluar (Pengeluaran)</span>
              </button>
            </div>
          </div>

          {/* Tanggal & Nominal Jumlah */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1.5">
                Tanggal <span className="text-rose-500">*</span>
              </label>
              <input
                type="date"
                required
                value={tanggal}
                onChange={(e) => setTanggal(e.target.value)}
                className="w-full px-3.5 py-2 text-sm bg-slate-50 border border-slate-200 rounded-xl focus:bg-white focus:outline-none focus:ring-2 focus:ring-emerald-500"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1.5">
                Nominal Jumlah <span className="text-rose-500">*</span>
              </label>
              <input
                type="number"
                step="any"
                min="0.01"
                required
                placeholder="Contoh: 500000"
                value={jumlah}
                onChange={(e) => setJumlah(e.target.value)}
                className="w-full px-3.5 py-2 text-sm bg-slate-50 border border-slate-200 rounded-xl font-mono focus:bg-white focus:outline-none focus:ring-2 focus:ring-emerald-500 font-medium"
              />
            </div>
          </div>

          {/* Keterangan */}
          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1.5">
              Keterangan Transaksi <span className="text-rose-500">*</span>
            </label>
            <textarea
              required
              rows={3}
              placeholder="Contoh: Pembayaran operasional kas bulanan..."
              value={keterangan}
              onChange={(e) => setKeterangan(e.target.value)}
              className="w-full px-3.5 py-2 text-sm bg-slate-50 border border-slate-200 rounded-xl focus:bg-white focus:outline-none focus:ring-2 focus:ring-emerald-500"
            />
          </div>

          {/* Action Buttons */}
          <div className="flex items-center justify-end gap-3 pt-4 border-t border-slate-100">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 text-xs sm:text-sm font-semibold text-slate-600 hover:bg-slate-100 rounded-xl transition cursor-pointer"
            >
              Batal
            </button>
            <button
              type="submit"
              className="px-5 py-2 text-xs sm:text-sm font-semibold bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl shadow-xs transition active:scale-95 cursor-pointer"
            >
              {initialData ? 'Simpan Perubahan' : 'Simpan Transaksi'}
            </button>
          </div>

        </form>
      </div>
    </div>
  );
};
