/**
 * components/orders/OrderToolbar.tsx
 * Purpose: Top toolbar for actions: Add, Duplicate, Edit, Delete, Print, Reload.
 */

import { Plus, Copy, Edit2, Trash2, Printer, RefreshCw } from "lucide-react";

interface OrderToolbarProps {
  canEdit: boolean;
  onAdd: () => void;
  onDuplicate: () => void;
  onEdit: () => void;
  onDelete: () => void;
  onPrint: () => void;
  onReload: () => void;
}

/**
 * OrderToolbar: Button group with accessible labels.
 */
export function OrderToolbar({
  canEdit,
  onAdd,
  onDuplicate,
  onEdit,
  onDelete,
  onPrint,
  onReload,
}: OrderToolbarProps) {
  const base =
    "inline-flex items-center gap-2 rounded-md border border-neutral-200 px-3 py-2 text-sm font-medium hover:bg-neutral-50 dark:border-neutral-700 dark:hover:bg-neutral-800 disabled:opacity-50";
  return (
    <div className="flex flex-wrap items-center gap-2">
      <button className={base} onClick={onAdd} title="Thêm">
        <Plus size={16} /> Thêm
      </button>
      <button
        className={base}
        onClick={onDuplicate}
        disabled={!canEdit}
        title="Nhân bản"
      >
        <Copy size={16} /> Nhân bản
      </button>
      <button
        className={base}
        onClick={onEdit}
        disabled={!canEdit}
        title="Sửa"
      >
        <Edit2 size={16} /> Sửa
      </button>
      <button
        className={base + " text-red-600 dark:text-red-400"}
        onClick={onDelete}
        disabled={!canEdit}
        title="Xóa"
      >
        <Trash2 size={16} /> Xóa
      </button>
      <button className={base} onClick={onPrint} title="In">
        <Printer size={16} /> In
      </button>
      <button className={base} onClick={onReload} title="Nạp">
        <RefreshCw size={16} /> Nạp
      </button>
    </div>
  );
}

