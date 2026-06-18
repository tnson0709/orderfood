/**
 * Type definitions for cash receipt/disbursement management system
 */

/**
 * Receipt type enum
 */
export enum ReceiptType {
  RECEIPT = 0,  // Phiếu thu
  DISBURSEMENT = 1  // Phiếu chi
}

/**
 * Receipt status enum
 */
export enum ReceiptStatus {
  PENDING = 0,  // Chưa thu/chi
  COMPLETED = 1  // Đã thu/chi
}

/**
 * Revenue type enum for receipt details
 */
export enum RevenueType {
  RENT = 0,      // Tiền nhà
  ELECTRICITY = 1,  // Tiền điện
  WATER = 2,     // Tiền nước
  OTHER = 3      // Khác
}

/**
 * Main receipt entity
 */
export interface CaReceipt {
  ca_receipt_id: string;
  ca_receipt_no: string;
  ca_receipt_type: ReceiptType;
  total_amount_receivable: number;
  total_amount_receipt: number;
  total_amount_debit: number;
  ca_status: ReceiptStatus;
  note: string;
  rowversion: number;
}

/**
 * Receipt detail entity
 */
export interface CaReceiptDetail {
  ca_receipt_detail_id: string;
  ca_receipt_id: string;
  ca_receipt_type: ReceiptType;
  receipt_revenue: RevenueType;
  amount: number;
  room_id: string | null;
  note: string;
}

/**
 * Filter options for receipt list
 */
export interface ReceiptFilter {
  receiptType?: ReceiptType;
  status?: ReceiptStatus;
  search?: string;
  dateFrom?: Date;
  dateTo?: Date;
}

/**
 * Pagination options
 */
export interface PaginationOptions {
  page: number;
  pageSize: number;
  total: number;
}

/**
 * Context menu item
 */
export interface ContextMenuItem {
  id: string;
  label: string;
  icon?: string;
  action: () => void;
}

