import { useState } from 'react'
import { useQuery } from '@tanstack/react-query'
import { BookOpen, ChevronLeft, AlertCircle, CheckCircle, Clock, Hourglass } from 'lucide-react'
import { getMyBorrows } from '../../apis/borrow.api' // Đường dẫn đổi theo dự án của bạn
import Pagination from '../../components/Pagination/Pagination'
import { Link } from 'react-router-dom'

export default function MyBorrow() {
  const [page, setPage] = useState(1)
  const size = 5
  const { data, isLoading } = useQuery({
    queryKey: ['myBorrows', page],
    queryFn: () => getMyBorrows(page, size) // Ví dụ page = 1, size = 100
  })

  const statusConfig = {
    BORROWED: {
      text: 'Đang mượn',
      icon: <Clock className='h-4 w-4' />,
      classes: 'bg-blue-500/10 text-blue-400 border-blue-500/20'
    },
    RETURNED: {
      text: 'Đã trả',
      icon: <CheckCircle className='h-4 w-4' />,
      classes: 'bg-green-500/10 text-green-400 border-green-500/20'
    },
    'Quá hạn': {
      text: 'Đã trả',
      icon: <AlertCircle className='h-4 w-4' />,
      classes: 'bg-red-500/10 text-red-400 border-red-500/20'
    },
    'Đang chờ duyệt': {
      text: 'Đã trả',
      icon: <Hourglass className='h-4 w-4' />,
      classes: 'bg-yellow-500/10 text-yellow-400 border-yellow-500/20'
    }
  }

  return (
    <div className='bg-slate-900 text-white min-h-screen font-sans'>
      <header className='sticky top-0 z-50 bg-slate-900/80 backdrop-blur-sm border-b border-slate-800'>
        <div className='container mx-auto px-4 sm:px-6 lg:px-8'>
          <div className='flex items-center justify-between h-16'>
            <Link to='/'>
              <div className='flex items-center gap-2 text-white'>
                <BookOpen className='h-6 w-6 text-teal-500' />
                <span className='text-xl font-bold'>Nova Library</span>
              </div>
            </Link>
            <Link to='/'>
              <div className='flex items-center gap-1.5 px-3 py-1.5 bg-slate-800 text-slate-300 border border-slate-700 rounded-full text-sm'>
                <ChevronLeft className='h-4 w-4' />
                Quay lại
              </div>
            </Link>
          </div>
        </div>
      </header>

      <main className='container mx-auto px-4 sm:px-6 lg:px-8 py-10'>
        <div className='max-w-7xl mx-auto'>
          <div className='mb-8'>
            <h1 className='text-3xl font-bold text-slate-100'>Lịch sử mượn sách</h1>
            <p className='text-slate-400 mt-1'>Quản lý và theo dõi tất cả các lượt mượn của bạn.</p>
          </div>

          <div className='bg-slate-800/50 border border-slate-800 rounded-lg overflow-hidden'>
            <div className='overflow-x-auto'>
              <table className='min-w-full text-sm text-left text-slate-300'>
                <thead className='text-xs text-slate-400 uppercase bg-slate-800'>
                  <tr>
                    <th className='px-6 py-4 font-semibold tracking-wider'>Mã đơn</th>
                    <th className='px-6 py-4 font-semibold tracking-wider'>Ngày mượn</th>
                    <th className='px-6 py-4 font-semibold tracking-wider'>Hạn trả</th>
                    <th className='px-6 py-4 font-semibold tracking-wider'>Ngày trả</th>
                    <th className='px-6 py-4 font-semibold tracking-wider'>Tiền phạt</th>
                    <th className='px-6 py-4 font-semibold tracking-wider'>Trạng thái</th>
                    {/* <th className='px-6 py-4 font-semibold tracking-wider text-center'>Hành động</th> */}
                  </tr>
                </thead>

                <tbody className='divide-y divide-slate-800'>
                  {isLoading && (
                    <tr>
                      <td colSpan={7} className='text-center py-6'>
                        Đang tải dữ liệu...
                      </td>
                    </tr>
                  )}

                  {data?.data.result.elements.length === 0 && !isLoading && (
                    <tr>
                      <td colSpan={7} className='text-center py-6 text-slate-500 italic'>
                        Không có đơn mượn nào
                      </td>
                    </tr>
                  )}

                  {data?.data.result.elements.map((borrow) => {
                    const status = borrow.status // Ví dụ field tên trạng thái
                    const config = statusConfig[status as keyof typeof statusConfig] || {
                      icon: null,
                      classes: 'bg-slate-700 text-slate-300 border-slate-600'
                    }
                    return (
                      <tr key={borrow.id} className='hover:bg-slate-800'>
                        <td className='px-6 py-4'>{borrow.id || borrow.id}</td>
                        <td className='px-6 py-4'>{borrow.borrowDate || '-'}</td>
                        <td className='px-6 py-4'>{borrow.dueDate || '-'}</td>
                        <td className='px-6 py-4'>{borrow.returnDate || 'Chưa trả'}</td>
                        <td className={`px-6 py-4 ${borrow.finalAmount > 0 ? 'text-red-400' : ''}`}>
                          {borrow.finalAmount?.toLocaleString()} đ
                        </td>
                        <td className='px-6 py-4'>
                          <span
                            className={`inline-flex items-center gap-1.5 font-semibold px-3 py-1 text-xs rounded-full border ${config.classes}`}
                          >
                            {config.icon}
                            {config.text}
                          </span>
                        </td>
                        {/* <td className='px-6 py-4 text-center'>
                          <Eye className='h-5 w-5 text-slate-300 hover:text-teal-400 cursor-pointer' />
                        </td> */}
                      </tr>
                    )
                  })}
                </tbody>
              </table>
            </div>
          </div>
          <Pagination
            currentPage={data?.data.result.currentPage ?? 0}
            totalPages={data?.data.result.totalPages ?? 1}
            hasNextPage={data?.data.result.hasNextPage ?? false}
            hasPreviousPage={data?.data.result.hasPreviousPage ?? false}
            onPageChange={(page) => setPage(page + 1)}
          />
        </div>
      </main>
    </div>
  )
}
