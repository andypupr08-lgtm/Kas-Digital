import React, { useState } from 'react';
import { gasFiles } from '../data/gasCode';
import { 
  Copy, 
  Check, 
  Download, 
  FileCode, 
  FileText, 
  ExternalLink, 
  Info,
  CheckCircle2
} from 'lucide-react';

export const CodeViewer: React.FC = () => {
  const [activeFileIndex, setActiveFileIndex] = useState<number>(0);
  const [copiedFile, setCopiedFile] = useState<string | null>(null);
  const [copiedAll, setCopiedAll] = useState<boolean>(false);

  const currentFile = gasFiles[activeFileIndex];

  const handleCopyCode = (code: string, fileName: string) => {
    navigator.clipboard.writeText(code);
    setCopiedFile(fileName);
    setTimeout(() => setCopiedFile(null), 2000);
  };

  const handleCopyAll = () => {
    const combined = gasFiles
      .map((f) => `// ==================== FILE: ${f.name} ====================\n\n${f.code}`)
      .join('\n\n\n');
    navigator.clipboard.writeText(combined);
    setCopiedAll(true);
    setTimeout(() => setCopiedAll(false), 2500);
  };

  const handleDownloadFile = (fileName: string, content: string) => {
    const blob = new Blob([content], { type: 'text/plain;charset=utf-8' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = fileName;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
  };

  const handleDownloadAllIndividual = () => {
    gasFiles.forEach((file, index) => {
      setTimeout(() => {
        handleDownloadFile(file.name, file.code);
      }, index * 200);
    });
  };

  return (
    <div className="space-y-6">
      
      {/* Overview Banner */}
      <div className="bg-gradient-to-r from-slate-900 to-slate-800 text-white p-6 rounded-2xl shadow-sm space-y-3">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <div className="flex items-center gap-2">
              <span className="px-2.5 py-0.5 rounded-full text-xs font-bold bg-emerald-500/20 text-emerald-300 border border-emerald-500/30">
                Google Apps Script (GAS)
              </span>
              <span className="text-xs text-slate-400">Total 4 File Siap Pakai</span>
            </div>
            <h2 className="text-lg sm:text-xl font-bold mt-1 text-white">
              Struktur Kode Sumber Lengkap
            </h2>
            <p className="text-xs sm:text-sm text-slate-300 max-w-2xl mt-1 leading-relaxed">
              Semua logika backend (Spreadsheet API, batch calculation, onOpen menu) dan antarmuka web (HtmlService, Chart.js, Tailwind) telah dipisahkan secara rapi dan modular.
            </p>
          </div>

          {/* Quick Actions */}
          <div className="flex items-center gap-2 flex-wrap">
            <button
              onClick={handleCopyAll}
              className="inline-flex items-center gap-2 bg-emerald-600 hover:bg-emerald-500 text-white px-3.5 py-2 rounded-xl text-xs font-bold transition shadow-xs active:scale-95"
            >
              {copiedAll ? <Check className="w-4 h-4" /> : <Copy className="w-4 h-4" />}
              <span>{copiedAll ? 'Semua Disalin!' : 'Salin Semua File'}</span>
            </button>

            <button
              onClick={handleDownloadAllIndividual}
              className="inline-flex items-center gap-2 bg-slate-700 hover:bg-slate-600 text-white px-3.5 py-2 rounded-xl text-xs font-bold transition active:scale-95"
            >
              <Download className="w-4 h-4" />
              <span>Unduh 4 File</span>
            </button>
          </div>
        </div>
      </div>

      {/* Code Tabs & Display */}
      <div className="bg-slate-900 rounded-2xl border border-slate-800 overflow-hidden shadow-md">
        
        {/* File Tabs Bar */}
        <div className="flex items-center justify-between bg-slate-950 px-4 py-2 border-b border-slate-800 overflow-x-auto gap-2">
          <div className="flex items-center gap-1.5">
            {gasFiles.map((file, idx) => {
              const isActive = idx === activeFileIndex;
              return (
                <button
                  key={file.name}
                  onClick={() => setActiveFileIndex(idx)}
                  className={`flex items-center gap-2 px-3 py-1.5 rounded-lg text-xs font-semibold transition whitespace-nowrap ${
                    isActive
                      ? 'bg-slate-800 text-emerald-400 border border-slate-700 shadow-xs'
                      : 'text-slate-400 hover:text-slate-200 hover:bg-slate-900'
                  }`}
                >
                  {file.extension === 'gs' ? (
                    <FileCode className="w-3.5 h-3.5 text-amber-400" />
                  ) : (
                    <FileText className="w-3.5 h-3.5 text-blue-400" />
                  )}
                  <span>{file.name}</span>
                </button>
              );
            })}
          </div>

          {/* Current File Action Buttons */}
          <div className="flex items-center gap-2">
            <button
              onClick={() => handleCopyCode(currentFile.code, currentFile.name)}
              className="inline-flex items-center gap-1.5 px-3 py-1 bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-medium rounded-lg border border-slate-700 transition"
              title="Salin isi file saat ini"
            >
              {copiedFile === currentFile.name ? (
                <>
                  <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400" />
                  <span className="text-emerald-400 font-bold">Tersalin!</span>
                </>
              ) : (
                <>
                  <Copy className="w-3.5 h-3.5" />
                  <span>Salin {currentFile.name}</span>
                </>
              )}
            </button>

            <button
              onClick={() => handleDownloadFile(currentFile.name, currentFile.code)}
              className="p-1.5 bg-slate-800 hover:bg-slate-700 text-slate-300 rounded-lg border border-slate-700 transition"
              title="Unduh file ini"
            >
              <Download className="w-3.5 h-3.5" />
            </button>
          </div>
        </div>

        {/* File Description Header */}
        <div className="px-5 py-3 bg-slate-900/90 border-b border-slate-800 text-xs text-slate-400 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Info className="w-4 h-4 text-emerald-400 flex-shrink-0" />
            <span>{currentFile.description}</span>
          </div>
          <span className="text-slate-500 font-mono">
            {currentFile.code.split('\n').length} baris kode
          </span>
        </div>

        {/* Code Content Container with Line Numbers */}
        <div className="p-4 overflow-x-auto max-h-[580px] font-mono text-xs text-slate-200 leading-relaxed">
          <pre className="text-slate-200">
            <code>{currentFile.code}</code>
          </pre>
        </div>

      </div>

      {/* File Purpose Breakdown Card */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        {gasFiles.map((f) => (
          <div key={f.name} className="bg-white p-4 rounded-xl border border-slate-200/80 shadow-xs space-y-1.5">
            <div className="flex items-center justify-between">
              <span className="font-bold text-xs text-slate-900">{f.name}</span>
              <span className={`text-[10px] font-bold px-2 py-0.5 rounded-md ${
                f.extension === 'gs' ? 'bg-amber-100 text-amber-800' : 'bg-blue-100 text-blue-800'
              }`}>
                {f.extension.toUpperCase()}
              </span>
            </div>
            <p className="text-xs text-slate-500 leading-relaxed">
              {f.description}
            </p>
          </div>
        ))}
      </div>

    </div>
  );
};
