import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { Search, Download, Plus, Pencil, Trash2, Package } from "lucide-react";
import { productService, categoryService } from "../services/api";
import { StatusBadge } from "../components/ui/Badge";
import {
  PageLoader,
  ConfirmModal,
  EmptyState,
} from "../components/ui/Feedback";
import Modal from "../components/ui/Modal";
import Button from "../components/ui/Button";
import Input from "../components/ui/Input";
import Select from "../components/ui/Select";

function ProductForm({
  initial,
  categories,
  subcategories,
  onSave,
  onClose,
  loading,
}) {
  const [form, setForm] = useState(
    initial || {
      serialNumber: "",
      productName: "",
      barcode: "",
      categoryId: "",
      subcategoryId: "",
      buyingPrice: "",
      sellingPrice: "",
      unit: "",
      reorderLevel: "",
      notes: "",
      isActive: true,
    },
  );
  const set = (k, v) => setForm((f) => ({ ...f, [k]: v }));

  const filtered = subcategories.filter((s) => {
    return s.categoryId === parseInt(form.categoryId);
  });

  return (
    <form
      onSubmit={(e) => {
        e.preventDefault();
        onSave(form);
      }}
      className="space-y-4"
    >
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <Input
          label="Serial Number"
          value={form.serialNumber}
          onChange={(e) => set("serialNumber", e.target.value)}
          placeholder="e.g. SN-001123"
        />
        <Input
          label="Product Name"
          value={form.productName}
          onChange={(e) => set("productName", e.target.value)}
          required
          placeholder="e.g. Samsung Galaxy A55"
        />
      </div>
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <Input
          label="Barcode"
          value={form.barcode}
          onChange={(e) => set("barcode", e.target.value)}
          placeholder="e.g. 8801643849023"
        />
        <Input
          label="Unit"
          value={form.unit}
          onChange={(e) => set("unit", e.target.value)}
          placeholder="e.g. PCS"
        />
      </div>
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <Select
          label="Category"
          value={form.categoryId}
          onChange={(e) => set("categoryId", e.target.value)}
        >
          <option value="">Select Category</option>
          {categories.map((c) => (
            <option key={c.categoryId} value={c.categoryId}>
              {c.categoryName}
            </option>
          ))}
        </Select>
        <Select
          label="Subcategory"
          value={form.subcategoryId}
          onChange={(e) => set("subcategoryId", e.target.value)}
        >
          <option value="">Select Subcategory</option>
          {filtered.map((s) => (
            <option key={s.subcategoryId} value={s.subcategoryId}>
              {s.subcategoryName}
            </option>
          ))}
        </Select>
      </div>
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <Input
          label="Buying Price ($)"
          type="number"
          min="0"
          step="0.01"
          value={form.buyingPrice}
          onChange={(e) => set("buyingPrice", e.target.value)}
          required
          placeholder="0.00"
        />
        <Input
          label="Selling Price ($)"
          type="number"
          min="0"
          step="0.01"
          value={form.sellingPrice}
          onChange={(e) => set("sellingPrice", e.target.value)}
          required
          placeholder="0.00"
        />
      </div>
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <Input
          label="Reorder Level"
          type="number"
          min="0"
          value={form.reorderLevel}
          onChange={(e) => set("reorderLevel", e.target.value)}
          placeholder="e.g. 10"
        />
        <Select
          label="Status"
          value={form.isActive ? "Active" : "Inactive"}
          onChange={(e) => set("isActive", e.target.value === "Active")}
        >
          <option value="Active">Active</option>
          <option value="Inactive">Inactive</option>
        </Select>
      </div>
      <Input
        label="Notes"
        value={form.notes}
        onChange={(e) => set("notes", e.target.value)}
        placeholder="Additional notes..."
      />
      <div className="flex gap-3 justify-end pt-2">
        <Button type="button" variant="secondary" onClick={onClose}>
          Cancel
        </Button>
        <Button type="submit" loading={loading}>
          Save Product
        </Button>
      </div>
    </form>
  );
}

export default function ProductsPage() {
  const navigate = useNavigate();
  const [products, setProducts] = useState([]);
  const [categories, setCategories] = useState([]);
  const [subcategories, setSubcategories] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [filterStatus, setFilterStatus] = useState("All Status");
  const [filterCat, setFilterCat] = useState("All");
  const [filterSub, setFilterSub] = useState("All");
  const [modal, setModal] = useState(null); // null | { mode: 'add'|'edit', product? }
  const [saving, setSaving] = useState(false);
  const [confirm, setConfirm] = useState(null);
  const [deleting, setDeleting] = useState(false);

  const load = async () => {
    setLoading(true);
    const [p, c] = await Promise.all([
      productService.getAll(),
      categoryService.getAll(),
    ]);
    // Collect all subcategories from all categories
    let allSubs = [];
    for (const cat of c) {
      const subs = await categoryService.getAllSubcategories(cat.categoryId);
      allSubs = [...allSubs, ...subs];
    }
    setProducts(p);
    setCategories(c);
    setSubcategories(allSubs);
    setLoading(false);
  };
  useEffect(() => {
    load();
  }, []);

  const filtered = products.filter((p) => {
    const q = search.toLowerCase();
    const productName = p.productName || "";
    const productId = String(p.productId || "");
    const barcode = p.barcode || "";
    const status = p.isActive ? "Active" : "Inactive";
    const category = p.categoryName || "";
    const subcategory = p.subcategoryName || "";

    if (
      q &&
      !productName.toLowerCase().includes(q) &&
      !productId.toLowerCase().includes(q) &&
      !barcode.toLowerCase().includes(q)
    )
      return false;
    if (filterStatus !== "All Status" && status !== filterStatus) return false;
    if (filterCat !== "All" && category !== filterCat) return false;
    if (filterSub !== "All" && subcategory !== filterSub) return false;
    return true;
  });

  // Helper to map API data to UI format
  const mapProduct = (p) => ({
    id: p.productId,
    productId: p.productId,
    serialNumber: p.serialNumber,
    name: p.productName,
    barcode: p.barcode,
    category: p.categoryName,
    categoryId: p.categoryId,
    subcategory: p.subcategoryName,
    subcategoryId: p.subcategoryId,
    buyPrice: p.buyingPrice,
    sellPrice: p.sellingPrice,
    status: p.isActive ? "Active" : "Inactive",
    isActive: p.isActive,
  });

  const handleSave = async (form) => {
    setSaving(true);
    try {
      const apiData = {
        serialNumber: form.serialNumber,
        productName: form.productName,
        categoryId: parseInt(form.categoryId),
        subcategoryId: parseInt(form.subcategoryId),
        buyingPrice: parseFloat(form.buyingPrice),
        sellingPrice: parseFloat(form.sellingPrice),
        barcode: form.barcode,
        unit: form.unit,
        reorderLevel: parseInt(form.reorderLevel) || 0,
        notes: form.notes,
        isActive: form.isActive,
      };
      if (modal.mode === "edit") {
        await productService.update(modal.product.id, apiData);
      } else {
        await productService.create(apiData);
      }
      await load();
      setModal(null);
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async () => {
    setDeleting(true);
    await productService.delete(confirm.id);
    await load();
    setConfirm(null);
    setDeleting(false);
  };

  if (loading) return <PageLoader />;

  return (
    <div className="space-y-4">
      <h1 className="text-2xl font-bold text-slate-800">Products List</h1>

      {/* Filters */}
      <div className="bg-white rounded-xl border border-slate-100 shadow-sm p-4 flex gap-3 flex-wrap">
        <div className="relative flex-1 min-w-48">
          <Search
            size={15}
            className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400"
          />
          <input
            placeholder="Search by Name / Serial / Barcode"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full pl-9 pr-3 py-2.5 text-sm border border-slate-200 rounded-lg bg-white focus:outline-none focus:ring-2 focus:ring-[#164E63] transition-all"
          />
        </div>
        <select
          value={filterStatus}
          onChange={(e) => setFilterStatus(e.target.value)}
          className="px-4 py-2.5 text-sm border border-slate-200 rounded-lg bg-white focus:outline-none focus:ring-2 focus:ring-[#164E63] min-w-32"
        >
          <option>All Status</option>
          <option>Active</option>
          <option>Inactive</option>
        </select>
        <select
          value={filterCat}
          onChange={(e) => setFilterCat(e.target.value)}
          className="px-4 py-2.5 text-sm border border-slate-200 rounded-lg bg-white focus:outline-none focus:ring-2 focus:ring-[#164E63] min-w-40"
        >
          <option value="All">Filter : Category</option>
          {categories.map((c) => (
            <option key={c.id} value={c.name}>
              {c.name}
            </option>
          ))}
        </select>
        <select
          value={filterSub}
          onChange={(e) => setFilterSub(e.target.value)}
          className="px-4 py-2.5 text-sm border border-slate-200 rounded-lg bg-white focus:outline-none focus:ring-2 focus:ring-[#164E63] min-w-44"
        >
          <option value="All">Filter : Subcategory</option>
          {subcategories.map((s) => (
            <option key={s.id} value={s.name}>
              {s.name}
            </option>
          ))}
        </select>
      </div>

      {/* Table card */}
      <div className="bg-white rounded-xl border border-slate-100 shadow-sm">
        <div className="flex items-center justify-between px-5 py-4 border-b border-slate-100">
          <h2 className="text-base font-semibold text-slate-800">Products</h2>
          <div className="flex flex-wrap gap-3">
            <button
              onClick={() => navigate("/categories")}
              className="px-4 py-2 text-sm border border-slate-200 rounded-lg hover:bg-slate-50 text-slate-600 transition-all"
            >
              Show All Categories
            </button>
            <button
              onClick={() => setModal({ mode: "add" })}
              className="flex items-center gap-2 px-4 py-2 text-sm bg-[#164E63] hover:bg-[#0E6680] text-white rounded-lg transition-all"
            >
              <Plus size={15} />  Add Product
            </button>
          </div>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-slate-50">
              <tr>
                {[
                  "SERIAL",
                  "PRODUCT",
                  "CATEGORY",
                  "SUBCATEGORY",
                  "BUY PRICE",
                  "SELL PRICE",
                  "STATUS",
                  "ACTIONS",
                ].map((h) => (
                  <th
                    key={h}
                    className="text-xs font-semibold text-slate-500 uppercase tracking-wider text-left px-5 py-3"
                  >
                    {h}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {filtered.length === 0 && (
                <tr>
                  <td colSpan={8}>
                    <EmptyState title="No products found" icon={Package} />
                  </td>
                </tr>
              )}
              {filtered.map((p) => {
                const mapped = mapProduct(p);
                return (
                  <tr
                    key={mapped.id}
                    className="border-t border-slate-100 hover:bg-slate-50 transition-colors"
                  >
                    <td className="px-5 py-3.5 text-sm text-slate-600 font-mono">
                      {mapped.serialNumber}
                    </td>
                    <td className="px-5 py-3.5 text-sm text-slate-800 font-medium max-w-48">
                      <div className="truncate">
                        {mapped.name} Barcode: {mapped.barcode?.slice(0, 5)}...
                      </div>
                    </td>
                    <td className="px-5 py-3.5 text-sm text-slate-600">
                      {mapped.category}
                    </td>
                    <td className="px-5 py-3.5 text-sm text-slate-600">
                      {mapped.subcategory}
                    </td>
                    <td className="px-5 py-3.5 text-sm text-slate-700">
                      ${Number(mapped.buyPrice).toFixed(2)}
                    </td>
                    <td className="px-5 py-3.5 text-sm text-slate-700">
                      ${Number(mapped.sellPrice).toFixed(2)}
                    </td>
                    <td className="px-5 py-3.5">
                      <StatusBadge status={mapped.status} />
                    </td>
                    <td className="px-5 py-3.5">
                      <div className="flex items-center gap-2">
                        <button
                          onClick={() =>
                            setModal({ mode: "edit", product: mapped })
                          }
                          className="text-slate-400 hover:text-[#164E63] transition-colors p-1"
                        >
                          <Pencil size={16} />
                        </button>
                        <button
                          onClick={() => setConfirm(mapped)}
                          className="text-slate-400 hover:text-red-500 transition-colors p-1"
                        >
                          <Trash2 size={16} />
                        </button>
                      </div>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>

      {/* Add/Edit Modal */}
      <Modal
        open={!!modal}
        onClose={() => setModal(null)}
        title={modal?.mode === "edit" ? "Edit Product" : "Add New Product"}
        size="lg"
      >
        <ProductForm
          initial={modal?.product}
          categories={categories}
          subcategories={subcategories}
          onSave={handleSave}
          onClose={() => setModal(null)}
          loading={saving}
        />
      </Modal>

      {/* Confirm delete */}
      <ConfirmModal
        open={!!confirm}
        onClose={() => setConfirm(null)}
        onConfirm={handleDelete}
        loading={deleting}
        title="Delete Product"
        message={`Are you sure you want to delete "${confirm?.name}"? This action cannot be undone.`}
      />
    </div>
  );
}
