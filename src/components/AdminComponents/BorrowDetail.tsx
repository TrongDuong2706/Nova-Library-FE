import { useQuery } from '@tanstack/react-query'
import { getOneBorrow } from '../../apis/borrow.api'

interface BorrowDetailProps {
  isOpen: boolean
  onClose: () => void
  borrowId: string | null
}

export default function BorrowDetailPopup({ isOpen, onClose, borrowId }: BorrowDetailProps) {
  const { data, isLoading, isError } = useQuery({
    queryKey: ['borrow', borrowId],
    queryFn: () => getOneBorrow(borrowId!),
    enabled: isOpen && !!borrowId
  })

  if (!isOpen) return null

  const borrow = data?.data.result

  return (
    <div className='fixed inset-0 bg-black bg-opacity-50 flex justify-center items-center z-50'>
      <div className='bg-white rounded-2xl p-6 w-full max-w-4xl relative shadow-xl overflow-y-auto max-h-[90vh]'>
        <button className='absolute top-3 right-3 text-gray-500 hover:text-red-500 text-lg' onClick={onClose}>
          &times;
        </button>

        <h2 className='text-2xl font-semibold text-gray-800 mb-6'>📄 Chi tiết lượt mượn</h2>

        {isLoading ? (
          <p className='text-gray-500'>Đang tải dữ liệu...</p>
        ) : isError || !borrow ? (
          <p className='text-red-500'>Không thể tải dữ liệu.</p>
        ) : (
          <>
            <div className='grid grid-cols-2 gap-4 text-sm text-gray-700 mb-6'>
              <div>
                <strong>ID:</strong> {borrow.id}
              </div>
              <div>
                <strong>Trạng thái:</strong>{' '}
                {borrow.status === 'BORROWED'
                  ? 'Hiện đang mượn'
                  : borrow.status === 'RETURNED'
                    ? 'Đã trả'
                    : borrow.status === 'OVERDUE'
                      ? 'Quá hạn'
                      : borrow.status}
              </div>
              <div>
                <strong>Ngày mượn:</strong> {borrow.borrowDate}
              </div>
              <div>
                <strong>Hạn trả:</strong> {borrow.dueDate}
              </div>
              <div>
                <strong>Ngày trả:</strong> {borrow.returnDate || 'Chưa trả'}
              </div>
              <div>
                <strong>Tiền phạt:</strong> {borrow.finalAmount.toLocaleString()} đ
              </div>
              <div className='col-span-2'>
                <strong>Người mượn:</strong> {borrow.userResponse.firstName} {borrow.userResponse.lastName} (
                {borrow.userResponse.studentCode})
              </div>
            </div>

            <hr className='my-4' />

            <h3 className='text-lg font-semibold text-gray-800 mb-3'>📚 Sách đã mượn:</h3>
            <div className='grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4'>
              {borrow.books.map((book) => (
                <div
                  key={book.id}
                  className='border border-gray-200 rounded-xl p-4 shadow-sm hover:shadow-md transition'
                >
                  {book.images[0] ? (
                    <img
                      src={book.images[0].imageUrl}
                      alt={book.title}
                      className='w-full h-40 object-cover rounded-md mb-3'
                    />
                  ) : (
                    <div className='w-full h-40 bg-gray-100 flex items-center justify-center text-gray-400 rounded-md mb-3'>
                      Không có ảnh
                    </div>
                  )}
                  <h4 className='font-medium text-gray-900'>{book.title}</h4>
                  <p className='text-sm text-gray-600'>
                    <span className='font-semibold'>Tác giả: </span>
                    <span>{book.authors.map((a) => a.name).join(', ')}</span>
                  </p>
                  <p className='text-sm text-gray-600'>
                    <span className='font-semibold'>Thể loại: </span>
                    <span>{book.genres.map((g) => g.name).join(', ')}</span>
                  </p>
                </div>
              ))}
            </div>
          </>
        )}
      </div>
    </div>
  )
}
