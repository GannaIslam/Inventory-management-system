import { useState, useEffect } from "react";
import { Search, Plus, Pencil, Trash2, MapPin } from "lucide-react";
import { locationService, stockService } from "../services/api";
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

function LocationForm({ initial, onSave, onClose, loading }) {
  const [form, setForm] = useState(
    initial
      ? { ...initial, maxCapacity: initial.maxCapacity ?? "" }
      : {
          block: "",
          aisle: "",
          shelf: "",
          description: "",
          maxCapacity: "",
          status: "Active",
        },
  );
  const set = (k, v) => setForm((f) => ({ ...f, [k]: v }));

  const location =
    form.block && form.aisle && form.shelf
      ? `${form.block}-${form.aisle}-${form.shelf}`
      : "";

  const handleSubmit = (e) => {
    e.preventDefault();
    const isActive = form.status === "Active";
    onSave({
      block: form.block,
      aisle: form.aisle,
      shelf: form.shelf,
      locationCode: location,
      description: form.description,
      maxCapacity: form.maxCapacity !== "" && form.maxCapacity !== null && form.maxCapacity !== undefined
        ? parseInt(form.maxCapacity, 10)
        : null,
      isActive,
    });
  };


  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <Input
          label="Block"
          value={form.block}
          onChange={(e) => set("block", e.target.value)}
          required
          placeholder="e.g. B1"
        />
        <Input
          label="Aisle"
          value={form.aisle}
          onChange={(e) => set("aisle", e.target.value)}
          required
          placeholder="e.g. A3"
        />
        <Input
          label="Shelf"
          value={form.shelf}
          onChange={(e) => set("shelf", e.target.value)}
          required
          placeholder="e.g. 05"
        />
      </div>
      {location && (
        <div className="bg-slate-50 rounded-lg px-4 py-2.5 text-sm text-slate-600">
          Location code:{" "}
          <span className="font-mono font-semibold text-slate-800">
            {location}
          </span>
        </div>
      )}
      <Input
        label="Description"
        value={form.description}
        onChange={(e) => set("description", e.target.value)}
        placeholder="e.g. Main Electronics Shelf"
      />
      <Input
        label="Max Capacity (units)"
        type="number"
        min="1"
        value={form.maxCapacity}
        onChange={(e) => set("maxCapacity", e.target.value)}
        required
        placeholder="e.g. 200"
      />
      <Select
        label="Status"
        value={form.status}
        onChange={(e) => set("status", e.target.value)}
      >
        <option>Active</option>
        <option>Inactive</option>
      </Select>
      <div className="flex gap-3 justify-end pt-2">
        <Button type="button" variant="secondary" onClick={onClose}>
          Cancel
        </Button>
        <Button type="submit" loading={loading}>
          Save Location
        </Button>
      </div>
    </form>
  );
}

export default function WarehouseLocationsPage() {
  const [locations, setLocations] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [filterStatus, setFilterStatus] = useState("All Status");
  const [modal, setModal] = useState(null);
  const [saving, setSaving] = useState(false);
  const [confirm, setConfirm] = useState(null);
  const [deleting, setDeleting] = useState(false);
  const [stock, setStock] = useState([]);

  const load = async () => {
    setLoading(true);
    try {
      const [locData, stockData] = await Promise.all([
        locationService.getAll(),
        stockService.getAll()
      ]);
      setLocations(locData || []);
      setStock(stockData || []);
    } catch (err) {
      console.error("Failed to load locations", err);
    }
    setLoading(false);
  };
  useEffect(() => {
    load();
  }, []);

  const filtered = locations.filter((l) => {
    const q = search.toLowerCase();
    if (
      q &&
      !l.location.toLowerCase().includes(q) &&
      !l.description.toLowerCase().includes(q)
    )
      return false;
    if (filterStatus !== "All Status" && l.status !== filterStatus)
      return false;
    return true;
  });

  const handleSave = async (form) => {
    setSaving(true);
    try {
      if (modal.mode === "edit")
        await locationService.update(modal.item.id, form);
      else await locationService.create(form);
      await load();
      setModal(null);
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async () => {
    setDeleting(true);
    await locationService.delete(confirm.id);
    await load();
    setConfirm(null);
    setDeleting(false);
  };

  if (loading) return <PageLoader />;

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold text-slate-800">Stock Locations</h1>
        <button
          onClick={() => setModal({ mode: "add" })}
          className="flex items-center gap-2 px-4 py-2.5 text-sm bg-[#164E63] hover:bg-[#0E6680] text-white rounded-lg transition-all"
        >
          <Plus size={15} />  Add Location
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
            placeholder="Search by location code or description"
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
            Warehouse Locations{" "}
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
                  "LOCATION",
                  "BLOCK",
                  "AISLE",
                  "SHELF",
                  "DESCRIPTION",
                  "MAX CAPACITY",
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
                    <EmptyState title="No locations found" icon={MapPin} />
                  </td>
                </tr>
              )}
              {filtered.map((l) => (
                <tr
                  key={l.id}
                  className="border-t border-slate-100 hover:bg-slate-50 transition-colors"
                >
                  <td className="px-5 py-3.5 text-sm font-mono font-semibold text-slate-700">
                    {l.location}
                  </td>
                  <td className="px-5 py-3.5 text-sm text-slate-600">
                    {l.block}
                  </td>
                  <td className="px-5 py-3.5 text-sm text-slate-600">
                    {l.aisle}
                  </td>
                  <td className="px-5 py-3.5 text-sm text-slate-600">
                    {l.shelf}
                  </td>
                  <td className="px-5 py-3.5 text-sm text-slate-600 max-w-48">
                    <div className="truncate">{l.description}</div>
                  </td>
                  <td className="px-5 py-3.5 text-sm text-slate-700">
                    {l.maxCapacity > 0 ? l.maxCapacity.toLocaleString() : <span className="text-slate-400">—</span>}
                  </td>
                  <td className="px-5 py-3.5">
                    <StatusBadge status={l.status} />
                  </td>
                  <td className="px-5 py-3.5">
                    <div className="flex items-center gap-2">
                       {/* Wrap row content in IIFE or just use variable if you can't, oh wait, I can just compute inside the array map */}
                      <button
                        onClick={() => setModal({ mode: "edit", item: l })}
                        className="text-slate-400 hover:text-[#164E63] transition-colors p-1"
                      >
                        <Pencil size={16} />
                      </button>
                      {(() => {
                        const locationStock = stock.filter((s) => s.locationId === l.id && s.qty > 0).length;
                        const isEmpty = locationStock === 0;
                        return (
                          <button
                            onClick={() => isEmpty && setConfirm(l)}
                            disabled={!isEmpty}
                            title={!isEmpty ? "Cannot delete location with active stock" : "Delete location"}
                            className={`${!isEmpty ? "text-slate-300 cursor-not-allowed" : "text-slate-400 hover:text-red-500"} transition-colors p-1`}
                          >
                            <Trash2 size={16} />
                          </button>
                        );
                      })()}
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
        title={modal?.mode === "edit" ? "Edit Location" : "Add New Location"}
        size="lg"
      >
        <LocationForm
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
        title="Delete Location"
        message={`Delete location "${confirm?.location}"? This action cannot be undone.`}
      />
    </div>
  );
}
