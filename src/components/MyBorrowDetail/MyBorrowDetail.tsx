// src/components/MyBorrowDetail/MyBorrowDetail.tsx

import React from 'react'
import { useQuery } from '@tanstack/react-query'
import { getOneBorrow } from '../../apis/borrow.api' // Đảm bảo đường dẫn này đúng
import { X, Loader2, FileText, AlertTriangle } from 'lucide-react'

interface BorrowDetailProps {
  isOpen: boolean
  onClose: () => void
  borrowId: string | null
}

export default function MyBorrowDetail({ isOpen, onClose, borrowId }: BorrowDetailProps) {
  const { data, isLoading, isError } = useQuery({
    queryKey: ['borrow', borrowId],
    // Hàm queryFn sẽ chỉ được gọi khi `enabled` là true
    queryFn: () => getOneBorrow(borrowId!),
    // Chỉ fetch dữ liệu khi popup được mở và có borrowId
    enabled: isOpen && !!borrowId
  })

  // Không render gì nếu popup không mở
  if (!isOpen) return null

  const borrow = data?.data.result

  // Xử lý sự kiện click ra ngoài để đóng popup
  const handleBackdropClick = (e: React.MouseEvent<HTMLDivElement>) => {
    if (e.target === e.currentTarget) {
      onClose()
    }
  }

  return (
    <div
      className='fixed inset-0 bg-black/60 backdrop-blur-sm flex justify-center items-center z-50 p-4'
      onClick={handleBackdropClick}
    >
      <div className='bg-slate-900 border border-slate-700 rounded-lg shadow-xl w-full max-w-4xl relative overflow-hidden max-h-[90vh] flex flex-col'>
        {/* Header */}
        <div className='flex items-center justify-between p-4 border-b border-slate-800 flex-shrink-0'>
          <div className='flex items-center gap-3'>
            <FileText className='h-6 w-6 text-teal-400' />
            <h2 className='text-xl font-bold text-slate-100'>Chi tiết lượt mượn</h2>
          </div>
          <button
            onClick={onClose}
            className='p-1 rounded-full text-slate-400 hover:bg-slate-700 hover:text-white transition-colors'
          >
            <X className='h-5 w-5' />
          </button>
        </div>

        {/* Body */}
        <div className='p-6 overflow-y-auto'>
          {isLoading && (
            <div className='flex flex-col items-center justify-center h-64 text-slate-400'>
              <Loader2 className='h-8 w-8 animate-spin mb-3' />
              <p>Đang tải dữ liệu...</p>
            </div>
          )}

          {isError && (
            <div className='flex flex-col items-center justify-center h-64 text-red-400'>
              <AlertTriangle className='h-8 w-8 mb-3' />
              <p>Không thể tải dữ liệu. Vui lòng thử lại.</p>
            </div>
          )}

          {!isLoading && !isError && borrow && (
            <>
              {/* Thông tin chung */}
              <div className='grid grid-cols-1 md:grid-cols-2 gap-x-8 gap-y-4 text-sm mb-6'>
                <div className='flex justify-between'>
                  <span className='font-semibold text-slate-400'>Mã đơn:</span>
                  <span className='text-slate-200 font-mono'>{borrow.id}</span>
                </div>
                <div className='flex justify-between'>
                  <span className='font-semibold text-slate-400'>Trạng thái:</span>
                  <span className='text-slate-200 font-semibold'>{borrow.status}</span>
                </div>
                <div className='flex justify-between'>
                  <span className='font-semibold text-slate-400'>Ngày mượn:</span>
                  <span className='text-slate-200'>{borrow.borrowDate}</span>
                </div>
                <div className='flex justify-between'>
                  <span className='font-semibold text-slate-400'>Hạn trả:</span>
                  <span className='text-slate-200'>{borrow.dueDate}</span>
                </div>
                <div className='flex justify-between'>
                  <span className='font-semibold text-slate-400'>Ngày trả:</span>
                  <span className='text-slate-200'>{borrow.returnDate || 'Chưa trả'}</span>
                </div>
                <div className='flex justify-between'>
                  <span className='font-semibold text-slate-400'>Tiền phạt:</span>
                  <span className={`font-bold ${borrow.finalAmount > 0 ? 'text-red-400' : 'text-green-400'}`}>
                    {borrow.finalAmount.toLocaleString('vi-VN')} đ
                  </span>
                </div>
                <div className='col-span-1 md:col-span-2 flex justify-between'>
                  <span className='font-semibold text-slate-400'>Người mượn:</span>
                  <span className='text-slate-200'>
                    {borrow.userResponse.firstName} {borrow.userResponse.lastName} ({borrow.userResponse.studentCode})
                  </span>
                </div>
              </div>

              <hr className='border-slate-800 my-6' />

              {/* Danh sách sách */}
              <div>
                <h3 className='text-lg font-semibold text-slate-200 mb-4'>📚 Sách đã mượn</h3>
                <div className='grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4'>
                  {borrow.books.map((book) => (
                    <div
                      key={book.id}
                      className='bg-slate-800/50 border border-slate-700 rounded-lg p-4 transition hover:border-teal-500/50'
                    >
                      {book.images && book.images[0] ? (
                        <img
                          src={book.images[0].imageUrl}
                          alt={book.title}
                          className='w-full h-40 object-cover rounded-md mb-3 bg-slate-700'
                        />
                      ) : (
                        <div className='w-full h-40 bg-slate-700 flex items-center justify-center text-slate-500 rounded-md mb-3'>
                          Không có ảnh
                        </div>
                      )}
                      <h4 className='font-semibold text-slate-100 truncate' title={book.title}>
                        {book.title}
                      </h4>
                      <p className='text-sm text-slate-400 mt-1'>
                        <span className='font-medium'>Tác giả:</span>{' '}
                        {book.authors.map((author, index) => (
                          <span key={index}>{author.name}</span>
                        ))}
                      </p>
                      <p className='text-sm text-slate-400'>
                        <span className='font-medium'>Thể loại:</span>{' '}
                        {book.genres.map((genre, index) => (
                          <span key={index}>{genre.name}</span>
                        ))}
                      </p>
                    </div>
                  ))}
                </div>
              </div>
            </>
          )}
        </div>
      </div>
    </div>
  )
}
