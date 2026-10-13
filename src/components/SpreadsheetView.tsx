import React, { useState } from 'react';
import { KasTransaction, DatabaseConfig } from '../types/kas';
import { formatRupiah, DEFAULT_DATABASE_CONFIG } from '../data/initialData';
import { 
  FileSpreadsheet,
  ExternalLink
} from 'lucide-react';

interface SpreadsheetViewProps {
  transactions: KasTransaction[];
  config?: DatabaseConfig;
}

export const SpreadsheetView: React.FC<SpreadsheetViewProps> = ({ 
  transactions, 
  config
}) => {
  const [selectedCell, setSelectedCell] = useState<{ row: number; col: string; val: string } | null>({
    row: 2,
    col: 'E',
    val: transactions[0] ? formatRupiah(transactions[0].saldoBerjalan) : 'Rp 0'
  });

  const spreadsheetUrl = config?.spreadsheetUrl || DEFAULT_DATABASE_CONFIG.spreadsheetUrl;

  const columns = [
    { key: 'colA', label: 'A', name: 'Tanggal', width: 'w-36' },
    { key: 'colB', label: 'B', name: 'Jenis', width: 'w-32' },
    { key: 'colC', label: 'C', name: 'Keterangan', width: 'w-72' },
    { key: 'colD', label: 'D', name: 'Jumlah (Rp)', width: 'w-40' },
    { key: 'colE', label: 'E', name: 'Saldo Berjalan (Rp)', width: 'w-48' }
  ];

  // Chronological order for sheet rows (as stored in real Sheet)
  const sheetRows = [...transactions].sort((a, b) => a.tanggal.localeCompare(b.tanggal));

  return (
    <div className="space-y-6">
      
      {/* Simulated Google Sheets UI */}
      <div className="bg-white rounded-2xl border border-slate-300 shadow-md overflow-hidden font-sans">
        
        {/* Spreadsheet Header Toolbar Mock */}
        <div className="bg-slate-100 border-b border-slate-200 px-4 py-2 flex items-center justify-between text-xs text-slate-700 flex-wrap gap-2">
          <div className="flex items-center gap-3">
            <div className="flex items-center gap-1.5 font-bold text-slate-900">
              <FileSpreadsheet className="w-5 h-5 text-emerald-600" />
              <span>Buku_Kas_Keuangan.gsheet</span>
            </div>
            <span className="text-slate-300">|</span>
            <div className="hidden sm:flex items-center gap-3 text-slate-600">
              <span className="hover:text-slate-900 cursor-pointer">File</span>
              <span className="hover:text-slate-900 cursor-pointer">Edit</span>
              <span className="hover:text-slate-900 cursor-pointer">Tampilan</span>
              <span className="hover:text-slate-900 cursor-pointer">Sisipkan</span>
              <span className="hover:text-slate-900 cursor-pointer font-bold text-emerald-700">📊 Buku Kas</span>
            </div>
          </div>

          <div className="flex items-center gap-3">
            <span className="text-[11px] text-slate-500 font-mono hidden sm:inline">
              Total: {transactions.length} Baris
            </span>
            {spreadsheetUrl && (
              <a
                href={spreadsheetUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-1.5 px-3 py-1 bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs rounded-lg transition shadow-xs"
              >
                <FileSpreadsheet className="w-3.5 h-3.5" />
                <span>Google Sheet</span>
                <ExternalLink className="w-3 h-3 ml-0.5" />
              </a>
            )}
          </div>
        </div>

        {/* Formula Bar Mock */}
        <div className="bg-white border-b border-slate-200 px-4 py-1.5 flex items-center gap-2 text-xs">
          <div className="w-10 font-bold text-slate-500 font-mono text-center bg-slate-100 py-0.5 rounded border border-slate-200">
            {selectedCell ? `${selectedCell.col}${selectedCell.row}` : 'A1'}
          </div>
          <span className="text-slate-300">|</span>
          <div className="font-mono text-slate-500 italic text-xs">
            fx
          </div>
          <div className="flex-1 font-mono text-slate-800 text-xs px-2 py-0.5 bg-slate-50 rounded border border-slate-200/60 truncate">
            {selectedCell ? selectedCell.val : 'Klik salah satu sel untuk melihat isi formula/nilai'}
          </div>
        </div>

        {/* Table Grid (Excel / Google Sheets Style) */}
        <div className="overflow-x-auto max-h-[600px] overflow-y-auto">
          <table className="w-full text-xs text-left border-collapse select-none">
            
            {/* Column Letters (A, B, C...) */}
            <thead className="sticky top-0 z-20 bg-slate-100 text-slate-600 font-semibold border-b border-slate-300 shadow-xs">
              <tr>
                <th className="w-12 py-1.5 px-2 text-center bg-slate-200/80 border-r border-slate-300 text-slate-500 font-mono">
                  #
                </th>
                {columns.map((col) => (
                  <th 
                    key={col.key} 
                    className={`${col.width} py-1.5 px-3 border-r border-slate-300 text-center font-bold text-slate-700`}
                  >
                    <div>{col.label}</div>
                    <div className="text-[10px] font-normal text-slate-500 truncate">{col.name}</div>
                  </th>
                ))}
              </tr>
            </thead>

            <tbody className="divide-y divide-slate-200 font-mono">
              
              {/* Row 1: Header Titles inside the sheet */}
              <tr className="bg-emerald-50/70 font-bold text-emerald-950 sticky top-10 z-10 border-b-2 border-emerald-600">
                <td className="py-2 px-2 text-center bg-slate-100 border-r border-slate-300 text-slate-500 font-bold">
                  1
                </td>
                <td className="py-2 px-3 border-r border-slate-200">Tanggal</td>
                <td className="py-2 px-3 border-r border-slate-200">Jenis</td>
                <td className="py-2 px-3 border-r border-slate-200">Keterangan</td>
                <td className="py-2 px-3 border-r border-slate-200 text-right">Jumlah (Rp)</td>
                <td className="py-2 px-3 border-r border-slate-200 text-right bg-emerald-100/60 font-extrabold text-emerald-900">
                  Saldo Berjalan (Rp)
                </td>
              </tr>

              {/* Data Rows (Row 2, 3, 4...) */}
              {sheetRows.map((row, idx) => {
                const rowNum = idx + 2;
                const isPemasukan = row.jenis === 'Pemasukan';
                
                return (
                  <tr 
                    key={row.id}
                    className={`hover:bg-blue-50/50 transition-colors ${
                      idx % 2 === 0 ? 'bg-white' : 'bg-slate-50/40'
                    }`}
                  >
                    {/* Row Index Number */}
                    <td className="py-2 px-2 text-center bg-slate-100/80 border-r border-slate-300 text-slate-500 font-bold">
                      {rowNum}
                    </td>

                    <td
                      onClick={() => setSelectedCell({ row: rowNum, col: 'A', val: row.tanggal })}
                      className={`py-2 px-3 border-r border-slate-200 text-slate-800 cursor-pointer ${
                        selectedCell?.row === rowNum && selectedCell?.col === 'A' ? 'bg-blue-100 ring-2 ring-blue-500' : ''
                      }`}
                    >
                      {row.tanggal}
                    </td>

                    <td
                      onClick={() => setSelectedCell({ row: rowNum, col: 'B', val: row.jenis })}
                      className={`py-2 px-3 border-r border-slate-200 font-semibold cursor-pointer ${
                        isPemasukan ? 'text-emerald-700' : 'text-rose-700'
                      } ${selectedCell?.row === rowNum && selectedCell?.col === 'B' ? 'bg-blue-100 ring-2 ring-blue-500' : ''}`}
                    >
                      {row.jenis}
                    </td>

                    <td
                      onClick={() => setSelectedCell({ row: rowNum, col: 'C', val: row.keterangan })}
                      className={`py-2 px-3 border-r border-slate-200 text-slate-800 max-w-xs truncate cursor-pointer ${
                        selectedCell?.row === rowNum && selectedCell?.col === 'C' ? 'bg-blue-100 ring-2 ring-blue-500' : ''
                      }`}
                    >
                      {row.keterangan}
                    </td>

                    <td
                      onClick={() => setSelectedCell({ row: rowNum, col: 'D', val: formatRupiah(row.jumlah) })}
                      className={`py-2 px-3 border-r border-slate-200 text-right font-bold cursor-pointer ${
                        isPemasukan ? 'text-emerald-700' : 'text-rose-700'
                      } ${selectedCell?.row === rowNum && selectedCell?.col === 'D' ? 'bg-blue-100 ring-2 ring-blue-500' : ''}`}
                    >
                      {formatRupiah(row.jumlah)}
                    </td>

                    <td
                      onClick={() => setSelectedCell({ row: rowNum, col: 'E', val: formatRupiah(row.saldoBerjalan) })}
                      className={`py-2 px-3 border-r border-slate-200 text-right font-extrabold text-slate-900 bg-slate-50/50 cursor-pointer ${
                        selectedCell?.row === rowNum && selectedCell?.col === 'E' ? 'bg-blue-100 ring-2 ring-blue-500' : ''
                      }`}
                    >
                      {formatRupiah(row.saldoBerjalan)}
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>

        {/* Spreadsheet Sheet Tab Footer */}
        <div className="bg-slate-100 border-t border-slate-200 px-4 py-2 flex items-center justify-between text-xs">
          <div className="flex items-center gap-2">
            <div className="bg-white border-t-2 border-emerald-600 px-3 py-1 font-bold text-slate-800 rounded-t shadow-xs flex items-center gap-1.5">
              <span>{config?.sheetName || 'Transaksi'}</span>
            </div>
          </div>
          <span className="text-slate-500 hidden sm:inline">
            💡 Tips: Setiap transaksi yang dicatat langsung memperbarui baris data spreadsheet secara real-time.
          </span>
        </div>

      </div>

    </div>
  );
};
