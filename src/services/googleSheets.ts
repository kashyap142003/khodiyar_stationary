import { SyncMutation } from '../types';

export interface GoogleSheetsConfig {
  spreadsheetUrl?: string;
  webAppUrl?: string;
  isAutoSyncEnabled: boolean;
  lastSyncedAt?: string;
}

export const DEFAULT_WEB_APP_URL =
  'https://script.google.com/macros/s/AKfycbzWq6pAx2_G1QwvfsunEIjfW9u_ac3WZGDnBK1lvSDDWDG_KiEz120-PurBFHnwsIuD/exec';

const STORAGE_KEY_CONFIG = 'shopbook_google_sheets_config';

export function getGoogleSheetsConfig(): GoogleSheetsConfig {
  try {
    const saved = localStorage.getItem(STORAGE_KEY_CONFIG);
    if (saved) {
      const parsed = JSON.parse(saved);
      // Auto-migrate if empty or if using older temporary Apps Script URL
      if (!parsed.webAppUrl || parsed.webAppUrl.includes('AKfycbxv_XqtOmqDCjJC-l3HaAkwCGAjJM5HPzVJXYlGxMcKY2jhjWfiWYQ8F5pnOhEHTPOB')) {
        parsed.webAppUrl = DEFAULT_WEB_APP_URL;
        localStorage.setItem(STORAGE_KEY_CONFIG, JSON.stringify(parsed));
      }
      return parsed;
    }
  } catch (e) {
    console.error('Error loading Google Sheets config', e);
  }
  const initialConfig: GoogleSheetsConfig = {
    spreadsheetUrl: '',
    webAppUrl: DEFAULT_WEB_APP_URL,
    isAutoSyncEnabled: true,
  };
  localStorage.setItem(STORAGE_KEY_CONFIG, JSON.stringify(initialConfig));
  return initialConfig;
}

export function saveGoogleSheetsConfig(config: GoogleSheetsConfig): void {
  localStorage.setItem(STORAGE_KEY_CONFIG, JSON.stringify(config));
  window.dispatchEvent(new Event('shopbook_sync_updated'));
}

/**
 * Sends data to Google Apps Script Web App
 */
export async function syncToGoogleSheets(
  webAppUrl: string,
  payload: {
    action: 'sync_batch' | 'ping' | 'full_backup' | 'fetch_all';
    mutations?: SyncMutation[];
    data?: any;
  }
): Promise<{ success: boolean; message: string; rowsUpdated?: number; data?: any }> {
  if (!webAppUrl || !webAppUrl.trim().startsWith('http')) {
    return {
      success: false,
      message: 'Google Apps Script Web App URL is not configured.',
    };
  }

  try {
    const response = await fetch(webAppUrl, {
      method: 'POST',
      headers: {
        'Content-Type': 'text/plain;charset=utf-8', // text/plain prevents CORS preflight issues with Google Apps Script
      },
      body: JSON.stringify(payload),
      redirect: 'follow',
    });

    const result = await response.json();
    return {
      success: result.status === 'success' || result.success === true,
      message: result.message || 'Synced successfully with Google Sheets',
      rowsUpdated: result.rowsUpdated || 0,
      data: result.data,
    };
  } catch (error: any) {
    return {
      success: false,
      message: error?.message || 'Failed to reach Google Apps Script. Check URL and permissions.',
    };
  }
}

/**
 * High-speed fetch of all ledger data from Google Sheets via GET request
 */
export async function fetchFromGoogleSheets(
  webAppUrl: string
): Promise<{ success: boolean; data?: any; message: string }> {
  if (!webAppUrl || !webAppUrl.trim().startsWith('http')) {
    return {
      success: false,
      message: 'Google Apps Script Web App URL is not configured.',
    };
  }

  try {
    const fetchUrl = webAppUrl.includes('?')
      ? `${webAppUrl}&action=fetch_all&t=${Date.now()}`
      : `${webAppUrl}?action=fetch_all&t=${Date.now()}`;

    const response = await fetch(fetchUrl, {
      method: 'GET',
      redirect: 'follow',
    });

    const result = await response.json();
    if (result.status === 'success' || result.success === true) {
      return {
        success: true,
        data: result.data || {},
        message: result.message || 'Data fetched successfully from Google Sheets',
      };
    } else {
      return {
        success: false,
        message: result.message || 'Failed to fetch data from Google Sheets',
      };
    }
  } catch (error: any) {
    return {
      success: false,
      message: error?.message || 'Network error while fetching from Google Sheets',
    };
  }
}

/**
 * Generates the complete, zero-dependency Google Apps Script (Code.gs)
 * with full read/write, auto-header creation, and JSON fetch support.
 */
export function generateAppsScriptTemplate(): string {
  return `/**
 * Khodiyar Stationery (ShopBook v2) — Google Sheets Database Backend
 * -------------------------------------------------------------------
 * Paste this entire script into your Google Sheet:
 * Extensions > Apps Script > Replace Code.gs > Save > Deploy > New Deployment > Web App
 * - Execute as: "Me"
 * - Who has access: "Anyone"
 * Copy the Web App URL and paste it into ShopBook v2.
 */

function doGet(e) {
  var action = e && e.parameter && e.parameter.action ? e.parameter.action : 'status';
  var ss = SpreadsheetApp.getActiveSpreadsheet();

  if (action === 'status') {
    return ContentService.createTextOutput(JSON.stringify({
      status: 'success',
      message: 'Khodiyar Stationery Google Sheets Database is active!',
      sheetName: ss.getName(),
      timestamp: new Date().toISOString()
    })).setMimeType(ContentService.MimeType.JSON);
  }

  if (action === 'fetch_all' || action === 'get_data') {
    var allData = fetchAllSheetData(ss);
    return ContentService.createTextOutput(JSON.stringify({
      status: 'success',
      data: allData,
      timestamp: new Date().toISOString()
    })).setMimeType(ContentService.MimeType.JSON);
  }

  return ContentService.createTextOutput(JSON.stringify({ status: 'ok' })).setMimeType(ContentService.MimeType.JSON);
}

function doPost(e) {
  try {
    var contents = e.postData.contents;
    var request = JSON.parse(contents);
    var ss = SpreadsheetApp.getActiveSpreadsheet();

    if (request.action === 'ping') {
      return ContentService.createTextOutput(JSON.stringify({
        status: 'success',
        message: 'Successfully connected to Google Sheet: ' + ss.getName()
      })).setMimeType(ContentService.MimeType.JSON);
    }

    if (request.action === 'fetch_all') {
      var allData = fetchAllSheetData(ss);
      return ContentService.createTextOutput(JSON.stringify({
        status: 'success',
        data: allData,
        timestamp: new Date().toISOString()
      })).setMimeType(ContentService.MimeType.JSON);
    }

    if (request.action === 'full_backup' || request.action === 'sync_batch') {
      var data = request.data || {};
      
      // Auto-sync all 11 tables with header styling and freeze
      syncSheet(ss, 'Customers', ['id', 'name', 'phone', 'address', 'segment', 'creditLimitPaise', 'openingBalancePaise', 'notes', 'createdAt'], data.customers || []);
      syncSheet(ss, 'Vendors', ['id', 'name', 'phone', 'address', 'paymentTermsDays', 'openingBalancePaise', 'notes', 'createdAt'], data.vendors || []);
      syncSheet(ss, 'Sales', ['id', 'saleDate', 'saleType', 'customerId', 'customerName', 'totalPaise', 'cashPaise', 'upiPaise', 'creditPaise', 'note', 'createdAt'], data.sales || []);
      syncSheet(ss, 'CustomerPayments', ['id', 'paymentDate', 'customerId', 'customerName', 'amountPaise', 'mode', 'reference', 'note', 'createdAt'], data.customerPayments || []);
      syncSheet(ss, 'CustomerAdjustments', ['id', 'customerId', 'customerName', 'adjustmentType', 'amountPaise', 'reason', 'adjustmentDate'], data.customerAdjustments || []);
      syncSheet(ss, 'Purchases', ['id', 'purchaseDate', 'vendorId', 'vendorName', 'billNumber', 'amountPaise', 'paidNowPaise', 'dueDate', 'paymentMode', 'note', 'createdAt'], data.purchases || []);
      syncSheet(ss, 'VendorPayments', ['id', 'paymentDate', 'vendorId', 'vendorName', 'amountPaise', 'mode', 'reference', 'note', 'createdAt'], data.vendorPayments || []);
      syncSheet(ss, 'Expenses', ['id', 'expenseDate', 'category', 'amountPaise', 'mode', 'note', 'isRecurring', 'createdAt'], data.expenses || []);
      syncSheet(ss, 'Followups', ['id', 'personName', 'phone', 'segment', 'requirement', 'estimatedValuePaise', 'status', 'followUpAt', 'notes', 'createdAt'], data.followups || []);
      syncSheet(ss, 'PromisesToPay', ['id', 'customerId', 'customerName', 'amountPaise', 'promisedFor', 'status', 'note', 'createdAt'], data.promises || []);
      syncSheet(ss, 'CashCloses', ['id', 'date', 'openingCashPaise', 'cashSalesPaise', 'cashCollectionsPaise', 'cashExpensesPaise', 'vendorCashPaymentsPaise', 'expectedCashPaise', 'actualCashPaise', 'diffPaise', 'note', 'closedAt'], data.cashCloses || []);

      return ContentService.createTextOutput(JSON.stringify({
        status: 'success',
        message: 'Google Sheets successfully updated',
        timestamp: new Date().toISOString()
      })).setMimeType(ContentService.MimeType.JSON);
    }

    return ContentService.createTextOutput(JSON.stringify({
      status: 'error',
      message: 'Unknown action'
    })).setMimeType(ContentService.MimeType.JSON);

  } catch (err) {
    return ContentService.createTextOutput(JSON.stringify({
      status: 'error',
      message: err.toString()
    })).setMimeType(ContentService.MimeType.JSON);
  }
}

function syncSheet(ss, sheetName, headers, items) {
  var sheet = ss.getSheetByName(sheetName);
  if (!sheet) {
    sheet = ss.insertSheet(sheetName);
  }
  
  sheet.clearContents();
  sheet.appendRow(headers);
  
  // Format Header Row
  var headerRange = sheet.getRange(1, 1, 1, headers.length);
  headerRange.setBackground('#0f172a').setFontColor('#ffffff').setFontWeight('bold');
  sheet.setFrozenRows(1);

  if (items && items.length > 0) {
    var rows = items.map(function(item) {
      return headers.map(function(header) {
        var val = item[header];
        if (val !== undefined && val !== null) {
          return val;
        }
        // Case-insensitive match fallback
        var lower = header.toLowerCase();
        for (var k in item) {
          if (k.toLowerCase() === lower) {
            return item[k] !== undefined && item[k] !== null ? item[k] : '';
          }
        }
        return '';
      });
    });
    
    sheet.getRange(2, 1, rows.length, headers.length).setValues(rows);
  }
}

function fetchAllSheetData(ss) {
  return {
    customers: readSheet(ss, 'Customers'),
    vendors: readSheet(ss, 'Vendors'),
    sales: readSheet(ss, 'Sales'),
    customerPayments: readSheet(ss, 'CustomerPayments'),
    customerAdjustments: readSheet(ss, 'CustomerAdjustments'),
    purchases: readSheet(ss, 'Purchases'),
    vendorPayments: readSheet(ss, 'VendorPayments'),
    expenses: readSheet(ss, 'Expenses'),
    followups: readSheet(ss, 'Followups'),
    promises: readSheet(ss, 'PromisesToPay'),
    cashCloses: readSheet(ss, 'CashCloses')
  };
}

function readSheet(ss, sheetName) {
  var sheet = ss.getSheetByName(sheetName);
  if (!sheet) return [];
  var lastRow = sheet.getLastRow();
  var lastCol = sheet.getLastColumn();
  if (lastRow <= 1 || lastCol <= 0) return [];

  var data = sheet.getRange(1, 1, lastRow, lastCol).getValues();
  var headers = data[0];
  var result = [];

  for (var r = 1; r < data.length; r++) {
    var row = data[r];
    var obj = {};
    var hasContent = false;
    for (var c = 0; c < headers.length; c++) {
      var h = headers[c];
      var val = row[c];
      if (val !== '' && val !== null && val !== undefined) {
        hasContent = true;
      }
      obj[h] = val;
    }
    if (hasContent) {
      // If user typed a manual row without an ID, generate a stable ID automatically
      if (!obj.id || obj.id === '') {
        obj.id = 'manual_' + sheetName.toLowerCase() + '_' + r + '_' + Date.now().toString(36);
      }
      result.push(obj);
    }
  }
  return result;
}
`;
}

