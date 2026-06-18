/**
 * components/common/Pagination.tsx
 * Purpose: Reusable pagination with page input and page size selector.
 */

import { ChevronLeft, ChevronRight } from "lucide-react";

interface PaginationProps {
  page: number;
  pageSize: number;
  total: number;
  onPageChange: (p: number) => void;
  onPageSizeChange: (s: number) => void;
}

/**
 * Pagination: compact pager with total indicator.
 */
export function Pagination({
  page,
  pageSize,
  total,
  onPageChange,
  onPageSizeChange,
}: PaginationProps) {
  const totalPages = Math.max(1, Math.ceil(total / pageSize));
  const canPrev = page > 1;
  const canNext = page < totalPages;

  return (
    <div className="flex items-center justify-between gap-3 text-sm">
      <div className="text-neutral-600 dark:text-neutral-400">
        Tổng: <b>{total}</b> dòng • Trang {page}/{totalPages}
      </div>
      <div className="flex items-center gap-2">
        <label className="flex items-center gap-2">
          <span>Kích thước trang</span>
          <select
            className="rounded-md border border-neutral-200 bg-white px-2 py-1 dark:border-neutral-700 dark:bg-neutral-900"
            value={pageSize}
            onChange={(e) => onPageSizeChange(Number(e.target.value))}
          >
            {[5, 10, 20, 50, 100].map((n) => (
              <option key={n} value={n}>
                {n}
              </option>
            ))}
          </select>
        </label>
        <div className="flex items-center gap-1">
          <button
            className="rounded-md border border-neutral-200 p-2 hover:bg-neutral-50 disabled:opacity-50 dark:border-neutral-700 dark:hover:bg-neutral-800"
            onClick={() => onPageChange(page - 1)}
            disabled={!canPrev}
          >
            <ChevronLeft size={16} />
          </button>
          <button
            className="rounded-md border border-neutral-200 p-2 hover:bg-neutral-50 disabled:opacity-50 dark:border-neutral-700 dark:hover:bg-neutral-800"
            onClick={() => onPageChange(page + 1)}
            disabled={!canNext}
          >
            <ChevronRight size={16} />
          </button>
        </div>
      </div>
    </div>
  );
}

