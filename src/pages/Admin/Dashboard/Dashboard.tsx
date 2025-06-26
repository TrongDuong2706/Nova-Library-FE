import { useQuery } from '@tanstack/react-query'
import { countBook, getAllBookZeroStock } from '../../../apis/books.api'
import { countBorrowed, countOverdue, getAllOverdueBorrow } from '../../../apis/borrow.api'
import StatisticalChart from '../../../components/AdminComponents/StatisticalChart'
import { useState } from 'react'
import Pagination from '../../../components/Pagination/Pagination'

export default function Dashboard() {
  const [page, setPage] = useState(1)
  const [zeroStockPage, setZeroStockPage] = useState(1)

  const size = 5

  const { data: countBookData } = useQuery({
    queryKey: ['countBook'],
    queryFn: () => countBook()
  })
  const countBookDataRespone = countBookData?.data.result

  const { data: countBorrowedData } = useQuery({
    queryKey: ['countBorrowed'],
    queryFn: () => countBorrowed()
  })
  const countBorrowedResponse = countBorrowedData?.data.result

  const { data: countOverdueData } = useQuery({
    queryKey: ['countOverdue'],
    queryFn: () => countOverdue()
  })
  const countOverdueResponse = countOverdueData?.data.result

  const { data: overdueBorrowData, isLoading } = useQuery({
    queryKey: ['usersWithOverDueBorrow', page],
    queryFn: () => getAllOverdueBorrow(page, size)
  })
  const result = overdueBorrowData?.data.result
  const elements = result?.elements || []

  const { data: zeroStockData, isLoading: isLoadingZeroStock } = useQuery({
    queryKey: ['zeroStockBooks', zeroStockPage],
    queryFn: () => getAllBookZeroStock(zeroStockPage, size)
  })
  const zeroStockResult = zeroStockData?.data.result
  const zeroStockElements = zeroStockResult?.elements || []

  return (
    <main className='flex-1 px-6 py-5 overflow-auto'>
      {/* Stats */}
      <div className='grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4'>
        <div className='bg-white p-4 rounded-lg shadow border-l-4 border-purple-500'>
          <p className='text-gray-500 text-xs'>Tổng số sách</p>
          <p className='text-xl font-bold text-purple-700 mt-1'>{countBookDataRespone}</p>
        </div>
        <div className='bg-white p-4 rounded-lg shadow border-l-4 border-purple-500'>
          <p className='text-gray-500 text-xs'>Số lượng đơn mượn sách</p>
          <p className='text-xl font-bold text-purple-700 mt-1'>{countBorrowedResponse}</p>
        </div>
        <div className='bg-white p-4 rounded-lg shadow border-l-4 border-red-400'>
          <p className='text-gray-500 text-xs'>Số lượng đơn mượn quá hạn</p>
          <p className='text-xl font-bold text-red-600 mt-1'>{countOverdueResponse}</p>
        </div>
      </div>

      {/* Recent activity */}
      <StatisticalChart />

      {/* Overdue members list */}
      <div className='mt-6 bg-white rounded-lg shadow p-4'>
        <h3 className='text-lg font-semibold text-gray-700 mb-4'>Danh sách thành viên trả sách trễ</h3>
        {isLoading ? (
          <p className='text-sm text-gray-500'>Đang tải dữ liệu...</p>
        ) : (
          <table className='w-full text-left border-collapse'>
            <thead>
              <tr>
                <th className='border-b p-2'>Mã đơn mượn</th>
                <th className='border-b p-2'>Tên</th>
                <th className='border-b p-2'>Mã sinh viên</th>
                <th className='border-b p-2'>Ngày mượn</th>
                <th className='border-b p-2'>Ngày hạn</th>
              </tr>
            </thead>
            <tbody>
              {elements.length > 0 ? (
                // eslint-disable-next-line @typescript-eslint/no-explicit-any
                elements.map((borrow: any) => (
                  <tr key={borrow.id}>
                    <td className='border-b p-2'>{borrow.id}</td>
                    <td className='border-b p-2'>
                      {borrow.userResponse.firstName} {borrow.userResponse.lastName}
                    </td>
                    <td className='border-b p-2'>{borrow.userResponse.studentCode}</td>
                    <td className='border-b p-2'>{borrow.borrowDate}</td>
                    <td className='border-b p-2'>{borrow.dueDate}</td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td className='p-2 text-center text-gray-500' colSpan={5}>
                    Không có dữ liệu
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        )}

        <Pagination
          currentPage={result?.currentPage ?? 0}
          totalPages={result?.totalPages ?? 1}
          hasNextPage={result?.hasNextPage ?? false}
          hasPreviousPage={result?.hasPreviousPage ?? false}
          onPageChange={setPage}
        />
      </div>
      {/* Zero stock books list */}
      <div className='mt-6 bg-white rounded-lg shadow p-4'>
        <h3 className='text-lg font-semibold text-gray-700 mb-4'>Danh sách sách hết hàng</h3>
        {isLoadingZeroStock ? (
          <p className='text-sm text-gray-500'>Đang tải dữ liệu...</p>
        ) : (
          <table className='w-full text-left border-collapse'>
            <thead>
              <tr>
                <th className='border-b p-2'>Mã sách</th>
                <th className='border-b p-2'>Hình ảnh</th>
                <th className='border-b p-2'>Tiêu đề</th>
                <th className='border-b p-2'>Tác giả</th>
                <th className='border-b p-2'>Thể loại</th>
              </tr>
            </thead>
            <tbody>
              {zeroStockElements.length > 0 ? (
                // eslint-disable-next-line @typescript-eslint/no-explicit-any
                zeroStockElements.map((book: any) => (
                  <tr key={book.id}>
                    <td className='border-b p-2'>{book.id}</td>
                    <td className='border-b p-2'>
                      {' '}
                      {book.images && book.images.length > 0 ? (
                        <img src={book.images[0].imageUrl} alt='Book' className='h-10 w-10 object-cover rounded' />
                      ) : (
                        <span className='text-gray-400 italic'>Không có ảnh</span>
                      )}
                    </td>
                    <td className='border-b p-2'>{book.title}</td>
                    <td className='border-b p-2'>{book.author.name}</td>
                    <td className='border-b p-2'>{book.genre.name}</td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td className='p-2 text-center text-gray-500' colSpan={4}>
                    Không có dữ liệu
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        )}

        <Pagination
          currentPage={zeroStockResult?.currentPage ?? 0}
          totalPages={zeroStockResult?.totalPages ?? 1}
          hasNextPage={zeroStockResult?.hasNextPage ?? false}
          hasPreviousPage={zeroStockResult?.hasPreviousPage ?? false}
          onPageChange={setZeroStockPage}
        />
      </div>
    </main>
  )
}
