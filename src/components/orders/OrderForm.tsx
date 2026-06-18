/**
 * components/orders/OrderForm.tsx
 * Purpose: Detailed Order form with add/edit/save and validation for licenseInfo JSON.
 */

import { useEffect, useMemo, useState } from "react";
import { useOrderStore } from "../../store/orderStore";
import {
  PaymentStatus,
  PaymentType,
  ResourceStatus,
  OrderInfo,
} from "../../types/order";
import { Save, Check, Copy, Plus } from "lucide-react";

interface OrderFormProps {
  onAddNew: () => void;
  onDuplicate: () => void;
}

/**
 * OrderForm: bind to selected order; if none, shows empty state.
 */
export function OrderForm({ onAddNew, onDuplicate }: OrderFormProps) {
  const { getSelected, update, selectedId } = useOrderStore();
  const selected = getSelected();

  const [draft, setDraft] = useState<OrderInfo | null>(selected ? { ...selected } : null);
  const [licenseText, setLicenseText] = useState<string>(
    selected ? JSON.stringify(selected.licenseInfo ?? {}, null, 2) : "{}"
  );
  const [licenseError, setLicenseError] = useState<string>("");

  useEffect(() => {
    if (!selected) {
      setDraft(null);
      setLicenseText("{}");
      setLicenseError("");
    } else {
      setDraft({ ...selected });
      setLicenseText(JSON.stringify(selected.licenseInfo ?? {}, null, 2));
      setLicenseError("");
    }
  }, [selectedId]);

  const canSave = useMemo(() => !!draft && !licenseError, [draft, licenseError]);

  function handleChange<K extends keyof OrderInfo>(key: K, value: OrderInfo[K]) {
    setDraft((d) => (d ? { ...d, [key]: value } : d));
  }

  function parseLicense(v: string) {
    setLicenseText(v);
    try {
      const obj = JSON.parse(v);
      setLicenseError("");
      if (draft) setDraft({ ...draft, licenseInfo: obj });
    } catch (e) {
      setLicenseError("JSON không hợp lệ");
    }
  }

  function handleSave() {
    if (!draft) return;
    update(draft.order_info_Id, {
      ...draft,
      licenseInfo: draft.licenseInfo ?? {},
    });
  }

  if (!draft) {
    return (
      <div className="flex h-full flex-col items-center justify-center gap-3 text-center text-neutral-600 dark:text-neutral-300">
        <div className="text-lg font-semibold">Chưa chọn đơn hàng</div>
        <div className="text-sm">Vui lòng chọn ở danh sách hoặc tạo mới.</div>
        <div className="mt-2 flex gap-2">
          <button
            className="inline-flex items-center gap-2 rounded-md border border-neutral-200 px-3 py-2 text-sm hover:bg-neutral-50 dark:border-neutral-700 dark:hover:bg-neutral-800"
            onClick={onAddNew}
          >
            <Plus size={16} /> Thêm đơn hàng
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="flex h-full flex-col">
      <div className="mb-3 flex flex-wrap items-center justify-between gap-2">
        <div className="text-base font-semibold">
          Đơn hàng #{draft.orderno || "(mới)"}
        </div>
        <div className="flex items-center gap-2">
          <button
            className="inline-flex items-center gap-2 rounded-md border border-neutral-200 px-3 py-2 text-sm hover:bg-neutral-50 dark:border-neutral-700 dark:hover:bg-neutral-800"
            onClick={onDuplicate}
            title="Nhân bản"
          >
            <Copy size={16} /> Nhân bản
          </button>
          <button
            className="inline-flex items-center gap-2 rounded-md border border-neutral-200 px-3 py-2 text-sm hover:bg-neutral-50 dark:border-neutral-700 dark:hover:bg-neutral-800 disabled:opacity-50"
            onClick={handleSave}
            disabled={!canSave}
            title="Lưu"
          >
            <Save size={16} /> Lưu
          </button>
        </div>
      </div>

      <div className="grid grid-cols-1 gap-3 overflow-auto pb-3 md:grid-cols-2">
        {/* Left column */}
        <div className="space-y-3">
          <Field label="Mã đơn (orderno)" readOnly>
            <input
              value={draft.orderno}
              readOnly
              className="w-full rounded-md border border-neutral-200 bg-neutral-100 px-3 py-2 text-sm dark:border-neutral-700 dark:bg-neutral-800"
            />
          </Field>

          <Field label="Mã sản phẩm (productId)">
            <input
              value={draft.productId}
              onChange={(e) => handleChange("productId", e.target.value)}
              placeholder="VD: PROD01"
              className="w-full rounded-md border border-neutral-200 bg-white px-3 py-2 text-sm dark:border-neutral-700 dark:bg-neutral-900"
            />
          </Field>

          <Field label="Mã gói (packcode)">
            <input
              value={draft.packcode}
              onChange={(e) => handleChange("packcode", e.target.value)}
              placeholder="VD: PACK-A"
              className="w-full rounded-md border border-neutral-200 bg-white px-3 py-2 text-sm dark:border-neutral-700 dark:bg-neutral-900"
            />
          </Field>

          <Field label="Ngày đặt (order_date)">
            <input
              type="date"
              value={draft.order_date?.slice(0, 10) || ""}
              onChange={(e) =>
                handleChange("order_date", e.target.value ? e.target.value : null)
              }
              className="w-full rounded-md border border-neutral-200 bg-white px-3 py-2 text-sm dark:border-neutral-700 dark:bg-neutral-900"
            />
          </Field>

          <Field label="Tên khách hàng">
            <input
              value={draft.customer_name || ""}
              onChange={(e) => handleChange("customer_name", e.target.value)}
              placeholder="Họ tên"
              className="w-full rounded-md border border-neutral-200 bg-white px-3 py-2 text-sm dark:border-neutral-700 dark:bg-neutral-900"
            />
          </Field>

          <Field label="Địa chỉ">
            <input
              value={draft.customer_address || ""}
              onChange={(e) => handleChange("customer_address", e.target.value)}
              placeholder="Địa chỉ"
              className="w-full rounded-md border border-neutral-200 bg-white px-3 py-2 text-sm dark:border-neutral-700 dark:bg-neutral-900"
            />
          </Field>

          <Field label="Loại khách hàng (customer_type)">
            <select
              value={draft.customer_type ?? ""}
              onChange={(e) =>
                handleChange(
                  "customer_type",
                  e.target.value === "" ? null : Number(e.target.value)
                )
              }
              className="w-full rounded-md border border-neutral-200 bg-white px-3 py-2 text-sm dark:border-neutral-700 dark:bg-neutral-900"
            >
              <option value="">-- chọn --</option>
              <option value={0}>Cá nhân</option>
              <option value={1}>Doanh nghiệp</option>
            </select>
          </Field>

          <Field label="Mã số thuế (taxcode)">
            <input
              value={draft.taxcode || ""}
              onChange={(e) => handleChange("taxcode", e.target.value)}
              placeholder="MST"
              className="w-full rounded-md border border-neutral-200 bg-white px-3 py-2 text-sm dark:border-neutral-700 dark:bg-neutral-900"
            />
          </Field>

          <Field label="CCCD (identity_code)">
            <input
              value={draft.identity_code || ""}
              onChange={(e) => handleChange("identity_code", e.target.value)}
              placeholder="Số CCCD"
              className="w-full rounded-md border border-neutral-200 bg-white px-3 py-2 text-sm dark:border-neutral-700 dark:bg-neutral-900"
            />
          </Field>
        </div>

        {/* Right column */}
        <div className="space-y-3">
          <Field label="Điện thoại">
            <input
              value={draft.tel || ""}
              onChange={(e) => handleChange("tel", e.target.value)}
              placeholder="SĐT"
              className="w-full rounded-md border border-neutral-200 bg-white px-3 py-2 text-sm dark:border-neutral-700 dark:bg-neutral-900"
            />
          </Field>

          <Field label="Email">
            <input
              value={draft.email || ""}
              onChange={(e) => handleChange("email", e.target.value)}
              placeholder="Email"
              type="email"
              className="w-full rounded-md border border-neutral-200 bg-white px-3 py-2 text-sm dark:border-neutral-700 dark:bg-neutral-900"
            />
          </Field>

          <Field label="Ghi chú">
            <input
              value={draft.note || ""}
              onChange={(e) => handleChange("note", e.target.value)}
              placeholder="Ghi chú"
              className="w-full rounded-md border border-neutral-200 bg-white px-3 py-2 text-sm dark:border-neutral-700 dark:bg-neutral-900"
            />
          </Field>

          <Field label="Số tiền (amount)">
            <input
              value={draft.amount ?? ""}
              onChange={(e) =>
                handleChange(
                  "amount",
                  e.target.value === "" ? null : Number(e.target.value)
                )
              }
              type="number"
              min={0}
              step="0.01"
              placeholder="0.00"
              className="w-full rounded-md border border-neutral-200 bg-white px-3 py-2 text-sm dark:border-neutral-700 dark:bg-neutral-900"
            />
          </Field>

          <Field label="Trạng thái thanh toán">
            <select
              value={draft.payment_status ?? 0}
              onChange={(e) =>
                handleChange("payment_status", Number(e.target.value))
              }
              className="w-full rounded-md border border-neutral-200 bg-white px-3 py-2 text-sm dark:border-neutral-700 dark:bg-neutral-900"
            >
              <option value={0}>0 - Chưa thanh toán</option>
              <option value={1}>1 - Cam kết thanh toán</option>
              <option value={2}>2 - Chờ thanh toán</option>
              <option value={3}>3 - Đã thanh toán</option>
            </select>
          </Field>

          <Field label="Mã giao dịch (payment_tran_no)">
            <input
              value={draft.payment_tran_no || ""}
              onChange={(e) => handleChange("payment_tran_no", e.target.value)}
              placeholder="Mã GD"
              className="w-full rounded-md border border-neutral-200 bg-white px-3 py-2 text-sm dark:border-neutral-700 dark:bg-neutral-900"
            />
          </Field>

          <Field label="Hình thức thanh toán">
            <select
              value={draft.payment_type ?? 0}
              onChange={(e) =>
                handleChange("payment_type", Number(e.target.value))
              }
              className="w-full rounded-md border border-neutral-200 bg-white px-3 py-2 text-sm dark:border-neutral-700 dark:bg-neutral-900"
            >
              <option value={0}>0 - Tiền mặt</option>
              <option value={1}>1 - Chuyển khoản</option>
            </select>
          </Field>

          <Field label="Ngày thanh toán">
            <input
              type="datetime-local"
              value={
                draft.payment_date
                  ? draft.payment_date.slice(0, 16)
                  : ""
              }
              onChange={(e) =>
                handleChange(
                  "payment_date",
                  e.target.value ? new Date(e.target.value).toISOString() : null
                )
              }
              className="w-full rounded-md border border-neutral-200 bg-white px-3 py-2 text-sm dark:border-neutral-700 dark:bg-neutral-900"
            />
          </Field>

          <Field label="Trạng thái cấp tài nguyên">
            <select
              value={draft.resource_status ?? 0}
              onChange={(e) =>
                handleChange("resource_status", Number(e.target.value))
              }
              className="w-full rounded-md border border-neutral-200 bg-white px-3 py-2 text-sm dark:border-neutral-700 dark:bg-neutral-900"
            >
              <option value={0}>0 - Chưa cấp</option>
              <option value={1}>1 - Đã cấp</option>
              <option value={2}>2 - Cấp lỗi</option>
            </select>
          </Field>

          <Field label="Mã CTV/đại lý (partner_code)">
            <input
              value={draft.partner_code || ""}
              onChange={(e) => handleChange("partner_code", e.target.value)}
              placeholder="Mã đối tác"
              className="w-full rounded-md border border-neutral-200 bg-white px-3 py-2 text-sm dark:border-neutral-700 dark:bg-neutral-900"
            />
          </Field>

          <Field label="Mã nhân viên (employee_code)">
            <input
              value={draft.employee_code || ""}
              onChange={(e) => handleChange("employee_code", e.target.value)}
              placeholder="Mã NV"
              className="w-full rounded-md border border-neutral-200 bg-white px-3 py-2 text-sm dark:border-neutral-700 dark:bg-neutral-900"
            />
          </Field>
        </div>

        {/* License JSON */}
        <div className="md:col-span-2">
          <Field label="License Info (JSON)">
            <textarea
              value={licenseText}
              onChange={(e) => parseLicense(e.target.value)}
              rows={8}
              className={
                "w-full rounded-md border px-3 py-2 font-mono text-xs " +
                (licenseError
                  ? "border-red-500 dark:border-red-500 bg-red-50 dark:bg-red-950"
                  : "border-neutral-200 bg-white dark:border-neutral-700 dark:bg-neutral-900")
              }
            />
          </Field>
          {licenseError && (
            <div className="mt-1 text-xs text-red-600 dark:text-red-400">{licenseError}</div>
          )}
        </div>
      </div>

      <div className="mt-auto flex items-center justify-end gap-2 pt-2">
        <button
          className="inline-flex items-center gap-2 rounded-md border border-neutral-200 px-3 py-2 text-sm hover:bg-neutral-50 dark:border-neutral-700 dark:hover:bg-neutral-800 disabled:opacity-50"
          onClick={handleSave}
          disabled={!canSave}
        >
          <Save size={16} /> Lưu thay đổi
        </button>
        <button
          className="inline-flex items-center gap-2 rounded-md border border-neutral-200 px-3 py-2 text-sm hover:bg-neutral-50 dark:border-neutral-700 dark:hover:bg-neutral-800"
          onClick={onAddNew}
        >
          <Plus size={16} /> Thêm mới
        </button>
      </div>
    </div>
  );
}

/**
 * Field: small helper component for label + content.
 */
function Field({
  label,
  children,
  readOnly,
}: {
  label: string;
  children: React.ReactNode;
  readOnly?: boolean;
}) {
  return (
    <label className="block">
      <div className="mb-1 text-xs uppercase tracking-wide text-neutral-500 dark:text-neutral-400">
        {label}
      </div>
      <div className={readOnly ? "opacity-80" : ""}>{children}</div>
    </label>
  );
}

