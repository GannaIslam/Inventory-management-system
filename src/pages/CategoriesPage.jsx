import { useState, useEffect } from "react";
import { Search, Plus, Pencil, Trash2, Tag } from "lucide-react";
import { categoryService } from "../services/api";
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

function CategoryForm({ initial, onSave, onClose, loading }) {
  const [form, setForm] = useState(
    initial || { categoryCode: "", categoryName: "", isActive: true },
  );
  const set = (k, v) => setForm((f) => ({ ...f, [k]: v }));
  return (
    <form
      onSubmit={(e) => {
        e.preventDefault();
        onSave(form);
      }}
      className="space-y-4"
    >
      <Input
        label="Category Code"
        value={form.categoryCode}
        onChange={(e) => set("categoryCode", e.target.value)}
        required
        placeholder="e.g. ELEC"
      />
      <Input
        label="Category Name"
        value={form.categoryName}
        onChange={(e) => set("categoryName", e.target.value)}
        required
        placeholder="e.g. Electronics"
      />
      <Select
        label="Status"
        value={form.isActive ? "Active" : "Inactive"}
        onChange={(e) => set("isActive", e.target.value === "Active")}
      >
        <option value="Active">Active</option>
        <option value="Inactive">Inactive</option>
      </Select>
      <div className="flex gap-3 justify-end pt-2">
        <Button type="button" variant="secondary" onClick={onClose}>
          Cancel
        </Button>
        <Button type="submit" loading={loading}>
          Save
        </Button>
      </div>
    </form>
  );
}

function SubcategoryForm({ initial, categories, onSave, onClose, loading }) {
  const [form, setForm] = useState(
    initial || {
      subcategoryCode: "",
      subcategoryName: "",
      categoryId: categories[0]?.categoryId || "",
      isActive: true,
    },
  );
  const set = (k, v) => setForm((f) => ({ ...f, [k]: v }));
  return (
    <form
      onSubmit={(e) => {
        e.preventDefault();
        onSave(form);
      }}
      className="space-y-4"
    >
      <Input
        label="Subcategory Code"
        value={form.subcategoryCode}
        onChange={(e) => set("subcategoryCode", e.target.value)}
        placeholder="e.g. SMART"
      />
      <Input
        label="Subcategory Name"
        value={form.subcategoryName}
        onChange={(e) => set("subcategoryName", e.target.value)}
        required
        placeholder="e.g. Smartphones"
      />
      <Select
        label="Parent Category"
        value={form.categoryId}
        onChange={(e) => set("categoryId", e.target.value)}
      >
        {categories.map((c) => (
          <option key={c.categoryId} value={c.categoryId}>
            {c.categoryName}
          </option>
        ))}
      </Select>
      <Select
        label="Status"
        value={form.isActive ? "Active" : "Inactive"}
        onChange={(e) => set("isActive", e.target.value === "Active")}
      >
        <option value="Active">Active</option>
        <option value="Inactive">Inactive</option>
      </Select>
      <div className="flex gap-3 justify-end pt-2">
        <Button type="button" variant="secondary" onClick={onClose}>
          Cancel
        </Button>
        <Button type="submit" loading={loading}>
          Save
        </Button>
      </div>
    </form>
  );
}

export default function CategoriesPage() {
  const [categories, setCategories] = useState([]);
  const [subcategories, setSubcategories] = useState([]);
  const [loading, setLoading] = useState(true);
  const [catSearch, setCatSearch] = useState("");
  const [subSearch, setSubSearch] = useState("");
  const [catModal, setCatModal] = useState(null);
  const [subModal, setSubModal] = useState(null);
  const [saving, setSaving] = useState(false);
  const [confirm, setConfirm] = useState(null);
  const [deleting, setDeleting] = useState(false);

  const load = async () => {
    setLoading(true);
    const c = await categoryService.getAll();
    // Collect all subcategories from all categories
    let allSubs = [];
    for (const cat of c) {
      const subs = await categoryService.getAllSubcategories(cat.categoryId);
      allSubs = [...allSubs, ...subs];
    }
    setCategories(c);
    setSubcategories(allSubs);
    setLoading(false);
  };
  useEffect(() => {
    load();
  }, []);

  const filteredCat = categories.filter((c) =>
    c.categoryName.toLowerCase().includes(catSearch.toLowerCase()),
  );
  const filteredSub = subcategories.filter((s) =>
    s.subcategoryName.toLowerCase().includes(subSearch.toLowerCase()),
  );

  const handleCatSave = async (form) => {
    setSaving(true);
    try {
      if (catModal.mode === "edit")
        await categoryService.update(catModal.item.categoryId, form);
      else await categoryService.create(form);
      await load();
      setCatModal(null);
    } finally {
      setSaving(false);
    }
  };

  const handleSubSave = async (form) => {
    setSaving(true);
    try {
      if (subModal.mode === "edit")
        await categoryService.updateSubcategory(
          subModal.item.subcategoryId,
          form,
        );
      else await categoryService.createSubcategory(form);
      await load();
      setSubModal(null);
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async () => {
    setDeleting(true);
    if (confirm.type === "cat")
      await categoryService.delete(confirm.item.categoryId);
    else await categoryService.deleteSubcategory(confirm.item.subcategoryId);
    await load();
    setConfirm(null);
    setDeleting(false);
  };

  if (loading) return <PageLoader />;

  return (
    <div className="space-y-4">
      <h1 className="text-2xl font-bold text-slate-800">
        Categories & Subcategories
      </h1>
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        {/* Categories */}
        <div className="bg-white rounded-xl border border-slate-100 shadow-sm">
          <div className="flex items-center justify-between px-5 py-4 border-b border-slate-100">
            <h2 className="text-base font-semibold text-slate-800">
              Categories
            </h2>
            <button
              onClick={() => setCatModal({ mode: "add" })}
              className="flex items-center gap-1.5 px-3 py-1.5 text-sm bg-[#164E63] hover:bg-[#0E6680] text-white rounded-lg transition-all"
            >
              <Plus size={14} /> + Add
            </button>
          </div>
          <div className="px-4 py-3 border-b border-slate-50">
            <div className="relative">
              <Search
                size={14}
                className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400"
              />
              <input
                value={catSearch}
                onChange={(e) => setCatSearch(e.target.value)}
                placeholder="Search Categories"
                className="w-full pl-8 pr-3 py-2 text-sm border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#164E63] transition-all"
              />
            </div>
          </div>
          <div>
            <div className="grid grid-cols-2 px-5 py-2.5 bg-slate-50 text-xs font-semibold uppercase text-slate-500 tracking-wider">
              <span>Name</span>
              <span className="text-right">ACTIONS</span>
            </div>
            <div className="divide-y divide-slate-50">
              {filteredCat.length === 0 && (
                <EmptyState title="No categories" icon={Tag} />
              )}
              {filteredCat.map((c) => (
                <div
                  key={c.categoryId}
                  className="flex items-center justify-between px-5 py-3.5 hover:bg-slate-50 transition-colors"
                >
                  <span className="text-sm font-medium text-slate-800">
                    {c.categoryName}
                  </span>
                  <div className="flex items-center gap-2">
                    <button
                      onClick={() => setCatModal({ mode: "edit", item: c })}
                      className="text-slate-400 hover:text-[#164E63] p-1 transition-colors"
                    >
                      <Pencil size={15} />
                    </button>
                    <button
                      onClick={() => setConfirm({ type: "cat", item: c })}
                      className="text-slate-400 hover:text-red-500 p-1 transition-colors"
                    >
                      <Trash2 size={15} />
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Subcategories */}
        <div className="bg-white rounded-xl border border-slate-100 shadow-sm">
          <div className="flex items-center justify-between px-5 py-4 border-b border-slate-100">
            <h2 className="text-base font-semibold text-slate-800">
              Subcategories
            </h2>
            <button
              onClick={() => setSubModal({ mode: "add" })}
              className="flex items-center gap-1.5 px-3 py-1.5 text-sm bg-[#164E63] hover:bg-[#0E6680] text-white rounded-lg transition-all"
            >
              <Plus size={14} /> + Add
            </button>
          </div>
          <div className="px-4 py-3 border-b border-slate-50">
            <div className="relative">
              <Search
                size={14}
                className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400"
              />
              <input
                value={subSearch}
                onChange={(e) => setSubSearch(e.target.value)}
                placeholder="Search Subcategories"
                className="w-full pl-8 pr-3 py-2 text-sm border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#164E63] transition-all"
              />
            </div>
          </div>
          <div>
            <div className="grid grid-cols-2 px-5 py-2.5 bg-slate-50 text-xs font-semibold uppercase text-slate-500 tracking-wider">
              <span>Name</span>
              <span className="text-right">ACTIONS</span>
            </div>
            <div className="divide-y divide-slate-50">
              {filteredSub.length === 0 && (
                <EmptyState title="No subcategories" icon={Tag} />
              )}
              {filteredSub.map((s) => {
                const cat = categories.find(
                  (c) => c.categoryId === s.categoryId,
                );
                return (
                  <div
                    key={s.subcategoryId}
                    className="flex items-center justify-between px-5 py-3.5 hover:bg-slate-50 transition-colors"
                  >
                    <div>
                      <p className="text-sm font-medium text-slate-800">
                        {s.subcategoryName}
                      </p>
                      <p className="text-xs text-slate-400">
                        {cat?.categoryName}
                      </p>
                    </div>
                    <div className="flex items-center gap-2">
                      <button
                        onClick={() => setSubModal({ mode: "edit", item: s })}
                        className="text-slate-400 hover:text-[#164E63] p-1 transition-colors"
                      >
                        <Pencil size={15} />
                      </button>
                      <button
                        onClick={() => setConfirm({ type: "sub", item: s })}
                        className="text-slate-400 hover:text-red-500 p-1 transition-colors"
                      >
                        <Trash2 size={15} />
                      </button>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      </div>

      <Modal
        open={!!catModal}
        onClose={() => setCatModal(null)}
        title={catModal?.mode === "edit" ? "Edit Category" : "Add Category"}
      >
        <CategoryForm
          initial={catModal?.item}
          onSave={handleCatSave}
          onClose={() => setCatModal(null)}
          loading={saving}
        />
      </Modal>
      <Modal
        open={!!subModal}
        onClose={() => setSubModal(null)}
        title={
          subModal?.mode === "edit" ? "Edit Subcategory" : "Add Subcategory"
        }
      >
        <SubcategoryForm
          initial={subModal?.item}
          categories={categories}
          onSave={handleSubSave}
          onClose={() => setSubModal(null)}
          loading={saving}
        />
      </Modal>
      <ConfirmModal
        open={!!confirm}
        onClose={() => setConfirm(null)}
        onConfirm={handleDelete}
        loading={deleting}
        title="Delete"
        message={`Delete "${confirm?.type === "cat" ? confirm?.item?.categoryName : confirm?.item?.subcategoryName}"? This cannot be undone.`}
      />
    </div>
  );
}
