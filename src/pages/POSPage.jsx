import { useState, useEffect } from "react";
import { Search, Plus, Trash2, Monitor, X } from "lucide-react";
import { productService, salesService, stockService } from "../services/api";
import { PageLoader } from "../components/ui/Feedback";
import { useAuth } from "../hooks/useAuth";

function generateInvoiceId() {
  const now = new Date();
  const date = now.toISOString().slice(0, 10).replace(/-/g, "");
  const num = String(Math.floor(Math.random() * 9000) + 1000);
  return `SI-${date}-${num}`;
}

function ProductCard({ product, onAddToCart }) {
  const availableLocations = product.locations || [];
  const defaultLocationId = availableLocations.length > 0 ? availableLocations[0].locationId : "";
  const [selectedLocationId, setSelectedLocationId] = useState(defaultLocationId);

  const handleAdd = () => {
    if (!selectedLocationId) return;
    const selectedLoc = availableLocations.find(
      (l) => String(l.locationId) === String(selectedLocationId)
    );
    if (selectedLoc) {
      onAddToCart(product, selectedLoc);
    }
  };

  const selectedLocDetails = availableLocations.find(
    (l) => String(l.locationId) === String(selectedLocationId)
  );
  const currentStock = selectedLocDetails ? selectedLocDetails.quantity : 0;

  return (
    <div className="bg-white border border-slate-100 rounded-xl p-4 text-left hover:border-[#164E63] hover:shadow-md transition-all group flex flex-col h-full">
      <div className="flex-1 cursor-pointer" onClick={handleAdd}>
        <div className="w-10 h-10 bg-slate-100 group-hover:bg-cyan-50 rounded-lg flex items-center justify-center mb-3 transition-colors">
          <Monitor
            size={20}
            className="text-slate-400 group-hover:text-[#164E63]"
          />
        </div>
        <p className="text-sm font-semibold text-slate-800 leading-tight mb-1">
          {product.name}
        </p>
        <p className="text-xs text-slate-400">
          {product.category} · {product.subcategory}
        </p>
        <div className="flex items-center justify-between mt-3 mb-3">
          <span className="text-base font-bold text-[#164E63]">
            ${product.sellPrice.toFixed(2)}
          </span>
          <span className="text-xs text-slate-400">
            Stock: {currentStock}
          </span>
        </div>
      </div>
      <div className="mt-auto border-t border-slate-100 pt-3">
        <select
          value={selectedLocationId}
          onChange={(e) => setSelectedLocationId(e.target.value)}
          onClick={(e) => e.stopPropagation()}
          className="w-full px-2 py-1.5 text-xs font-medium border border-slate-200 rounded text-slate-700 bg-slate-50 focus:outline-none focus:ring-1 focus:ring-[#164E63] mb-2"
        >
          {availableLocations.map((loc) => (
            <option key={loc.locationId} value={loc.locationId}>
              {loc.locationName} ({loc.quantity})
            </option>
          ))}
        </select>
        <button
          onClick={(e) => {
            e.stopPropagation();
            handleAdd();
          }}
          disabled={!selectedLocationId || currentStock <= 0}
          className="w-full py-1.5 bg-slate-100 hover:bg-[#164E63] hover:text-white text-slate-600 rounded text-xs font-semibold transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
        >
          Add to Cart
        </button>
      </div>
    </div>
  );
}

export default function POSPage() {
  const { user } = useAuth();
  const [products, setProducts] = useState([]);
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
  const [error, setError] = useState("");

  useEffect(() => {
    Promise.all([
      productService.getAll(),
      stockService.getAll(),
    ])
      .then(([productsData, stocksData]) => {
        const productsWithLocations = productsData.map((p) => {
          const productStocks = stocksData.filter(
            (s) => s.productId === p.id && s.qty > 0
          );
          return {
            ...p,
            locations: productStocks.map((s) => ({
              locationId: s.locationId,
              locationName: s.locationCode || s.location,
              quantity: s.qty,
            })),
          };
        });

        const validProducts = productsWithLocations.filter(
          (p) => p.status === "Active" && p.locations.length > 0
        );
        setProducts(validProducts);
        setLoading(false);
      })
      .catch((err) => {
        console.error("Failed to load products and stock", err);
        setLoading(false);
      });
  }, []);

  const filteredProducts = products.filter(
    (p) =>
      search.length === 0 ||
      p.name.toLowerCase().includes(search.toLowerCase()) ||
      p.barcode?.includes(search),
  );

  const addToCart = (product, selectedLocation) => {
    const itemKey = `${product.id}-${selectedLocation.locationId}`;
    setCart((prev) => {
      const existing = prev.find((i) => i.itemKey === itemKey);
      if (existing) {
        if (existing.qty >= selectedLocation.quantity) return prev;
        return prev.map((i) =>
          i.itemKey === itemKey ? { ...i, qty: i.qty + 1 } : i,
        );
      }
      return [
        ...prev,
        {
          itemKey,
          productId: product.id,
          productName: product.name,
          locationId: selectedLocation.locationId,
          locationName: selectedLocation.locationName,
          maxQty: selectedLocation.quantity,
          price: product.sellPrice,
          qty: 1,
        },
      ];
    });
  };

  const updateQty = (itemKey, qty) => {
    if (qty < 1) {
      removeItem(itemKey);
      return;
    }
    setCart((prev) =>
      prev.map((i) => {
        if (i.itemKey === itemKey) {
          return { ...i, qty: Math.min(qty, i.maxQty) };
        }
        return i;
      }),
    );
  };

  const removeItem = (itemKey) => {
    setCart((prev) => prev.filter((i) => i.itemKey !== itemKey));
  };

  const subtotal = cart.reduce((sum, i) => sum + i.price * i.qty, 0);
  const discount = subtotal * (discountPct / 100);
  const tax = (subtotal - discount) * (taxPct / 100);
  const grandTotal = subtotal - discount + tax;

  const handleCheckout = async () => {
    if (cart.length === 0) return;
    setSaving(true);
    setError("");
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
          locationId: item.locationId,
          quantity: item.qty,
          discountPercent: 0,
        })),
        notes: `Subtotal: $${subtotal.toFixed(2)}, Discount: $${discount.toFixed(2)}, Tax: $${tax.toFixed(2)}`,
      });
      if (invoice) {
        setReceipt(invoice);
        setCart([]);
        setCustomerName("");
        setCustomerNumber("");
        setDiscountPct(0);
        setError("");
        setTimeout(() => setReceipt(null), 5000); // Auto hide receipt after 5 seconds
      } else {
        setError("Failed to process sale. Please try again.");
      }
    } catch (err) {
      setError(err.message || "Error processing sale. Please try again.");
      console.error("POS checkout error:", err);
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
              <ProductCard key={p.id} product={p} onAddToCart={addToCart} />
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
                key={item.itemKey}
                className="flex items-center gap-2 bg-slate-50 rounded-lg p-2.5"
              >
                <div className="flex-1 min-w-0">
                  <p className="text-xs font-semibold text-slate-800 truncate">
                    {item.productName}
                  </p>
                  <p className="text-[10px] text-slate-500 font-medium truncate mb-0.5">
                    {item.locationName}
                  </p>
                  <p className="text-xs text-slate-400">
                    ${item.price.toFixed(2)} ea.
                  </p>
                </div>
                <div className="flex items-center gap-1">
                  <button
                    onClick={() => updateQty(item.itemKey, item.qty - 1)}
                    className="w-6 h-6 flex items-center justify-center rounded bg-white border border-slate-200 text-slate-600 hover:bg-slate-100 text-sm"
                  >
                    −
                  </button>
                  <span className="w-6 text-center text-sm font-semibold text-slate-800">
                    {item.qty}
                  </span>
                  <button
                    onClick={() => updateQty(item.itemKey, item.qty + 1)}
                    className="w-6 h-6 flex items-center justify-center rounded bg-white border border-slate-200 text-slate-600 hover:bg-slate-100 text-sm"
                  >
                    +
                  </button>
                </div>
                <span className="text-xs font-bold text-slate-700 w-14 text-right">
                  ${(item.price * item.qty).toFixed(2)}
                </span>
                <button
                  onClick={() => removeItem(item.itemKey)}
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

          {/* Warehouse Location Input Removed for individual component locations */}

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

          {error && (
            <div className="bg-red-50 border border-red-200 rounded-lg px-3 py-2 text-xs text-red-600">
              {error}
            </div>
          )}

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
