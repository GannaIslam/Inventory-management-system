import { useState, useEffect } from "react";
import { Search, Plus, Pencil, Trash2, Users } from "lucide-react";
import { supplierService } from "../services/api";
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

function SupplierForm({ initial, onSave, onClose, loading }) {
  const [form, setForm] = useState(
    initial || {
      supplierCode: "",
      supplierName: "",
      email: "",
      phone: "",
      address: "",
      taxNumber: "",
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
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <Input
          label="Supplier Code"
          value={form.supplierCode}
          onChange={(e) => set("supplierCode", e.target.value)}
          required
          placeholder="e.g. SUP001"
        />
        <Input
          label="Supplier Name"
          value={form.supplierName}
          onChange={(e) => set("supplierName", e.target.value)}
          required
          placeholder="e.g. TechDistrib Global"
        />
      </div>
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <Input
          label="Email"
          type="email"
          value={form.email}
          onChange={(e) => set("email", e.target.value)}
          placeholder="e.g. contact@example.com"
        />
        <Input
          label="Phone"
          value={form.phone}
          onChange={(e) => set("phone", e.target.value)}
          placeholder="e.g. +20-100-123-4567"
        />
      </div>
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <Input
          label="Address"
          value={form.address}
          onChange={(e) => set("address", e.target.value)}
          placeholder="e.g. 123 Business St"
        />
        <Input
          label="Tax Number"
          value={form.taxNumber}
          onChange={(e) => set("taxNumber", e.target.value)}
          placeholder="e.g. EG-123456789"
        />
      </div>
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
          Save Supplier
        </Button>
      </div>
    </form>
  );
}

export default function SuppliersPage() {
  const [suppliers, setSuppliers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [filterStatus, setFilterStatus] = useState("All Status");
  const [modal, setModal] = useState(null);
  const [saving, setSaving] = useState(false);
  const [confirm, setConfirm] = useState(null);
  const [deleting, setDeleting] = useState(false);

  const load = async () => {
    setLoading(true);
    const data = await supplierService.getAll();
    setSuppliers(data);
    setLoading(false);
  };
  useEffect(() => {
    load();
  }, []);

  const filtered = suppliers.filter((s) => {
    const q = search.toLowerCase();
    if (
      q &&
      !s.supplierName.toLowerCase().includes(q) &&
      !s.email.toLowerCase().includes(q)
    )
      return false;
    if (filterStatus !== "All Status" && s.status !== filterStatus)
      return false;
    return true;
  });

  const handleSave = async (form) => {
    setSaving(true);
    try {
      if (modal.mode === "edit")
        await supplierService.update(modal.item.id, form);
      else await supplierService.create(form);
      await load();
      setModal(null);
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async () => {
    setDeleting(true);
    await supplierService.delete(confirm.id);
    await load();
    setConfirm(null);
    setDeleting(false);
  };

  if (loading) return <PageLoader />;

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold text-slate-800">Supplier List</h1>
        <button
          onClick={() => setModal({ mode: "add" })}
          className="flex items-center gap-2 px-4 py-2.5 text-sm bg-[#164E63] hover:bg-[#0E6680] text-white rounded-lg transition-all"
        >
          <Plus size={15} />  Add Supplier
        </button>
      </div>

      {/* Filters */}
      <div className="bg-white rounded-xl border border-slate-100 shadow-sm p-4 flex gap-3 flex-wrap">
        <div className="relative flex-1 min-w-48">
          <Search
            size={15}
            className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400"
          />
          <input
            placeholder="Search by supplier name or email"
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
      </div>

      {/* Table */}
      <div className="bg-white rounded-xl border border-slate-100 shadow-sm">
        <div className="px-5 py-4 border-b border-slate-100">
          <h2 className="text-base font-semibold text-slate-800">
            Suppliers{" "}
            <span className="text-slate-400 font-normal text-sm ml-1">
              ({filtered.length})
            </span>
          </h2>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-slate-50">
              <tr>
                {[
                  "ID",
                  "CODE",
                  "SUPPLIER NAME",
                  "EMAIL",
                  "PHONE",
                  "ADDRESS",
                  "TAX NUMBER",
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
                  <td colSpan={9}>
                    <EmptyState title="No suppliers found" icon={Users} />
                  </td>
                </tr>
              )}
              {filtered.map((s) => (
                <tr
                  key={s.id}
                  className="border-t border-slate-100 hover:bg-slate-50 transition-colors"
                >
                  <td className="px-5 py-3.5 text-sm font-mono text-slate-600">
                    {s.id}
                  </td>
                  <td className="px-5 py-3.5 text-sm font-semibold text-slate-800">
                    {s.supplierCode}
                  </td>
                  <td className="px-5 py-3.5 text-sm text-slate-600">
                    {s.supplierName}
                  </td>
                  <td className="px-5 py-3.5 text-sm text-slate-600">
                    {s.email}
                  </td>
                  <td className="px-5 py-3.5 text-sm text-slate-600 whitespace-nowrap">
                    {s.phone}
                  </td>
                  <td className="px-5 py-3.5 text-sm text-slate-600">
                    {s.address}
                  </td>
                  <td className="px-5 py-3.5 text-sm font-mono text-slate-600">
                    {s.taxNumber}
                  </td>
                  <td className="px-5 py-3.5">
                    <StatusBadge status={s.status} />
                  </td>
                  <td className="px-5 py-3.5">
                    <div className="flex items-center gap-2">
                      <button
                        onClick={() => setModal({ mode: "edit", item: s })}
                        className="text-slate-400 hover:text-[#164E63] transition-colors p-1"
                      >
                        <Pencil size={16} />
                      </button>
                      <button
                        onClick={() => setConfirm(s)}
                        className="text-slate-400 hover:text-red-500 transition-colors p-1"
                      >
                        <Trash2 size={16} />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      <Modal
        open={!!modal}
        onClose={() => setModal(null)}
        title={modal?.mode === "edit" ? "Edit Supplier" : "Add New Supplier"}
        size="lg"
      >
        <SupplierForm
          initial={modal?.item}
          onSave={handleSave}
          onClose={() => setModal(null)}
          loading={saving}
        />
      </Modal>

      <ConfirmModal
        open={!!confirm}
        onClose={() => setConfirm(null)}
        onConfirm={handleDelete}
        loading={deleting}
        title="Delete Supplier"
        message={`Delete "${confirm?.supplierName}"? This action cannot be undone.`}
      />
    </div>
  );
}
