import { useState } from 'react'
import { Outlet } from 'react-router-dom'
import Sidebar from '../components/layout/Sidebar'
import Navbar from '../components/layout/Navbar'

export default function MainLayout() {
  const [sidebarOpen, setSidebarOpen] = useState(false)

  return (
    <div className="flex min-h-screen bg-[#F1F5F9]">
      <Sidebar isOpen={sidebarOpen} onClose={() => setSidebarOpen(false)} />
      <div className="flex-1 lg:ml-64 flex flex-col min-h-screen">
        <Navbar onMenuClick={() => setSidebarOpen(o => !o)} />
        <main className="flex-1 pt-14 p-3 sm:p-6 overflow-auto">
          <Outlet />
        </main>
      </div>
    </div>
  )
}
