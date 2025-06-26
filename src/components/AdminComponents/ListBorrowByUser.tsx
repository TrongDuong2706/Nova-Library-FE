import { useState } from 'react'
import { useQuery } from '@tanstack/react-query'
import { Clock, CheckCircle, AlertCircle, X } from 'lucide-react'
import { getAllBorrowByUserId } from '../../apis/borrow.api'
import Pagination from '../Pagination/Pagination'

interface BorrowByUserProps {
  isOpen: boolean
  onClose: () => void
  userId: string | null
}

export default function ListBorrowByUser({ isOpen, onClose, userId }: BorrowByUserProps) {
  const [page, setPage] = useState(1)
  const size = 5

  const { data, isLoading, isError } = useQuery({
    queryKey: ['borrowings', userId, page],
    queryFn: () => getAllBorrowByUserId(userId!, page, size),
    enabled: isOpen && !!userId
  })

  const borrows = data?.data.result.elements || []

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
    OVERDUE: {
      text: 'Quá hạn',
      icon: <AlertCircle className='h-4 w-4' />,
      classes: 'bg-red-500/10 text-red-400 border-red-500/20'
    }
  }

  if (!isOpen) return null

  return (
    <div className='fixed inset-0 bg-black bg-opacity-50 flex justify-center items-center z-50'>
      <div className='bg-white w-full max-w-5xl rounded-lg shadow-lg p-6 relative'>
        <button onClick={onClose} className='absolute top-3 right-3 text-gray-500 hover:text-gray-700'>
          <X size={20} />
        </button>
        <h2 className='text-xl font-semibold mb-4'>📚 Lịch sử mượn sách của người dùng</h2>

        <div className='overflow-x-auto'>
          <table className='min-w-full text-sm text-left text-gray-700'>
            <thead className='text-xs text-gray-500 uppercase bg-gray-100'>
              <tr>
                <th className='px-4 py-2'>Mã đơn</th>
                <th className='px-4 py-2'>Ngày mượn</th>
                <th className='px-4 py-2'>Hạn trả</th>
                <th className='px-4 py-2'>Ngày trả</th>
                <th className='px-4 py-2'>Tiền phạt</th>
                <th className='px-4 py-2'>Trạng thái</th>
              </tr>
            </thead>
            <tbody>
              {isLoading ? (
                <tr>
                  <td colSpan={7} className='text-center py-4'>
                    Đang tải dữ liệu...
                  </td>
                </tr>
              ) : isError ? (
                <tr>
                  <td colSpan={7} className='text-center py-4 text-red-500'>
                    Lỗi khi tải dữ liệu.
                  </td>
                </tr>
              ) : borrows.length === 0 ? (
                <tr>
                  <td colSpan={7} className='text-center py-4 italic text-gray-400'>
                    Không có đơn mượn nào
                  </td>
                </tr>
              ) : (
                borrows.map((borrow) => {
                  const config = statusConfig[borrow.status as keyof typeof statusConfig] || {
                    icon: null,
                    classes: 'bg-gray-200 text-gray-600 border-gray-300'
                  }
                  return (
                    <tr key={borrow.id} className='hover:bg-gray-50'>
                      <td className='px-4 py-2'>{borrow.id}</td>
                      <td className='px-4 py-2'>{borrow.borrowDate || '-'}</td>
                      <td className='px-4 py-2'>{borrow.dueDate || '-'}</td>
                      <td className='px-4 py-2'>{borrow.returnDate || 'Chưa trả'}</td>
                      <td className={`px-4 py-2 ${borrow.finalAmount > 0 ? 'text-red-500' : ''}`}>
                        {borrow.finalAmount?.toLocaleString()} đ
                      </td>
                      <td className='px-4 py-2'>
                        <span
                          className={`inline-flex items-center gap-1.5 font-semibold px-3 py-1 text-xs rounded-full border ${config.classes}`}
                        >
                          {config.icon}
                          {config.text}
                        </span>
                      </td>
                    </tr>
                  )
                })
              )}
            </tbody>
          </table>
        </div>

        <Pagination
          currentPage={data?.data.result.currentPage ?? 0}
          totalPages={data?.data.result.totalPages ?? 1}
          hasNextPage={data?.data.result.hasNextPage ?? false}
          hasPreviousPage={data?.data.result.hasPreviousPage ?? false}
          onPageChange={(p) => setPage(p + 1)}
        />
      </div>
    </div>
  )
}
