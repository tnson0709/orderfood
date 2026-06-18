import { useEffect, useMemo, useState } from "react";
import { useNavigate } from "react-router";
import { Button } from "../components/ui/button";
import { Input } from "../components/ui/input";
import { Card, CardContent, CardHeader, CardTitle } from "../components/ui/card";
import { ArrowLeft, Layers, Plus, Edit3, Trash2 } from "lucide-react";
import { getJson, setJson } from "../utils/storage";

type FoodProduct = {
  id: string;
  name: string;
  category: string;
  description: string;
  price: number;
  image: string;
  active: boolean;
};

const STORAGE_KEY = "foodproduct";

const DEFAULT_PRODUCTS: FoodProduct[] = [
  {
    id: "food-001",
    name: "Cơm gà xối mỡ",
    category: "Cơm",
    description: "Gà giòn, cơm tơi và nước mắm chua ngọt.",
    price: 79000,
    image: "https://images.unsplash.com/photo-1546069901-ba9599a7e63c?w=400&h=300&fit=crop",
    active: true,
  },
  {
    id: "food-002",
    name: "Phở bò tái",
    category: "Phở",
    description: "Nước dùng thơm ngon với bò tái mềm và hành lá.",
    price: 69000,
    image: "https://images.unsplash.com/photo-1582878657521-fad87a0268c9?w=400&h=300&fit=crop",
    active: true,
  },
  {
    id: "food-003",
    name: "Bún chả Hà Nội",
    category: "Bún",
    description: "Chả nướng, bún tươi, rau sống và nước chấm đặc trưng.",
    price: 75000,
    image: "https://images.unsplash.com/photo-1569718212165-3a8278d5f624?w=400&h=300&fit=crop",
    active: true,
  },
];

function createId() {
  return crypto.randomUUID?.() ?? `${Date.now()}-${Math.random().toString(36).slice(2)}`;
}

function formatVnd(value: number) {
  return value.toLocaleString("vi-VN", {
    style: "currency",
    currency: "VND",
    maximumFractionDigits: 0,
  });
}

export default function FoodAdminPage() {
  const navigate = useNavigate();
  const [products, setProducts] = useState<FoodProduct[]>([]);
  const [search, setSearch] = useState("");
  const [editingId, setEditingId] = useState<string | null>(null);
  const [draft, setDraft] = useState<Partial<FoodProduct>>({
    name: "",
    category: "",
    description: "",
    price: 0,
    image: "",
    active: true,
  });

  useEffect(() => {
    const stored = getJson<FoodProduct[]>(STORAGE_KEY, DEFAULT_PRODUCTS);
    setProducts(stored);
  }, []);

  useEffect(() => {
    if (!editingId) {
      setDraft({ name: "", category: "", description: "", price: 0, image: "", active: true });
      return;
    }
    const product = products.find((item) => item.id === editingId);
    if (product) {
      setDraft({ ...product });
    }
  }, [editingId, products]);

  const categories = useMemo(
    () => Array.from(new Set(products.map((item) => item.category))).sort(),
    [products]
  );

  const filteredProducts = useMemo(() => {
    const q = search.trim().toLowerCase();
    if (!q) return products;
    return products.filter((item) =>
      [item.name, item.category, item.description].some((value) =>
        value.toLowerCase().includes(q)
      )
    );
  }, [products, search]);

  function persist(next: FoodProduct[]) {
    setProducts(next);
    setJson(STORAGE_KEY, next);
  }

  function handleSelectProduct(id: string) {
    setEditingId(id);
  }

  function handleNewProduct() {
    setEditingId(null);
  }

  function handleDeleteProduct(id: string) {
    if (!window.confirm("Xóa sản phẩm này?")) return;
    const next = products.filter((item) => item.id !== id);
    persist(next);
    if (editingId === id) {
      setEditingId(null);
    }
  }

  function handleSaveProduct() {
    const name = String(draft.name || "").trim();
    const category = String(draft.category || "").trim();
    const description = String(draft.description || "").trim();
    const image = String(draft.image || "").trim();
    const price = Number(draft.price || 0);

    if (!name || !category || Number.isNaN(price) || price <= 0) {
      window.alert("Vui lòng nhập tên, loại và giá hợp lệ.");
      return;
    }

    if (editingId) {
      const next = products.map((item) =>
        item.id === editingId
          ? { ...item, name, category, description, price, image, active: !!draft.active }
          : item
      );
      persist(next);
    } else {
      const newProduct: FoodProduct = {
        id: createId(),
        name,
        category,
        description,
        price,
        image,
        active: !!draft.active,
      };
      persist([newProduct, ...products]);
      setEditingId(newProduct.id);
    }
  }

  function handleField<K extends keyof FoodProduct>(key: K, value: FoodProduct[K]) {
    setDraft((current) => ({ ...current, [key]: value }));
  }

  const selectedProduct = products.find((item) => item.id === editingId);

  return (
    <div className="min-h-screen bg-slate-50 text-slate-900 pb-10">
      <div className="mx-auto max-w-7xl px-4 py-6 sm:px-6 lg:px-8">
        <div className="mb-6 flex flex-col gap-4 rounded-3xl border border-slate-200 bg-white p-6 shadow-sm sm:flex-row sm:items-center sm:justify-between">
          <div>
            <div className="flex items-center gap-2 text-sm text-slate-500">
              <Button
                variant="ghost"
                size="sm"
                className="inline-flex items-center gap-2 px-2 py-1"
                onClick={() => navigate(-1)}
              >
                <ArrowLeft className="h-4 w-4" /> Quay lại
              </Button>
              <span className="inline-flex items-center gap-1 rounded-full bg-slate-100 px-3 py-1 text-xs font-medium text-slate-600">
                <Layers className="h-3.5 w-3.5" /> Quản lý sản phẩm
              </span>
            </div>
            <h1 className="mt-3 text-3xl font-semibold tracking-tight text-slate-900">
              Bảng điều khiển sản phẩm đồ ăn
            </h1>
            <p className="mt-2 max-w-2xl text-sm leading-6 text-slate-600 sm:text-base">
              Thêm, sửa, xóa và quản lý sản phẩm bán nhanh cho cửa hàng.
            </p>
          </div>
          <div className="grid gap-3 sm:auto-cols-fr sm:grid-flow-col sm:grid">
            <div className="rounded-3xl bg-slate-50 p-4 text-sm text-slate-700 shadow-sm">
              <div className="font-semibold">Sản phẩm hiện có</div>
              <div>{products.length}</div>
            </div>
            <div className="rounded-3xl bg-slate-50 p-4 text-sm text-slate-700 shadow-sm">
              <div className="font-semibold">Danh mục</div>
              <div>{categories.length}</div>
            </div>
          </div>
        </div>

        <div className="grid gap-6 xl:grid-cols-[1.6fr_1fr]">
          <Card className="overflow-hidden">
            <CardHeader>
              <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
                <div>
                  <CardTitle>Danh sách sản phẩm</CardTitle>
                  <p className="text-sm text-slate-500">Tìm kiếm theo tên, loại, hoặc mô tả.</p>
                </div>
                <div className="flex flex-wrap items-center gap-2">
                  <Button variant="secondary" size="sm" onClick={handleNewProduct}>
                    <Plus className="h-4 w-4" /> Thêm sản phẩm
                  </Button>
                  <Input
                    value={search}
                    onChange={(e) => setSearch(e.target.value)}
                    placeholder="Tìm kiếm..."
                    className="max-w-xs"
                  />
                </div>
              </div>
            </CardHeader>
            <CardContent className="overflow-auto">
              <div className="min-w-full overflow-x-auto">
                <table className="min-w-full text-sm">
                  <thead className="sticky top-0 z-10 bg-slate-50 text-slate-700">
                    <tr>
                      <th className="px-3 py-3 text-left font-semibold">Tên</th>
                      <th className="px-3 py-3 text-left font-semibold">Danh mục</th>
                      <th className="px-3 py-3 text-right font-semibold">Giá</th>
                      <th className="px-3 py-3 text-center font-semibold">Trạng thái</th>
                      <th className="px-3 py-3 text-right font-semibold">Hành động</th>
                    </tr>
                  </thead>
                  <tbody>
                    {filteredProducts.map((item) => (
                      <tr
                        key={item.id}
                        className={`border-t border-slate-200 hover:bg-slate-50 ${
                          item.id === editingId ? "bg-slate-100" : ""
                        }`}
                      >
                        <td className="px-3 py-3">{item.name}</td>
                        <td className="px-3 py-3">{item.category}</td>
                        <td className="px-3 py-3 text-right font-semibold text-slate-900">
                          {formatVnd(item.price)}
                        </td>
                        <td className="px-3 py-3 text-center text-sm text-slate-600">
                          {item.active ? "Kinh doanh" : "Ẩn"}
                        </td>
                        <td className="px-3 py-3 text-right">
                          <div className="inline-flex items-center gap-2">
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={() => handleSelectProduct(item.id)}
                            >
                              <Edit3 className="h-4 w-4" />
                            </Button>
                            <Button
                              variant="ghost"
                              size="sm"
                              className="text-rose-600"
                              onClick={() => handleDeleteProduct(item.id)}
                            >
                              <Trash2 className="h-4 w-4" />
                            </Button>
                          </div>
                        </td>
                      </tr>
                    ))}
                    {filteredProducts.length === 0 && (
                      <tr>
                        <td colSpan={5} className="px-3 py-8 text-center text-slate-500">
                          Không tìm thấy sản phẩm.
                        </td>
                      </tr>
                    )}
                  </tbody>
                </table>
              </div>
            </CardContent>
          </Card>

          <Card className="overflow-hidden">
            <CardHeader>
              <div>
                <CardTitle>{editingId ? "Chỉnh sửa sản phẩm" : "Thêm sản phẩm mới"}</CardTitle>
                <p className="text-sm text-slate-500">Nhập thông tin và lưu thay đổi.</p>
              </div>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2 text-sm text-slate-700">
                <label className="block">
                  Tên sản phẩm
                  <Input
                    value={draft.name || ""}
                    onChange={(e) => handleField("name", e.target.value)}
                    placeholder="Ví dụ: Cơm sườn nướng"
                  />
                </label>
                <label className="block">
                  Danh mục
                  <Input
                    value={draft.category || ""}
                    onChange={(e) => handleField("category", e.target.value)}
                    placeholder="Ví dụ: Cơm, Phở, Bún"
                  />
                </label>
                <label className="block">
                  Mô tả
                  <textarea
                    rows={3}
                    value={draft.description || ""}
                    onChange={(e) => handleField("description", e.target.value)}
                    className="mt-1 min-h-[70px] w-full rounded-md border border-slate-200 bg-white px-3 py-2 text-sm shadow-sm focus:outline-none focus:ring-2 focus:ring-slate-300"
                    placeholder="Mô tả ngắn về món ăn"
                  />
                </label>
                <label className="block">
                  Link ảnh sản phẩm
                  <Input
                    value={draft.image || ""}
                    onChange={(e) => handleField("image", e.target.value)}
                    placeholder="https://example.com/image.jpg"
                  />
                  {draft.image && (
                    <img 
                      src={draft.image} 
                      alt={draft.name || "Sản phẩm"} 
                      className="mt-2 h-20 w-20 rounded object-cover border border-slate-200"
                      onError={(e) => {
                        (e.target as HTMLImageElement).style.display = 'none';
                      }}
                    />
                  )}
                </label>
                <label className="block">
                  Giá bán (VND)
                  <Input
                    type="number"
                    min={0}
                    step={1000}
                    value={draft.price ?? 0}
                    onChange={(e) => handleField("price", Number(e.target.value))}
                    placeholder="Ví dụ: 79000"
                  />
                </label>
                <label className="flex items-center gap-3 text-sm text-slate-700">
                  <input
                    type="checkbox"
                    checked={!!draft.active}
                    onChange={(e) => handleField("active", e.target.checked)}
                    className="h-4 w-4 rounded border-slate-300 text-slate-900"
                  />
                  Hiển thị sản phẩm trên menu
                </label>
              </div>
              <div className="flex flex-wrap gap-3 pt-2">
                <Button onClick={handleSaveProduct}>
                  {editingId ? "Cập nhật" : "Lưu"}
                </Button>
                <Button variant="outline" onClick={handleNewProduct}>
                  Tạo mới
                </Button>
                {selectedProduct && (
                  <Button
                    variant="ghost"
                    className="text-rose-600"
                    onClick={() => handleDeleteProduct(selectedProduct.id)}
                  >
                    Xóa
                  </Button>
                )}
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
