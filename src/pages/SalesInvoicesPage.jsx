import { useState, useEffect } from "react";
import { Search, Eye, Receipt, RotateCcw, XCircle } from "lucide-react";
import { salesService, dashboardService } from "../services/api";
import {
  PageLoader,
  EmptyState,
  ConfirmModal,
} from "../components/ui/Feedback";
import Modal from "../components/ui/Modal";

function StatusPill({ status }) {
  const map = {
    Completed: "bg-emerald-100 text-emerald-700",
    Refunded: "bg-amber-100 text-amber-700",
    Voided: "bg-red-100 text-red-600",
  };
  return (
    <span
      className={`inline-flex items-center px-2.5 py-1 rounded-full text-xs font-semibold ${map[status] || "bg-slate-100 text-slate-600"}`}
    >
      {status}
    </span>
  );
}

function PaymentBadge({ payment }) {
  return (
    <span
      className={`inline-flex items-center px-2 py-0.5 rounded text-xs font-semibold ${
        payment === "CASH"
          ? "bg-green-50 text-green-700"
          : "bg-blue-50 text-blue-700"
      }`}
    >
      {payment}
    </span>
  );
}

function InvoiceDetailModal({ invoice }) {
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
          <p className="text-slate-400 text-xs mb-1">Customer</p>
          <p className="font-semibold text-slate-800">{invoice.customer}</p>
          <p className="text-xs text-slate-400">{invoice.customerNumber}</p>
        </div>
        <div>
          <p className="text-slate-400 text-xs mb-1">Cashier</p>
          <p className="text-slate-700">{invoice.cashier}</p>
        </div>
        <div>
          <p className="text-slate-400 text-xs mb-1">Date</p>
          <p className="text-slate-700">{invoice.date}</p>
        </div>
        <div>
          <p className="text-slate-400 text-xs mb-1">Payment Method</p>
          <PaymentBadge payment={invoice.payment} />
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
        <div className="flex justify-between border-t border-slate-100 pt-2">
          <span className="font-semibold text-slate-800">Grand Total</span>
          <span className="font-bold text-lg text-[#164E63]">
            ${invoice.grandTotal?.toFixed(2)}
          </span>
        </div>
      </div>
    </div>
  );
}

export default function SalesInvoicesPage() {
  const [invoices, setInvoices] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [search, setSearch] = useState("");
  const [filterStatus, setFilterStatus] = useState("All Status");
  const [filterPayment, setFilterPayment] = useState("All");
  const [viewModal, setViewModal] = useState(null);
  const [confirmAction, setConfirmAction] = useState(null);
  const [actionLoading, setActionLoading] = useState(false);
  const [stats, setStats] = useState(null);

  const load = async () => {
    setLoading(true);
    setError("");
    try {
      const [salesData, statsData] = await Promise.all([
        salesService.getAll(),
        dashboardService.getStats()
      ]);
      setInvoices(salesData || []);
      setStats(statsData);
      if (!salesData || salesData.length === 0) {
        setError("");
      }
    } catch (err) {
      setError("Failed to load sales invoices. Please try again.");
      console.error("Sales invoices load error:", err);
    }
    setLoading(false);
  };
  useEffect(() => {
    load();
  }, []);

  const filtered = invoices.filter((inv) => {
    const q = search.toLowerCase();
    if (
      q &&
      !(inv.id || "").toLowerCase().includes(q) &&
      !(inv.customer || "").toLowerCase().includes(q)
    )
      return false;
    if (filterStatus !== "All Status" && (inv.status || "").toLowerCase() !== filterStatus.toLowerCase())
      return false;
    if (filterPayment !== "All" && (inv.payment || "").toLowerCase() !== filterPayment.toLowerCase()) 
      return false;
    return true;
  });

  const totalRevenue = invoices
    .filter((i) => i.status === "Completed")
    .reduce((sum, i) => sum + i.grandTotal, 0);

  const handleAction = async () => {
    setActionLoading(true);
    try {
      if (confirmAction.type === "refund")
        await salesService.processRefund(confirmAction.id);
      else await salesService.voidInvoice(confirmAction.id);
      await load();
      setConfirmAction(null);
    } finally {
      setActionLoading(false);
    }
  };

  if (loading) return <PageLoader />;

  return (
    <div className="space-y-4">
      <h1 className="text-2xl font-bold text-slate-800">Sales Invoices</h1>

      {error && (
        <div className="flex items-center gap-2 bg-red-50 border border-red-200 text-red-700 rounded-lg px-4 py-2.5 text-sm font-medium">
          <span>⚠️</span> {error}
        </div>
      )}

      {/* Summary */}
      <div className="grid grid-cols-6 xl:grid-cols-4 gap-4">
        {[
          {
            label: "Total Sales",
            value: stats ? stats.totalSalesCount : invoices.length,
            color: "text-slate-800",
          },
          {
            label: "Completed",
            value: invoices.filter((i) => (i.status || "").toLowerCase() === "completed").length,
            color: "text-emerald-600",
          },
          {
            label: "Refunded",
            value: invoices.filter((i) => (i.status || "").toLowerCase() === "refunded").length,
            color: "text-amber-600",
          },
          {
            label: "Revenue",
            value: `$${(stats ? stats.totalRevenue : totalRevenue).toLocaleString("en", { minimumFractionDigits: 2 })}`,
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
            placeholder="Search by Invoice ID or Customer"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full pl-9 pr-3 py-2.5 text-sm border border-slate-200 rounded-lg bg-white focus:outline-none focus:ring-2 focus:ring-[#164E63]"
          />
        </div>
        <select
          value={filterStatus}
          onChange={(e) => setFilterStatus(e.target.value)}
          className="px-4 py-2.5 text-sm border border-slate-200 rounded-lg bg-white focus:outline-none focus:ring-2 focus:ring-[#164E63] min-w-36"
        >
          <option>All Status</option>
          <option>Completed</option>
          <option>Refunded</option>
          <option>Voided</option>
        </select>
        <select
          value={filterPayment}
          onChange={(e) => setFilterPayment(e.target.value)}
          className="px-4 py-2.5 text-sm border border-slate-200 rounded-lg bg-white focus:outline-none focus:ring-2 focus:ring-[#164E63] min-w-32"
        >
          <option>All</option>
          <option>CASH</option>
          <option>CARD</option>
        </select>
      </div>

      {/* Table */}
      <div className="bg-white rounded-xl border border-slate-100 shadow-sm">
        <div className="px-5 py-4 border-b border-slate-100">
          <h2 className="text-base font-semibold text-slate-800">
            Sales Ledger
          </h2>
        </div>

        <div className="w-full max-w-full overflow-x-auto">
          <table className="w-full min-w-[900px]">
            <thead className="bg-slate-50">
              <tr>
                {[
                  "INVOICE ID",
                  "CUSTOMER",
                  "CASHIER",
                  "DATE",
                  "TOTAL",
                  "DISCOUNT",
                  "TAX",
                  "GRAND TOTAL",
                  "PAYMENT",
                  "STATUS",
                  "ACTIONS",
                ].map((h) => (
                  <th
                    key={h}
                    className="text-xs font-semibold text-slate-500 uppercase tracking-wider text-left px-3 md:px-5 py-3"
                  >
                    {h}
                  </th>
                ))}
              </tr>
            </thead>

            <tbody>
              {filtered.length === 0 && (
                <tr>
                  <td colSpan={11}>
                    <EmptyState title="No invoices found" icon={Receipt} />
                  </td>
                </tr>
              )}

              {filtered.map((inv) => (
                <tr
                  key={inv.id}
                  className="border-t border-slate-100 hover:bg-slate-50"
                >
                  <td className="px-3 md:px-5 py-3.5 text-sm font-mono text-slate-600">
                    {inv.id}
                  </td>
                  <td className="px-3 md:px-5 py-3.5">
                    <p className="text-sm font-semibold text-slate-800">
                      {inv.customer}
                    </p>
                    <p className="text-xs text-slate-400">
                      {inv.customerNumber}
                    </p>
                  </td>
                  <td className="px-3 md:px-5 py-3.5 text-sm text-slate-600">
                    {inv.cashier}
                  </td>
                  <td className="px-3 md:px-5 py-3.5 text-sm text-slate-600">
                    {inv.date}
                  </td>
                  <td className="px-3 md:px-5 py-3.5 text-sm text-slate-700">
                    ${inv.total?.toFixed(2)}
                  </td>
                  <td className="px-3 md:px-5 py-3.5 text-sm text-green-600">
                    -${inv.discount?.toFixed(2)}
                  </td>
                  <td className="px-3 md:px-5 py-3.5 text-sm text-slate-600">
                    ${inv.tax?.toFixed(2)}
                  </td>
                  <td className="px-3 md:px-5 py-3.5 text-sm font-semibold text-slate-800">
                    ${inv.grandTotal?.toFixed(2)}
                  </td>
                  <td className="px-3 md:px-5 py-3.5">
                    <PaymentBadge payment={inv.payment} />
                  </td>
                  <td className="px-3 md:px-5 py-3.5">
                    <StatusPill status={inv.status} />
                  </td>
                  <td className="px-3 md:px-5 py-3.5">
                    <div className="flex items-center gap-1">
                      <button
                        onClick={() => setViewModal(inv)}
                        className="text-slate-400 hover:text-[#164E63] p-1"
                      >
                        <Eye size={15} />
                      </button>

                      {inv.status === "Completed" && (
                        <>
                          <button
                            onClick={() =>
                              setConfirmAction({
                                type: "refund",
                                id: inv.id,
                                label: inv.id,
                              })
                            }
                            className="text-slate-400 hover:text-amber-500 p-1"
                          >
                            <RotateCcw size={15} />
                          </button>
                          <button
                            onClick={() =>
                              setConfirmAction({
                                type: "void",
                                id: inv.id,
                                label: inv.id,
                              })
                            }
                            className="text-slate-400 hover:text-red-500 p-1"
                          >
                            <XCircle size={15} />
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
        title="Sales Invoice Details"
      >
        <InvoiceDetailModal invoice={viewModal} />
      </Modal>

      <ConfirmModal
        open={!!confirmAction}
        onClose={() => setConfirmAction(null)}
        onConfirm={handleAction}
        loading={actionLoading}
        title={
          confirmAction?.type === "refund" ? "Process Refund" : "Void Invoice"
        }
        message={`${confirmAction?.type === "refund" ? "Refund" : "Void"} invoice ${confirmAction?.label}? This action cannot be undone.`}
      />
    </div>
  );
}
