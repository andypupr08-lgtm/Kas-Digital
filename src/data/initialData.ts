import { KasTransaction, DatabaseConfig, GoogleSheetDatabaseProfile } from '../types/kas';

export const INITIAL_TRANSACTIONS: KasTransaction[] = [
  {
    id: 'TRX-20260801-1001',
    tanggal: '2026-08-01',
    jenis: 'Pemasukan',
    kategori: 'Iuran Warga',
    keterangan: 'Iuran bulanan warga RT 05 (40 KK @ Rp 50.000)',
    jumlah: 2000000,
    saldoBerjalan: 2000000
  },
  {
    id: 'TRX-20260803-1002',
    tanggal: '2026-08-03',
    jenis: 'Pengeluaran',
    kategori: 'Kebersihan',
    keterangan: 'Honor petugas kebersihan & angkut sampah minggu 1',
    jumlah: 350000,
    saldoBerjalan: 1650000
  },
  {
    id: 'TRX-20260805-1003',
    tanggal: '2026-08-05',
    jenis: 'Pemasukan',
    kategori: 'Donasi / Infaq',
    keterangan: 'Donasi kas warga dari Bpk. Bambang Sutrisno',
    jumlah: 750000,
    saldoBerjalan: 2400000
  },
  {
    id: 'TRX-20260808-1004',
    tanggal: '2026-08-08',
    jenis: 'Pengeluaran',
    kategori: 'Perbaikan / Sarana',
    keterangan: 'Penggantian lampu penerangan jalan gang 2 (4 titik)',
    jumlah: 280000,
    saldoBerjalan: 2120000
  },
  {
    id: 'TRX-20260810-1005',
    tanggal: '2026-08-10',
    jenis: 'Pengeluaran',
    kategori: 'Keamanan',
    keterangan: 'Insentif pos ronda & ronda malam awal bulan',
    jumlah: 400000,
    saldoBerjalan: 1720000
  },
  {
    id: 'TRX-20260812-1006',
    tanggal: '2026-08-12',
    jenis: 'Pemasukan',
    kategori: 'Iuran Warga',
    keterangan: 'Iuran susulan warga blok C dan D',
    jumlah: 600000,
    saldoBerjalan: 2320000
  },
  {
    id: 'TRX-20260815-1007',
    tanggal: '2026-08-15',
    jenis: 'Pengeluaran',
    kategori: 'Konsumsi Rapat',
    keterangan: 'Konsumsi snack & air mineral rapat pengurus 17 Agustus',
    jumlah: 225000,
    saldoBerjalan: 2095000
  },
  {
    id: 'TRX-20260817-1008',
    tanggal: '2026-08-17',
    jenis: 'Pemasukan',
    kategori: 'Donasi / Infaq',
    keterangan: 'Sponsor lomba kemerdekaan dari Toko Berkah',
    jumlah: 1500000,
    saldoBerjalan: 3595000
  }
];

export const DEFAULT_DATABASE_PROFILES: GoogleSheetDatabaseProfile[] = [
  {
    id: 'db-google-sheet-primary',
    name: 'Google Sheets Database Kas',
    webAppUrl: 'https://script.google.com/macros/s/AKfycbwoUqURAgScgSnNp7F-WMeCb_c3TxXp1PjX4of7lzI6oTe4DRdMWm9fNHvBmLkRe5Uv/exec',
    spreadsheetUrl: 'https://docs.google.com/spreadsheets/d/1CFttmq3kV9KyGQKC4-8JbLNN7WWXTiwlMQCMO4rRZF0/edit?gid=1921662302#gid=1921662302',
    spreadsheetId: '1CFttmq3kV9KyGQKC4-8JbLNN7WWXTiwlMQCMO4rRZF0',
    sheetName: 'Transaksi',
    saldoAwal: 0,
    description: 'Database Google Sheets terhubung langsung melalui Google Apps Script Web App.',
    createdAt: '2026-08-18',
    isLive: true
  }
];

export const DEFAULT_DATABASE_CONFIG: DatabaseConfig = {
  mode: 'live',
  webAppUrl: 'https://script.google.com/macros/s/AKfycbwoUqURAgScgSnNp7F-WMeCb_c3TxXp1PjX4of7lzI6oTe4DRdMWm9fNHvBmLkRe5Uv/exec',
  spreadsheetUrl: 'https://docs.google.com/spreadsheets/d/1CFttmq3kV9KyGQKC4-8JbLNN7WWXTiwlMQCMO4rRZF0/edit?gid=1921662302#gid=1921662302',
  spreadsheetId: '1CFttmq3kV9KyGQKC4-8JbLNN7WWXTiwlMQCMO4rRZF0',
  sheetName: 'Transaksi',
  saldoAwal: 0,
  autoSync: true,
  categoriesPemasukan: [
    'Iuran Warga',
    'Donasi / Infaq',
    'Sponsorship',
    'Hasil Usaha / Jasa',
    'Pendapatan Lain-lain'
  ],
  categoriesPengeluaran: [
    'Kebersihan',
    'Keamanan',
    'Operasional',
    'Konsumsi Rapat',
    'Perbaikan / Sarana',
    'Sosial / Duka',
    'Lain-lain'
  ],
  isConnected: true
};

export const KATEGORI_OPTIONS = [
  'Iuran Warga',
  'Donasi / Infaq',
  'Kebersihan',
  'Keamanan',
  'Operasional',
  'Konsumsi Rapat',
  'Perbaikan / Sarana',
  'Lain-lain'
];

/**
 * Format Angka ke Rupiah
 */
export function formatRupiah(amount: number): string {
  if (isNaN(amount) || amount === null) return 'Rp 0';
  return new Intl.NumberFormat('id-ID', {
    style: 'currency',
    currency: 'IDR',
    minimumFractionDigits: 0,
    maximumFractionDigits: 0
  }).format(amount);
}

/**
 * Hitung Ulang Saldo Berjalan (Running Balance)
 */
export function calculateRunningBalances(
  transactions: KasTransaction[],
  saldoAwal: number = 0
): KasTransaction[] {
  // Sort ascending by date to guarantee accurate chronological balance
  const sorted = [...transactions].sort((a, b) => a.tanggal.localeCompare(b.tanggal));
  let running = saldoAwal;
  
  const calculated = sorted.map(item => {
    if (item.jenis === 'Pemasukan') {
      running += item.jumlah;
    } else {
      running -= item.jumlah;
    }
    return {
      ...item,
      saldoBerjalan: running
    };
  });

  return calculated;
}
