import React from 'react'
import Sidebar from '../../components/AdminComponents/Sidebar'
import AdminHeader from '../../components/AdminComponents/AdminHeader'
interface Props {
  children?: React.ReactNode
}
export default function AdminLayout({ children }: Props) {
  return (
    <div className='flex min-h-screen bg-purple-50 text-sm text-gray-800'>
      <Sidebar />
      <div className='flex-1 flex flex-col'>
        <AdminHeader />
        {/* main content */}
        <main className='flex-1 p-6 overflow-auto'>
          <div className='max-w-7xl mx-auto'>{children}</div>
        </main>
      </div>
    </div>
  )
}
