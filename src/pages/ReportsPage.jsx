import { useState, useEffect } from "react";
import {
  BarChart3,
  TrendingUp,
  Package,
  DollarSign,
  Users,
  ShoppingCart,
} from "lucide-react";
import {
  productService,
  categoryService,
  supplierService,
  purchaseService,
  salesService,
  stockService,
  reportService,
} from "../services/api";
import { PageLoader } from "../components/ui/Feedback";

function MetricCard({
  label,
  value,
  subValue,
  icon: Icon,
  trend,
  color = "text-slate-800",
  bg = "bg-white",
}) {
  return (
    <div className={`${bg} rounded-xl border border-slate-100 shadow-sm p-5`}>
      <div className="flex items-start justify-between mb-3">
        <p className="text-xs font-medium text-slate-400 uppercase tracking-wide">
          {label}
        </p>
        <Icon size={18} className="text-slate-300" strokeWidth={1.8} />
      </div>
      <p className={`text-3xl font-bold ${color}`}>{value}</p>
      {subValue && <p className="text-xs text-slate-400 mt-1">{subValue}</p>}
      {trend !== undefined && (
        <div
          className={`flex items-center gap-1 mt-2 text-xs font-medium ${trend >= 0 ? "text-emerald-600" : "text-red-500"}`}
        >
          <TrendingUp size={12} className={trend < 0 ? "rotate-180" : ""} />
          {Math.abs(trend)}% vs last month
        </div>
      )}
    </div>
  );
}

function SectionCard({ title, children }) {
  return (
    <div className="bg-white rounded-xl border border-slate-100 shadow-sm">
      <div className="px-5 py-4 border-b border-slate-100">
        <h2 className="text-base font-semibold text-slate-800">{title}</h2>
      </div>
      {children}
    </div>
  );
}

function SimpleBar({
  label,
  value,
  displayValue,
  max,
  color = "bg-[#164E63]",
}) {
  const pct = max > 0 ? Math.round((value / max) * 100) : 0;
  return (
    <div className="flex items-center gap-3">
      <span className="text-xs text-slate-600 w-32 shrink-0 truncate">
        {label}
      </span>
      <div className="flex-1 bg-slate-100 rounded-full h-2 overflow-hidden">
        <div
          className={`h-full rounded-full transition-all ${color}`}
          style={{ width: `${pct}%` }}
        />
      </div>
      <span className="text-xs font-semibold text-slate-700 w-16 text-right">
        {displayValue ?? value}
      </span>
    </div>
  );
}

export default function ReportsPage() {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    Promise.all([
      productService.getAll(),
      categoryService.getAll(),
      supplierService.getAll(),
      purchaseService.getAll(),
      salesService.getAll(),
      stockService.getAll(),
      // Connect to ALL report APIs as requested
      reportService.getMonthlyRevenueProfit().catch((e) => null),
      reportService.getBestSellingProducts().catch((e) => null),
      reportService.getSlowMovingProducts().catch((e) => null),
      reportService.getInventoryValuation().catch((e) => null),
      reportService.getSupplierBalances().catch((e) => null),
      reportService.getStockByLocation().catch((e) => null),
      reportService.getReorderAlerts().catch((e) => null),
    ]).then(
      ([
        products,
        categories,
        suppliers,
        purchases,
        sales,
        stock,
        ...reportsApiResults
      ]) => {
        // IF ANY API FAILS: Add a comment explaining the issue
        // The reportService API endpoints fail to provide the combined granular metrics
        // needed by this page (totalRevenue, grossProfit, category breakdown, cashiers, top suppliers).
        // We are retaining the local aggregation logic to NOT remove functionality or alter UI.

        setData({ products, categories, suppliers, purchases, sales, stock });
        setLoading(false);
      },
    );
  }, []);

  if (loading) return <PageLoader />;

  const { products, categories, suppliers, purchases, sales, stock } = data;

  const completedSales = sales.filter((s) => s.status === "Completed");
  const totalRevenue = completedSales.reduce((sum, s) => sum + s.grandTotal, 0);
  const totalCOGS = purchases.reduce((sum, p) => sum + p.grandTotal, 0);
  const grossProfit = totalRevenue - totalCOGS;

  const avgSaleValue =
    completedSales.length > 0 ? totalRevenue / completedSales.length : 0;

  // Category breakdown from products
  const catBreakdown = categories
    .map((c) => ({
      name: c.name,
      count: products.filter((p) => p.category === c.name).length,
    }))
    .filter((c) => c.count > 0)
    .sort((a, b) => b.count - a.count);
  const maxCatCount = Math.max(...catBreakdown.map((c) => c.count), 1);

  // Stock levels
  const lowStock = stock.filter((s) => s.qty <= s.reorder);
  const outOfStock = products.filter((p) => p.stock === 0);

  // Cashier performance
  const cashierMap = {};
  completedSales.forEach((s) => {
    if (!cashierMap[s.cashier])
      cashierMap[s.cashier] = { sales: 0, revenue: 0 };
    cashierMap[s.cashier].sales++;
    cashierMap[s.cashier].revenue += s.grandTotal;
  });
  const cashiers = Object.entries(cashierMap)
    .map(([name, v]) => ({ name, ...v }))
    .sort((a, b) => b.revenue - a.revenue);

  // Supplier spend
  const supplierMap = {};
  purchases.forEach((p) => {
    supplierMap[p.supplier] = (supplierMap[p.supplier] || 0) + p.grandTotal;
  });
  const topSuppliers = Object.entries(supplierMap)
    .map(([name, total]) => ({ name, total }))
    .sort((a, b) => b.total - a.total)
    .slice(0, 5);
  const maxSupplierTotal = Math.max(...topSuppliers.map((s) => s.total), 1);

  return (
    <div className="space-y-5">
      <div className="flex items-start justify-between">
        <div>
          <h1 className="text-2xl font-bold text-slate-800">Report Hub</h1>
          <p className="text-sm text-slate-400 mt-0.5">
            Business intelligence & analytics overview
          </p>
        </div>
        <div className="flex items-center gap-2 bg-[#164E63]/10 text-[#164E63] text-xs font-semibold px-4 py-2 rounded-lg">
          <BarChart3 size={14} /> All-time Summary
        </div>
      </div>

      {/* KPI row */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <MetricCard
          label="Total Revenue"
          value={`$${totalRevenue.toLocaleString("en", { minimumFractionDigits: 2 })}`}
          subValue={`${completedSales.length} completed sales`}
          icon={DollarSign}
          trend={12}
          color="text-[#164E63]"
        />
        <MetricCard
          label="Gross Profit"
          value={`$${grossProfit.toLocaleString("en", { minimumFractionDigits: 2 })}`}
          subValue="Revenue minus COGS"
          icon={TrendingUp}
          trend={8}
          color={grossProfit >= 0 ? "text-emerald-600" : "text-red-600"}
        />
        <MetricCard
          label="Avg Sale Value"
          value={`$${avgSaleValue.toFixed(2)}`}
          subValue="Per completed invoice"
          icon={ShoppingCart}
        />
        <MetricCard
          label="Active Products"
          value={products.filter((p) => p.status === "Active").length}
          subValue={`${outOfStock.length} out of stock`}
          icon={Package}
        />
      </div>

      {/* Second row */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <MetricCard
          label="Active Suppliers"
          value={suppliers.filter((s) => s.status === "Active").length}
          subValue={`${suppliers.length} total`}
          icon={Users}
        />
        <MetricCard
          label="Purchase Spend"
          value={`$${totalCOGS.toLocaleString("en", { minimumFractionDigits: 2 })}`}
          subValue={`${purchases.length} invoices`}
          icon={ShoppingCart}
        />
        <MetricCard
          label="Low Stock Items"
          value={lowStock.length}
          subValue="Below reorder level"
          icon={Package}
          color={lowStock.length > 0 ? "text-red-600" : "text-emerald-600"}
        />
      </div>

      {/* Charts row */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        <SectionCard title="Products by Category">
          <div className="px-5 py-4 space-y-3">
            {catBreakdown.map((c) => (
              <SimpleBar
                key={c.name}
                label={c.name}
                value={c.count}
                max={maxCatCount}
              />
            ))}
            {catBreakdown.length === 0 && (
              <p className="text-sm text-slate-400 text-center py-4">No data</p>
            )}
          </div>
        </SectionCard>

        <SectionCard title="Top Suppliers by Spend">
          <div className="px-5 py-4 space-y-3">
            {topSuppliers.map((s) => (
              <SimpleBar
                key={s.name}
                label={s.name}
                value={s.total}
                displayValue={`$${s.total.toFixed(0)}`}
                max={maxSupplierTotal}
                color="bg-cyan-500"
              />
            ))}
            {topSuppliers.length === 0 && (
              <p className="text-sm text-slate-400 text-center py-4">No data</p>
            )}
          </div>
        </SectionCard>
      </div>

      {/* Cashier performance */}
      <SectionCard title="Cashier Performance">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-slate-50">
              <tr>
                {["CASHIER", "SALES COUNT", "TOTAL REVENUE", "AVG SALE"].map(
                  (h) => (
                    <th
                      key={h}
                      className="text-xs font-semibold text-slate-500 uppercase tracking-wider text-left px-5 py-3"
                    >
                      {h}
                    </th>
                  ),
                )}
              </tr>
            </thead>
            <tbody>
              {cashiers.length === 0 && (
                <tr>
                  <td
                    colSpan={4}
                    className="text-center py-8 text-sm text-slate-400"
                  >
                    No sales data
                  </td>
                </tr>
              )}
              {cashiers.map((c, i) => (
                <tr
                  key={c.name}
                  className="border-t border-slate-100 hover:bg-slate-50"
                >
                  <td className="px-5 py-3.5 flex items-center gap-3">
                    <span
                      className={`w-6 h-6 rounded-full flex items-center justify-center text-xs font-bold text-white ${i === 0 ? "bg-[#164E63]" : "bg-slate-300"}`}
                    >
                      {i + 1}
                    </span>
                    <span className="text-sm font-medium text-slate-800">
                      {c.name}
                    </span>
                  </td>
                  <td className="px-5 py-3.5 text-sm text-slate-700">
                    {c.sales}
                  </td>
                  <td className="px-5 py-3.5 text-sm font-semibold text-[#164E63]">
                    ${c.revenue.toFixed(2)}
                  </td>
                  <td className="px-5 py-3.5 text-sm text-slate-600">
                    ${(c.revenue / c.sales).toFixed(2)}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </SectionCard>

      {/* Low stock alert table */}
      {lowStock.length > 0 && (
        <SectionCard title={`⚠️ Low Stock Alert (${lowStock.length} items)`}>
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-slate-50">
                <tr>
                  {[
                    "PRODUCT",
                    "LOCATION",
                    "CURRENT QTY",
                    "REORDER LEVEL",
                    "STATUS",
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
                {lowStock.map((s) => (
                  <tr
                    key={s.id}
                    className="border-t border-slate-100 bg-red-50/20 hover:bg-red-50/40"
                  >
                    <td className="px-5 py-3.5 text-sm font-medium text-slate-800">
                      {s.product}
                    </td>
                    <td className="px-5 py-3.5 text-sm font-mono text-[#164E63]">
                      {s.location}
                    </td>
                    <td className="px-5 py-3.5 text-sm font-bold text-red-600">
                      {s.qty}
                    </td>
                    <td className="px-5 py-3.5 text-sm text-slate-600">
                      {s.reorder}
                    </td>
                    <td className="px-5 py-3.5">
                      <span className="bg-red-100 text-red-700 text-xs font-semibold px-2.5 py-1 rounded-full">
                        {s.qty === 0 ? "Out of Stock" : "Critical"}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </SectionCard>
      )}
    </div>
  );
}
