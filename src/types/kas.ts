export type TransactionType = 'Pemasukan' | 'Pengeluaran';

export type UserRole = 'admin' | 'user';

export interface AuthUser {
  id: string;
  username: string;
  nama: string;
  role: UserRole;
  email?: string;
}

export interface KasTransaction {
  id: string;
  tanggal: string; // YYYY-MM-DD
  jenis: TransactionType;
  kategori: string;
  keterangan: string;
  jumlah: number;
  saldoBerjalan: number;
}

export interface KasSummary {
  saldoTotal: number;
  totalPemasukan: number;
  totalPengeluaran: number;
  jumlahTransaksi: number;
  pemasukanBulanIni: number;
  pengeluaranBulanIni: number;
}

export interface MonthlyChartData {
  bulan: string; // e.g. "Jan 2026", "Feb 2026"
  pemasukan: number;
  pengeluaran: number;
  selisih: number;
}

export interface FilterOptions {
  search: string;
  jenis: 'Semua' | TransactionType;
  kategori?: string;
  startDate: string;
  endDate: string;
  sortBy: 'tanggal-desc' | 'tanggal-asc' | 'jumlah-desc' | 'jumlah-asc';
}

export interface GasFile {
  name: string;
  extension: 'gs' | 'html';
  description: string;
  code: string;
}

export interface DatabaseConfig {
  mode: 'simulator' | 'live';
  webAppUrl: string;
  spreadsheetUrl?: string;
  spreadsheetId: string;
  sheetName: string;
  saldoAwal: number;
  autoSync: boolean;
  categoriesPemasukan: string[];
  categoriesPengeluaran: string[];
  lastSyncTime?: string;
  isConnected: boolean;
  activeProfileId?: string;
}

export interface GoogleSheetDatabaseProfile {
  id: string;
  name: string;
  webAppUrl: string;
  spreadsheetUrl?: string;
  spreadsheetId?: string;
  sheetName: string;
  saldoAwal: number;
  description?: string;
  createdAt: string;
  lastSyncedAt?: string;
  isLive: boolean;
}

export interface DatabaseLog {
  id: string;
  timestamp: string;
  action: 'READ' | 'CREATE' | 'UPDATE' | 'DELETE' | 'RECALCULATE' | 'BACKUP' | 'SYNC';
  status: 'SUCCESS' | 'ERROR' | 'PENDING';
  details: string;
  payload?: string;
}
