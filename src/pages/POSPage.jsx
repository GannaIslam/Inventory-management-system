import { useState, useEffect } from "react";
import { Search, Plus, Trash2, Monitor, X } from "lucide-react";
import { productService, salesService, locationService } from "../services/api";
import { PageLoader } from "../components/ui/Feedback";
import { useAuth } from "../hooks/useAuth";

function generateInvoiceId() {
  const now = new Date();
  const date = now.toISOString().slice(0, 10).replace(/-/g, "");
  const num = String(Math.floor(Math.random() * 9000) + 1000);
  return `SI-${date}-${num}`;
}

export default function POSPage() {
  const { user } = useAuth();
  const [products, setProducts] = useState([]);
  const [locations, setLocations] = useState([]);
  const [selectedLocation, setSelectedLocation] = useState(null);
  const [loading, setLoading] = useState(true);
  const [cart, setCart] = useState([]);
  const [search, setSearch] = useState("");
  const [customerName, setCustomerName] = useState("");
  const [customerNumber, setCustomerNumber] = useState("");
  const [payment, setPayment] = useState("CASH");
  const [discountPct, setDiscountPct] = useState(0);
  const [taxPct, setTaxPct] = useState(5);
  const [saving, setSaving] = useState(false);
  const [receipt, setReceipt] = useState(null);

  useEffect(() => {
    Promise.all([
      productService.getAll().then((p) => {
        setProducts(p.filter((p) => p.status === "Active" && p.stock > 0));
      }),
      locationService.getAll().then((locs) => {
        setLocations(locs);
        // Set first active location as default
        const defaultLoc = locs.find((l) => l.isActive);
        if (defaultLoc) setSelectedLocation(defaultLoc.locationId);
      }),
    ]).then(() => setLoading(false));
  }, []);

  const filteredProducts = products.filter(
    (p) =>
      search.length === 0 ||
      p.name.toLowerCase().includes(search.toLowerCase()) ||
      p.barcode?.includes(search),
  );

  const addToCart = (product) => {
    setCart((prev) => {
      const existing = prev.find((i) => i.productId === product.id);
      if (existing) {
        return prev.map((i) =>
          i.productId === product.id ? { ...i, qty: i.qty + 1 } : i,
        );
      }
      return [
        ...prev,
        {
          productId: product.id,
          productName: product.name,
          price: product.sellPrice,
          qty: 1,
        },
      ];
    });
  };

  const updateQty = (productId, qty) => {
    if (qty < 1) {
      removeItem(productId);
      return;
    }
    setCart((prev) =>
      prev.map((i) => (i.productId === productId ? { ...i, qty } : i)),
    );
  };

  const removeItem = (productId) => {
    setCart((prev) => prev.filter((i) => i.productId !== productId));
  };

  const subtotal = cart.reduce((sum, i) => sum + i.price * i.qty, 0);
  const discount = subtotal * (discountPct / 100);
  const tax = (subtotal - discount) * (taxPct / 100);
  const grandTotal = subtotal - discount + tax;

  const handleCheckout = async () => {
    if (cart.length === 0 || !selectedLocation) return;
    setSaving(true);
    try {
      // Build request per OpenAPI CreateSalesInvoiceDTO spec
      const invoice = await salesService.create({
        invoiceNumber: generateInvoiceId(),
        customerName: customerName || "Walk-in Customer",
        customerPhone: customerNumber || "",
        paymentMethod: payment,
        cashierName: user?.username || "Unknown",
        lines: cart.map((item) => ({
          productId: item.productId,
          locationId: selectedLocation,
          quantity: item.qty,
          discountPercent: 0,
        })),
        notes: `Subtotal: $${subtotal.toFixed(2)}, Discount: $${discount.toFixed(2)}, Tax: $${tax.toFixed(2)}`,
      });
      setReceipt(invoice);
      setCart([]);
      setCustomerName("");
      setCustomerNumber("");
      setDiscountPct(0);
    } finally {
      setSaving(false);
    }
  };

  if (loading) return <PageLoader />;

  return (
    <div className="flex flex-col lg:flex-row gap-5 lg:h-[calc(100vh-6rem)]">
      {/* Left: Product grid */}
      <div className="flex-1 flex flex-col min-w-0 space-y-3">
        <div className="flex items-center gap-3">
          <h1 className="text-2xl font-bold text-slate-800 shrink-0">
            POS Terminal
          </h1>
          <div className="relative flex-1">
            <Search
              size={15}
              className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400"
            />
            <input
              placeholder="Search by name or scan barcode..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="w-full pl-9 pr-3 py-2.5 text-sm border border-slate-200 rounded-lg bg-white focus:outline-none focus:ring-2 focus:ring-[#164E63] transition-all"
            />
          </div>
        </div>

        <div className="flex-1 overflow-y-auto">
          <div className="grid grid-cols-2 sm:grid-cols-3 gap-3 pb-4">
            {filteredProducts.map((p) => (
              <button
                key={p.id}
                onClick={() => addToCart(p)}
                className="bg-white border border-slate-100 rounded-xl p-4 text-left hover:border-[#164E63] hover:shadow-md transition-all group"
              >
                <div className="w-10 h-10 bg-slate-100 group-hover:bg-cyan-50 rounded-lg flex items-center justify-center mb-3 transition-colors">
                  <Monitor
                    size={20}
                    className="text-slate-400 group-hover:text-[#164E63]"
                  />
                </div>
                <p className="text-sm font-semibold text-slate-800 leading-tight mb-1">
                  {p.name}
                </p>
                <p className="text-xs text-slate-400">
                  {p.category} · {p.subcategory}
                </p>
                <div className="flex items-center justify-between mt-3">
                  <span className="text-base font-bold text-[#164E63]">
                    ${p.sellPrice.toFixed(2)}
                  </span>
                  <span className="text-xs text-slate-400">
                    Stock: {p.stock}
                  </span>
                </div>
              </button>
            ))}
            {filteredProducts.length === 0 && (
              <div className="col-span-2 sm:col-span-3 flex flex-col items-center justify-center py-12 text-slate-400">
                <Monitor size={40} strokeWidth={1.2} />
                <p className="mt-2 text-sm">No products found</p>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Right: Cart & checkout */}
      <div className="w-full lg:w-80 bg-white rounded-xl border border-slate-100 shadow-sm flex flex-col">
        <div className="px-5 py-4 border-b border-slate-100">
          <h2 className="text-base font-semibold text-slate-800">
            Current Sale
          </h2>
        </div>

        {/* Customer */}
        <div className="px-4 py-3 border-b border-slate-100 space-y-2">
          <input
            placeholder="Customer name (optional)"
            value={customerName}
            onChange={(e) => setCustomerName(e.target.value)}
            className="w-full px-3 py-2 text-sm border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#164E63] transition-all"
          />
          <input
            placeholder="Customer # (optional)"
            value={customerNumber}
            onChange={(e) => setCustomerNumber(e.target.value)}
            className="w-full px-3 py-2 text-sm border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#164E63] transition-all"
          />
        </div>

        {/* Cart items */}
        <div className="flex-1 overflow-y-auto px-4 py-3 space-y-2">
          {cart.length === 0 ? (
            <div className="flex flex-col items-center justify-center h-full text-slate-300">
              <Plus size={32} strokeWidth={1.2} />
              <p className="text-sm mt-2">Add products</p>
            </div>
          ) : (
            cart.map((item) => (
              <div
                key={item.productId}
                className="flex items-center gap-2 bg-slate-50 rounded-lg p-2.5"
              >
                <div className="flex-1 min-w-0">
                  <p className="text-xs font-semibold text-slate-800 truncate">
                    {item.productName}
                  </p>
                  <p className="text-xs text-slate-400">
                    ${item.price.toFixed(2)} ea.
                  </p>
                </div>
                <div className="flex items-center gap-1">
                  <button
                    onClick={() => updateQty(item.productId, item.qty - 1)}
                    className="w-6 h-6 flex items-center justify-center rounded bg-white border border-slate-200 text-slate-600 hover:bg-slate-100 text-sm"
                  >
                    −
                  </button>
                  <span className="w-6 text-center text-sm font-semibold text-slate-800">
                    {item.qty}
                  </span>
                  <button
                    onClick={() => updateQty(item.productId, item.qty + 1)}
                    className="w-6 h-6 flex items-center justify-center rounded bg-white border border-slate-200 text-slate-600 hover:bg-slate-100 text-sm"
                  >
                    +
                  </button>
                </div>
                <span className="text-xs font-bold text-slate-700 w-14 text-right">
                  ${(item.price * item.qty).toFixed(2)}
                </span>
                <button
                  onClick={() => removeItem(item.productId)}
                  className="text-slate-300 hover:text-red-400 p-0.5 transition-colors"
                >
                  <X size={13} />
                </button>
              </div>
            ))
          )}
        </div>

        {/* Totals */}
        <div className="border-t border-slate-100 px-4 py-4 space-y-3">
          <div className="grid grid-cols-2 gap-2">
            <div>
              <label className="block text-xs text-slate-400 mb-1">
                Discount %
              </label>
              <input
                type="number"
                min="0"
                max="100"
                value={discountPct}
                onChange={(e) => setDiscountPct(+e.target.value)}
                className="w-full px-2.5 py-1.5 text-sm border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#164E63]"
              />
            </div>
            <div>
              <label className="block text-xs text-slate-400 mb-1">Tax %</label>
              <input
                type="number"
                min="0"
                max="100"
                value={taxPct}
                onChange={(e) => setTaxPct(+e.target.value)}
                className="w-full px-2.5 py-1.5 text-sm border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#164E63]"
              />
            </div>
          </div>

          <div className="space-y-1 text-sm">
            <div className="flex justify-between text-slate-500">
              <span>Subtotal</span>
              <span>${subtotal.toFixed(2)}</span>
            </div>
            <div className="flex justify-between text-green-600">
              <span>Discount</span>
              <span>-${discount.toFixed(2)}</span>
            </div>
            <div className="flex justify-between text-slate-500">
              <span>Tax</span>
              <span>${tax.toFixed(2)}</span>
            </div>
            <div className="flex justify-between font-bold text-base border-t border-slate-100 pt-2">
              <span className="text-slate-800">Total</span>
              <span className="text-[#164E63]">${grandTotal.toFixed(2)}</span>
            </div>
          </div>

          {/* Warehouse Location */}
          <div>
            <label className="block text-xs text-slate-400 mb-1">
              Warehouse Location
            </label>
            <select
              value={selectedLocation || ""}
              onChange={(e) => setSelectedLocation(Number(e.target.value))}
              className="w-full px-3 py-2 text-sm border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#164E63]"
            >
              <option value="">Select Location</option>
              {locations.map((loc) => (
                <option key={loc.locationId} value={loc.locationId}>
                  {loc.block}/{loc.aisle}/{loc.shelf}
                </option>
              ))}
            </select>
          </div>

          {/* Payment type */}
          <div className="flex gap-2">
            {["CASH", "CARD"].map((pm) => (
              <button
                key={pm}
                type="button"
                onClick={() => setPayment(pm)}
                className={`flex-1 py-2 rounded-lg text-sm font-semibold transition-all border ${
                  payment === pm
                    ? "bg-[#164E63] text-white border-[#164E63]"
                    : "bg-white text-slate-600 border-slate-200 hover:bg-slate-50"
                }`}
              >
                {pm}
              </button>
            ))}
          </div>

          <button
            onClick={handleCheckout}
            disabled={cart.length === 0 || saving}
            className="w-full py-3 rounded-lg bg-[#164E63] hover:bg-[#0E6680] text-white font-semibold text-sm transition-all disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {saving ? "Processing..." : `Checkout · $${grandTotal.toFixed(2)}`}
          </button>

          {receipt && (
            <div className="bg-emerald-50 border border-emerald-200 rounded-lg p-3 text-center">
              <p className="text-xs font-semibold text-emerald-700">
                ✓ Sale completed!
              </p>
              <p className="text-xs text-emerald-600 font-mono">{receipt.id}</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
