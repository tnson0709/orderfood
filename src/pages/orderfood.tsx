import { useEffect, useMemo, useState } from "react";
import { useNavigate } from "react-router";
import { Button } from "../components/ui/button";
import { Input } from "../components/ui/input";
import { Card, CardContent, CardHeader, CardTitle } from "../components/ui/card";
import {
  ArrowLeft,
  ChevronRight,
  Minus,
  Plus,
  ShoppingCart,
  Star,
  Truck,
  Users,
  MessageCircle,
} from "lucide-react";
import { getJson } from "../utils/storage";

type MenuItem = {
  id: string;
  category: string;
  name: string;
  description: string;
  price: number;
  image?: string;
  active?: boolean;
};

type CartItem = MenuItem & {
  quantity: number;
};

const DEFAULT_PRODUCTS: MenuItem[] = [
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

function formatVnd(value: number) {
  return value.toLocaleString("vi-VN", {
    style: "currency",
    currency: "VND",
    maximumFractionDigits: 0,
  });
}

export default function OrderFoodPage() {
  const navigate = useNavigate();
  const [menuItems, setMenuItems] = useState<MenuItem[]>(DEFAULT_PRODUCTS);
  const [activeCategory, setActiveCategory] = useState("");
  const [cart, setCart] = useState<CartItem[]>([]);
  const [customerName, setCustomerName] = useState("");
  const [customerPhone, setCustomerPhone] = useState("");
  const [customerAddress, setCustomerAddress] = useState("");
  const [customerNote, setCustomerNote] = useState("");
  const [submitted, setSubmitted] = useState(false);

  useEffect(() => {
    const stored = getJson<MenuItem[]>("foodproduct", DEFAULT_PRODUCTS);
    const activeItems = stored.filter((item) => item.active !== false);
    setMenuItems(activeItems);
    const cats = Array.from(new Set(activeItems.map((item) => item.category)));
    if (cats.length > 0) {
      setActiveCategory(cats[0]);
    }
  }, []);

  const categories = useMemo(
    () => Array.from(new Set(menuItems.map((item) => item.category))),
    [menuItems]
  );

  const categoryItems = useMemo(
    () => menuItems.filter((item) => item.category === activeCategory),
    [activeCategory, menuItems]
  );

  const subtotal = useMemo(
    () => cart.reduce((acc, item) => acc + item.price * item.quantity, 0),
    [cart]
  );
  const fee = cart.length > 0 ? 15000 : 0;
  const total = subtotal + fee;

  const canPlaceOrder =
    cart.length > 0 && customerName.trim() && customerPhone.trim() && customerAddress.trim();

  function addToCart(item: MenuItem) {
    setCart((current) => {
      const existing = current.find((row) => row.id === item.id);
      if (existing) {
        return current.map((row) =>
          row.id === item.id ? { ...row, quantity: row.quantity + 1 } : row
        );
      }
      return [...current, { ...item, quantity: 1 }];
    });
    setSubmitted(false);
  }

  function updateQuantity(id: string, delta: number) {
    setCart((current) =>
      current
        .map((item) =>
          item.id === id
            ? { ...item, quantity: Math.max(1, item.quantity + delta) }
            : item
        )
        .filter((item) => item.quantity > 0)
    );
    setSubmitted(false);
  }

  function removeFromCart(id: string) {
    setCart((current) => current.filter((item) => item.id !== id));
    setSubmitted(false);
  }

  function handleSubmit() {
    if (!canPlaceOrder) return;
    setSubmitted(true);
    window.scrollTo({ top: 0, behavior: "smooth" });
  }

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
                <ShoppingCart className="h-3.5 w-3.5" /> Đặt nhanh đồ ăn
              </span>
            </div>
            <h1 className="mt-3 text-3xl font-semibold tracking-tight text-slate-900">
              Đặt đồ ăn nhanh trong vài bước
            </h1>
            <p className="mt-2 max-w-2xl text-sm leading-6 text-slate-600 sm:text-base">
              Chọn món, nhập thông tin và xác nhận. Giao tận nơi trong khu vực.
            </p>
          </div>
          <div className="grid gap-3 sm:auto-cols-fr sm:grid-flow-col sm:grid">
            <div className="rounded-3xl bg-slate-50 p-4 text-sm text-slate-700 shadow-sm">
              <div className="font-semibold">Thời gian giao</div>
              <div>15 - 30 phút</div>
            </div>
            <div className="rounded-3xl bg-slate-50 p-4 text-sm text-slate-700 shadow-sm">
              <div className="font-semibold">Phí ship</div>
              <div>{formatVnd(fee)}</div>
            </div>
          </div>
        </div>

        {submitted && (
          <div className="mb-6 rounded-3xl border border-emerald-200 bg-emerald-50 p-4 text-sm text-emerald-900 shadow-sm">
            <div className="font-semibold">Đơn hàng đã được tạo!</div>
            <p className="mt-1">Chúng tôi đã ghi nhận yêu cầu của bạn và sẽ liên hệ lại sớm.</p>
          </div>
        )}

        <div className="grid gap-6 xl:grid-cols-[1.6fr_1fr]">
          <div className="space-y-6">
            <Card className="overflow-hidden">
              <CardHeader>
                <div className="flex flex-col gap-1 sm:flex-row sm:items-center sm:justify-between">
                  <div>
                    <CardTitle>Menu chọn món</CardTitle>
                    <p className="text-sm text-slate-500">Chọn món bạn muốn ăn từ các danh mục.</p>
                  </div>
                  <div className="flex flex-wrap gap-2">
                    {categories.map((category) => (
                      <button
                        key={category}
                        className={`rounded-full border px-3 py-1 text-sm transition ${
                          category === activeCategory
                            ? "border-slate-900 bg-slate-900 text-white"
                            : "border-slate-200 bg-white text-slate-700 hover:border-slate-300"
                        }`}
                        onClick={() => setActiveCategory(category)}
                        type="button"
                      >
                        {category}
                      </button>
                    ))}
                  </div>
                </div>
              </CardHeader>
              <CardContent className="grid gap-4 sm:grid-cols-2 xl:grid-cols-2">
                {categoryItems.map((item) => (
                  <div
                    key={item.id}
                    className="rounded-3xl border border-slate-200 bg-slate-50 p-5 shadow-sm overflow-hidden"
                  >
                    {item.image && (
                      <img
                        src={item.image}
                        alt={item.name}
                        className="w-full h-40 object-cover rounded-2xl mb-4"
                        onError={(e) => {
                          (e.target as HTMLImageElement).style.display = 'none';
                        }}
                      />
                    )}
                    <div className="flex items-start justify-between gap-4">
                      <div className="flex-1">
                        <div className="text-lg font-semibold text-slate-900">{item.name}</div>
                        <p className="mt-1 text-sm text-slate-600">{item.description}</p>
                      </div>
                      <div className="text-right text-base font-semibold text-slate-900">
                        {formatVnd(item.price)}
                      </div>
                    </div>
                    <div className="mt-5 flex items-center justify-between gap-3">
                      <button
                        type="button"
                        className="inline-flex items-center gap-2 rounded-full bg-slate-900 px-4 py-2 text-sm font-semibold text-white transition hover:bg-slate-800"
                        onClick={() => addToCart(item)}
                      >
                        <Plus className="h-4 w-4" /> Thêm
                      </button>
                      <div className="flex items-center gap-1 text-xs text-slate-500">
                        <Star className="h-4 w-4 text-amber-500" /> Yêu thích
                      </div>
                    </div>
                  </div>
                ))}
              </CardContent>
            </Card>

            <Card className="overflow-hidden">
              <CardHeader>
                <div>
                  <CardTitle>Thông tin khách hàng</CardTitle>
                  <p className="text-sm text-slate-500">Nhập thông tin để giao hàng chính xác.</p>
                </div>
              </CardHeader>
              <CardContent className="grid gap-4">
                <div className="grid gap-4 sm:grid-cols-2">
                  <label className="space-y-1 text-sm text-slate-700">
                    Họ và tên
                    <Input
                      value={customerName}
                      onChange={(e) => setCustomerName(e.target.value)}
                      placeholder="Nguyễn Văn A"
                    />
                  </label>
                  <label className="space-y-1 text-sm text-slate-700">
                    Số điện thoại
                    <Input
                      value={customerPhone}
                      onChange={(e) => setCustomerPhone(e.target.value)}
                      placeholder="0987 654 321"
                    />
                  </label>
                </div>
                <label className="space-y-1 text-sm text-slate-700">
                  Địa chỉ nhận hàng
                  <Input
                    value={customerAddress}
                    onChange={(e) => setCustomerAddress(e.target.value)}
                    placeholder="Số nhà, đường, phường, quận"
                  />
                </label>
                <label className="space-y-1 text-sm text-slate-700">
                  Ghi chú thêm
                  <Input
                    value={customerNote}
                    onChange={(e) => setCustomerNote(e.target.value)}
                    placeholder="Không cay / Thêm rau"
                  />
                </label>
              </CardContent>
            </Card>
          </div>

          <div className="space-y-6">
            <Card className="overflow-hidden">
              <CardHeader>
                <CardTitle>Giỏ hàng</CardTitle>
                <p className="text-sm text-slate-500">Kiểm tra số lượng và tổng tiền.</p>
              </CardHeader>
              <CardContent className="space-y-4">
                {cart.length === 0 ? (
                  <div className="rounded-3xl border border-dashed border-slate-300 bg-slate-50 p-6 text-center text-slate-500">
                    Chưa có món trong giỏ. Chọn món từ menu bên trái.
                  </div>
                ) : (
                  <div className="space-y-4">
                    <div className="space-y-4">
                      {cart.map((item) => (
                        <div key={item.id} className="rounded-3xl border border-slate-200 bg-white p-4">
                          <div className="flex items-start justify-between gap-3">
                            <div>
                              <div className="font-semibold text-slate-900">{item.name}</div>
                              <div className="mt-1 text-sm text-slate-500">{formatVnd(item.price)} × {item.quantity}</div>
                            </div>
                            <div className="text-right text-sm font-semibold text-slate-900">
                              {formatVnd(item.quantity * item.price)}
                            </div>
                          </div>
                          <div className="mt-4 flex items-center justify-between gap-3">
                            <div className="inline-flex items-center gap-1 rounded-full border border-slate-200 bg-slate-100 px-2 py-1 text-sm text-slate-700">
                              <button
                                type="button"
                                className="inline-flex h-7 w-7 items-center justify-center rounded-full text-slate-700 transition hover:bg-slate-200"
                                onClick={() => updateQuantity(item.id, -1)}
                              >
                                <Minus className="h-4 w-4" />
                              </button>
                              <span className="min-w-[24px] text-center">{item.quantity}</span>
                              <button
                                type="button"
                                className="inline-flex h-7 w-7 items-center justify-center rounded-full text-slate-700 transition hover:bg-slate-200"
                                onClick={() => updateQuantity(item.id, 1)}
                              >
                                <Plus className="h-4 w-4" />
                              </button>
                            </div>
                            <button
                              type="button"
                              className="text-sm font-medium text-rose-600 hover:text-rose-700"
                              onClick={() => removeFromCart(item.id)}
                            >
                              Xóa
                            </button>
                          </div>
                        </div>
                      ))}
                    </div>
                    <div className="rounded-3xl border border-slate-200 bg-slate-50 p-4 text-sm text-slate-700">
                      <div className="flex items-center justify-between">
                        <span>Tạm tính</span>
                        <span>{formatVnd(subtotal)}</span>
                      </div>
                      <div className="mt-2 flex items-center justify-between">
                        <span>Phí giao hàng</span>
                        <span>{formatVnd(fee)}</span>
                      </div>
                      <div className="mt-3 flex items-center justify-between border-t border-slate-200 pt-3 text-base font-semibold text-slate-900">
                        <span>Tổng</span>
                        <span>{formatVnd(total)}</span>
                      </div>
                    </div>
                    <Button
                      className="w-full justify-between"
                      onClick={handleSubmit}
                      disabled={!canPlaceOrder}
                    >
                      <span>Đặt hàng</span>
                      <ChevronRight className="h-4 w-4" />
                    </Button>
                    <div className="rounded-3xl border border-slate-200 bg-slate-50 p-4 text-sm text-slate-600">
                      <div className="flex items-center gap-2">
                        <Truck className="h-4 w-4 text-slate-500" />
                        Giao nhanh trong khu vực.
                      </div>
                      <div className="mt-2 flex items-center gap-2">
                        <Users className="h-4 w-4 text-slate-500" /> Khách hàng thân thiết được ưu đãi.
                      </div>
                      <div className="mt-2 flex items-center gap-2">
                        <MessageCircle className="h-4 w-4 text-slate-500" /> Hỗ trợ trực tiếp khi cần.
                      </div>
                    </div>
                  </div>
                )}
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </div>
  );
}
