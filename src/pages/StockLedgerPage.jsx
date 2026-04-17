import { useState, useEffect } from "react";
import { Search, BookOpen, ArrowRightLeft } from "lucide-react";
import { stockService, locationService } from "../services/api";
import { PageLoader, EmptyState } from "../components/ui/Feedback";
import Modal from "../components/ui/Modal";
import Button from "../components/ui/Button";
import Select from "../components/ui/Select";

function TransferForm({ item, locations, onSave, onClose, loading }) {
  const [targetLocationId, setTargetLocationId] = useState(
    item?.locationId || "",
  );
  const [quantity, setQuantity] = useState(item?.qty || 1);
  const [error, setError] = useState("");

  const handleSubmit = (e) => {
    e.preventDefault();
    setError("");

    if (!targetLocationId) {
      setError("Please select a target location");
      return;
    }

    const qty = parseInt(quantity);
    if (isNaN(qty) || qty <= 0) {
      setError("Quantity must be greater than 0");
      return;
    }

    if (qty > item?.qty) {
      setError(`Cannot transfer more than ${item?.qty} units available`);
      return;
    }

    onSave(targetLocationId, qty);
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div className="bg-slate-50 rounded-lg p-4 space-y-1">
        <p className="text-sm font-semibold text-slate-800">{item?.product}</p>
        <p className="text-xs text-slate-500">
          Current Location:{" "}
          <span className="font-mono font-semibold text-[#164E63]">
            {item?.location}
          </span>
        </p>
        <p className="text-xs text-slate-500">
          Available Stock:{" "}
          <span className="font-semibold">{item?.qty} units</span>
        </p>
      </div>

      <div>
        <label className="block text-xs font-medium text-slate-600 mb-1.5">
          Quantity to Transfer *
        </label>
        <input
          type="number"
          min="1"
          max={item?.qty}
          value={quantity}
          onChange={(e) => {
            setQuantity(e.target.value);
            setError("");
          }}
          className="w-full px-3 py-2.5 text-sm border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#164E63] transition-all"
          required
        />
        <p className="text-xs text-slate-400 mt-1">Max: {item?.qty} units</p>
      </div>

      <Select
        label="Transfer to Location"
        value={targetLocationId}
        onChange={(e) => setTargetLocationId(e.target.value)}
      >
        <option value="">Select Location</option>
        {locations.map((l) => (
          <option key={l.id} value={l.id}>
            {l.location} — {l.description}
          </option>
        ))}
      </Select>

      {error && (
        <div className="bg-red-50 border border-red-200 rounded-lg px-3 py-2 text-xs text-red-600">
          {error}
        </div>
      )}

      <div className="flex gap-3 justify-end pt-2">
        <Button type="button" variant="secondary" onClick={onClose}>
          Cancel
        </Button>
        <Button type="submit" loading={loading}>
          Transfer Stock
        </Button>
      </div>
    </form>
  );
}

function StockLevelBar({ qty, reorder }) {
  const ratio = Math.min(qty / Math.max(reorder * 3, 1), 1);
  const color =
    qty <= reorder
      ? "bg-red-400"
      : qty <= reorder * 2
        ? "bg-amber-400"
        : "bg-emerald-400";
  return (
    <div className="flex items-center gap-2">
      <div className="w-20 h-1.5 bg-slate-100 rounded-full overflow-hidden">
        <div
          className={`h-full rounded-full transition-all ${color}`}
          style={{ width: `${ratio * 100}%` }}
        />
      </div>
      <span
        className={`text-sm font-semibold ${qty <= reorder ? "text-red-500" : qty <= reorder * 2 ? "text-amber-500" : "text-slate-700"}`}
      >
        {qty}
      </span>
    </div>
  );
}

export default function StockLedgerPage() {
  const [stock, setStock] = useState([]);
  const [locations, setLocations] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [search, setSearch] = useState("");
  const [filterBlock, setFilterBlock] = useState("All");
  const [transferModal, setTransferModal] = useState(null);
  const [transferring, setTransferring] = useState(false);

  const load = async () => {
    setLoading(true);
    setError("");
    try {
      const [s, l] = await Promise.all([
        stockService.getAll(),
        locationService.getAll(),
      ]);
      const validStock = (s || []).filter((item) => item.qty > 0);
      setStock(validStock);
      setLocations((l || []).filter((l) => l.status === "Active"));
    } catch (err) {
      setError("Failed to load stock data. Please try again.");
      console.error("Stock ledger load error:", err);
    }
    setLoading(false);
  };
  useEffect(() => {
    load();
  }, []);

  const blockStats = {};
  stock.forEach((s) => {
    if (!blockStats[s.block]) blockStats[s.block] = 0;
    blockStats[s.block]++;
  });
  const blocks = ["All", ...Object.keys(blockStats).sort()];

  const filtered = stock.filter((s) => {
    const q = search.toLowerCase();
    if (
      q &&
      !s.product.toLowerCase().includes(q) &&
      !s.location.toLowerCase().includes(q)
    )
      return false;
    if (filterBlock !== "All" && s.block !== filterBlock) return false;
    return true;
  });

  const handleTransfer = async (toLocationId, quantity) => {
    setTransferring(true);
    try {
      await stockService.transfer(
        transferModal.productId,
        transferModal.locationId,
        toLocationId,
        quantity,
        null, // notes
      );
      await load();
      setTransferModal(null);
    } finally {
      setTransferring(false);
    }
  };

  if (loading) return <PageLoader />;

  const lowStockCount = stock.filter((s) => s.qty <= s.reorder).length;

  return (
    <div className="space-y-4">
      {error && (
        <div className="flex items-center gap-2 bg-red-50 border border-red-200 text-red-700 rounded-lg px-4 py-2.5 text-sm font-medium">
          <span>⚠️</span> {error}
        </div>
      )}
      <div className="flex flex-wrap items-start justify-between gap-3">
        <div>
          <h1 className="text-2xl font-bold text-slate-800">Stock Ledger</h1>
          <p className="text-sm text-slate-400 mt-0.5">
            Inventory levels and warehouse locations
          </p>
        </div>
        {lowStockCount > 0 && (
          <div className="flex items-center gap-2 bg-red-50 border border-red-100 text-red-600 rounded-lg px-4 py-2.5 text-sm font-medium">
            <span className="w-2 h-2 bg-red-500 rounded-full animate-pulse" />
            {lowStockCount} item{lowStockCount > 1 ? "s" : ""} below reorder
            level
          </div>
        )}
      </div>

      {/* Summary cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {[
          { label: "Total SKUs", value: stock.length, sub: "In ledger" },
          {
            label: "Total Units",
            value: stock.reduce((sum, s) => sum + s.qty, 0).toLocaleString(),
            sub: "On-hand",
          },
          {
            label: "Low Stock",
            value: lowStockCount,
            sub: "Below reorder",
            danger: true,
          },
          {
            label: "Locations Used",
            value: new Set(stock.map((s) => s.location)).size,
            sub: "Warehouse positions",
          },
        ].map((card) => (
          <div
            key={card.label}
            className={`bg-white rounded-xl border shadow-sm p-4 ${card.danger ? "border-red-100" : "border-slate-100"}`}
          >
            <p
              className={`text-xs font-medium ${card.danger ? "text-red-400" : "text-slate-400"} mb-1`}
            >
              {card.label}
            </p>
            <p
              className={`text-2xl font-bold ${card.danger ? "text-red-600" : "text-slate-800"}`}
            >
              {card.value}
            </p>
            <p className="text-xs text-slate-400 mt-0.5">{card.sub}</p>
          </div>
        ))}
      </div>

      {/* Filters */}
      <div className="bg-white rounded-xl border border-slate-100 shadow-sm p-4 flex gap-3 flex-wrap">
        <div className="relative flex-1 min-w-48">
          <Search
            size={15}
            className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400"
          />
          <input
            placeholder="Search by product or location"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full pl-9 pr-3 py-2.5 text-sm border border-slate-200 rounded-lg bg-white focus:outline-none focus:ring-2 focus:ring-[#164E63] transition-all"
          />
        </div>
        <select
          value={filterBlock}
          onChange={(e) => setFilterBlock(e.target.value)}
          className="px-4 py-2.5 text-sm border border-slate-200 rounded-lg bg-white focus:outline-none focus:ring-2 focus:ring-[#164E63] min-w-32"
        >
          {blocks.map((b) => (
            <option key={b} value={b}>
              {b === "All"
                ? "All Blocks"
                : `Block ${b} (${blockStats[b]} items)`}
            </option>
          ))}
        </select>
      </div>

      {/* Table */}
      <div className="bg-white rounded-xl border border-slate-100 shadow-sm">
        <div className="px-5 py-4 border-b border-slate-100">
          <h2 className="text-base font-semibold text-slate-800">
            Stock Inventory
          </h2>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-slate-50">
              <tr>
                {[
                  "PRODUCT",
                  "LOCATION",
                  "BLOCK",
                  "AISLE",
                  "SHELF",
                  "QTY / REORDER",
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
                  <td colSpan={7}>
                    <EmptyState
                      title="No stock records found"
                      icon={BookOpen}
                    />
                  </td>
                </tr>
              )}
              {filtered.map((s) => (
                <tr
                  key={s.id}
                  className={`border-t border-slate-100 hover:bg-slate-50 transition-colors ${s.qty <= s.reorder ? "bg-red-50/30" : ""}`}
                >
                  <td className="px-5 py-3.5 text-sm text-slate-800 font-medium max-w-44">
                    <div className="truncate">{s.product}</div>
                  </td>
                  <td className="px-5 py-3.5 text-sm font-mono font-semibold text-[#164E63]">
                    {s.location}
                  </td>
                  <td className="px-5 py-3.5 text-sm text-slate-600">
                    {s.block}
                  </td>
                  <td className="px-5 py-3.5 text-sm text-slate-600">
                    {s.aisle}
                  </td>
                  <td className="px-5 py-3.5 text-sm text-slate-600">
                    {s.shelf}
                  </td>
                  <td className="px-5 py-3.5">
                    <StockLevelBar qty={s.qty} reorder={s.reorder} />
                    <span className="text-xs text-slate-400 mt-0.5">
                      Reorder at {s.reorder}
                    </span>
                  </td>
                  <td className="px-5 py-3.5">
                    <button
                      onClick={() => setTransferModal(s)}
                      className="flex items-center gap-1.5 text-xs px-3 py-1.5 rounded-lg border border-slate-200 hover:border-[#164E63] hover:text-[#164E63] text-slate-600 transition-all"
                    >
                      <ArrowRightLeft size={13} /> Transfer
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      <Modal
        open={!!transferModal}
        onClose={() => setTransferModal(null)}
        title="Transfer Stock"
      >
        <TransferForm
          item={transferModal}
          locations={locations}
          onSave={handleTransfer}
          onClose={() => setTransferModal(null)}
          loading={transferring}
        />
      </Modal>
    </div>
  );
}
