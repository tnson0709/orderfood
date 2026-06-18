/**
 * store/orderStore.ts
 * Purpose: Zustand store to manage OrderInfo list + persistence in localStorage.
 */

import { create } from "zustand";
import { getJson, setJson } from "../utils/storage";
import {
  OrderInfo,
  PaymentStatus,
  ResourceStatus,
  PaymentType,
} from "../types/order";

const STORAGE_KEY = "order_info_v1";

/**
 * Calculate the next auto-increment order number as string.
 * It finds the max numeric orderno and increases by 1.
 */
function getNextOrderNo(rows: OrderInfo[]): string {
  const nums = rows
    .map((r) => Number(String(r.orderno).replace(/\D/g, "")))
    .filter((n) => !Number.isNaN(n));
  const max = nums.length ? Math.max(...nums) : 0;
  return String(max + 1).padStart(6, "0"); // e.g., 000001, 000002
}

/**
 * Create an empty order template with an optional cloned source.
 */
function createNewOrder(clone?: Partial<OrderInfo>): OrderInfo {
  return {
    order_info_Id: crypto.randomUUID(),
    orderno: "",
    productId: clone?.productId ?? "",
    packcode: clone?.packcode ?? "",
    licenseInfo: clone?.licenseInfo ?? {},
    order_date: clone?.order_date ?? new Date().toISOString().slice(0, 10),
    customer_name: clone?.customer_name ?? "",
    customer_address: clone?.customer_address ?? "",
    customer_type: clone?.customer_type ?? null,
    taxcode: clone?.taxcode ?? "",
    identity_code: clone?.identity_code ?? "",
    tel: clone?.tel ?? "",
    email: clone?.email ?? "",
    note: clone?.note ?? "",
    amount: clone?.amount ?? null,
    payment_status: clone?.payment_status ?? PaymentStatus.Unpaid,
    payment_tran_no: clone?.payment_tran_no ?? "",
    payment_type: clone?.payment_type ?? PaymentType.Cash,
    payment_date: clone?.payment_date ?? null,
    resource_status: clone?.resource_status ?? ResourceStatus.NotProvisioned,
    partner_code: clone?.partner_code ?? "",
    employee_code: clone?.employee_code ?? "",
  };
}

export interface OrderState {
  orders: OrderInfo[];
  selectedId: string | null;
  search: string;
  page: number;
  pageSize: number;

  load: () => void;
  reload: () => void;
  setSearch: (q: string) => void;
  setPage: (p: number) => void;
  setPageSize: (n: number) => void;
  select: (id: string | null) => void;

  add: (data: Partial<OrderInfo>) => OrderInfo;
  update: (id: string, patch: Partial<OrderInfo>) => void;
  remove: (id: string) => void;
  duplicate: (id: string) => OrderInfo | null;

  confirmPayment: (id: string) => void;
  provisionResource: (id: string) => void;

  importCSV: (rows: OrderInfo[]) => void;
  exportCSV: () => OrderInfo[];

  getSelected: () => OrderInfo | null;
}

export const useOrderStore = create<OrderState>((set, get) => ({
  orders: [],
  selectedId: null,
  search: "",
  page: 1,
  pageSize: 10,

  load: () => {
    const rows = getJson<OrderInfo[]>(STORAGE_KEY, []);
    set({ orders: rows });
    // auto-select first item if nothing selected
    const selectedId = get().selectedId;
    if (!selectedId && rows.length) set({ selectedId: rows[0].order_info_Id });
  },

  reload: () => {
    get().load();
  },

  setSearch: (q) => set({ search: q, page: 1 }),

  setPage: (p) => set({ page: p }),

  setPageSize: (n) => set({ pageSize: n, page: 1 }),

  select: (id) => set({ selectedId: id }),

  add: (data) => {
    const rows = [...get().orders];
    const item: OrderInfo = {
      ...createNewOrder(data),
      orderno: getNextOrderNo(rows),
    };
    rows.unshift(item);
    set({ orders: rows, selectedId: item.order_info_Id });
    setJson(STORAGE_KEY, rows);
    return item;
  },

  update: (id, patch) => {
    const rows = get().orders.map((r) =>
      r.order_info_Id === id ? { ...r, ...patch } : r
    );
    set({ orders: rows });
    setJson(STORAGE_KEY, rows);
  },

  remove: (id) => {
    const rows = get().orders.filter((r) => r.order_info_Id !== id);
    let selectedId = get().selectedId;
    if (selectedId === id) selectedId = rows[0]?.order_info_Id ?? null;
    set({ orders: rows, selectedId });
    setJson(STORAGE_KEY, rows);
  },

  duplicate: (id) => {
    const source = get().orders.find((r) => r.order_info_Id === id);
    if (!source) return null;
    const rows = [...get().orders];
    const dup = createNewOrder(source);
    dup.orderno = getNextOrderNo(rows);
    rows.unshift(dup);
    set({ orders: rows, selectedId: dup.order_info_Id });
    setJson(STORAGE_KEY, rows);
    return dup;
  },

  confirmPayment: (id) => {
    const row = get().orders.find((r) => r.order_info_Id === id);
    if (!row) return;
    const now = new Date().toISOString();
    get().update(id, {
      payment_status: PaymentStatus.Paid,
      payment_date: now,
    });
  },

  provisionResource: (id) => {
    const row = get().orders.find((r) => r.order_info_Id === id);
    if (!row) return;
    // Simulate provisioning success
    get().update(id, { resource_status: ResourceStatus.Provisioned });
  },

  importCSV: (rows) => {
    // Merge by order_info_Id uniqueness
    const current = [...get().orders];
    const byId = new Map(current.map((r) => [r.order_info_Id, r]));
    for (const r of rows) {
      byId.set(r.order_info_Id, r);
    }
    const merged = Array.from(byId.values());
    set({ orders: merged });
    setJson(STORAGE_KEY, merged);
  },

  exportCSV: () => {
    return get().orders;
  },

  getSelected: () => {
    const id = get().selectedId;
    if (!id) return null;
    return get().orders.find((r) => r.order_info_Id === id) ?? null;
  },
}));

