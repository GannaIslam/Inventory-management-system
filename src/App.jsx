import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom'
import { AuthProvider } from './hooks/useAuth'
import ProtectedRoute from './routes/ProtectedRoute'
import MainLayout from './layouts/MainLayout'

import LoginPage from './pages/LoginPage'
import DashboardPage from './pages/DashboardPage'
import ProductsPage from './pages/ProductsPage'
import CategoriesPage from './pages/CategoriesPage'
import WarehouseLocationsPage from './pages/WarehouseLocationsPage'
import StockLedgerPage from './pages/StockLedgerPage'
import SuppliersPage from './pages/SuppliersPage'
import PurchaseInvoicesPage from './pages/PurchaseInvoicesPage'
import CreatePurchasePage from './pages/CreatePurchasePage'
import POSPage from './pages/POSPage'
import SalesInvoicesPage from './pages/SalesInvoicesPage'
import ReportsPage from './pages/ReportsPage'

export default function App() {
  return (
    <AuthProvider>
      <BrowserRouter>
        <Routes>
          <Route path="/login" element={<LoginPage />} />
          <Route element={<ProtectedRoute />}>
            <Route element={<MainLayout />}>
              <Route index element={<Navigate to="/dashboard" replace />} />
              <Route path="/dashboard" element={<DashboardPage />} />
              <Route path="/products" element={<ProductsPage />} />
              <Route path="/categories" element={<CategoriesPage />} />
              <Route path="/warehouse/locations" element={<WarehouseLocationsPage />} />
              <Route path="/warehouse/stock" element={<StockLedgerPage />} />
              <Route path="/purchasing/suppliers" element={<SuppliersPage />} />
              <Route path="/purchasing/invoices" element={<PurchaseInvoicesPage />} />
              <Route path="/purchasing/create" element={<CreatePurchasePage />} />
              <Route path="/sales/pos" element={<POSPage />} />
              <Route path="/sales/invoices" element={<SalesInvoicesPage />} />
              <Route path="/reports" element={<ReportsPage />} />
              <Route path="*" element={<Navigate to="/dashboard" replace />} />
            </Route>
          </Route>
        </Routes>
      </BrowserRouter>
    </AuthProvider>
  )
}
