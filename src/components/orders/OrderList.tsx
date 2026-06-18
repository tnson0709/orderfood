/**
 * components/orders/OrderList.tsx
 * Purpose: Display order list with search, pagination, right-click context menu, and selectable rows.
 */

import * as ContextMenu from "@radix-ui/react-context-menu";
import { useMemo, useRef } from "react";
import { useOrderStore } from "../../store/orderStore";
import { Pagination } from "../common/Pagination";
import { OrderInfo, PaymentStatus, ResourceStatus } from "../../types/order";
import {
  FileDown,
  FileUp,
  ClipboardCopy,
  Printer,
  RefreshCw,
  CheckCircle2,
  Rocket,
} from "lucide-react";
import { ordersToCSV, csvToOrders } from "../../utils/csv";

interface OrderListProps {
  onPrint: () => void;
}

/**
 * OrderList: table of orders with search + pagination + context menu.
 */
export function OrderList({ onPrint }: OrderListProps) {
  const {
    orders,
    search,
    page,
    pageSize,
    setSearch,
    setPage,
    setPageSize,
    select,
    selectedId,
    duplicate,
    reload,
    confirmPayment,
    provisionResource,
    importCSV,
    exportCSV,
  } = useOrderStore();

  const fileRef = useRef<HTMLInputElement | null>(null);

  const filtered = useMemo(() => {
    const q = search.trim().toLowerCase();
    if (!q) return orders;
    return orders.filter((r) => {
      const hay =
        [
          r.orderno,
          r.productId,
          r.packcode,
          r.customer_name,
          r.taxcode,
          r.identity_code,
          r.tel,
          r.email,
          r.note,
          r.partner_code,
          r.employee_code,
        ]
          .filter(Boolean)
          .join(" ")
          .toLowerCase() + " " + JSON.stringify(r.licenseInfo ?? {});
      return hay.includes(q);
    });
  }, [orders, search]);

  const total = filtered.length;
  const startIdx = (page - 1) * pageSize;
  const pageRows = filtered.slice(startIdx, startIdx + pageSize);

  function handleExport() {
    const data = exportCSV();
    const csv = ordersToCSV(data);
    const blob = new Blob([csv], { type: "text/csv;charset=utf-8;" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = "orders.csv";
    a.click();
    URL.revokeObjectURL(url);
  }

  function handleImport(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = () => {
      const text = String(reader.result || "");
      const rows = csvToOrders(text);
      importCSV(rows);
      setPage(1);
    };
    reader.readAsText(file);
    e.currentTarget.value = "";
  }

  function paymentStatusBadge(s?: number) {
    const map: Record<number, { label: string; cls: string }> = {
      0: { label: "Chưa TT", cls: "bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-300" },
      1: { label: "Cam kết", cls: "bg-amber-100 text-amber-700 dark:bg-amber-900/30 dark:text-amber-300" },
      2: { label: "Chờ TT", cls: "bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-300" },
      3: { label: "Đã TT", cls: "bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-300" },
    };
    const x = map[s ?? 0];
    return <span className={"rounded px-2 py-0.5 text-xs " + x.cls}>{x.label}</span>;
  }

  function resourceStatusBadge(s?: number) {
    const map: Record<number, { label: string; cls: string }> = {
      0: { label: "Chưa cấp", cls: "bg-neutral-100 text-neutral-700 dark:bg-neutral-800 dark:text-neutral-300" },
      1: { label: "Đã cấp", cls: "bg-emerald-100 text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-300" },
      2: { label: "Cấp lỗi", cls: "bg-rose-100 text-rose-700 dark:bg-rose-900/30 dark:text-rose-300" },
    };
    const x = map[s ?? 0];
    return <span className={"rounded px-2 py-0.5 text-xs " + x.cls}>{x.label}</span>;
  }

  // Right-click actions
  const onDuplicate = () => selectedId && duplicate(selectedId);
  const onReload = () => reload();
  const onPrintLocal = () => onPrint();
  const onExport = () => handleExport();
  const onImport = () => fileRef.current?.click();
  const onProvision = () => selectedId && provisionResource(selectedId);
  const onConfirmPay = () => selectedId && confirmPayment(selectedId);

  return (
    <ContextMenu.Root>
      <ContextMenu.Trigger asChild>
        <div className="flex h-full flex-col">
          <div className="mb-2 flex items-center justify-between gap-2">
            <input
              placeholder="Tìm kiếm nhanh..."
              className="w-full rounded-md border border-neutral-200 bg-white px-3 py-2 text-sm dark:border-neutral-700 dark:bg-neutral-900"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
            />
          </div>
          <div className="relative min-h-0 flex-1 overflow-auto rounded-md border border-neutral-200 dark:border-neutral-700">
            <table className="min-w-full text-sm">
              <thead className="sticky top-0 z-10 bg-neutral-50 text-neutral-700 dark:bg-neutral-900 dark:text-neutral-300">
                <tr>
                  <th className="px-3 py-2 text-left">Mã đơn</th>
                  <th className="px-3 py-2 text-left">Sản phẩm</th>
                  <th className="px-3 py-2 text-left">Gói</th>
                  <th className="px-3 py-2 text-left">Khách hàng</th>
                  <th className="px-3 py-2 text-right">Số tiền</th>
                  <th className="px-3 py-2 text-left">TT Thanh toán</th>
                  <th className="px-3 py-2 text-left">Cấp tài nguyên</th>
                  <th className="px-3 py-2 text-left">Ngày</th>
                </tr>
              </thead>
              <tbody>
                {pageRows.map((r) => {
                  const active = r.order_info_Id === selectedId;
                  return (
                    <tr
                      key={r.order_info_Id}
                      className={
                        "cursor-pointer border-t border-neutral-100 hover:bg-neutral-50 dark:border-neutral-800 dark:hover:bg-neutral-800 " +
                        (active ? "bg-blue-50 dark:bg-neutral-800/60" : "")
                      }
                      onClick={() => select(r.order_info_Id)}
                    >
                      <td className="px-3 py-2 font-medium">{r.orderno}</td>
                      <td className="px-3 py-2">{r.productId}</td>
                      <td className="px-3 py-2">{r.packcode}</td>
                      <td className="px-3 py-2">{r.customer_name}</td>
                      <td className="px-3 py-2 text-right">
                        {r.amount != null ? r.amount.toLocaleString() : ""}
                      </td>
                      <td className="px-3 py-2">{paymentStatusBadge(r.payment_status)}</td>
                      <td className="px-3 py-2">{resourceStatusBadge(r.resource_status)}</td>
                      <td className="px-3 py-2">
                        {r.order_date ? String(r.order_date).slice(0, 10) : ""}
                      </td>
                    </tr>
                  );
                })}

                {pageRows.length === 0 && (
                  <tr>
                    <td colSpan={8} className="px-3 py-6 text-center text-neutral-500 dark:text-neutral-400">
                      Không có dữ liệu
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>

          <div className="mt-2">
            <Pagination
              page={page}
              pageSize={pageSize}
              total={total}
              onPageChange={setPage}
              onPageSizeChange={setPageSize}
            />
          </div>

          <input
            ref={fileRef}
            type="file"
            accept=".csv,text/csv"
            className="hidden"
            onChange={handleImport}
          />
        </div>
      </ContextMenu.Trigger>

      <ContextMenu.Content
        className="min-w-[220px] rounded-md border border-neutral-200 bg-white p-1 shadow-lg dark:border-neutral-700 dark:bg-neutral-900"
        onCloseAutoFocus={(e) => e.preventDefault()}
      >
        <ContextMenu.Item
          className="flex cursor-pointer select-none items-center gap-2 rounded px-2 py-1.5 text-sm hover:bg-neutral-100 dark:hover:bg-neutral-800"
          onSelect={onDuplicate}
        >
          <ClipboardCopy size={16} /> Nhân bản
        </ContextMenu.Item>
        <ContextMenu.Item
          className="flex cursor-pointer select-none items-center gap-2 rounded px-2 py-1.5 text-sm hover:bg-neutral-100 dark:hover:bg-neutral-800"
          onSelect={onReload}
        >
          <RefreshCw size={16} /> Nạp
        </ContextMenu.Item>
        <ContextMenu.Item
          className="flex cursor-pointer select-none items-center gap-2 rounded px-2 py-1.5 text-sm hover:bg-neutral-100 dark:hover:bg-neutral-800"
          onSelect={onPrintLocal}
        >
          <Printer size={16} /> In
        </ContextMenu.Item>
        <ContextMenu.Separator className="my-1 border-t border-neutral-200 dark:border-neutral-700" />
        <ContextMenu.Item
          className="flex cursor-pointer select-none items-center gap-2 rounded px-2 py-1.5 text-sm hover:bg-neutral-100 dark:hover:bg-neutral-800"
          onSelect={onExport}
        >
          <FileDown size={16} /> Xuất khẩu Excel
        </ContextMenu.Item>
        <ContextMenu.Item
          className="flex cursor-pointer select-none items-center gap-2 rounded px-2 py-1.5 text-sm hover:bg-neutral-100 dark:hover:bg-neutral-800"
          onSelect={onImport}
        >
          <FileUp size={16} /> Nhập khẩu Excel
        </ContextMenu.Item>
        <ContextMenu.Separator className="my-1 border-t border-neutral-200 dark:border-neutral-700" />
        <ContextMenu.Item
          className="flex cursor-pointer select-none items-center gap-2 rounded px-2 py-1.5 text-sm hover:bg-neutral-100 dark:hover:bg-neutral-800"
          onSelect={onProvision}
        >
          <Rocket size={16} /> Cấp tài nguyên
        </ContextMenu.Item>
        <ContextMenu.Item
          className="flex cursor-pointer select-none items-center gap-2 rounded px-2 py-1.5 text-sm hover:bg-neutral-100 dark:hover:bg-neutral-800"
          onSelect={onConfirmPay}
        >
          <CheckCircle2 size={16} /> Xác nhận thanh toán
        </ContextMenu.Item>
      </ContextMenu.Content>
    </ContextMenu.Root>
  );
}

