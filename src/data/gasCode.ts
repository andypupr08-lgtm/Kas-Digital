import { GasFile } from '../types/kas';

export const gasFiles: GasFile[] = [
  {
    name: 'Code.gs',
    extension: 'gs',
    description: 'Server-Side Google Apps Script (REST JSON API, Spreadsheet Engine, Running Balance, CRUD)',
    code: `/**
 * ============================================================================
 * APLIKASI LAPORAN KAS GOOGLE APPS SCRIPT (GAS) & GOOGLE SHEETS
 * Versi: 3.0.0 (Dengan Dukungan Dual: REST JSON API & Web App GUI)
 * Dibuat untuk: Kas RT, Organisasi, Kas Masjid, & Usaha Kecil
 * ============================================================================
 */

// Konfigurasi Standar Nama Sheet & Kolom
const DEFAULT_SHEET_TRANSAKSI = 'Transaksi';
const DEFAULT_SHEET_CONFIG = 'Pengaturan';
const HEADERS = ['ID Transaksi', 'Tanggal', 'Jenis', 'Kategori', 'Keterangan', 'Jumlah (Rp)', 'Saldo Berjalan (Rp)'];

/**
 * Endpoint Web App (GET Request)
 * Mendukung 2 mode:
 * 1. Web App HTML GUI (Bila dibuka di browser biasa)
 * 2. REST JSON API (Bila diakses dengan parameter ?action=getAll atau ?format=json)
 */
function doGet(e) {
  try {
    setupInitialSheet();
    
    // Cek jika request meminta format JSON (REST API)
    if (e && e.parameter && (e.parameter.format === 'json' || e.parameter.action)) {
      return handleApiGet(e);
    }
    
    // Default: Tampilkan UI Web App
    const template = HtmlService.createTemplateFromFile('Index');
    return template.evaluate()
      .setTitle('Sistem Kas & Keuangan - Google Sheets')
      .addMetaTag('viewport', 'width=device-width, initial-scale=1, maximum-scale=1')
      .setXFrameOptionsMode(HtmlService.XFrameOptionsMode.ALLOWALL);
  } catch (error) {
    return HtmlService.createHtmlOutput('<h3 style="color:red;font-family:sans-serif;">Terjadi Kesalahan: ' + error.message + '</h3>');
  }
}

/**
 * Endpoint Web App (POST Request)
 * Menerima payload JSON untuk operasi database (Create, Update, Delete, Recalculate)
 */
function doPost(e) {
  try {
    let payload = {};
    if (e.postData && e.postData.contents) {
      payload = JSON.parse(e.postData.contents);
    }
    
    const action = payload.action || (e.parameter && e.parameter.action);
    let result = { status: 'error', message: 'Aksi tidak dikenali' };
    
    if (action === 'create') {
      const res = addTransaction(payload.data);
      result = { status: res.success ? 'success' : 'error', message: res.message, id: res.id };
    } else if (action === 'update') {
      const res = updateTransaction(payload.data);
      result = { status: res.success ? 'success' : 'error', message: res.message };
    } else if (action === 'delete') {
      const res = deleteTransaction(payload.id);
      result = { status: res.success ? 'success' : 'error', message: res.message };
    } else if (action === 'recalculate') {
      const res = recalculateRunningBalance();
      result = { status: res.success ? 'success' : 'error', message: res.message, totalBalance: res.totalBalance };
    } else if (action === 'backup') {
      const res = backupDatabase();
      result = { status: res.success ? 'success' : 'error', message: res.message };
    } else if (action === 'ping') {
      result = { status: 'success', ping: 'pong', message: 'Koneksi database Google Sheets aktif' };
    }
    
    return ContentService.createTextOutput(JSON.stringify(result))
      .setMimeType(ContentService.MimeType.JSON);
  } catch (err) {
    const errorOutput = { status: 'error', message: err.message };
    return ContentService.createTextOutput(JSON.stringify(errorOutput))
      .setMimeType(ContentService.MimeType.JSON);
  }
}

/**
 * Handler Khusus untuk Permintaan GET REST API
 */
function handleApiGet(e) {
  const action = (e.parameter && e.parameter.action) || 'getAll';
  let responseData = {};
  
  if (action === 'ping') {
    responseData = {
      status: 'success',
      ping: 'pong',
      message: 'Koneksi ke Google Sheets Apps Script berhasil dan aktif!',
      timestamp: new Date().toISOString()
    };
  } else {
    const data = getKasData();
    if (data.success) {
      responseData = {
        status: 'success',
        data: data.transactions,
        summary: data.summary,
        total: data.transactions.length
      };
    } else {
      responseData = {
        status: 'error',
        message: data.message
      };
    }
  }
  
  return ContentService.createTextOutput(JSON.stringify(responseData))
    .setMimeType(ContentService.MimeType.JSON);
}

/**
 * Helper untuk menyisipkan file HTML terpisah (Stylesheet & JavaScript)
 */
function include(filename) {
  return HtmlService.createHtmlOutputFromFile(filename).getContent();
}

/**
 * Menu Kustom di Google Spreadsheet saat file dibuka
 */
function onOpen() {
  const ui = SpreadsheetApp.getUi();
  ui.createMenu('📊 Buku Kas')
    .addItem('🚀 Buka Web App', 'openWebAppUrl')
    .addItem('📋 Buka Sidebar Kas', 'showKasSidebar')
    .addItem('🗂️ Buka Dialog Form Transaksi', 'showTransactionDialog')
    .addSeparator()
    .addItem('🔄 Hitung Ulang Saldo Berjalan', 'recalculateRunningBalance')
    .addItem('📦 Buat Cadangan (Backup Sheet)', 'backupDatabase')
    .addItem('⚙️ Inisialisasi / Reset Struktur Tabel', 'setupInitialSheet')
    .addToUi();
}

/**
 * Menampilkan Sidebar di dalam Google Sheets
 */
function showKasSidebar() {
  const html = HtmlService.createTemplateFromFile('Index').evaluate()
    .setTitle('Buku Kas Digital')
    .setWidth(350);
  SpreadsheetApp.getUi().showSidebar(html);
}

/**
 * Menampilkan Dialog Modal di dalam Google Sheets
 */
function showTransactionDialog() {
  const html = HtmlService.createTemplateFromFile('Index').evaluate()
    .setWidth(950)
    .setHeight(650);
  SpreadsheetApp.getUi().showModalDialog(html, 'Sistem Pencatatan Kas');
}

/**
 * Mendapatkan URL Web App saat ini
 */
function openWebAppUrl() {
  const url = ScriptApp.getService().getUrl();
  const htmlOutput = HtmlService.createHtmlOutput(
    '<div style="font-family:sans-serif;padding:20px;text-align:center;">' +
    '<h3>🔗 Akses Web App Kas</h3>' +
    '<p>Klik tautan di bawah ini untuk membuka halaman Web App:</p>' +
    '<a href="' + (url || '#') + '" target="_blank" style="display:inline-block;padding:10px 20px;background:#10b981;color:#fff;text-decoration:none;border-radius:6px;font-weight:bold;">Buka Web App Kas</a>' +
    (!url ? '<p style="color:#ef4444;font-size:12px;margin-top:12px;">*Catatan: Anda perlu men-deploy script ini sebagai Web App terlebih dahulu.</p>' : '') +
    '</div>'
  ).setWidth(400).setHeight(220);
  SpreadsheetApp.getUi().showModalDialog(htmlOutput, 'Tautan Web App');
}

/**
 * Mendapatkan Spreadsheet yang aktif
 */
function getKasSheet() {
  const ss = SpreadsheetApp.getActiveSpreadsheet();
  let sheet = ss.getSheetByName(DEFAULT_SHEET_TRANSAKSI);
  if (!sheet) {
    sheet = ss.insertSheet(DEFAULT_SHEET_TRANSAKSI);
  }
  return sheet;
}

/**
 * Inisialisasi format tabel dan header spreadsheet secara batch
 */
function setupInitialSheet() {
  try {
    const ss = SpreadsheetApp.getActiveSpreadsheet();
    let sheet = ss.getSheetByName(DEFAULT_SHEET_TRANSAKSI);
    
    if (!sheet) {
      sheet = ss.insertSheet(DEFAULT_SHEET_TRANSAKSI);
    }
    
    // Cek apakah header sudah ada
    const lastRow = sheet.getLastRow();
    if (lastRow === 0) {
      sheet.getRange(1, 1, 1, HEADERS.length).setValues([HEADERS]);
    }
    
    // Styling Header
    const headerRange = sheet.getRange(1, 1, 1, HEADERS.length);
    headerRange.setBackground('#1e293b')
      .setFontColor('#ffffff')
      .setFontWeight('bold')
      .setHorizontalAlignment('center')
      .setVerticalAlignment('middle');
    
    sheet.setRowHeight(1, 36);
    
    // Set lebar kolom ideal
    sheet.setColumnWidth(1, 160); // ID
    sheet.setColumnWidth(2, 110); // Tanggal
    sheet.setColumnWidth(3, 110); // Jenis
    sheet.setColumnWidth(4, 140); // Kategori
    sheet.setColumnWidth(5, 260); // Keterangan
    sheet.setColumnWidth(6, 140); // Jumlah
    sheet.setColumnWidth(7, 150); // Saldo
    
    // Bekukan baris pertama
    sheet.setFrozenRows(1);
    
    return { success: true, message: 'Format sheet berhasil disiapkan' };
  } catch (error) {
    Logger.log('Error setupInitialSheet: ' + error.message);
    return { success: false, message: error.message };
  }
}

/**
 * Membuat Cadangan (Backup) Sheet Transaksi dengan Timestamp
 */
function backupDatabase() {
  try {
    const ss = SpreadsheetApp.getActiveSpreadsheet();
    const sourceSheet = getKasSheet();
    const timeStamp = Utilities.formatDate(new Date(), Session.getScriptTimeZone(), 'yyyyMMdd_HHmm');
    const backupName = 'Backup_' + timeStamp;
    
    const existing = ss.getSheetByName(backupName);
    if (existing) {
      ss.deleteSheet(existing);
    }
    
    const copy = sourceSheet.copyTo(ss);
    copy.setName(backupName);
    
    return { success: true, message: 'Cadangan berhasil dibuat dengan nama: ' + backupName };
  } catch (e) {
    Logger.log('Error backupDatabase: ' + e.message);
    return { success: false, message: e.message };
  }
}

/**
 * Mengambil semua transaksi beserta summary ringkasan
 * Menggunakan batch getValues() untuk performa optimal
 */
function getKasData() {
  try {
    const sheet = getKasSheet();
    const lastRow = sheet.getLastRow();
    
    if (lastRow <= 1) {
      return {
        success: true,
        transactions: [],
        summary: {
          saldoTotal: 0,
          totalPemasukan: 0,
          totalPengeluaran: 0,
          jumlahTransaksi: 0
        }
      };
    }
    
    // Batch read seluruh data transaksi sekaligus
    const values = sheet.getRange(2, 1, lastRow - 1, 7).getValues();
    const transactions = [];
    let totalPemasukan = 0;
    let totalPengeluaran = 0;
    
    for (let i = 0; i < values.length; i++) {
      const row = values[i];
      const id = String(row[0] || '');
      if (!id) continue;
      
      let tanggalStr = '';
      if (row[1] instanceof Date) {
        tanggalStr = Utilities.formatDate(row[1], Session.getScriptTimeZone(), 'yyyy-MM-dd');
      } else {
        tanggalStr = String(row[1] || '');
      }
      
      const jenis = String(row[2] || '');
      const kategori = String(row[3] || 'Umum');
      const keterangan = String(row[4] || '');
      const jumlah = Number(row[5]) || 0;
      const saldoBerjalan = Number(row[6]) || 0;
      
      if (jenis === 'Pemasukan') {
        totalPemasukan += jumlah;
      } else if (jenis === 'Pengeluaran') {
        totalPengeluaran += jumlah;
      }
      
      transactions.push({
        id: id,
        tanggal: tanggalStr,
        jenis: jenis,
        kategori: kategori,
        keterangan: keterangan,
        jumlah: jumlah,
        saldoBerjalan: saldoBerjalan,
        rowIndex: i + 2
      });
    }
    
    const saldoTotal = totalPemasukan - totalPengeluaran;
    
    return {
      success: true,
      transactions: transactions,
      summary: {
        saldoTotal: saldoTotal,
        totalPemasukan: totalPemasukan,
        totalPengeluaran: totalPengeluaran,
        jumlahTransaksi: transactions.length
      }
    };
  } catch (error) {
    Logger.log('Error getKasData: ' + error.message);
    return { success: false, message: 'Gagal mengambil data: ' + error.message };
  }
}

/**
 * Menambahkan transaksi baru dan menghitung ulang saldo berjalan secara batch
 */
function addTransaction(data) {
  try {
    if (!data.tanggal || !data.jenis || !data.jumlah || data.jumlah <= 0) {
      throw new Error('Tanggal, Jenis Transaksi, dan Jumlah (> 0) wajib diisi dengan benar.');
    }
    
    const sheet = getKasSheet();
    const now = new Date();
    const datePrefix = Utilities.formatDate(now, Session.getScriptTimeZone(), 'yyyyMMdd');
    const randomSuffix = Math.floor(1000 + Math.random() * 9000);
    const newId = 'TRX-' + datePrefix + '-' + randomSuffix;
    
    const rowData = [
      newId,
      data.tanggal,
      data.jenis,
      data.kategori || 'Umum',
      data.keterangan || '-',
      Number(data.jumlah),
      0 // akan dihitung ulang secara batch
    ];
    
    sheet.appendRow(rowData);
    recalculateRunningBalance();
    
    return {
      success: true,
      message: 'Transaksi kas berhasil ditambahkan',
      id: newId
    };
  } catch (error) {
    Logger.log('Error addTransaction: ' + error.message);
    return { success: false, message: error.message };
  }
}

/**
 * Mengedit transaksi yang sudah ada berdasarkan ID
 */
function updateTransaction(data) {
  try {
    if (!data.id) {
      throw new Error('ID Transaksi tidak ditemukan.');
    }
    if (!data.tanggal || !data.jenis || !data.jumlah || data.jumlah <= 0) {
      throw new Error('Data input tidak lengkap atau tidak valid.');
    }
    
    const sheet = getKasSheet();
    const lastRow = sheet.getLastRow();
    if (lastRow <= 1) throw new Error('Data kosong.');
    
    const idValues = sheet.getRange(2, 1, lastRow - 1, 1).getValues();
    let targetRow = -1;
    const searchId = String(data.id).trim();
    
    for (let i = 0; i < idValues.length; i++) {
      if (String(idValues[i][0]).trim() === searchId) {
        targetRow = i + 2;
        break;
      }
    }
    
    if (targetRow === -1) {
      throw new Error('Transaksi dengan ID ' + data.id + ' tidak ditemukan di Spreadsheet.');
    }
    
    const updateValues = [
      [
        data.tanggal,
        data.jenis,
        data.kategori || 'Umum',
        data.keterangan || '-',
        Number(data.jumlah)
      ]
    ];
    
    sheet.getRange(targetRow, 2, 1, 5).setValues(updateValues);
    recalculateRunningBalance();
    
    return { success: true, message: 'Transaksi berhasil diperbarui di Spreadsheet' };
  } catch (error) {
    Logger.log('Error updateTransaction: ' + error.message);
    return { success: false, message: error.message };
  }
}

/**
 * Menghapus transaksi berdasarkan ID
 */
function deleteTransaction(id) {
  try {
    if (!id) throw new Error('ID transaksi diperlukan.');
    
    const sheet = getKasSheet();
    const lastRow = sheet.getLastRow();
    if (lastRow <= 1) throw new Error('Data kosong.');
    
    const idValues = sheet.getRange(2, 1, lastRow - 1, 1).getValues();
    let targetRow = -1;
    const searchId = String(id).trim();
    
    for (let i = 0; i < idValues.length; i++) {
      if (String(idValues[i][0]).trim() === searchId) {
        targetRow = i + 2;
        break;
      }
    }
    
    if (targetRow === -1) {
      throw new Error('Transaksi dengan ID ' + id + ' tidak ditemukan di Spreadsheet.');
    }
    
    sheet.deleteRow(targetRow);
    recalculateRunningBalance();
    
    return { success: true, message: 'Transaksi berhasil dihapus dari Spreadsheet' };
  } catch (error) {
    Logger.log('Error deleteTransaction: ' + error.message);
    return { success: false, message: error.message };
  }
}

/**
 * Menghitung ulang Running Balance seluruh baris secara batch (Anti-Quota Exhaustion)
 */
function recalculateRunningBalance() {
  try {
    const sheet = getKasSheet();
    const lastRow = sheet.getLastRow();
    
    if (lastRow <= 1) return { success: true, message: 'Tidak ada data untuk dihitung.', totalBalance: 0 };
    
    const range = sheet.getRange(2, 1, lastRow - 1, 7);
    const data = range.getValues();
    
    let currentBalance = 0;
    const balanceColumn = [];
    
    for (let i = 0; i < data.length; i++) {
      const jenis = String(data[i][2]);
      const jumlah = Number(data[i][5]) || 0;
      
      if (jenis === 'Pemasukan') {
        currentBalance += jumlah;
      } else if (jenis === 'Pengeluaran') {
        currentBalance -= jumlah;
      }
      
      balanceColumn.push([currentBalance]);
    }
    
    // Batch write kembali ke kolom G (Saldo Berjalan)
    sheet.getRange(2, 7, balanceColumn.length, 1).setValues(balanceColumn);
    
    // Format mata uang untuk kolom Jumlah dan Saldo
    sheet.getRange(2, 6, data.length, 2).setNumberFormat('"Rp"#,##0');
    sheet.getRange(2, 2, data.length, 1).setNumberFormat('yyyy-mm-dd');
    
    return { success: true, message: 'Saldo berjalan berhasil dihitung ulang', totalBalance: currentBalance };
  } catch (error) {
    Logger.log('Error recalculateRunningBalance: ' + error.message);
    return { success: false, message: error.message };
  }
}
`
  },
  {
    name: 'Index.html',
    extension: 'html',
    description: 'Halaman Antarmuka Web App Utama (Dashboard, Form Modal, Filter, Tabel, & Visualisasi)',
    code: `<!DOCTYPE html>
<html lang="id">
<head>
  <base target="_top">
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Aplikasi Laporan Kas Google Sheets</title>
  <!-- Tailwind CSS CDN -->
  <script src="https://cdn.tailwindcss.com"></script>
  <!-- Chart.js CDN -->
  <script src="https://cdn.jsdelivr.net/npm/chart.js"></script>
  <!-- Lucide Icons CDN -->
  <script src="https://unpkg.com/lucide@latest"></script>
  <?!= include('Stylesheet'); ?>
</head>
<body class="bg-slate-50 text-slate-800 antialiased min-h-screen">

  <!-- TOP NAVBAR -->
  <nav class="bg-white border-b border-slate-200 sticky top-0 z-30 shadow-xs">
    <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
      <div class="flex items-center justify-between h-16">
        <!-- Logo & Title -->
        <div class="flex items-center gap-3">
          <div class="w-10 h-10 rounded-xl bg-emerald-600 flex items-center justify-center text-white shadow-sm font-bold text-lg">
            Rp
          </div>
          <div>
            <h1 class="text-lg font-bold text-slate-900 leading-tight">Buku Kas Digital</h1>
            <p class="text-xs text-slate-500">Tersinkronisasi dengan Google Sheets</p>
          </div>
        </div>

        <!-- Action Buttons -->
        <div class="flex items-center gap-2">
          <button id="btnRefresh" onclick="loadData()" class="p-2 text-slate-600 hover:text-slate-900 hover:bg-slate-100 rounded-lg transition" title="Muat Ulang Data">
            <i data-lucide="refresh-cw" class="w-5 h-5"></i>
          </button>
          <button onclick="openTransactionModal()" class="inline-flex items-center gap-2 bg-emerald-600 hover:bg-emerald-700 text-white px-4 py-2 rounded-xl text-sm font-semibold shadow-sm transition active:scale-95">
            <i data-lucide="plus-circle" class="w-4 h-4"></i>
            <span>Catat Kas</span>
          </button>
        </div>
      </div>
    </div>
  </nav>

  <!-- MAIN CONTAINER -->
  <main class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 space-y-6">

    <!-- ALERT / NOTIFICATION BANNER -->
    <div id="alertBox" class="hidden p-4 rounded-xl text-sm font-medium transition-all duration-300"></div>

    <!-- SUMMARY CARDS -->
    <section class="grid grid-cols-1 md:grid-cols-3 gap-5">
      <!-- Card: Saldo Kas -->
      <div class="bg-white p-5 rounded-2xl border border-slate-200 shadow-xs flex flex-col justify-between">
        <div class="flex items-center justify-between">
          <span class="text-xs font-semibold uppercase tracking-wider text-slate-500">Saldo Kas Saat Ini</span>
          <span class="p-2 rounded-xl bg-emerald-50 text-emerald-600">
            <i data-lucide="wallet" class="w-5 h-5"></i>
          </span>
        </div>
        <div class="mt-4">
          <div id="cardSaldo" class="text-2xl sm:text-3xl font-extrabold text-slate-900">Rp 0</div>
          <p id="cardTotalTransaksi" class="text-xs text-slate-500 mt-1">0 total transaksi tercatat</p>
        </div>
      </div>

      <!-- Card: Total Pemasukan -->
      <div class="bg-white p-5 rounded-2xl border border-slate-200 shadow-xs flex flex-col justify-between">
        <div class="flex items-center justify-between">
          <span class="text-xs font-semibold uppercase tracking-wider text-emerald-700">Total Kas Masuk</span>
          <span class="p-2 rounded-xl bg-emerald-100 text-emerald-700">
            <i data-lucide="arrow-down-left" class="w-5 h-5"></i>
          </span>
        </div>
        <div class="mt-4">
          <div id="cardPemasukan" class="text-2xl sm:text-3xl font-extrabold text-emerald-600">Rp 0</div>
          <p class="text-xs text-emerald-700 mt-1 font-medium">Akumulasi Pemasukan</p>
        </div>
      </div>

      <!-- Card: Total Pengeluaran -->
      <div class="bg-white p-5 rounded-2xl border border-slate-200 shadow-xs flex flex-col justify-between">
        <div class="flex items-center justify-between">
          <span class="text-xs font-semibold uppercase tracking-wider text-rose-700">Total Kas Keluar</span>
          <span class="p-2 rounded-xl bg-rose-100 text-rose-700">
            <i data-lucide="arrow-up-right" class="w-5 h-5"></i>
          </span>
        </div>
        <div class="mt-4">
          <div id="cardPengeluaran" class="text-2xl sm:text-3xl font-extrabold text-rose-600">Rp 0</div>
          <p class="text-xs text-rose-700 mt-1 font-medium">Akumulasi Pengeluaran</p>
        </div>
      </div>
    </section>

    <!-- CHART & MONTHLY STATS -->
    <section class="bg-white p-6 rounded-2xl border border-slate-200 shadow-xs">
      <div class="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-4">
        <div>
          <h2 class="text-base font-bold text-slate-900">Tren Pemasukan vs Pengeluaran</h2>
          <p class="text-xs text-slate-500">Grafik perbandingan arus kas masuk dan keluar tiap bulan</p>
        </div>
        <div class="flex items-center gap-2 text-xs">
          <span class="inline-flex items-center gap-1.5 font-medium text-emerald-700">
            <span class="w-3 h-3 rounded-full bg-emerald-500"></span> Pemasukan
          </span>
          <span class="inline-flex items-center gap-1.5 font-medium text-rose-700 ml-3">
            <span class="w-3 h-3 rounded-full bg-rose-500"></span> Pengeluaran
          </span>
        </div>
      </div>
      <div class="h-64 sm:h-72 w-full">
        <canvas id="kasTrendChart"></canvas>
      </div>
    </section>

    <!-- FILTER & SEARCH TOOLBAR -->
    <section class="bg-white p-5 rounded-2xl border border-slate-200 shadow-xs space-y-4">
      <div class="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
        <h2 class="text-base font-bold text-slate-900">Riwayat Transaksi</h2>
        
        <!-- Quick Filter Buttons -->
        <div class="inline-flex p-1 bg-slate-100 rounded-xl text-xs font-medium self-start lg:self-auto">
          <button onclick="setFilterJenis('Semua')" id="btnFilterSemua" class="px-3 py-1.5 rounded-lg bg-white shadow-xs text-slate-900 font-semibold">Semua</button>
          <button onclick="setFilterJenis('Pemasukan')" id="btnFilterPemasukan" class="px-3 py-1.5 rounded-lg text-slate-600 hover:text-emerald-700">Pemasukan</button>
          <button onclick="setFilterJenis('Pengeluaran')" id="btnFilterPengeluaran" class="px-3 py-1.5 rounded-lg text-slate-600 hover:text-rose-700">Pengeluaran</button>
        </div>
      </div>

      <!-- Detail Filters Form -->
      <div class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3 pt-2">
        <!-- Search Input -->
        <div class="relative">
          <input type="text" id="filterSearch" oninput="applyFilters()" placeholder="Cari keterangan / ID..." class="w-full pl-9 pr-3 py-2 text-sm bg-slate-50 border border-slate-200 rounded-xl focus:bg-white focus:outline-none focus:ring-2 focus:ring-emerald-500">
          <i data-lucide="search" class="w-4 h-4 text-slate-400 absolute left-3 top-2.5"></i>
        </div>

        <!-- Filter Kategori -->
        <div>
          <select id="filterKategori" onchange="applyFilters()" class="w-full px-3 py-2 text-sm bg-slate-50 border border-slate-200 rounded-xl focus:bg-white focus:outline-none focus:ring-2 focus:ring-emerald-500">
            <option value="">Semua Kategori</option>
            <option value="Iuran Warga">Iuran Warga</option>
            <option value="Donasi / Infaq">Donasi / Infaq</option>
            <option value="Kebersihan">Kebersihan</option>
            <option value="Keamanan">Keamanan</option>
            <option value="Operasional">Operasional</option>
            <option value="Konsumsi Rapat">Konsumsi Rapat</option>
            <option value="Perbaikan / Sarana">Perbaikan / Sarana</option>
            <option value="Lain-lain">Lain-lain</option>
          </select>
        </div>

        <!-- Start Date -->
        <div>
          <input type="date" id="filterStartDate" onchange="applyFilters()" class="w-full px-3 py-2 text-sm bg-slate-50 border border-slate-200 rounded-xl focus:bg-white focus:outline-none focus:ring-2 focus:ring-emerald-500">
        </div>

        <!-- End Date -->
        <div>
          <input type="date" id="filterEndDate" onchange="applyFilters()" class="w-full px-3 py-2 text-sm bg-slate-50 border border-slate-200 rounded-xl focus:bg-white focus:outline-none focus:ring-2 focus:ring-emerald-500">
        </div>
      </div>
    </section>

    <!-- TRANSACTION TABLE -->
    <section class="bg-white rounded-2xl border border-slate-200 shadow-xs overflow-hidden">
      <div class="overflow-x-auto">
        <table class="w-full text-left text-sm text-slate-600">
          <thead class="bg-slate-50 text-slate-700 font-semibold uppercase text-xs tracking-wider border-b border-slate-200">
            <tr>
              <th class="py-3.5 px-4">Tanggal</th>
              <th class="py-3.5 px-4">Jenis</th>
              <th class="py-3.5 px-4">Kategori</th>
              <th class="py-3.5 px-4">Keterangan</th>
              <th class="py-3.5 px-4 text-right">Jumlah</th>
              <th class="py-3.5 px-4 text-right">Saldo Berjalan</th>
              <th class="py-3.5 px-4 text-center">Aksi</th>
            </tr>
          </thead>
          <tbody id="transactionTableBody" class="divide-y divide-slate-100">
            <!-- Dynamic rows will be inserted here -->
          </tbody>
        </table>
      </div>

      <!-- Empty State -->
      <div id="emptyState" class="hidden py-12 text-center text-slate-400">
        <i data-lucide="inbox" class="w-12 h-12 mx-auto text-slate-300 mb-2"></i>
        <p class="text-sm font-medium text-slate-600">Tidak ada transaksi ditemukan</p>
        <p class="text-xs text-slate-400 mt-1">Coba ubah filter pencarian atau tambahkan transaksi baru.</p>
      </div>

      <!-- Table Footer / Count -->
      <div class="p-4 border-t border-slate-100 bg-slate-50 flex items-center justify-between text-xs text-slate-500">
        <span id="txtShowingCount">Menampilkan 0 transaksi</span>
        <button onclick="resetFilters()" class="text-emerald-600 hover:text-emerald-700 font-medium">Reset Semua Filter</button>
      </div>
    </section>

  </main>

  <!-- MODAL FORM TRANSAKSI (INPUT / EDIT) -->
  <div id="modalTransaction" class="fixed inset-0 z-50 bg-slate-900/50 backdrop-blur-xs flex items-center justify-center p-4 hidden">
    <div class="bg-white w-full max-w-lg rounded-2xl shadow-xl overflow-hidden animate-in fade-in zoom-in duration-200">
      
      <!-- Modal Header -->
      <div class="px-6 py-4 border-b border-slate-100 flex items-center justify-between bg-slate-50">
        <h3 id="modalTitle" class="text-base font-bold text-slate-900">Catat Transaksi Kas Baru</h3>
        <button onclick="closeTransactionModal()" class="text-slate-400 hover:text-slate-600 p-1 rounded-lg">
          <i data-lucide="x" class="w-5 h-5"></i>
        </button>
      </div>

      <!-- Modal Form -->
      <form id="formTransaction" onsubmit="handleFormSubmit(event)" class="p-6 space-y-4">
        <input type="hidden" id="formId">

        <!-- Radio / Toggle Jenis Transaksi -->
        <div>
          <label class="block text-xs font-semibold uppercase text-slate-500 mb-2">Jenis Transaksi *</label>
          <div class="grid grid-cols-2 gap-3">
            <label class="flex items-center justify-center gap-2 p-3 border-2 rounded-xl cursor-pointer transition border-emerald-500 bg-emerald-50 text-emerald-700 font-semibold" id="labelJenisPemasukan">
              <input type="radio" name="formJenis" value="Pemasukan" checked onchange="updateJenisUI()" class="hidden">
              <i data-lucide="arrow-down-left" class="w-4 h-4"></i>
              <span>Pemasukan</span>
            </label>
            <label class="flex items-center justify-center gap-2 p-3 border-2 rounded-xl cursor-pointer transition border-slate-200 hover:border-slate-300 text-slate-600 font-semibold" id="labelJenisPengeluaran">
              <input type="radio" name="formJenis" value="Pengeluaran" onchange="updateJenisUI()" class="hidden">
              <i data-lucide="arrow-up-right" class="w-4 h-4"></i>
              <span>Pengeluaran</span>
            </label>
          </div>
        </div>

        <!-- Tanggal & Kategori -->
        <div class="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div>
            <label class="block text-xs font-semibold text-slate-700 mb-1">Tanggal *</label>
            <input type="date" id="formTanggal" required class="w-full px-3.5 py-2 text-sm border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-emerald-500">
          </div>
          <div>
            <label class="block text-xs font-semibold text-slate-700 mb-1">Kategori</label>
            <select id="formKategori" class="w-full px-3.5 py-2 text-sm border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-emerald-500">
              <option value="Iuran Warga">Iuran Warga</option>
              <option value="Donasi / Infaq">Donasi / Infaq</option>
              <option value="Kebersihan">Kebersihan</option>
              <option value="Keamanan">Keamanan</option>
              <option value="Operasional">Operasional</option>
              <option value="Konsumsi Rapat">Konsumsi Rapat</option>
              <option value="Perbaikan / Sarana">Perbaikan / Sarana</option>
              <option value="Lain-lain">Lain-lain</option>
            </select>
          </div>
        </div>

        <!-- Jumlah (Rp) -->
        <div>
          <label class="block text-xs font-semibold text-slate-700 mb-1">Jumlah Nominal (Rp) *</label>
          <div class="relative">
            <span class="absolute left-3.5 top-2.5 text-sm font-semibold text-slate-400">Rp</span>
            <input type="number" id="formJumlah" min="1" step="1" required placeholder="0" class="w-full pl-11 pr-3.5 py-2 text-sm border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-emerald-500 font-semibold">
          </div>
          <span id="previewNominal" class="text-xs text-slate-400 mt-1 block">Rp 0</span>
        </div>

        <!-- Keterangan -->
        <div>
          <label class="block text-xs font-semibold text-slate-700 mb-1">Keterangan / Catatan</label>
          <textarea id="formKeterangan" rows="2" placeholder="Contoh: Iuran kas bulanan bpk Ahmad..." class="w-full px-3.5 py-2 text-sm border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-emerald-500"></textarea>
        </div>

        <!-- Submit & Cancel Buttons -->
        <div class="flex items-center justify-end gap-3 pt-3 border-t border-slate-100">
          <button type="button" onclick="closeTransactionModal()" class="px-4 py-2 text-sm font-medium text-slate-600 hover:bg-slate-100 rounded-xl transition">
            Batal
          </button>
          <button type="submit" id="btnSubmitForm" class="px-5 py-2 text-sm font-semibold text-white bg-emerald-600 hover:bg-emerald-700 rounded-xl shadow-sm transition active:scale-95 flex items-center gap-2">
            <span id="btnSubmitText">Simpan Transaksi</span>
          </button>
        </div>
      </form>
    </div>
  </div>

  <!-- DELETE CONFIRMATION MODAL -->
  <div id="modalDelete" class="fixed inset-0 z-50 bg-slate-900/50 backdrop-blur-xs flex items-center justify-center p-4 hidden">
    <div class="bg-white w-full max-w-sm rounded-2xl shadow-xl p-6 text-center animate-in fade-in zoom-in duration-200">
      <div class="w-12 h-12 rounded-full bg-rose-100 text-rose-600 mx-auto flex items-center justify-center mb-4">
        <i data-lucide="trash-2" class="w-6 h-6"></i>
      </div>
      <h3 class="text-base font-bold text-slate-900 mb-1">Hapus Transaksi?</h3>
      <p class="text-xs text-slate-500 mb-6">Tindakan ini akan menghapus data dari Google Sheets dan saldo berjalan akan otomatis dihitung ulang.</p>
      
      <div class="flex items-center justify-center gap-3">
        <button onclick="closeDeleteModal()" class="flex-1 py-2 text-sm font-medium text-slate-600 hover:bg-slate-100 rounded-xl">
          Batal
        </button>
        <button id="btnConfirmDelete" onclick="executeDelete()" class="flex-1 py-2 text-sm font-semibold text-white bg-rose-600 hover:bg-rose-700 rounded-xl">
          Ya, Hapus
        </button>
      </div>
    </div>
  </div>

  <?!= include('JavaScript'); ?>
</body>
</html>
`
  },
  {
    name: 'Stylesheet.html',
    extension: 'html',
    description: 'Styling Kustom & Variabel Warna untuk Antarmuka Google Apps Script',
    code: `<style>
  /* Custom Google Apps Script Styling Enhancement */
  @import url('https://fonts.googleapis.com/css2?family=Plus+Jakarta+Sans:wght@400;500;600;700;800&display=swap');

  body {
    font-family: 'Plus Jakarta Sans', sans-serif;
  }

  /* Custom Scrollbar for Clean UI */
  ::-webkit-scrollbar {
    width: 6px;
    height: 6px;
  }
  ::-webkit-scrollbar-track {
    background: #f1f5f9;
  }
  ::-webkit-scrollbar-thumb {
    background: #cbd5e1;
    border-radius: 9999px;
  }
  ::-webkit-scrollbar-thumb:hover {
    background: #94a3b8;
  }

  /* Status Badges */
  .badge-pemasukan {
    background-color: #ecfdf5;
    color: #047857;
    border: 1px solid #a7f3d0;
  }

  .badge-pengeluaran {
    background-color: #fff1f2;
    color: #be123c;
    border: 1px solid #fecdd3;
  }

  /* Table Striping & Transitions */
  tbody tr {
    transition: background-color 0.15s ease-in-out;
  }
  tbody tr:hover {
    background-color: #f8fafc;
  }

  /* Print Friendly Styles */
  @media print {
    nav, button, #btnRefresh, .no-print {
      display: none !important;
    }
    body {
      background: white !important;
    }
  }
</style>
`
  },
  {
    name: 'JavaScript.html',
    extension: 'html',
    description: 'Client-Side Script (Integrasi google.script.run, Filter, Chart.js, & Kalkulasi)',
    code: `<script>
  // State Aplikasi Client-Side
  let allTransactions = [];
  let filteredTransactions = [];
  let trendChartInstance = null;
  let deleteTargetId = null;
  let activeJenisFilter = 'Semua';

  // Inisialisasi saat DOM siap
  document.addEventListener('DOMContentLoaded', () => {
    lucide.createIcons();
    initTodayDate();
    loadData();
  });

  function initTodayDate() {
    const today = new Date().toISOString().split('T')[0];
    const formTanggal = document.getElementById('formTanggal');
    if (formTanggal) formTanggal.value = today;
  }

  // Format Rupiah Helper
  function formatRupiah(number) {
    if (isNaN(number) || number === null) return 'Rp 0';
    return new Intl.NumberFormat('id-ID', {
      style: 'currency',
      currency: 'IDR',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0
    }).format(number);
  }

  // Menampilkan Notifikasi Banner
  function showAlert(message, isError = false) {
    const alertBox = document.getElementById('alertBox');
    alertBox.textContent = message;
    alertBox.className = isError 
      ? 'p-4 rounded-xl text-sm font-medium bg-rose-50 text-rose-700 border border-rose-200 block animate-in fade-in'
      : 'p-4 rounded-xl text-sm font-medium bg-emerald-50 text-emerald-700 border border-emerald-200 block animate-in fade-in';
    
    setTimeout(() => {
      alertBox.className = 'hidden';
    }, 4000);
  }

  // Panggil Server GAS: getKasData()
  function loadData() {
    const btnRefresh = document.getElementById('btnRefresh');
    if (btnRefresh) btnRefresh.classList.add('animate-spin');

    // Jika berjalan di dalam Google Apps Script Web App
    if (typeof google !== 'undefined' && google.script && google.script.run) {
      google.script.run
        .withSuccessHandler(handleDataSuccess)
        .withFailureHandler(handleDataFailure)
        .getKasData();
    } else {
      // Fallback jika diuji di browser biasa tanpa GAS
      console.warn('google.script.run tidak terdeteksi (Running in preview mode)');
      if (btnRefresh) btnRefresh.classList.remove('animate-spin');
    }
  }

  function handleDataSuccess(response) {
    const btnRefresh = document.getElementById('btnRefresh');
    if (btnRefresh) btnRefresh.classList.remove('animate-spin');

    if (!response.success) {
      showAlert(response.message || 'Gagal memuat data.', true);
      return;
    }

    allTransactions = response.transactions || [];
    updateSummaryCards(response.summary);
    updateChart(allTransactions);
    applyFilters();
  }

  function handleDataFailure(error) {
    const btnRefresh = document.getElementById('btnRefresh');
    if (btnRefresh) btnRefresh.classList.remove('animate-spin');
    showAlert('Koneksi Apps Script Gagal: ' + error.message, true);
  }

  // Update Kartu Ringkasan
  function updateSummaryCards(summary) {
    if (!summary) return;
    document.getElementById('cardSaldo').textContent = formatRupiah(summary.saldoTotal);
    document.getElementById('cardPemasukan').textContent = formatRupiah(summary.totalPemasukan);
    document.getElementById('cardPengeluaran').textContent = formatRupiah(summary.totalPengeluaran);
    document.getElementById('cardTotalTransaksi').textContent = (summary.jumlahTransaksi || 0) + ' total transaksi tercatat';
  }

  // Update Visualisasi Chart.js Tren Bulanan
  function updateChart(transactions) {
    const ctx = document.getElementById('kasTrendChart');
    if (!ctx) return;

    // Agregasi pemasukan & pengeluaran per bulan
    const monthlyMap = {};
    transactions.forEach(t => {
      if (!t.tanggal) return;
      const monthKey = t.tanggal.substring(0, 7); // YYYY-MM
      if (!monthlyMap[monthKey]) {
        monthlyMap[monthKey] = { pemasukan: 0, pengeluaran: 0 };
      }
      if (t.jenis === 'Pemasukan') {
        monthlyMap[monthKey].pemasukan += t.jumlah;
      } else {
        monthlyMap[monthKey].pengeluaran += t.jumlah;
      }
    });

    const sortedMonths = Object.keys(monthlyMap).sort();
    const labels = sortedMonths.map(m => {
      const parts = m.split('-');
      const d = new Date(parts[0], parts[1] - 1);
      return d.toLocaleDateString('id-ID', { month: 'short', year: 'numeric' });
    });

    const dataPemasukan = sortedMonths.map(m => monthlyMap[m].pemasukan);
    const dataPengeluaran = sortedMonths.map(m => monthlyMap[m].pengeluaran);

    if (trendChartInstance) {
      trendChartInstance.destroy();
    }

    trendChartInstance = new Chart(ctx, {
      type: 'bar',
      data: {
        labels: labels.length ? labels : ['Belum Ada Data'],
        datasets: [
          {
            label: 'Pemasukan (Rp)',
            data: dataPemasukan.length ? dataPemasukan : [0],
            backgroundColor: '#10b981',
            borderRadius: 6,
            barPercentage: 0.6
          },
          {
            label: 'Pengeluaran (Rp)',
            data: dataPengeluaran.length ? dataPengeluaran : [0],
            backgroundColor: '#f43f5e',
            borderRadius: 6,
            barPercentage: 0.6
          }
        ]
      },
      options: {
        responsive: true,
        maintainAspectRatio: false,
        plugins: {
          legend: { display: false },
          tooltip: {
            callbacks: {
              label: (context) => context.dataset.label + ': ' + formatRupiah(context.raw)
            }
          }
        },
        scales: {
          x: { grid: { display: false } },
          y: {
            beginAtZero: true,
            ticks: {
              callback: (value) => 'Rp ' + (value >= 1000000 ? (value / 1000000) + 'jt' : (value / 1000) + 'rb')
            }
          }
        }
      }
    });
  }

  // Filter Data
  function setFilterJenis(jenis) {
    activeJenisFilter = jenis;
    
    ['Semua', 'Pemasukan', 'Pengeluaran'].forEach(j => {
      const btn = document.getElementById('btnFilter' + j);
      if (btn) {
        if (j === jenis) {
          btn.className = 'px-3 py-1.5 rounded-lg bg-white shadow-xs text-slate-900 font-semibold';
        } else {
          btn.className = 'px-3 py-1.5 rounded-lg text-slate-600 hover:text-slate-900';
        }
      }
    });
    
    applyFilters();
  }

  function applyFilters() {
    const searchVal = (document.getElementById('filterSearch')?.value || '').toLowerCase();
    const kategoriVal = document.getElementById('filterKategori')?.value || '';
    const startDateVal = document.getElementById('filterStartDate')?.value || '';
    const endDateVal = document.getElementById('filterEndDate')?.value || '';

    filteredTransactions = allTransactions.filter(t => {
      if (activeJenisFilter !== 'Semua' && t.jenis !== activeJenisFilter) return false;
      if (kategoriVal && t.kategori !== kategoriVal) return false;
      if (startDateVal && t.tanggal < startDateVal) return false;
      if (endDateVal && t.tanggal > endDateVal) return false;
      if (searchVal) {
        const text = (t.keterangan + ' ' + t.id + ' ' + t.kategori).toLowerCase();
        if (!text.includes(searchVal)) return false;
      }
      return true;
    });

    renderTable(filteredTransactions);
  }

  function resetFilters() {
    document.getElementById('filterSearch').value = '';
    document.getElementById('filterKategori').value = '';
    document.getElementById('filterStartDate').value = '';
    document.getElementById('filterEndDate').value = '';
    setFilterJenis('Semua');
  }

  // Render Tabel Transaksi
  function renderTable(data) {
    const tbody = document.getElementById('transactionTableBody');
    const emptyState = document.getElementById('emptyState');
    const txtCount = document.getElementById('txtShowingCount');

    tbody.innerHTML = '';
    txtCount.textContent = 'Menampilkan ' + data.length + ' dari ' + allTransactions.length + ' transaksi';

    if (data.length === 0) {
      emptyState.classList.remove('hidden');
      return;
    }

    emptyState.classList.add('hidden');

    data.forEach(t => {
      const tr = document.createElement('tr');
      const isPemasukan = t.jenis === 'Pemasukan';

      tr.innerHTML = \`
        <td class="py-3 px-4 font-mono text-xs text-slate-500 whitespace-nowrap">\${t.tanggal}</td>
        <td class="py-3 px-4">
          <span class="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-semibold \${isPemasukan ? 'badge-pemasukan' : 'badge-pengeluaran'}">
            <i data-lucide="\${isPemasukan ? 'arrow-down-left' : 'arrow-up-right'}" class="w-3.5 h-3.5"></i>
            \${t.jenis}
          </span>
        </td>
        <td class="py-3 px-4 font-medium text-slate-700">\${t.kategori || '-'}</td>
        <td class="py-3 px-4 text-slate-800 max-w-xs truncate">\${t.keterangan || '-'}</td>
        <td class="py-3 px-4 text-right font-bold \${isPemasukan ? 'text-emerald-600' : 'text-rose-600'}">
          \${formatRupiah(t.jumlah)}
        </td>
        <td class="py-3 px-4 text-right font-extrabold text-slate-900 bg-slate-50/50">
          \${formatRupiah(t.saldoBerjalan)}
        </td>
        <td class="py-3 px-4 text-center">
          <div class="flex items-center justify-center gap-1.5">
            <button onclick="editTransaction('\${t.id}')" class="p-1.5 text-slate-500 hover:text-emerald-600 hover:bg-emerald-50 rounded-lg transition" title="Edit">
              <i data-lucide="edit-3" class="w-4 h-4"></i>
            </button>
            <button onclick="openDeleteModal('\${t.id}')" class="p-1.5 text-slate-500 hover:text-rose-600 hover:bg-rose-50 rounded-lg transition" title="Hapus">
              <i data-lucide="trash-2" class="w-4 h-4"></i>
            </button>
          </div>
        </td>
      \`;

      tbody.appendChild(tr);
    });

    lucide.createIcons();
  }

  // Modal Form Management
  function openTransactionModal(data = null) {
    const modal = document.getElementById('modalTransaction');
    const title = document.getElementById('modalTitle');
    const formId = document.getElementById('formId');
    const formTanggal = document.getElementById('formTanggal');
    const formKategori = document.getElementById('formKategori');
    const formJumlah = document.getElementById('formJumlah');
    const formKeterangan = document.getElementById('formKeterangan');
    const btnSubmitText = document.getElementById('btnSubmitText');

    if (data) {
      title.textContent = 'Ubah Transaksi Kas';
      formId.value = data.id;
      formTanggal.value = data.tanggal;
      formKategori.value = data.kategori || 'Iuran Warga';
      formJumlah.value = data.jumlah;
      formKeterangan.value = data.keterangan || '';
      btnSubmitText.textContent = 'Simpan Perubahan';
      
      const radio = document.querySelector(\`input[name="formJenis"][value="\${data.jenis}"]\`);
      if (radio) radio.checked = true;
    } else {
      title.textContent = 'Catat Transaksi Kas Baru';
      formId.value = '';
      initTodayDate();
      formKategori.value = 'Iuran Warga';
      formJumlah.value = '';
      formKeterangan.value = '';
      btnSubmitText.textContent = 'Simpan Transaksi';
      
      const radio = document.querySelector('input[name="formJenis"][value="Pemasukan"]');
      if (radio) radio.checked = true;
    }

    updateJenisUI();
    modal.classList.remove('hidden');
  }

  function closeTransactionModal() {
    document.getElementById('modalTransaction').classList.add('hidden');
  }

  function updateJenisUI() {
    const selected = document.querySelector('input[name="formJenis"]:checked')?.value || 'Pemasukan';
    const labelIn = document.getElementById('labelJenisPemasukan');
    const labelOut = document.getElementById('labelJenisPengeluaran');

    if (selected === 'Pemasukan') {
      labelIn.className = 'flex items-center justify-center gap-2 p-3 border-2 rounded-xl cursor-pointer transition border-emerald-500 bg-emerald-50 text-emerald-700 font-semibold';
      labelOut.className = 'flex items-center justify-center gap-2 p-3 border-2 rounded-xl cursor-pointer transition border-slate-200 hover:border-slate-300 text-slate-600 font-semibold';
    } else {
      labelOut.className = 'flex items-center justify-center gap-2 p-3 border-2 rounded-xl cursor-pointer transition border-rose-500 bg-rose-50 text-rose-700 font-semibold';
      labelIn.className = 'flex items-center justify-center gap-2 p-3 border-2 rounded-xl cursor-pointer transition border-slate-200 hover:border-slate-300 text-slate-600 font-semibold';
    }
  }

  // Handle Form Submit (Add / Edit)
  function handleFormSubmit(e) {
    e.preventDefault();
    const btnSubmit = document.getElementById('btnSubmitForm');
    btnSubmit.disabled = true;

    const payload = {
      id: document.getElementById('formId').value,
      tanggal: document.getElementById('formTanggal').value,
      jenis: document.querySelector('input[name="formJenis"]:checked').value,
      kategori: document.getElementById('formKategori').value,
      jumlah: parseFloat(document.getElementById('formJumlah').value),
      keterangan: document.getElementById('formKeterangan').value
    };

    if (payload.id) {
      // Edit
      google.script.run
        .withSuccessHandler(res => {
          btnSubmit.disabled = false;
          closeTransactionModal();
          if (res.success) {
            showAlert('Transaksi berhasil diperbarui!');
            loadData();
          } else {
            showAlert(res.message, true);
          }
        })
        .withFailureHandler(err => {
          btnSubmit.disabled = false;
          showAlert('Gagal: ' + err.message, true);
        })
        .updateTransaction(payload);
    } else {
      // Add
      google.script.run
        .withSuccessHandler(res => {
          btnSubmit.disabled = false;
          closeTransactionModal();
          if (res.success) {
            showAlert('Transaksi baru berhasil dicatat!');
            loadData();
          } else {
            showAlert(res.message, true);
          }
        })
        .withFailureHandler(err => {
          btnSubmit.disabled = false;
          showAlert('Gagal: ' + err.message, true);
        })
        .addTransaction(payload);
    }
  }

  function editTransaction(id) {
    const tx = allTransactions.find(t => t.id === id);
    if (tx) {
      openTransactionModal(tx);
    }
  }

  // Delete Modal
  function openDeleteModal(id) {
    deleteTargetId = id;
    document.getElementById('modalDelete').classList.remove('hidden');
  }

  function closeDeleteModal() {
    deleteTargetId = null;
    document.getElementById('modalDelete').classList.add('hidden');
  }

  function executeDelete() {
    if (!deleteTargetId) return;
    const btn = document.getElementById('btnConfirmDelete');
    btn.disabled = true;

    google.script.run
      .withSuccessHandler(res => {
        btn.disabled = false;
        closeDeleteModal();
        if (res.success) {
          showAlert('Transaksi berhasil dihapus.');
          loadData();
        } else {
          showAlert(res.message, true);
        }
      })
      .withFailureHandler(err => {
        btn.disabled = false;
        closeDeleteModal();
        showAlert('Gagal menghapus: ' + err.message, true);
      })
      .deleteTransaction(deleteTargetId);
  }
</script>
`
  }
];
