import React, { useState, useRef } from 'react';
import { 
  X, 
  Download, 
  Smartphone, 
  Check, 
  Layers, 
  Upload, 
  RefreshCw, 
  Eye, 
  Sparkles,
  ExternalLink
} from 'lucide-react';

interface PWAIconModalProps {
  isOpen: boolean;
  onClose: () => void;
}

interface IconSizeItem {
  name: string;
  filename: string;
  size: string;
  platform: string;
  description: string;
  src: string;
  isMaskable?: boolean;
}

const ICON_LIST: IconSizeItem[] = [
  {
    name: 'Master Source PWA (512px)',
    filename: 'PWA-512.png',
    size: '512 × 512 px',
    platform: 'Master Upload & Web App HD',
    description: 'File gambar asli dari upload pengguna beresolusi 512×512 px.',
    src: '/PWA-512.png'
  },
  {
    name: 'Master Source PWA (192px)',
    filename: 'PWA-192.png',
    size: '192 × 192 px',
    platform: 'Master Upload Launcher',
    description: 'File gambar ukuran 192×192 px dari master upload.',
    src: '/PWA-192.png'
  },
  {
    name: 'Android & PWA Standard (192px)',
    filename: 'pwa-192x192.png',
    size: '192 × 192 px',
    platform: 'Android Home Screen & Task Switcher',
    description: 'Ukuran standar untuk ikon shortcut launcher di perangkat Android dan desktop Chrome/Edge.',
    src: '/pwa-192x192.png'
  },
  {
    name: 'Android Splash & HD (512px)',
    filename: 'pwa-512x512.png',
    size: '512 × 512 px',
    platform: 'Android Splash Screen & Web App Install',
    description: 'Ikon resolusi tinggi yang muncul saat aplikasi dibuka (splash screen) dan dialog instalasi PWA.',
    src: '/pwa-512x512.png'
  },
  {
    name: 'Android Adaptive Maskable (512px)',
    filename: 'pwa-maskable-512x512.png',
    size: '512 × 512 px',
    platform: 'Android 8+ Adaptive / Shape-shifting Icons',
    description: 'Ikon dengan safe-zone margin 15% yang aman dipotong menjadi lingkaran, squircle, atau rounded rect oleh sistem Android.',
    src: '/pwa-maskable-512x512.png',
    isMaskable: true
  },
  {
    name: 'Android Adaptive Maskable (192px)',
    filename: 'pwa-maskable-192x192.png',
    size: '192 × 192 px',
    platform: 'Android Adaptive Small Devices',
    description: 'Ikon maskable ukuran menengah untuk perangkat Android dengan pixel-ratio compact.',
    src: '/pwa-maskable-192x192.png',
    isMaskable: true
  },
  {
    name: 'Apple Touch Icon (180px)',
    filename: 'apple-touch-icon.png',
    size: '180 × 180 px',
    platform: 'iOS Safari / iPhone Home Screen',
    description: 'Ikon khusus Apple iOS dengan background solid non-transparan sesuai spesifikasi WebKit Safari.',
    src: '/apple-touch-icon.png'
  },
  {
    name: 'Apple iPad & iPad Pro (152px & 167px)',
    filename: 'apple-touch-icon-152x152.png',
    size: '152 × 152 px / 167 × 167 px',
    platform: 'Apple iPad OS Retina & iPad Pro',
    description: 'Ikon khusus untuk home screen perangkat iPad dan iPad Pro.',
    src: '/apple-touch-icon-152x152.png'
  },
  {
    name: 'Browser Favicon (32px & 16px)',
    filename: 'favicon-32x32.png',
    size: '32 × 32 px & 16 × 16 px',
    platform: 'Browser Tab, Bookmarks & History',
    description: 'Favicon tab browser agar mudah dikenali di antara deretan tab browser terbuka.',
    src: '/favicon-32x32.png'
  },
  {
    name: 'Scalable Vector Graphic (SVG)',
    filename: 'icon.svg',
    size: 'Vector (Infinit)',
    platform: 'Modern Desktop Browsers & HiDPI',
    description: 'Format vektor berbasis Google Sheets yang selalu tajam di segala resolusi layar retina.',
    src: '/icon.svg'
  }
];

export const PWAIconModal: React.FC<PWAIconModalProps> = ({ isOpen, onClose }) => {
  const [activeTab, setActiveTab] = useState<'sizes' | 'preview' | 'converter'>('sizes');
  const [previewShape, setPreviewShape] = useState<'circle' | 'squircle' | 'rounded'>('squircle');
  
  // Custom converter state
  const [customImage, setCustomImage] = useState<string | null>(null);
  const [isProcessing, setIsProcessing] = useState(false);
  const [convertedIcons, setConvertedIcons] = useState<{ [key: string]: string }>({});
  const fileInputRef = useRef<HTMLInputElement>(null);

  if (!isOpen) return null;

  const handleCustomUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setIsProcessing(true);
    const reader = new FileReader();
    reader.onload = (event) => {
      const imgUrl = event.target?.result as string;
      setCustomImage(imgUrl);
      generateAllSizesFromImage(imgUrl);
    };
    reader.readAsDataURL(file);
  };

  const generateAllSizesFromImage = (imgSrc: string) => {
    const img = new Image();
    img.crossOrigin = 'anonymous';
    img.onload = () => {
      const results: { [key: string]: string } = {};
      const sizesToGen = [
        { name: 'pwa-512x512.png', size: 512, maskable: false },
        { name: 'pwa-192x192.png', size: 192, maskable: false },
        { name: 'pwa-maskable-512x512.png', size: 512, maskable: true },
        { name: 'pwa-maskable-192x192.png', size: 192, maskable: true },
        { name: 'apple-touch-icon.png', size: 180, maskable: false, solidBg: true },
        { name: 'favicon-32x32.png', size: 32, maskable: false },
        { name: 'favicon-16x16.png', size: 16, maskable: false },
      ];

      sizesToGen.forEach(({ name, size, maskable, solidBg }) => {
        const canvas = document.createElement('canvas');
        canvas.width = size;
        canvas.height = size;
        const ctx = canvas.getContext('2d');
        if (!ctx) return;

        if (maskable || solidBg) {
          // Fill background for maskable or iOS
          ctx.fillStyle = '#0F9D58';
          ctx.fillRect(0, 0, size, size);
          
          if (maskable) {
            // Safe zone: draw centered within 80%
            const pad = size * 0.12;
            ctx.drawImage(img, pad, pad, size - pad * 2, size - pad * 2);
          } else {
            ctx.drawImage(img, 0, 0, size, size);
          }
        } else {
          ctx.clearRect(0, 0, size, size);
          ctx.drawImage(img, 0, 0, size, size);
        }

        results[name] = canvas.toDataURL('image/png');
      });

      setConvertedIcons(results);
      setIsProcessing(false);
    };
    img.src = imgSrc;
  };

  const downloadDataUrl = (dataUrl: string, filename: string) => {
    const a = document.createElement('a');
    a.href = dataUrl;
    a.download = filename;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-black/60 backdrop-blur-xs animate-in fade-in duration-200">
      <div className="bg-white dark:bg-slate-900 rounded-2xl shadow-2xl w-full max-w-4xl max-h-[92vh] flex flex-col overflow-hidden border border-slate-200 dark:border-slate-800">
        
        {/* Header */}
        <div className="px-5 py-4 border-b border-slate-200 dark:border-slate-800 flex items-center justify-between bg-slate-50/80 dark:bg-slate-800/50">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-white p-1.5 shadow-md flex items-center justify-center border border-slate-200 dark:border-slate-700">
              <img 
                src="/pwa-512x512.png" 
                onError={(e) => { e.currentTarget.src = '/PWA-512.png'; }}
                alt="Google Sheet Icon" 
                className="w-full h-full object-contain" 
              />
            </div>
            <div>
              <h3 className="text-base sm:text-lg font-bold text-slate-900 dark:text-white flex items-center gap-2">
                Konfigurasi Seluruh Ukuran Icon PWA
                <span className="text-[10px] font-semibold bg-emerald-100 dark:bg-emerald-950/80 text-emerald-700 dark:text-emerald-300 px-2 py-0.5 rounded-full border border-emerald-300 dark:border-emerald-700">
                  Ready & Active
                </span>
              </h3>
              <p className="text-xs text-slate-500 dark:text-slate-400">
                Otomatis dikonversi ke resolusi Android, iOS Safari, dan Desktop Favicon
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-lg text-slate-400 hover:text-slate-700 dark:hover:text-slate-200 hover:bg-slate-200/60 dark:hover:bg-slate-800 transition"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Tab Navigation */}
        <div className="px-5 border-b border-slate-200 dark:border-slate-800 flex gap-2 bg-white dark:bg-slate-900 text-xs sm:text-sm font-medium">
          <button
            onClick={() => setActiveTab('sizes')}
            className={`py-3 px-3 border-b-2 font-semibold transition cursor-pointer flex items-center gap-2 ${
              activeTab === 'sizes'
                ? 'border-emerald-600 text-emerald-600 dark:text-emerald-400'
                : 'border-transparent text-slate-500 hover:text-slate-800 dark:hover:text-slate-300'
            }`}
          >
            <Layers className="w-4 h-4" />
            Daftar Ukuran Terpasang ({ICON_LIST.length})
          </button>
          <button
            onClick={() => setActiveTab('preview')}
            className={`py-3 px-3 border-b-2 font-semibold transition cursor-pointer flex items-center gap-2 ${
              activeTab === 'preview'
                ? 'border-emerald-600 text-emerald-600 dark:text-emerald-400'
                : 'border-transparent text-slate-500 hover:text-slate-800 dark:hover:text-slate-300'
            }`}
          >
            <Eye className="w-4 h-4" />
            Live Preview Mockup
          </button>
          <button
            onClick={() => setActiveTab('converter')}
            className={`py-3 px-3 border-b-2 font-semibold transition cursor-pointer flex items-center gap-2 ${
              activeTab === 'converter'
                ? 'border-emerald-600 text-emerald-600 dark:text-emerald-400'
                : 'border-transparent text-slate-500 hover:text-slate-800 dark:hover:text-slate-300'
            }`}
          >
            <Sparkles className="w-4 h-4" />
            Konversi Gambar Baru
          </button>
        </div>

        {/* Modal Body */}
        <div className="p-5 overflow-y-auto flex-1 space-y-6">
          
          {/* TAB 1: LIST OF INSTALLED SIZES */}
          {activeTab === 'sizes' && (
            <div className="space-y-4">
              <div className="p-3.5 rounded-xl bg-emerald-50 dark:bg-emerald-950/40 border border-emerald-200 dark:border-emerald-800/60 flex items-start gap-3 text-xs sm:text-sm text-emerald-800 dark:text-emerald-200">
                <Check className="w-5 h-5 text-emerald-600 flex-shrink-0 mt-0.5" />
                <div>
                  <p className="font-semibold">Seluruh ukuran ikon PWA telah aktif dan terdaftar di Web App Manifest!</p>
                  <p className="text-xs text-emerald-700/90 dark:text-emerald-300/90 mt-0.5">
                    Semua file telah di-generate dalam resolusi presisi tinggi dan tersimpan di folder <code>/public</code>. Anda dapat mengunduh atau memeriksa masing-masing file langsung di bawah ini.
                  </p>
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-3.5">
                {ICON_LIST.map((icon, idx) => (
                  <div
                    key={idx}
                    className="p-3.5 rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-850 hover:border-emerald-400 dark:hover:border-emerald-600 transition flex items-center gap-3.5 shadow-2xs group"
                  >
                    <div className="w-14 h-14 rounded-xl bg-slate-100 dark:bg-slate-800 p-1.5 flex items-center justify-center flex-shrink-0 border border-slate-200 dark:border-slate-700 overflow-hidden shadow-xs">
                      <img
                        src={icon.src}
                        alt={icon.name}
                        className={`w-full h-full object-contain ${
                          icon.isMaskable ? 'rounded-full scale-105' : ''
                        }`}
                      />
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center justify-between gap-1">
                        <span className="font-bold text-xs sm:text-sm text-slate-800 dark:text-white truncate">
                          {icon.name}
                        </span>
                        <span className="text-[10px] font-mono bg-slate-100 dark:bg-slate-800 px-1.5 py-0.5 rounded text-slate-600 dark:text-slate-300 font-semibold flex-shrink-0">
                          {icon.size}
                        </span>
                      </div>
                      <p className="text-[11px] text-emerald-600 dark:text-emerald-400 font-medium">
                        {icon.platform}
                      </p>
                      <p className="text-[10px] text-slate-500 dark:text-slate-400 line-clamp-1 mt-0.5">
                        {icon.description}
                      </p>
                    </div>
                    <a
                      href={icon.src}
                      download={icon.filename}
                      className="p-2 rounded-lg text-slate-400 hover:text-emerald-600 hover:bg-emerald-50 dark:hover:bg-slate-800 transition flex-shrink-0"
                      title={`Download ${icon.filename}`}
                    >
                      <Download className="w-4 h-4" />
                    </a>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* TAB 2: LIVE PREVIEW MOCKUP */}
          {activeTab === 'preview' && (
            <div className="space-y-6">
              <div className="flex items-center justify-between">
                <span className="text-xs sm:text-sm font-semibold text-slate-700 dark:text-slate-300">
                  Pilih Bentuk Masking Adaptive Android:
                </span>
                <div className="flex gap-1.5 bg-slate-100 dark:bg-slate-800 p-1 rounded-lg text-xs">
                  <button
                    onClick={() => setPreviewShape('squircle')}
                    className={`px-2.5 py-1 rounded font-medium transition cursor-pointer ${
                      previewShape === 'squircle'
                        ? 'bg-white dark:bg-slate-700 text-slate-900 dark:text-white shadow-xs'
                        : 'text-slate-500'
                    }`}
                  >
                    Squircle (Samsung/Xiaomi)
                  </button>
                  <button
                    onClick={() => setPreviewShape('circle')}
                    className={`px-2.5 py-1 rounded font-medium transition cursor-pointer ${
                      previewShape === 'circle'
                        ? 'bg-white dark:bg-slate-700 text-slate-900 dark:text-white shadow-xs'
                        : 'text-slate-500'
                    }`}
                  >
                    Circle (Google Pixel)
                  </button>
                  <button
                    onClick={() => setPreviewShape('rounded')}
                    className={`px-2.5 py-1 rounded font-medium transition cursor-pointer ${
                      previewShape === 'rounded'
                        ? 'bg-white dark:bg-slate-700 text-slate-900 dark:text-white shadow-xs'
                        : 'text-slate-500'
                    }`}
                  >
                    Rounded Rect
                  </button>
                </div>
              </div>

              {/* Mockup Containers */}
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                
                {/* Android Phone Mockup */}
                <div className="p-4 rounded-2xl bg-gradient-to-b from-slate-900 to-slate-950 text-white border border-slate-800 flex flex-col items-center justify-center py-8">
                  <div className="text-[11px] text-slate-400 font-semibold mb-6 flex items-center gap-1.5">
                    <Smartphone className="w-3.5 h-3.5 text-emerald-400" />
                    Android Home Screen
                  </div>
                  <div
                    className={`w-20 h-20 shadow-xl overflow-hidden transition-all duration-300 ${
                      previewShape === 'circle'
                        ? 'rounded-full'
                        : previewShape === 'squircle'
                        ? 'rounded-2xl'
                        : 'rounded-xl'
                    }`}
                  >
                    <img
                      src="/pwa-maskable-512x512.png"
                      alt="Android Preview"
                      className="w-full h-full object-cover"
                    />
                  </div>
                  <span className="text-xs font-semibold mt-3 text-slate-200">
                    Google Sheet
                  </span>
                  <span className="text-[10px] text-emerald-400 mt-0.5">
                    Adaptive Maskable
                  </span>
                </div>

                {/* iPhone / iPad Mockup */}
                <div className="p-4 rounded-2xl bg-gradient-to-b from-slate-800 to-slate-900 text-white border border-slate-700 flex flex-col items-center justify-center py-8">
                  <div className="text-[11px] text-slate-300 font-semibold mb-6 flex items-center gap-1.5">
                    <Smartphone className="w-3.5 h-3.5 text-sky-400" />
                    Apple iOS Safari
                  </div>
                  <div className="w-20 h-20 rounded-[22%] shadow-2xl overflow-hidden border border-white/20">
                    <img
                      src="/apple-touch-icon.png"
                      alt="Apple iOS Preview"
                      className="w-full h-full object-cover"
                    />
                  </div>
                  <span className="text-xs font-semibold mt-3 text-slate-100">
                    Google Sheet
                  </span>
                  <span className="text-[10px] text-sky-300 mt-0.5">
                    180×180 Apple Touch
                  </span>
                </div>

                {/* Desktop Browser Tab Mockup */}
                <div className="p-4 rounded-2xl bg-slate-100 dark:bg-slate-800 border border-slate-300 dark:border-slate-700 flex flex-col justify-center py-6">
                  <div className="text-[11px] text-slate-600 dark:text-slate-300 font-semibold mb-4 text-center">
                    Browser Tab Desktop
                  </div>
                  <div className="bg-white dark:bg-slate-900 rounded-lg p-2.5 shadow-sm border border-slate-200 dark:border-slate-700 flex items-center gap-2">
                    <img src="/favicon-32x32.png" alt="Favicon" className="w-4 h-4 flex-shrink-0" />
                    <span className="text-xs font-semibold text-slate-800 dark:text-slate-200 truncate">
                      Kas Digital
                    </span>
                    <span className="text-slate-400 text-xs ml-auto">×</span>
                  </div>
                  <div className="mt-4 p-2.5 bg-emerald-50 dark:bg-emerald-950/40 rounded-lg text-[11px] text-emerald-800 dark:text-emerald-300 text-center font-medium">
                    Favicon tajam di resolusi 16px, 32px, dan 64px
                  </div>
                </div>

              </div>
            </div>
          )}

          {/* TAB 3: CUSTOM CONVERTER DROPZONE */}
          {activeTab === 'converter' && (
            <div className="space-y-4">
              <div className="p-4 rounded-xl border-2 border-dashed border-emerald-400 dark:border-emerald-600 bg-emerald-50/50 dark:bg-emerald-950/20 text-center">
                <input
                  type="file"
                  ref={fileInputRef}
                  onChange={handleCustomUpload}
                  accept="image/png,image/jpeg,image/svg+xml,image/webp"
                  className="hidden"
                />
                <div className="w-12 h-12 rounded-full bg-emerald-100 dark:bg-emerald-900/60 text-emerald-600 dark:text-emerald-400 mx-auto flex items-center justify-center mb-3">
                  <Upload className="w-6 h-6" />
                </div>
                <h4 className="text-sm font-bold text-slate-800 dark:text-white">
                  Ingin Mengonversi Gambar Baru Lainnya?
                </h4>
                <p className="text-xs text-slate-500 dark:text-slate-400 mt-1 max-w-md mx-auto">
                  Pilih gambar format PNG, JPG, atau SVG apa saja. Sistem akan langsung merender dan mengonversinya secara otomatis ke seluruh ukuran PWA.
                </p>
                <button
                  onClick={() => fileInputRef.current?.click()}
                  className="mt-3.5 inline-flex items-center gap-2 px-4 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold transition shadow-sm cursor-pointer"
                >
                  <Upload className="w-4 h-4" />
                  Pilih Gambar dari Komputer / HP
                </button>
              </div>

              {isProcessing && (
                <div className="p-4 text-center text-xs text-slate-500 flex items-center justify-center gap-2">
                  <RefreshCw className="w-4 h-4 animate-spin text-emerald-600" />
                  Sedang mengonversi gambar ke seluruh resolusi PWA...
                </div>
              )}

              {customImage && Object.keys(convertedIcons).length > 0 && (
                <div className="space-y-3 pt-2">
                  <h5 className="text-xs font-bold text-slate-700 dark:text-slate-300">
                    Hasil Konversi Otomatis Gambar Anda:
                  </h5>
                  <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                    {Object.entries(convertedIcons).map(([filename, dataUrl]) => (
                      <div
                        key={filename}
                        className="p-3 rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-850 text-center flex flex-col items-center"
                      >
                        <div className="w-16 h-16 rounded-xl bg-white dark:bg-slate-800 p-1 flex items-center justify-center mb-2 shadow-xs border border-slate-200 dark:border-slate-700">
                          <img src={String(dataUrl)} alt={filename} className="w-full h-full object-contain" />
                        </div>
                        <span className="text-[10px] font-mono text-slate-600 dark:text-slate-400 truncate w-full font-semibold">
                          {filename}
                        </span>
                        <button
                          onClick={() => downloadDataUrl(String(dataUrl), filename)}
                          className="mt-2 text-[10px] text-emerald-600 dark:text-emerald-400 font-bold hover:underline flex items-center gap-1 cursor-pointer"
                        >
                          <Download className="w-3 h-3" /> Unduh
                        </button>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
          )}

        </div>

        {/* Footer */}
        <div className="px-5 py-3.5 border-t border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-800/50 flex flex-col sm:flex-row items-center justify-between gap-3 text-xs">
          <div className="text-slate-500 dark:text-slate-400">
            Path Aktif: <code>/public/pwa-192x192.png</code>, <code>/public/pwa-512x512.png</code>, dll.
          </div>
          <div className="flex items-center gap-2">
            <a
              href="/icon.svg"
              download="icon.svg"
              className="px-3 py-1.5 rounded-lg border border-slate-300 dark:border-slate-700 text-slate-700 dark:text-slate-300 font-semibold hover:bg-slate-100 dark:hover:bg-slate-800 transition flex items-center gap-1.5"
            >
              <Download className="w-3.5 h-3.5" />
              Download SVG
            </a>
            <a
              href="/pwa-512x512.png"
              download="pwa-512x512.png"
              className="px-3.5 py-1.5 rounded-lg bg-emerald-600 hover:bg-emerald-700 text-white font-bold transition shadow-xs flex items-center gap-1.5"
            >
              <Download className="w-3.5 h-3.5" />
              Download Master 512px
            </a>
          </div>
        </div>

      </div>
    </div>
  );
};
