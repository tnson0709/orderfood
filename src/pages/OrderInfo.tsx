/**
 * pages/OrderInfo.tsx
 * Purpose: Main page with split layout: Order list (left) and Order form (right).
 * Includes toolbar, dark mode toggle, printing, and action handling.
 */

import { Panel, PanelGroup, PanelResizeHandle } from "react-resizable-panels";
import { OrderToolbar } from "../components/orders/OrderToolbar";
import { OrderList } from "../components/orders/OrderList";
import { OrderForm } from "../components/orders/OrderForm";
import { ThemeToggle } from "../components/common/ThemeToggle";
import { useOrderStore } from "../store/orderStore";
import { useEffect } from "react";

/**
 * OrderInfoPage: orchestrates state and renders two resizable panels.
 */
export default function OrderInfoPage() {
  const {
    load,
    add,
    duplicate,
    remove,
    getSelected,
    selectedId,
    select,
    reload,
  } = useOrderStore();

  useEffect(() => {
    load();
    // Seed some demo data if empty for better first impression
    if (!useOrderStore.getState().orders.length) {
      add({
        productId: "PROD-A",
        packcode: "BASIC",
        customer_name: "Nguyễn Văn A",
        amount: 1500000,
        note: "Đơn mẫu",
      });
      add({
        productId: "PROD-B",
        packcode: "PRO",
        customer_name: "Công ty B",
        amount: 5200000,
      });
      reload();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  function handleAdd() {
    const row = add({});
    select(row.order_info_Id);
  }

  function handleDuplicate() {
    if (selectedId) {
      duplicate(selectedId);
    }
  }

  function handleEdit() {
    // Edit is inline in the form; this provides a visual hint (no-op).
    // Could focus the form if needed.
    const el = document.querySelector<HTMLInputElement>('input[placeholder="VD: PROD01"]');
    el?.focus();
  }

  function handleDelete() {
    if (!selectedId) return;
    const row = getSelected();
    if (
      confirm(
        `Xóa đơn hàng ${row?.orderno || ""}? Hành động không thể hoàn tác.`
      )
    ) {
      remove(selectedId);
    }
  }

  function handlePrint() {
    const row = getSelected();
    if (!row) {
      // Print list
      const listEl = document.querySelector("table")?.outerHTML || "";
      const html = `&lt;html&gt;&lt;head&gt;&lt;title&gt;In danh sách&lt;/title&gt;&lt;style&gt;body{font-family:Inter,ui-sans-serif,system-ui,-apple-system,Segoe UI,Roboto,Arial}table{width:100%;border-collapse:collapse}th,td{border:1px solid #ddd;padding:8px;text-align:left}thead{background:#f4f4f5}&lt;/style&gt;&lt;/head&gt;&lt;body&gt;${listEl}&lt;/body&gt;&lt;/html&gt;`;
      const w = window.open("", "_blank");
      if (w) {
        w.document.write(html);
        w.document.close();
        w.focus();
        w.print();
      }
      return;
    }
    // Print detail
    const html = `&lt;html&gt;&lt;head&gt;&lt;title&gt;Đơn hàng ${row.orderno}&lt;/title&gt;&lt;style&gt;body{font-family:Inter,ui-sans-serif,system-ui,-apple-system,Segoe UI,Roboto,Arial;padding:24px}h1{font-size:20px;margin-bottom:16px}dl{display:grid;grid-template-columns:200px 1fr;gap:8px 16px}dt{color:#475569}dd{font-weight:600}&lt;/style&gt;&lt;/head&gt;&lt;body&gt;&lt;h1&gt;Đơn hàng #${row.orderno}&lt;/h1&gt;&lt;dl&gt;
      &lt;dt&gt;Sản phẩm&lt;/dt&gt;&lt;dd&gt;${row.productId}&lt;/dd&gt;
      &lt;dt&gt;Gói&lt;/dt&gt;&lt;dd&gt;${row.packcode}&lt;/dd&gt;
      &lt;dt&gt;Khách hàng&lt;/dt&gt;&lt;dd&gt;${row.customer_name || ""}&lt;/dd&gt;
      &lt;dt&gt;Số tiền&lt;/dt&gt;&lt;dd&gt;${row.amount ?? ""}&lt;/dd&gt;
      &lt;dt&gt;Ngày đặt&lt;/dt&gt;&lt;dd&gt;${row.order_date || ""}&lt;/dd&gt;
      &lt;dt&gt;Thanh toán&lt;/dt&gt;&lt;dd&gt;${row.payment_status ?? 0}&lt;/dd&gt;
      &lt;dt&gt;License Info&lt;/dt&gt;&lt;dd&gt;&lt;pre&gt;${escapeHtml(
        JSON.stringify(row.licenseInfo ?? {}, null, 2)
      )}&lt;/pre&gt;&lt;/dd&gt;
      &lt;/dl&gt;&lt;/body&gt;&lt;/html&gt;`;
    const w = window.open("", "_blank");
    if (w) {
      w.document.write(html);
      w.document.close();
      w.focus();
      w.print();
    }
  }

  return (
    <div className="flex h-screen flex-col bg-white text-neutral-900 dark:bg-neutral-950 dark:text-neutral-100">
      {/* Header */}
      <div className="sticky top-0 z-10 border-b border-neutral-200 bg-white/80 backdrop-blur dark:border-neutral-800 dark:bg-neutral-950/80">
        <div className="mx-auto flex max-w-7xl items-center justify-between gap-3 p-3">
          <div className="flex items-center gap-3">
            <img src="https://pub-cdn.sider.ai/u/U0KAHZLJL0Y/web-coder/68a6d04d7b28bae49813a202/resource/edaccbd5-53de-40f7-a1bf-320c2a204cd5.jpg" className="h-8 w-8 rounded object-cover" />
            <div>
              <div className="text-lg font-bold">Quản lý đơn hàng</div>
              <div className="text-xs text-neutral-500 dark:text-neutral-400">
                Danh sách + Chi tiết • LocalStorage • Dark mode
              </div>
            </div>
          </div>
          <ThemeToggle />
        </div>
      </div>

      {/* Toolbar */}
      <div className="mx-auto w-full max-w-7xl px-3 py-2">
        <OrderToolbar
          canEdit={!!selectedId}
          onAdd={handleAdd}
          onDuplicate={handleDuplicate}
          onEdit={handleEdit}
          onDelete={handleDelete}
          onPrint={handlePrint}
          onReload={() => useOrderStore.getState().reload()}
        />
      </div>

      {/* Content */}
      <div className="mx-auto flex w-full max-w-7xl flex-1 px-3 pb-3">
        <PanelGroup direction="horizontal" className="flex w-full rounded-lg border border-neutral-200 dark:border-neutral-800">
          <Panel defaultSize={45} minSize={30} className="min-w-[280px]">
            <div className="h-full p-3">
              <OrderList onPrint={handlePrint} />
            </div>
          </Panel>
          <PanelResizeHandle className="w-1.5 bg-neutral-200 hover:bg-neutral-300 dark:bg-neutral-800 dark:hover:bg-neutral-700 transition-colors" />
          <Panel minSize={35}>
            <div className="h-full p-3">
              <OrderForm onAddNew={handleAdd} onDuplicate={handleDuplicate} />
            </div>
          </Panel>
        </PanelGroup>
      </div>
    </div>
  );
}

/**
 * escapeHtml: escape special characters for safe injection in print HTML.
 */
function escapeHtml(str: string): string {
  return str
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;");
}
