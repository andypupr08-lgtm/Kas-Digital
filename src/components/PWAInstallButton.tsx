import React, { useState } from 'react';
import { usePWAInstall } from '../hooks/usePWAInstall';
import { Download, Smartphone, X, CheckCircle, Share2, PlusSquare } from 'lucide-react';

interface PWAInstallButtonProps {
  variant?: 'sidebar' | 'header' | 'floating';
}

export const PWAInstallButton: React.FC<PWAInstallButtonProps> = ({ variant = 'sidebar' }) => {
  const { isInstallable, isInstalled, isIOS, install } = usePWAInstall();
  const [showIOSGuide, setShowIOSGuide] = useState(false);
  const [dismissedFloating, setDismissedFloating] = useState(false);

  // If already running as an installed PWA, hide install buttons
  if (isInstalled) {
    return null;
  }

  // Floating banner variant (bottom right on mobile/desktop if installable or iOS)
  if (variant === 'floating') {
    if (dismissedFloating) return null;
    if (!isInstallable && !isIOS) return null;

    return (
      <>
        <div className="fixed bottom-4 right-4 z-40 max-w-sm bg-slate-900 text-white rounded-2xl p-4 shadow-2xl border border-slate-700/80 flex items-start gap-3 animate-fade-in">
          <div className="w-10 h-10 rounded-xl bg-emerald-600/20 border border-emerald-500/30 flex items-center justify-center flex-shrink-0 text-emerald-400">
            <Smartphone className="w-5 h-5" />
          </div>
          <div className="flex-1 min-w-0 pr-2">
            <h4 className="text-xs font-bold text-slate-100 flex items-center gap-1.5">
              <span>Install Buku Kas</span>
              <span className="px-1.5 py-0.5 rounded text-[10px] bg-emerald-500/20 text-emerald-300 font-semibold">PWA</span>
            </h4>
            <p className="text-[11px] text-slate-300 mt-1 leading-snug">
              Pasang di HP atau Komputer untuk akses cepat layaknya aplikasi native tanpa buka browser.
            </p>
            <div className="mt-2.5 flex items-center gap-2">
              {isInstallable && (
                <button
                  onClick={install}
                  className="px-3 py-1.5 rounded-lg bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-bold transition flex items-center gap-1.5 shadow-xs cursor-pointer"
                >
                  <Download className="w-3.5 h-3.5" />
                  <span>Pasang Sekarang</span>
                </button>
              )}
              {isIOS && (
                <button
                  onClick={() => setShowIOSGuide(true)}
                  className="px-3 py-1.5 rounded-lg bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-bold transition flex items-center gap-1.5 shadow-xs cursor-pointer"
                >
                  <Smartphone className="w-3.5 h-3.5" />
                  <span>Cara Pasang di iOS</span>
                </button>
              )}
              <button
                onClick={() => setDismissedFloating(true)}
                className="px-2 py-1.5 text-xs text-slate-400 hover:text-slate-200 transition"
              >
                Nanti
              </button>
            </div>
          </div>
          <button
            onClick={() => setDismissedFloating(true)}
            className="text-slate-400 hover:text-slate-200 p-1"
            title="Tutup"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {showIOSGuide && (
          <IOSInstallModal onClose={() => setShowIOSGuide(false)} />
        )}
      </>
    );
  }

  // Header button variant
  if (variant === 'header') {
    if (isInstallable) {
      return (
        <button
          onClick={install}
          className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold shadow-xs transition active:scale-95 cursor-pointer"
          title="Install Buku Kas sebagai Aplikasi (PWA)"
        >
          <Download className="w-3.5 h-3.5" />
          <span className="hidden sm:inline">Install App</span>
        </button>
      );
    }
    if (isIOS) {
      return (
        <>
          <button
            onClick={() => setShowIOSGuide(true)}
            className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold shadow-xs transition active:scale-95 cursor-pointer"
            title="Petunjuk Pasang di iPhone/iPad"
          >
            <Smartphone className="w-3.5 h-3.5" />
            <span className="hidden sm:inline">Install App</span>
          </button>
          {showIOSGuide && <IOSInstallModal onClose={() => setShowIOSGuide(false)} />}
        </>
      );
    }
    return null;
  }

  // Sidebar variant
  if (isInstallable) {
    return (
      <button
        onClick={install}
        className="w-full flex items-center justify-between px-3.5 py-2.5 rounded-lg text-xs font-semibold text-emerald-400 hover:bg-emerald-950/40 border border-emerald-800/30 hover:border-emerald-700/50 hover:text-emerald-300 transition group cursor-pointer text-left"
        title="Pasang aplikasi ke Layar Utama atau Desktop"
      >
        <div className="flex items-center gap-3">
          <Download className="w-4 h-4 flex-shrink-0 text-emerald-400 group-hover:scale-110 transition-transform" />
          <span>Install Aplikasi (PWA)</span>
        </div>
        <span className="text-[10px] font-bold bg-emerald-900/60 text-emerald-300 px-1.5 py-0.5 rounded border border-emerald-700/40">
          Install
        </span>
      </button>
    );
  }

  if (isIOS) {
    return (
      <>
        <button
          onClick={() => setShowIOSGuide(true)}
          className="w-full flex items-center justify-between px-3.5 py-2.5 rounded-lg text-xs font-semibold text-emerald-400 hover:bg-emerald-950/40 border border-emerald-800/30 hover:border-emerald-700/50 hover:text-emerald-300 transition group cursor-pointer text-left"
          title="Petunjuk Pasang di iPhone/iPad"
        >
          <div className="flex items-center gap-3">
            <Smartphone className="w-4 h-4 flex-shrink-0 text-emerald-400 group-hover:scale-110 transition-transform" />
            <span>Install di iOS (PWA)</span>
          </div>
          <span className="text-[10px] font-bold bg-emerald-900/60 text-emerald-300 px-1.5 py-0.5 rounded border border-emerald-700/40">
            Panduan
          </span>
        </button>
        {showIOSGuide && <IOSInstallModal onClose={() => setShowIOSGuide(false)} />}
      </>
    );
  }

  return null;
};

// iOS Safari Install Modal
const IOSInstallModal: React.FC<{ onClose: () => void }> = ({ onClose }) => {
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-xs p-4 animate-fade-in">
      <div className="w-full max-w-sm rounded-2xl bg-white p-6 shadow-2xl border border-slate-200">
        <div className="flex items-center justify-between pb-3 border-b border-slate-100">
          <div className="flex items-center gap-2">
            <Smartphone className="w-5 h-5 text-emerald-600" />
            <h3 className="text-base font-bold text-slate-900">Pasang di iPhone / iPad</h3>
          </div>
          <button
            onClick={onClose}
            className="p-1 rounded-lg text-slate-400 hover:text-slate-600 hover:bg-slate-100 transition"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <div className="mt-4 space-y-3.5 text-xs text-slate-600">
          <div className="flex items-start gap-3 bg-slate-50 p-3 rounded-xl border border-slate-200/70">
            <div className="w-6 h-6 rounded-lg bg-emerald-100 text-emerald-700 font-bold flex items-center justify-center flex-shrink-0 text-xs">
              1
            </div>
            <div>
              <p className="font-semibold text-slate-800 flex items-center gap-1.5">
                Ketuk tombol Bagikan <Share2 className="w-3.5 h-3.5 text-blue-600 inline" />
              </p>
              <p className="text-slate-500 mt-0.5">
                Tombol Share berada di bilah bawah Safari (iPhone) atau atas (iPad).
              </p>
            </div>
          </div>

          <div className="flex items-start gap-3 bg-slate-50 p-3 rounded-xl border border-slate-200/70">
            <div className="w-6 h-6 rounded-lg bg-emerald-100 text-emerald-700 font-bold flex items-center justify-center flex-shrink-0 text-xs">
              2
            </div>
            <div>
              <p className="font-semibold text-slate-800 flex items-center gap-1.5">
                Pilih "Tambah ke Layar Utama" <PlusSquare className="w-3.5 h-3.5 text-emerald-600 inline" />
              </p>
              <p className="text-slate-500 mt-0.5">
                Geser ke bawah menu opsi dan ketuk <em>Add to Home Screen</em>.
              </p>
            </div>
          </div>

          <div className="flex items-start gap-3 bg-slate-50 p-3 rounded-xl border border-slate-200/70">
            <div className="w-6 h-6 rounded-lg bg-emerald-100 text-emerald-700 font-bold flex items-center justify-center flex-shrink-0 text-xs">
              3
            </div>
            <div>
              <p className="font-semibold text-slate-800">
                Ketuk "Tambah" / "Add" di pojok kanan atas
              </p>
              <p className="text-slate-500 mt-0.5">
                Ikon aplikasi Buku Kas akan otomatis muncul di layar utama gadget Anda.
              </p>
            </div>
          </div>
        </div>

        <button
          onClick={onClose}
          className="mt-5 w-full rounded-xl bg-emerald-600 hover:bg-emerald-700 py-2.5 text-xs font-bold text-white transition shadow-xs"
        >
          Mengerti, Tutup
        </button>
      </div>
    </div>
  );
};
