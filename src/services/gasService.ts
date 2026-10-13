import { KasTransaction, DatabaseConfig } from '../types/kas';

export interface GasApiResponse<T = any> {
  status: 'success' | 'error';
  message?: string;
  data?: T;
  total?: number;
  saldoTotal?: number;
}

/**
 * Service untuk memanggil API Google Apps Script Web App
 */
export const gasApiService = {
  /**
   * Tes koneksi ke URL Google Apps Script Web App
   */
  async ping(webAppUrl: string): Promise<{ success: boolean; message: string; latencyMs: number }> {
    if (!webAppUrl || !webAppUrl.startsWith('http')) {
      return { success: false, message: 'URL Web App tidak valid. Gunakan format https://script.google.com/.../exec', latencyMs: 0 };
    }

    const startTime = Date.now();
    try {
      // Append query parameter format=json and action=ping
      const pingUrl = new URL(webAppUrl);
      pingUrl.searchParams.set('action', 'ping');
      pingUrl.searchParams.set('format', 'json');

      const response = await fetch(pingUrl.toString(), {
        method: 'GET',
        headers: { 'Accept': 'application/json' }
      });

      const latencyMs = Date.now() - startTime;

      if (!response.ok) {
        throw new Error(`HTTP Error: ${response.status} ${response.statusText}`);
      }

      const resJson = await response.json();
      if (resJson.status === 'success' || resJson.ping === 'pong') {
        return {
          success: true,
          message: resJson.message || 'Koneksi ke database Google Sheets Apps Script berhasil!',
          latencyMs
        };
      } else {
        return {
          success: false,
          message: resJson.message || 'Respon dari Apps Script tidak sesuai format standar.',
          latencyMs
        };
      }
    } catch (err: any) {
      const latencyMs = Date.now() - startTime;
      return {
        success: false,
        message: err.message || 'Gagal terhubung ke URL Google Apps Script. Pastikan Web App di-deploy dengan akses "Anyone".',
        latencyMs
      };
    }
  },

  /**
   * Mengambil semua transaksi dari Google Sheets
   */
  async fetchTransactions(webAppUrl: string): Promise<GasApiResponse<KasTransaction[]>> {
    try {
      const fetchUrl = new URL(webAppUrl);
      fetchUrl.searchParams.set('action', 'getAll');
      fetchUrl.searchParams.set('format', 'json');

      const response = await fetch(fetchUrl.toString(), {
        method: 'GET',
        headers: { 'Accept': 'application/json' }
      });

      if (!response.ok) {
        throw new Error(`Gagal mengambil data dari Google Sheets (${response.status})`);
      }

      const resJson = await response.json();
      if (resJson.status === 'success' && Array.isArray(resJson.data)) {
        resJson.data = resJson.data.map((item: any, idx: number) => ({
          id: item.id || `TX-${Date.now()}-${idx + 1}`,
          tanggal: item.tanggal || new Date().toISOString().split('T')[0],
          jenis: item.jenis || 'Pemasukan',
          kategori: item.kategori || '-',
          keterangan: item.keterangan || '',
          jumlah: Number(item.jumlah) || 0,
          saldoBerjalan: Number(item.saldoBerjalan) || 0,
          rowIndex: item.rowIndex || idx + 2
        }));
      }
      return resJson;
    } catch (error: any) {
      return {
        status: 'error',
        message: error.message || 'Terjadi kesalahan saat memuat data dari Spreadsheet.'
      };
    }
  },

  /**
   * Menambahkan transaksi baru ke Google Sheets
   */
  async createTransaction(webAppUrl: string, transaction: Omit<KasTransaction, 'saldoBerjalan'>): Promise<GasApiResponse> {
    try {
      const response = await fetch(webAppUrl, {
        method: 'POST',
        headers: {
          'Content-Type': 'text/plain;charset=utf-8' // Standard CORS-friendly payload for GAS
        },
        body: JSON.stringify({
          action: 'create',
          data: transaction
        })
      });

      const resJson = await response.json();
      return resJson;
    } catch (error: any) {
      return {
        status: 'error',
        message: error.message || 'Gagal mengirim data baru ke Google Sheets.'
      };
    }
  },

  /**
   * Memperbarui transaksi di Google Sheets
   */
  async updateTransaction(webAppUrl: string, transaction: KasTransaction): Promise<GasApiResponse> {
    try {
      const response = await fetch(webAppUrl, {
        method: 'POST',
        headers: {
          'Content-Type': 'text/plain;charset=utf-8'
        },
        body: JSON.stringify({
          action: 'update',
          data: transaction
        })
      });

      const resJson = await response.json();
      return resJson;
    } catch (error: any) {
      return {
        status: 'error',
        message: error.message || 'Gagal memperbarui data di Google Sheets.'
      };
    }
  },

  /**
   * Menghapus transaksi dari Google Sheets berdasarkan ID
   */
  async deleteTransaction(webAppUrl: string, id: string): Promise<GasApiResponse> {
    try {
      const response = await fetch(webAppUrl, {
        method: 'POST',
        headers: {
          'Content-Type': 'text/plain;charset=utf-8'
        },
        body: JSON.stringify({
          action: 'delete',
          id: id
        })
      });

      const resJson = await response.json();
      return resJson;
    } catch (error: any) {
      return {
        status: 'error',
        message: error.message || 'Gagal menghapus data di Google Sheets.'
      };
    }
  },

  /**
   * Meminta server Apps Script menghitung ulang saldo berjalan (batch calculate)
   */
  async recalculateBalance(webAppUrl: string): Promise<GasApiResponse> {
    try {
      const response = await fetch(webAppUrl, {
        method: 'POST',
        headers: {
          'Content-Type': 'text/plain;charset=utf-8'
        },
        body: JSON.stringify({
          action: 'recalculate'
        })
      });

      const resJson = await response.json();
      return resJson;
    } catch (error: any) {
      return {
        status: 'error',
        message: error.message || 'Gagal memicu kalkulasi ulang di Spreadsheet.'
      };
    }
  }
};
