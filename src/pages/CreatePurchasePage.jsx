import { useState, useEffect } from "react";
import { Plus, Trash2, ShoppingCart, Search } from "lucide-react";
import {
  productService,
  supplierService,
  purchaseService,
  locationService,
} from "../services/api";
import { PageLoader } from "../components/ui/Feedback";
import Input from "../components/ui/Input";
import Select from "../components/ui/Select";
import Button from "../components/ui/Button";

function generateInvoiceId() {
  const now = new Date();
  const date = now.toISOString().slice(0, 10).replace(/-/g, "");
  const num = String(Math.floor(Math.random() * 9000) + 1000);
  return `PI-${date}-${num}`;
}

export default function CreatePurchasePage() {
  const [products, setProducts] = useState([]);
  const [suppliers, setSuppliers] = useState([]);
  const [locations, setLocations] = useState([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);

  // Header
  const [supplierId, setSupplierId] = useState("");
  const [selectedLocation, setSelectedLocation] = useState(null);
  const [date, setDate] = useState(new Date().toISOString().slice(0, 10));
  const [notes, setNotes] = useState("");
  const [discountPct, setDiscountPct] = useState(0);
  const [taxPct, setTaxPct] = useState(10);

  // Line items
  const [items, setItems] = useState([]);
  const [productSearch, setProductSearch] = useState("");
  const [searchFocus, setSearchFocus] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => {
    Promise.all([
      productService.getAll(),
      supplierService.getAll(),
      locationService.getAll(),
    ]).then(([p, s, locs]) => {
      setProducts(p);
      const activeSup = s.filter((s) => s.status === "Active");
      setSuppliers(activeSup);
      setSupplierId(activeSup[0]?.supplierId || "");

      setLocations(locs);
      const defaultLoc = locs.find((l) => l.isActive);
      if (defaultLoc) setSelectedLocation(defaultLoc.locationId);

      setLoading(false);
    });
  }, []);

  const filteredProducts =
    productSearch.length > 0
      ? products.filter(
          (p) =>
            (p.name.toLowerCase().includes(productSearch.toLowerCase()) ||
              p.barcode?.includes(productSearch)) &&
            !items.find((i) => i.productId === p.productId),
        )
      : [];

  const addItem = (product) => {
    setItems((prev) => [
      ...prev,
      {
        productId: product.productId,
        productName: product.name,
        unitCost: product.buyPrice,
        qty: 1,
      },
    ]);
    setProductSearch("");
  };

  const updateItem = (idx, key, val) => {
    setItems((prev) =>
      prev.map((item, i) => (i === idx ? { ...item, [key]: val } : item)),
    );
  };

  const removeItem = (idx) => {
    setItems((prev) => prev.filter((_, i) => i !== idx));
  };

  const subtotal = items.reduce((sum, i) => sum + i.unitCost * i.qty, 0);
  const discount = subtotal * (discountPct / 100);
  const tax = (subtotal - discount) * (taxPct / 100);
  const grandTotal = subtotal - discount + tax;

  const selectedSupplier = suppliers.find((s) => s.supplierId === supplierId);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    if (items.length === 0) {
      setError("Add at least one product.");
      return;
    }
    if (!selectedLocation) {
      setError("Please select a warehouse location.");
      return;
    }
    setSaving(true);
    try {
      // Build request per OpenAPI CreatePurchaseInvoiceDTO spec
      const result = await purchaseService.create({
        invoiceNumber: generateInvoiceId(),
        supplierId: parseInt(supplierId),
        invoiceDate: date,
        notes,
        lines: items.map((item) => ({
          productId: item.productId,
          locationId: selectedLocation,
          quantity: item.qty,
          unitBuyingPrice: item.unitCost,
          discountPercent: 0,
        })),
      });
      if (result) {
        setSaved(true);
        setItems([]);
        setNotes("");
        setError("");
        setTimeout(() => setSaved(false), 5000); // Auto hide success after 5 seconds
      } else {
        setError(
          "Failed to save purchase invoice. Please check the form and try again.",
        );
      }
    } catch (err) {
      setError(
        err.message || "Error saving purchase invoice. Please try again.",
      );
    } finally {
      setSaving(false);
    }
  };

  if (loading) return <PageLoader />;

  return (
    <div className="space-y-5 ">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold text-slate-800">
          Create Purchase Invoice
        </h1>
        {saved && (
          <div className="flex items-center gap-2 bg-emerald-50 border border-emerald-200 text-emerald-700 rounded-lg px-4 py-2 text-sm font-medium">
            ✓ Purchase invoice saved successfully!
          </div>
        )}
      </div>

      {error && (
        <div className="flex items-center gap-2 bg-red-50 border border-red-200 text-red-700 rounded-lg px-4 py-2.5 text-sm font-medium">
          <span>⚠️</span> {error}
        </div>
      )}

      <form onSubmit={handleSubmit} className="space-y-5">
        {/* Invoice Header */}
        <div className="bg-white rounded-xl border border-slate-100 shadow-sm p-5 space-y-4">
          <h2 className="text-sm font-semibold text-slate-700 uppercase tracking-wide">
            Invoice Details
          </h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-medium text-slate-600 mb-1.5">
                Supplier *
              </label>
              <select
                value={supplierId}
                onChange={(e) => setSupplierId(e.target.value)}
                required
                className="w-full px-3 py-2.5 text-sm border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#164E63] transition-all bg-white"
              >
                {suppliers.map((s) => (
                  <option key={s.supplierId} value={s.supplierId}>
                    {s.supplierName}
                  </option>
                ))}
              </select>
            </div>
            <div>
              <label className="block text-xs font-medium text-slate-600 mb-1.5">
                Warehouse Location *
              </label>
              <select
                value={selectedLocation || ""}
                onChange={(e) => setSelectedLocation(Number(e.target.value))}
                required
                className="w-full px-3 py-2.5 text-sm border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#164E63] transition-all bg-white"
              >
                <option value="">Select Location</option>
                {locations.map((loc) => (
                  <option key={loc.locationId} value={loc.locationId}>
                    {loc.block}/{loc.aisle}/{loc.shelf}
                  </option>
                ))}
              </select>
            </div>
            <Input
              label="Invoice Date"
              type="date"
              value={date}
              onChange={(e) => setDate(e.target.value)}
              required
            />
            <Input
              label="Notes"
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              placeholder="Optional notes..."
            />
          </div>
        </div>

        {/* Line Items */}
        <div className="bg-white rounded-xl border border-slate-100 shadow-sm p-5 space-y-4">
          <h2 className="text-sm font-semibold text-slate-700 uppercase tracking-wide">
            Products
          </h2>

          {/* Search to add product */}
          <div className="relative">
            <Search
              size={15}
              className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400"
            />
            <input
              placeholder="Type to search and add product..."
              value={productSearch}
              onChange={(e) => {
                setProductSearch(e.target.value);
                setSaved(false);
              }}
              onFocus={() => setSearchFocus(true)}
              onBlur={() => setTimeout(() => setSearchFocus(false), 150)}
              className="w-full pl-9 pr-3 py-2.5 text-sm border border-slate-200 rounded-lg bg-white focus:outline-none focus:ring-2 focus:ring-[#164E63] transition-all"
            />
            {searchFocus && filteredProducts.length > 0 && (
              <div className="absolute top-full left-0 right-0 mt-1 bg-white border border-slate-200 rounded-lg shadow-lg z-10 overflow-hidden max-h-48 overflow-y-auto">
                {filteredProducts.map((p) => (
                  <button
                    key={p.productId}
                    type="button"
                    onMouseDown={() => addItem(p)}
                    className="w-full flex items-center justify-between px-4 py-3 text-sm hover:bg-slate-50 transition-colors text-left"
                  >
                    <div>
                      <p className="font-medium text-slate-800">{p.name}</p>
                      <p className="text-xs text-slate-400">
                        {p.serialNumber} · {p.category}
                      </p>
                    </div>
                    <span className="text-[#164E63] font-semibold">
                      ${p.buyPrice.toFixed(2)}
                    </span>
                  </button>
                ))}
              </div>
            )}
          </div>

          {/* Items table */}
          {items.length > 0 ? (
            <div className="border border-slate-100 rounded-lg overflow-hidden">
              <table className="w-full">
                <thead className="bg-slate-50">
                  <tr>
                    {["PRODUCT", "UNIT COST ($)", "QTY", "LINE TOTAL", ""].map(
                      (h) => (
                        <th
                          key={h}
                          className="text-xs font-semibold text-slate-500 uppercase tracking-wider text-left px-4 py-3"
                        >
                          {h}
                        </th>
                      ),
                    )}
                  </tr>
                </thead>
                <tbody>
                  {items.map((item, idx) => (
                    <tr
                      key={item.productId}
                      className="border-t border-slate-100"
                    >
                      <td className="px-4 py-3 text-sm font-medium text-slate-800">
                        {item.productName}
                      </td>
                      <td className="px-4 py-3">
                        <input
                          type="number"
                          min="0"
                          step="0.01"
                          value={item.unitCost}
                          onChange={(e) =>
                            updateItem(
                              idx,
                              "unitCost",
                              parseFloat(e.target.value) || 0,
                            )
                          }
                          className="w-28 px-3 py-1.5 text-sm border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#164E63]"
                        />
                      </td>
                      <td className="px-4 py-3">
                        <input
                          type="number"
                          min="1"
                          value={item.qty}
                          onChange={(e) =>
                            updateItem(
                              idx,
                              "qty",
                              parseInt(e.target.value) || 1,
                            )
                          }
                          className="w-20 px-3 py-1.5 text-sm border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#164E63]"
                        />
                      </td>
                      <td className="px-4 py-3 text-sm font-semibold text-slate-800">
                        ${(item.unitCost * item.qty).toFixed(2)}
                      </td>
                      <td className="px-4 py-3">
                        <button
                          type="button"
                          onClick={() => removeItem(idx)}
                          className="text-slate-400 hover:text-red-500 transition-colors p-1"
                        >
                          <Trash2 size={15} />
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          ) : (
            <div className="flex flex-col items-center justify-center py-10 text-slate-400 border-2 border-dashed border-slate-100 rounded-lg">
              <ShoppingCart size={32} strokeWidth={1.2} />
              <p className="mt-2 text-sm">
                Search above to add products to this invoice
              </p>
            </div>
          )}
        </div>

        {/* Totals & Controls */}
        <div className="grid grid-cols-1 lg:grid-cols-5 gap-5">
          <div className="col-span-1 lg:col-span-3 bg-white rounded-xl border border-slate-100 shadow-sm p-5 space-y-3">
            <h2 className="text-sm font-semibold text-slate-700 uppercase tracking-wide">
              Pricing
            </h2>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-medium text-slate-600 mb-1.5">
                  Discount (%)
                </label>
                <input
                  type="number"
                  min="0"
                  max="100"
                  value={discountPct}
                  onChange={(e) => setDiscountPct(+e.target.value)}
                  className="w-full px-3 py-2.5 text-sm border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#164E63]"
                />
              </div>
              <div>
                <label className="block text-xs font-medium text-slate-600 mb-1.5">
                  Tax (%)
                </label>
                <input
                  type="number"
                  min="0"
                  max="100"
                  value={taxPct}
                  onChange={(e) => setTaxPct(+e.target.value)}
                  className="w-full px-3 py-2.5 text-sm border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#164E63]"
                />
              </div>
            </div>
          </div>

          <div className="col-span-1 lg:col-span-2 bg-white rounded-xl border border-slate-100 shadow-sm p-5 space-y-3">
            <h2 className="text-sm font-semibold text-slate-700 uppercase tracking-wide mb-4">
              Summary
            </h2>
            <div className="space-y-2 text-sm">
              <div className="flex justify-between">
                <span className="text-slate-500">Subtotal</span>
                <span>${subtotal.toFixed(2)}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-500">
                  Discount ({discountPct}%)
                </span>
                <span className="text-green-600">-${discount.toFixed(2)}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-500">Tax ({taxPct}%)</span>
                <span>${tax.toFixed(2)}</span>
              </div>
              <div className="flex justify-between border-t border-slate-100 pt-2 font-bold text-base">
                <span className="text-slate-800">Grand Total</span>
                <span className="text-[#164E63]">${grandTotal.toFixed(2)}</span>
              </div>
            </div>
            <Button
              type="submit"
              loading={saving}
              className="w-full mt-4 justify-center"
            >
              <ShoppingCart size={16} className="mr-2" />
              Save Purchase Invoice
            </Button>
          </div>
        </div>
      </form>
    </div>
  );
}
