import { useState, useEffect } from "react";
import { Search, Eye, FileText, Check, X } from "lucide-react";
import { purchaseService } from "../services/api";
import { PageLoader, EmptyState } from "../components/ui/Feedback";
import Modal from "../components/ui/Modal";

function StatusPill({ status }) {
  const map = {
    Paid: "bg-emerald-100 text-emerald-700",
    Confirmed: "bg-emerald-100 text-emerald-700",
    Pending: "bg-amber-100 text-amber-700",
    Cancelled: "bg-red-100 text-red-600",
    Draft: "bg-slate-100 text-slate-600",
  };
  return (
    <span
      className={`inline-flex items-center px-2.5 py-1 rounded-full text-xs font-semibold ${map[status] || "bg-slate-100 text-slate-600"} capitalize`}
    >
      {status?.toLowerCase()}
    </span>
  );
}

function InvoiceDetailModal({ invoice, onClose }) {
  if (!invoice) return null;
  return (
    <div className="space-y-5">
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-sm">
        <div>
          <p className="text-slate-400 text-xs mb-1">Invoice ID</p>
          <p className="font-mono font-semibold text-slate-800">{invoice.id}</p>
        </div>
        <div>
          <p className="text-slate-400 text-xs mb-1">Status</p>
          <StatusPill status={invoice.status} />
        </div>
        <div>
          <p className="text-slate-400 text-xs mb-1">Supplier</p>
          <p className="font-semibold text-slate-800">{invoice.supplier}</p>
        </div>
        <div>
          <p className="text-slate-400 text-xs mb-1">Date</p>
          <p className="text-slate-700">{invoice.date}</p>
        </div>
        <div>
          <p className="text-slate-400 text-xs mb-1">Delivery Date</p>
          <p className="text-slate-700">{invoice.deliveryDate || "—"}</p>
        </div>
        <div>
          <p className="text-slate-400 text-xs mb-1">Notes</p>
          <p className="text-slate-700">{invoice.notes || "—"}</p>
        </div>
        {(() => {
          const uniqueLocs = [...new Set(invoice.lines?.map(l => l.locationName))].filter(Boolean);
          if (uniqueLocs.length === 1) {
            return (
              <div className="sm:col-span-2 bg-slate-50 rounded-lg p-2.5 border border-slate-200 mt-1 text-center">
                <p className="text-slate-500 text-[10px] uppercase font-bold mb-0.5">Primary Storage Location</p>
                <p className="text-slate-800 font-mono font-bold text-xs">{uniqueLocs[0]}</p>
              </div>
            );
          }
          return null;
        })()}
      </div>
      <div className="border-t border-slate-100 pt-4">
        <p className="text-slate-800 font-bold text-sm mb-3">Itemized Products</p>
        <div className="bg-white rounded-lg overflow-hidden border border-slate-200">
          <table className="w-full text-xs text-left">
            <thead className="bg-slate-50 font-bold text-slate-700 border-b border-slate-200">
              <tr>
                <th className="px-3 py-2.5">Product</th>
                {(() => {
                  const uniqueLocs = [...new Set(invoice.lines?.map(l => l.locationName))].filter(Boolean);
                  return uniqueLocs.length > 1 ? <th className="px-3 py-2.5">Location</th> : null;
                })()}
                <th className="px-3 py-2.5 text-right">Unit Price</th>
                <th className="px-3 py-2.5 text-center">Qty</th>
                <th className="px-3 py-2.5 text-right">Total</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {(() => {
                const filteredLines = invoice.lines?.filter(l => l.quantity > 0 && l.lineTotal > 0) || [];
                const uniqueLocs = [...new Set(filteredLines.map(l => l.locationName))].filter(Boolean);
                const showLoc = uniqueLocs.length > 1;

                if (filteredLines.length === 0 && invoice.lines?.length > 0) {
                   return invoice.lines.map((line) => (
                    <tr key={line.id} className="text-slate-700 hover:bg-slate-50 transition-colors">
                      <td className="px-3 py-2.5 font-medium">{line.productName}</td>
                      {showLoc && <td className="px-3 py-2.5 font-mono text-[10px]">{line.locationName || "—"}</td>}
                      <td className="px-3 py-2.5 text-right">${line.unitBuyingPrice?.toFixed(2)}</td>
                      <td className="px-3 py-2.5 text-center">{line.quantity}</td>
                      <td className="px-3 py-2.5 text-right font-semibold text-slate-900">${line.lineTotal?.toFixed(2)}</td>
                    </tr>
                   ));
                }

                return filteredLines.map((line) => (
                  <tr key={line.id} className="text-slate-700 hover:bg-slate-50 transition-colors">
                    <td className="px-3 py-2.5 font-medium">{line.productName}</td>
                    {showLoc && <td className="px-3 py-2.5 font-mono text-[10px]">{line.locationName || "—"}</td>}
                    <td className="px-3 py-2.5 text-right">${line.unitBuyingPrice?.toFixed(2)}</td>
                    <td className="px-3 py-2.5 text-center">{line.quantity}</td>
                    <td className="px-3 py-2.5 text-right font-semibold text-slate-900">${line.lineTotal?.toFixed(2)}</td>
                  </tr>
                ));
              })()}
            </tbody>
          </table>
        </div>
      </div>

      <div className="border-t border-slate-100 pt-4 space-y-2 text-sm">
        <div className="flex justify-between">
          <span className="text-slate-500">Subtotal</span>
          <span className="font-medium">${invoice.total?.toFixed(2)}</span>
        </div>
        <div className="flex justify-between">
          <span className="text-slate-500">Discount</span>
          <span className="font-medium text-green-600">
            -${invoice.discount?.toFixed(2)}
          </span>
        </div>
        <div className="flex justify-between">
          <span className="text-slate-500">Tax</span>
          <span className="font-medium">${invoice.tax?.toFixed(2)}</span>
        </div>
        <div className="flex justify-between border-t border-slate-200 pt-3">
          <span className="font-bold text-slate-900">Grand Total</span>
          <span className="font-bold text-xl text-slate-900">
            ${invoice.grandTotal?.toFixed(2)}
          </span>
        </div>
      </div>
    </div>
  );
}

export default function PurchaseInvoicesPage() {
  const [invoices, setInvoices] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [search, setSearch] = useState("");
  const [filterStatus, setFilterStatus] = useState("All Status");
  const [viewModal, setViewModal] = useState(null);

  const fetchInvoices = async () => {
    setLoading(true);
    setError("");
    try {
      const data = await purchaseService.getAll();
      setInvoices(data || []);
    } catch (err) {
      setError("Failed to load purchase invoices. Please try again.");
      console.error("Purchase invoices load error:", err);
    }
    setLoading(false);
  };

  useEffect(() => {
    fetchInvoices();
  }, []);

  const handleConfirm = async (id) => {
    if (!window.confirm("Are you sure you want to confirm this invoice? This will update your stock ledger.")) return;
    try {
      const result = await purchaseService.confirm(id);
      if (result) {
        fetchInvoices();
      }
    } catch (err) {
      setError(err.message || "Failed to confirm invoice.");
    }
  };

  const handleCancel = async (id) => {
    if (!window.confirm("Are you sure you want to cancel this draft invoice?")) return;
    try {
      const result = await purchaseService.cancel(id);
      if (result) {
        fetchInvoices();
      }
    } catch (err) {
      setError(err.message || "Failed to cancel invoice.");
    }
  };

  const filtered = invoices.filter((inv) => {
    const q = search.toLowerCase();
    if (
      q &&
      !(inv.id || "").toLowerCase().includes(q) &&
      !(inv.supplier || "").toLowerCase().includes(q)
    )
      return false;
    if (filterStatus !== "All Status" && (inv.status || "").toLowerCase() !== filterStatus.toLowerCase())
      return false;
    return true;
  });

  const totalValue = filtered.reduce((sum, inv) => sum + inv.grandTotal, 0);

  if (loading) return <PageLoader />;

  return (
    <div className="space-y-4">
      <h1 className="text-2xl font-bold text-slate-800">Purchase Invoices</h1>

      {error && (
        <div className="flex items-center gap-2 bg-red-50 border border-red-200 text-red-700 rounded-lg px-4 py-2.5 text-sm font-medium">
          <span>⚠️</span> {error}
        </div>
      )}

      {/* Summary */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
        {[
          {
            label: "Total Invoices",
            value: invoices.length,
            color: "text-slate-800",
          },
          {
            label: "Pending",
            value: invoices.filter((i) => (i.status || "").toLowerCase() === "pending").length,
            color: "text-amber-600",
          },
          {
            label: "Total Value",
            value: `$${invoices.reduce((s, i) => s + i.grandTotal, 0).toLocaleString("en", { minimumFractionDigits: 2 })}`,
            color: "text-[#164E63]",
          },
        ].map((c) => (
          <div
            key={c.label}
            className="bg-white rounded-xl border border-slate-100 shadow-sm p-4"
          >
            <p className="text-xs text-slate-400 mb-1">{c.label}</p>
            <p className={`text-2xl font-bold ${c.color}`}>{c.value}</p>
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
            placeholder="Search by Invoice ID or Supplier"
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
          <option>Paid</option>
          <option>Confirmed</option>
          <option>Draft</option>
        </select>
      </div>

      {/* Table */}
      <div className="bg-white rounded-xl border border-slate-100 shadow-sm">
        <div className="flex items-center justify-between px-5 py-4 border-b border-slate-100">
          <h2 className="text-base font-semibold text-slate-800">Invoices</h2>
          <span className="text-sm text-slate-400">
            Showing {filtered.length} · Total:{" "}
            <span className="font-semibold text-slate-700">
              ${totalValue.toFixed(2)}
            </span>
          </span>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-slate-50">
              <tr>
                {[
                  "INVOICE ID",
                  "SUPPLIER",
                  "DATE",
                  "DELIVERY DATE",
                  "SUBTOTAL",
                  "DISCOUNT",
                  "TAX",
                  "GRAND TOTAL",
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
                  <td colSpan={10}>
                    <EmptyState title="No invoices found" icon={FileText} />
                  </td>
                </tr>
              )}
              {filtered.map((inv) => (
                <tr
                  key={inv.id}
                  onClick={() => setViewModal(inv)}
                  className="border-t border-slate-100 hover:bg-slate-50 transition-colors cursor-pointer group"
                >
                  <td className="px-5 py-3.5 text-sm font-mono text-slate-600 whitespace-nowrap">
                    {inv.id}
                  </td>
                  <td className="px-5 py-3.5 text-sm font-semibold text-slate-800 whitespace-nowrap">
                    {inv.supplier}
                  </td>
                  <td className="px-5 py-3.5 text-sm text-slate-600 whitespace-nowrap">
                    {inv.date}
                  </td>
                  <td className="px-5 py-3.5 text-sm text-slate-600 whitespace-nowrap">
                    {inv.deliveryDate}
                  </td>
                  <td className="px-5 py-3.5 text-sm text-slate-700">
                    ${inv.total?.toFixed(2)}
                  </td>
                  <td className="px-5 py-3.5 text-sm text-green-600">
                    -${inv.discount?.toFixed(2)}
                  </td>
                  <td className="px-5 py-3.5 text-sm text-slate-600">
                    ${inv.tax?.toFixed(2)}
                  </td>
                  <td className="px-5 py-3.5 text-sm font-semibold text-slate-800">
                    ${inv.grandTotal?.toFixed(2)}
                  </td>
                  <td className="px-5 py-3.5">
                    <StatusPill status={inv.status} />
                  </td>
                  <td className="px-5 py-3.5">
                    <div className="flex items-center gap-1">
                      <button
                        onClick={() => setViewModal(inv)}
                        title="View Details"
                        className="text-slate-400 hover:text-[#164E63] p-1 transition-colors"
                      >
                        <Eye size={16} />
                      </button>
                      {inv.status?.toLowerCase() === "draft" && (
                        <>
                          <button
                            onClick={() => handleConfirm(inv.purchaseInvoiceId)}
                            title="Confirm & Update Stock"
                            className="text-slate-400 hover:text-emerald-600 p-1 transition-colors"
                          >
                            <Check size={16} />
                          </button>
                          <button
                            onClick={() => handleCancel(inv.purchaseInvoiceId)}
                            title="Cancel Invoice"
                            className="text-slate-400 hover:text-red-500 p-1 transition-colors"
                          >
                            <X size={16} />
                          </button>
                        </>
                      )}
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      <Modal
        open={!!viewModal}
        onClose={() => setViewModal(null)}
        title="Purchase Invoice Details"
        size="lg"
      >
        <InvoiceDetailModal
          invoice={viewModal}
          onClose={() => setViewModal(null)}
        />
      </Modal>
    </div>
  );
}
