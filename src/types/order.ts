/**
 * types/order.ts
 * Purpose: Define TypeScript interfaces and enums for Order domain.
 */

export type UUID = string;

/**
 * Payment status codes
 * 0: Unpaid, 1: Promise to pay, 2: Pending, 3: Paid
 */
export enum PaymentStatus {
  Unpaid = 0,
  Promise = 1,
  Pending = 2,
  Paid = 3,
}

/**
 * Payment type
 * 0: Cash, 1: Bank transfer
 */
export enum PaymentType {
  Cash = 0,
  Transfer = 1,
}

/**
 * Resource status
 * 0: Not provisioned, 1: Provisioned, 2: Failed
 */
export enum ResourceStatus {
  NotProvisioned = 0,
  Provisioned = 1,
  Failed = 2,
}

/**
 * OrderInfo: matches CREATE TABLE order_info definition.
 */
export interface OrderInfo {
  order_info_Id: UUID;
  orderno: string;
  productId: string;
  packcode: string;
  licenseInfo: unknown; // JSON
  order_date?: string | null; // ISO string
  customer_name?: string;
  customer_address?: string;
  customer_type?: number | null;
  taxcode?: string;
  identity_code?: string; // CCCD
  tel?: string;
  email?: string;
  note?: string;
  amount?: number | null;
  payment_status?: PaymentStatus;
  payment_tran_no?: string;
  payment_type?: PaymentType;
  payment_date?: string | null; // ISO string
  resource_status?: ResourceStatus;
  partner_code?: string;
  employee_code?: string;
}

/**
 * A lightweight row model for listing.
 */
export interface OrderRow extends OrderInfo {}

