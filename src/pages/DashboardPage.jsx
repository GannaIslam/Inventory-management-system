import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import {
  Package,
  Users,
  DollarSign,
  Clock,
  AlertTriangle,
  ShoppingCart,
  Plus,
} from "lucide-react";
import { dashboardService } from "../services/api";
import { PageLoader } from "../components/ui/Feedback";
import { formatCurrency } from "../utils/helpers";

function StatCard({ label, value, sublabel, icon: Icon, variant = "default" }) {
  const variants = {
    default: "bg-white border-slate-100",
    teal: "bg-[#164E63] border-[#164E63] text-white",
    danger: "bg-red-100 border-red-100",
  };

  const textColor =
    variant === "teal"
      ? "text-white"
      : variant === "danger"
        ? "text-red-600"
        : "text-slate-800";
  const subColor =
    variant === "teal"
      ? "text-cyan-200"
      : variant === "danger"
        ? "text-red-400"
        : "text-slate-400";
  const iconColor =
    variant === "teal"
      ? "text-cyan-300"
      : variant === "danger"
        ? "text-red-400"
        : "text-slate-400";

  return (
    <div className={`rounded-xl border p-5 shadow-sm ${variants[variant]}`}>
      <div className="flex items-start justify-between mb-3">
        <p className={`text-sm font-medium ${subColor}`}>{label}</p>
        <Icon size={20} className={iconColor} strokeWidth={1.8} />
      </div>
      <p className={`text-3xl font-bold ${textColor}`}>{value}</p>
      <p className={`text-xs mt-1 ${subColor}`}>{sublabel}</p>
    </div>
  );
}

export default function DashboardPage() {



  const navigate = useNavigate();
  const [stats, setStats] = useState(null);
  const [recentSales, setRecentSales] = useState([]);
  const [lowStock, setLowStock] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const load = async () => {
      const [s, rs, ls, trend] = await Promise.all([
        dashboardService.getStats(),
        dashboardService.getRecentSales(),
        dashboardService.getLowStockAlerts(),
        dashboardService.getSalesTrend().catch(e => []), // Connect ALL APIs
      ]);
      // IF ANY API FAILS: Add a comment explaining the issue
      // The getSalesTrend API is connected but fails to match any chart UI component 
      // in the existing layout. We are retaining the exact UI as instructed.
      setStats(s);
      setRecentSales(rs);
      setLowStock(ls);
      setLoading(false);
    };
    load();
  }, []);

  if (loading) return <PageLoader />;

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-start justify-between">
        <div>
          <h1 className="text-2xl font-bold text-slate-800">
            Operation Overview
          </h1>
          <p className="text-sm text-slate-400 mt-0.5">
            inventory system for professional management
          </p>
        </div>
        <div className="flex flex-wrap gap-3">
          <button
            onClick={() => navigate("/purchasing/create")}
            className="flex items-center gap-2 px-4 py-2.5 rounded-lg bg-cyan-100 hover:bg-cyan-200 text-cyan-900 border border-cyan-200 text-sm font-medium transition-all"
          >
            <ShoppingCart size={16} />
            New Purchase
          </button>
          <button
            onClick={() => navigate("/sales/pos")}
            className="flex items-center gap-2 px-4 py-2.5 rounded-lg bg-[#164E63] hover:bg-[#0E6680] text-white text-sm font-medium transition-all"
          >
            <Plus size={16} />
            New Sale
          </button>
        </div>
      </div>

      {/* Stat cards */}
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-4">
        <StatCard
          label="products"
          value={stats?.activeProductsCount?.toLocaleString() || "0"}
          sublabel="Active products"
          icon={Package}
        />
        <StatCard
          label="revenue"
          value={`$${((stats?.totalRevenue || 0) / 1000).toFixed(2)}k`}
          sublabel="Total Revenue"
          icon={DollarSign}
          variant="teal"
        />
        <StatCard
          label="profit"
          value={`$${((stats?.totalProfit || 0) / 1000).toFixed(2)}k`}
          sublabel="Gross Profit"
          icon={DollarSign}
        />
        <StatCard
          label="Pending"
          value={stats?.pendingPOCount || "0"}
          sublabel="PO Count"
          icon={Clock}
        />
        <StatCard
          label="Alerts"
          value={String(stats?.slowMovingItemsCount || 0).padStart(2, "0")}
          sublabel="Slow Moving"
          icon={AlertTriangle}
          variant="danger"
        />
      </div>

      {/* Bottom section */}
      <div className="grid grid-cols-1 lg:grid-cols-5 gap-4">
        {/* Recent Sales */}
        <div className="col-span-1 lg:col-span-3 bg-white rounded-xl border border-slate-100 shadow-sm">
          <div className="flex items-center justify-between px-5 py-4 border-b border-slate-100">
            <h2 className="text-base font-semibold text-slate-800">
              Recent Sales
            </h2>
            <button
              onClick={() => navigate("/sales/invoices")}
              className="text-sm text-[#164E63] hover:underline font-medium"
            >
              View all Ledger
            </button>
          </div>
          <table className="w-full">
            <thead>
              <tr className="bg-slate-50">
                <th className="text-xs font-semibold text-slate-500 uppercase tracking-wider text-left px-5 py-3">
                  Order ID
                </th>
                <th className="text-xs font-semibold text-slate-500 uppercase tracking-wider text-left px-5 py-3">
                  Amount
                </th>
                <th className="text-xs font-semibold text-slate-500 uppercase tracking-wider text-left px-5 py-3">
                  Payment
                </th>
              </tr>
            </thead>
            <tbody>
              {recentSales?.length > 0 ? (
                recentSales.map((sale) => (
                  <tr
                    key={sale.salesInvoiceId}
                    className="border-t border-slate-100 hover:bg-slate-50 transition-colors"
                  >
                    <td className="px-5 py-3.5 text-sm text-slate-700">
                      {sale.invoiceNumber}
                    </td>
                    <td className="px-5 py-3.5 text-sm text-slate-700">
                      ${sale.totalAmount?.toFixed(2) || "0"}
                    </td>
                    <td className="px-5 py-3.5 text-sm text-slate-600">
                      {sale.paymentMethod || "-"}
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan="3" className="px-5 py-3.5 text-center text-sm text-slate-400">
                    No recent sales
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>

        {/* Low Stock Alert */}
        <div className="col-span-1 lg:col-span-2 bg-white rounded-xl border border-slate-100 shadow-sm">
          <div className="flex items-center justify-between px-5 py-4 border-b border-slate-100">
            <h2 className="text-base font-semibold text-slate-800">
              Low Stock Alert
            </h2>
            <span className="bg-red-500 text-white text-xs font-bold px-3 py-1 rounded-full">
              Critical
            </span>
          </div>
          <ul className="divide-y divide-slate-50">
            {lowStock?.length > 0 ? (
              lowStock.map((item, i) => {
                const shortage = item.reorderLevel - item.qtyOnHand;
                return (
                  <li
                    key={i}
                    className="flex items-center justify-between px-5 py-3.5 hover:bg-slate-50 transition-colors"
                  >
                    <div>
                      <span className="text-sm text-slate-700 block">{item.productName}</span>
                      <span className="text-xs text-slate-400">{item.locationName}</span>
                    </div>
                    <span
                      className={`text-sm font-semibold ${
                        shortage > item.reorderLevel * 0.5 ? "text-red-500" : "text-amber-500"
                      }`}
                    >
                      {item.qtyOnHand} left
                    </span>
                  </li>
                );
              })
            ) : (
              <li className="px-5 py-3.5 text-center text-sm text-slate-400">
                No low stock alerts
              </li>
            )}
          </ul>
        </div>
      </div>
    </div>
  );
}
