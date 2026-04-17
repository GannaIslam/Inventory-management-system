import { useLocation, useNavigate } from 'react-router-dom'
import { LogOut, User, Menu } from 'lucide-react'
import { useAuth } from '../../hooks/useAuth'

const pageTitles = {
  '/dashboard': 'Operation Overview',
  '/products': 'Products List',
  '/categories': 'Categories & Subcategories',
  '/warehouse/locations': 'Storage Location',
  '/warehouse/stock': 'Storage Ledger',
  '/purchasing/suppliers': 'Supplier List',
  '/purchasing/invoices': 'Purchase Invoice',
  '/purchasing/create': 'Create New Purchase',
  '/sales/pos': 'Create New Sale',
  '/sales/invoices': 'Sales Invoice',
  '/reports': 'Report Hub',
}

export default function Navbar({ onMenuClick }) {
  const location = useLocation()
  const navigate = useNavigate()
  const { user, logout } = useAuth()

  const title = pageTitles[location.pathname] || 'Inventra'

  const handleLogout = () => {
    logout()
    navigate('/login')
  }

  return (
    <header className="sticky top-0 left-0 right-0 lg:left-64 h-14 bg-white border-b border-slate-100 z-30 flex items-center justify-between px-4 sm:px-6">
      <div className="flex items-center gap-3 min-w-0">
        {/* Hamburger — hidden on desktop */}
        <button
          onClick={onMenuClick}
          className="lg:hidden flex items-center justify-center w-8 h-8 rounded-lg text-slate-500 hover:bg-slate-100 transition-colors shrink-0"
          aria-label="Open menu"
        >
          <Menu size={20} />
        </button>
        <span className="text-sm font-medium text-slate-500 truncate">{title}</span>
      </div>

      <div className="flex items-center gap-2 sm:gap-3 shrink-0">
        <div className="flex items-center gap-2 text-sm text-slate-600">
          <div className="w-8 h-8 rounded-full bg-primary-900 flex items-center justify-center shrink-0">
            <User size={14} className="text-white" />
          </div>
          <span className="font-medium hidden sm:inline">{user?.name || 'Admin'}</span>
        </div>
        <button
          onClick={handleLogout}
          className="flex items-center gap-1.5 text-red-500 hover:text-red-600 transition-colors duration-200 ml-1"
          title="Logout"
        >
          <LogOut size={20} />
          {/* <span className="hidden sm:inline">Logout</span> */}
        </button>
      </div>
    </header>
  )
}
