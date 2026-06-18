/**
 * utils/csv.ts
 * Purpose: CSV import/export helpers for simple Excel interoperability.
 */

import { OrderInfo } from "../types/order";

/**
 * Convert an array of OrderInfo to CSV string.
 */
export function ordersToCSV(rows: OrderInfo[]): string {
  const headers = [
    "order_info_Id",
    "orderno",
    "productId",
    "packcode",
    "licenseInfo",
    "order_date",
    "customer_name",
    "customer_address",
    "customer_type",
    "taxcode",
    "identity_code",
    "tel",
    "email",
    "note",
    "amount",
    "payment_status",
    "payment_tran_no",
    "payment_type",
    "payment_date",
    "resource_status",
    "partner_code",
    "employee_code",
  ];
  const escape = (v: unknown) => {
    if (v === null || v === undefined) return "";
    const s = typeof v === "string" ? v : JSON.stringify(v);
    // Escape quotes and wrap with quotes if contains comma or newline
    const needsWrap = /[",\n]/.test(s);
    const esc = s.replace(/"/g, '""');
    return needsWrap ? `"${esc}"` : esc;
  };
  const lines = [
    headers.join(","),
    ...rows.map((r) =>
      [
        r.order_info_Id,
        r.orderno,
        r.productId,
        r.packcode,
        JSON.stringify(r.licenseInfo ?? {}),
        r.order_date ?? "",
        r.customer_name ?? "",
        r.customer_address ?? "",
        r.customer_type ?? "",
        r.taxcode ?? "",
        r.identity_code ?? "",
        r.tel ?? "",
        r.email ?? "",
        r.note ?? "",
        r.amount ?? "",
        r.payment_status ?? "",
        r.payment_tran_no ?? "",
        r.payment_type ?? "",
        r.payment_date ?? "",
        r.resource_status ?? "",
        r.partner_code ?? "",
        r.employee_code ?? "",
      ]
        .map(escape)
        .join(",")
    ),
  ];
  return lines.join("\n");
}

/**
 * Parse CSV text to array of OrderInfo.
 * - Very basic CSV parser handling quoted values.
 */
export function csvToOrders(csvText: string): OrderInfo[] {
  const lines = csvText.trim().split(/\r?\n/);
  if (lines.length === 0) return [];
  const header = parseCsvLine(lines[0]);
  const rows: OrderInfo[] = [];
  for (let i = 1; i < lines.length; i++) {
    const cols = parseCsvLine(lines[i]);
    const obj: Record<string, unknown> = {};
    header.forEach((h, idx) => (obj[h] = cols[idx]));
    try {
      if (typeof obj.licenseInfo === "string" && obj.licenseInfo) {
        obj.licenseInfo = JSON.parse(obj.licenseInfo as string);
      }
    } catch {
      // keep as string if JSON parse fails
    }
    const amountNum =
      typeof obj.amount === "string" && obj.amount !== ""
        ? Number(obj.amount)
        : null;
    rows.push({
      order_info_Id: String(obj.order_info_Id || crypto.randomUUID()),
      orderno: String(obj.orderno || ""),
      productId: String(obj.productId || ""),
      packcode: String(obj.packcode || ""),
      licenseInfo: obj.licenseInfo ?? {},
      order_date: obj.order_date ? String(obj.order_date) : null,
      customer_name: obj.customer_name ? String(obj.customer_name) : "",
      customer_address: obj.customer_address ? String(obj.customer_address) : "",
      customer_type:
        obj.customer_type !== "" && obj.customer_type !== undefined
          ? Number(obj.customer_type)
          : null,
      taxcode: obj.taxcode ? String(obj.taxcode) : "",
      identity_code: obj.identity_code ? String(obj.identity_code) : "",
      tel: obj.tel ? String(obj.tel) : "",
      email: obj.email ? String(obj.email) : "",
      note: obj.note ? String(obj.note) : "",
      amount: amountNum,
      payment_status:
        obj.payment_status !== "" && obj.payment_status !== undefined
          ? Number(obj.payment_status)
          : 0,
      payment_tran_no: obj.payment_tran_no ? String(obj.payment_tran_no) : "",
      payment_type:
        obj.payment_type !== "" && obj.payment_type !== undefined
          ? Number(obj.payment_type)
          : 0,
      payment_date: obj.payment_date ? String(obj.payment_date) : null,
      resource_status:
        obj.resource_status !== "" && obj.resource_status !== undefined
          ? Number(obj.resource_status)
          : 0,
      partner_code: obj.partner_code ? String(obj.partner_code) : "",
      employee_code: obj.employee_code ? String(obj.employee_code) : "",
    });
  }
  return rows;
}

/**
 * parseCsvLine: Parses a single CSV line into cells supporting quotes.
 */
function parseCsvLine(line: string): string[] {
  const result: string[] = [];
  let current = "";
  let inQuotes = false;
  for (let i = 0; i < line.length; i++) {
    const ch = line[i];
    if (inQuotes) {
      if (ch === '"') {
        if (line[i + 1] === '"') {
          current += '"';
          i++;
        } else {
          inQuotes = false;
        }
      } else {
        current += ch;
      }
    } else {
      if (ch === '"') {
        inQuotes = true;
      } else if (ch === ",") {
        result.push(current);
        current = "";
      } else {
        current += ch;
      }
    }
  }
  result.push(current);
  return result;
}

