import { useState } from "react";
import { NavLink, useLocation } from "react-router-dom";
import {
  LayoutDashboard,
  Package,
  Warehouse,
  ShoppingCart,
  Monitor,
  BarChart3,
  ChevronDown,
  ChevronRight,
  MapPin,
  BookOpen,
  Users,
  FileText,
  PlusCircle,
  Receipt,
  X,
} from "lucide-react";
import { cn } from "../../utils/helpers";
import { useRole } from "../../hooks/useRole";

const allNavItems = [
  {
    label: "Dashboard",
    path: "/dashboard",
    icon: LayoutDashboard,
  },
  {
    label: "Products",
    path: "/products",
    icon: Package,
  },
  {
    label: "WAREHOUSE",
    icon: Warehouse,
    children: [
      { label: "Stock Location", path: "/warehouse/locations", icon: MapPin },
      { label: "Stock Legend", path: "/warehouse/stock", icon: BookOpen },
    ],
  },
  {
    label: "Purchasing",
    icon: ShoppingCart,
    children: [
      { label: "Supplier List", path: "/purchasing/suppliers", icon: Users },
      {
        label: "Purchase Invoice",
        path: "/purchasing/invoices",
        icon: FileText,
      },
      {
        label: "Create Purchase",
        path: "/purchasing/create",
        icon: PlusCircle,
      },
    ],
  },
  {
    label: "POS Sales",
    icon: Monitor,
    children: [
      { label: "POS Terminal", path: "/sales/pos", icon: Monitor },
      { label: "Sales Invoice", path: "/sales/invoices", icon: Receipt },
    ],
  },
  {
    label: "Report Hub",
    path: "/reports",
    icon: BarChart3,
  },
];

function NavGroup({ item, onClose }) {
  const location = useLocation();
  const isChildActive = item.children?.some((c) =>
    location.pathname.startsWith(c.path),
  );
  const [open, setOpen] = useState(isChildActive);

  return (
    <div>
      <button
        onClick={() => setOpen((o) => !o)}
        className={cn(
          "w-full flex items-center gap-3 px-4 py-3 rounded-lg text-sm font-medium transition-all duration-200",
          isChildActive
            ? "text-white bg-white/10"
            : "text-slate-400 hover:text-white hover:bg-white/5",
        )}
      >
        <item.icon size={18} strokeWidth={1.8} />
        <span className="flex-1 text-left uppercase tracking-wider text-xs font-semibold">
          {item.label}
        </span>
        {open ? <ChevronDown size={14} /> : <ChevronRight size={14} />}
      </button>
      {open && (
        <div className="ml-4 mt-1 space-y-0.5 border-l border-white/10 pl-3">
          {item.children.map((child) => (
            <NavLink
              key={child.path}
              to={child.path}
              onClick={onClose}
              className={({ isActive }) =>
                cn(
                  "flex items-center gap-2.5 px-3 py-2.5 rounded-lg text-sm transition-all duration-200",
                  isActive
                    ? "text-white bg-primary-900 font-medium"
                    : "text-slate-400 hover:text-white hover:bg-white/5",
                )
              }
            >
              <child.icon size={15} strokeWidth={1.8} />
              {child.label}
            </NavLink>
          ))}
        </div>
      )}
    </div>
  );
}

export default function Sidebar({ isOpen, onClose }) {
  const { canAccessRoute } = useRole();

  // Filter nav items based on user permissions
  const navItems = allNavItems
    .filter((item) => {
      if (item.path) return canAccessRoute(item.path);
      if (item.children) {
        return item.children.some((child) => canAccessRoute(child.path));
      }
      return true;
    })
    .map((item) => {
      if (item.children) {
        return {
          ...item,
          children: item.children.filter((child) => canAccessRoute(child.path)),
        };
      }
      return item;
    });

  return (
    <>
      {/* Mobile overlay — hidden on desktop */}
      {isOpen && (
        <div
          className="fixed inset-0 bg-black/50 z-30 lg:hidden"
          onClick={onClose}
        />
      )}

      <aside
        className={cn(
          "fixed top-0 left-0 h-screen w-64 bg-[#0F172A] flex flex-col z-40 select-none",
          "transition-transform duration-300 ease-in-out",
          // Mobile: slide in/out; Desktop: always visible
          isOpen ? "translate-x-0" : "-translate-x-full",
          "lg:translate-x-0",
        )}
      >
        {/* Brand */}
        <div className="px-6 py-5 border-b border-white/10 flex items-center justify-between">
          <h1 className="text-2xl font-extrabold text-white tracking-tight">
            Inven<span className="text-cyan-400">tra</span>
          </h1>
          {/* Close button — only visible on mobile */}
          <button
            onClick={onClose}
            className="lg:hidden text-slate-400 hover:text-white transition-colors p-1"
            aria-label="Close menu"
          >
            <X size={20} />
          </button>
        </div>

        {/* Nav */}
        <nav className="flex-1 overflow-y-auto px-3 py-4 space-y-1">
          {navItems.map((item) =>
            item.children ? (
              <NavGroup key={item.label} item={item} onClose={onClose} />
            ) : (
              <NavLink
                key={item.path}
                to={item.path}
                onClick={onClose}
                className={({ isActive }) =>
                  cn(
                    "flex items-center gap-3 px-4 py-3 rounded-lg text-sm font-medium transition-all duration-200",
                    isActive
                      ? "text-white bg-[#164E63]"
                      : "text-slate-400 hover:text-white hover:bg-white/5",
                  )
                }
              >
                <item.icon size={18} strokeWidth={1.8} />
                {item.label}
              </NavLink>
            ),
          )}
        </nav>
      </aside>
    </>
  );
}
