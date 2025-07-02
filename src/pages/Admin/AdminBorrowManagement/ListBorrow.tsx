import { useState } from 'react'
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import Pagination from '../../../components/Pagination/Pagination'
import { bookRenewal, getBorrowWithFilter, returnBook } from '../../../apis/borrow.api'
import type { Borrow } from '../../../types/borrow.type'
import { Eye, Plus } from 'lucide-react'
import BorrowDetailPopup from '../../../components/AdminComponents/BorrowDetail'
import Swal from 'sweetalert2'
import { useForm } from 'react-hook-form'
import dayjs from 'dayjs'
import { Link } from 'react-router-dom'

type FilterFormData = {
  id: string
  name: string
  borrowDate: string
}

export default function ListBorrow() {
  const [isDetailOpen, setIsDetailOpen] = useState(false)
  const [selectedBorrowId, setSelectedBorrowId] = useState<string | null>(null)
  const [page, setPage] = useState(1)
  const size = 5
  const { register, handleSubmit, reset } = useForm<FilterFormData>()
  const [filterId, setFilterId] = useState<string | null>(null)
  const [filterName, setFilterName] = useState<string | null>(null)
  const [filterBorrowDate, setFilterBorrowDate] = useState<string | null>(null)

  const queryClient = useQueryClient()

  const returnMutation = useMutation({
    mutationFn: (borrowId: string) => returnBook(borrowId),
    onSuccess: () => {
      Swal.fire({
        icon: 'success',
        title: 'Trả sách thành công!',
        timer: 2000,
        showConfirmButton: false,
        toast: true,
        position: 'bottom-end'
      })
      queryClient.invalidateQueries({ queryKey: ['borrows'] })
    },
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    onError: (error: any) => {
      const message = error?.response?.data?.message || 'Đã xảy ra lỗi không xác định. Vui lòng thử lại.'

      Swal.fire({
        icon: 'error',
        title: 'Lỗi khi trả sách!',
        text: message,
        confirmButtonText: 'Đóng'
      })
    }
  })

  const { data, isLoading, isError } = useQuery({
    queryKey: ['borrows', { filterId, filterName, filterBorrowDate, page }],
    queryFn: () => getBorrowWithFilter(filterId, filterName, filterBorrowDate, page, size)
  })

  const borrows: Borrow[] = data?.data.result.elements || []

  const onSubmit = (formData: FilterFormData) => {
    setPage(1)
    setFilterId(formData.id || null)
    setFilterName(formData.name || null)
    setFilterBorrowDate(formData.borrowDate || null)
  }

  const handleClear = () => {
    reset()
    setPage(1)
    setFilterId(null)
    setFilterName(null)
    setFilterBorrowDate(null)
  }

  //Gia hạn
  const renewalMutation = useMutation({
    mutationFn: ({ borrowId, newDueDate }: { borrowId: string; newDueDate: string }) =>
      bookRenewal(borrowId, { newDueDate }),
    onSuccess: () => {
      Swal.fire({
        icon: 'success',
        title: 'Gia hạn thành công!',
        timer: 2000,
        showConfirmButton: false,
        toast: true,
        position: 'bottom-end'
      })
      queryClient.invalidateQueries({ queryKey: ['borrows'] })
    },
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    onError: (error: any) => {
      const message = error?.response?.data?.message || 'Có lỗi khi gia hạn. Vui lòng thử lại.'
      Swal.fire({
        icon: 'error',
        title: 'Lỗi khi gia hạn!',
        text: message
      })
    }
  })

  return (
    <div className='bg-white rounded-2xl shadow-md p-6'>
      <div className='flex items-center justify-between mb-6'>
        <h1 className='text-2xl font-semibold text-gray-800'>📄 Danh sách lượt mượn sách</h1>
        <Link
          to='/admin/borrows/create' // Đổi đường dẫn này nếu bạn muốn khác
          className='flex items-center gap-2 px-4 py-2 bg-green-600 text-white rounded-xl hover:bg-green-700 transition shadow-sm'
        >
          <Plus size={18} />
          <span className='text-sm font-medium'>Tạo đơn mượn</span>
        </Link>
      </div>
      {/* --- START: Giao diện bộ lọc --- */}
      <form onSubmit={handleSubmit(onSubmit)} className='grid grid-cols-1 md:grid-cols-4 gap-4 mb-4 items-end'>
        {/* Mã đơn */}
        <div className='flex flex-col'>
          <label className='text-sm font-medium text-gray-700 mb-1'>Mã đơn</label>
          <input {...register('id')} type='text' className='border px-3 py-2 rounded' placeholder='Nhập mã đơn' />
        </div>

        {/* Tên người mượn */}
        <div className='flex flex-col'>
          <label className='text-sm font-medium text-gray-700 mb-1'>Tên người mượn</label>
          <input
            {...register('name')}
            type='text'
            className='border px-3 py-2 rounded'
            placeholder='Nhập tên người mượn'
          />
        </div>

        {/* Ngày mượn */}
        <div className='flex flex-col'>
          <label className='text-sm font-medium text-gray-700 mb-1'>Ngày mượn</label>
          <input {...register('borrowDate')} type='date' className='border px-3 py-2 rounded' />
        </div>

        {/* Nút */}
        <div className='flex gap-2'>
          <button type='submit' className='bg-blue-600 text-white rounded px-4 py-2 hover:bg-blue-700 transition'>
            Lọc
          </button>
          <button
            type='button'
            onClick={handleClear}
            className='bg-gray-300 text-black rounded px-4 py-2 hover:bg-gray-400 transition'
          >
            Xóa
          </button>
        </div>
      </form>

      {/* --- END: Giao diện bộ lọc --- */}

      <div className='overflow-x-auto'>
        <table className='min-w-full table-fixed text-sm border-separate border-spacing-y-2'>
          <thead>
            <tr className='text-left text-gray-600'>
              <th className='px-4 py-2'>ID</th>
              <th className='px-4 py-2'>Ngày mượn</th>
              <th className='px-4 py-2'>Hạn trả</th>
              <th className='px-4 py-2'>Ngày trả</th>
              <th className='px-4 py-2'>Tiền phạt</th>
              <th className='px-4 py-2'>Trạng thái</th>
              <th className='px-4 py-2'>Người mượn</th>
              <th className='px-4 py-2 text-center'>Hành động</th>
            </tr>
          </thead>
          <tbody>
            {isLoading ? (
              <tr>
                <td colSpan={7} className='text-center py-4 text-gray-500'>
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
                <td colSpan={7} className='text-center py-4 text-gray-400 italic'>
                  Không có lượt mượn nào.
                </td>
              </tr>
            ) : (
              borrows.map((borrow) => (
                <tr key={borrow.id} className='bg-gray-50 hover:bg-gray-100 rounded-xl transition'>
                  <td className='px-4 py-3 rounded-l-xl'>{borrow.id}</td>
                  <td className='px-4 py-3'>
                    {borrow.borrowDate ? dayjs(borrow.borrowDate).format('DD-MM-YYYY') : ''}
                  </td>
                  <td className='px-4 py-3'>{borrow.dueDate ? dayjs(borrow.dueDate).format('DD-MM-YYYY') : ''}</td>
                  <td className='px-4 py-3'>
                    {borrow.returnDate ? dayjs(borrow.returnDate).format('DD-MM-YYYY') : 'Chưa trả'}
                  </td>
                  <td className='px-4 py-3'>{borrow.finalAmount.toLocaleString()} đ</td>
                  <td className='px-4 py-3'>
                    {borrow.status === 'BORROWED'
                      ? 'Hiện đang mượn'
                      : borrow.status === 'RETURNED'
                        ? 'Đã trả'
                        : borrow.status === 'OVERDUE'
                          ? 'Quá hạn'
                          : borrow.status}
                  </td>

                  <td className='px-4 py-3 rounded-r-xl'>
                    {borrow.userResponse?.firstName} {borrow.userResponse?.lastName} <br />
                    <span className='text-gray-500 text-xs'>({borrow.userResponse?.studentCode})</span>
                  </td>
                  <td className='px-4 py-3 text-center rounded-r-xl'>
                    <div className='flex justify-center gap-3'>
                      <button
                        onClick={() => {
                          setSelectedBorrowId(borrow.id)
                          setIsDetailOpen(true)
                        }}
                        className='text-blue-500 hover:text-blue-700 transition'
                        title='Xem chi tiết'
                      >
                        <Eye size={18} />
                      </button>
                      <button
                        onClick={() => {
                          Swal.fire({
                            title: 'Xác nhận trả sách?',
                            text: 'Bạn có chắc chắn muốn trả sách này không?',
                            icon: 'question',
                            showCancelButton: true,
                            confirmButtonText: 'Trả sách',
                            cancelButtonText: 'Hủy'
                          }).then((result) => {
                            if (result.isConfirmed) {
                              returnMutation.mutate(borrow.id)
                            }
                          })
                        }}
                        disabled={borrow.status === 'RETURNED'}
                        className={`px-3 py-1 text-sm rounded-lg transition ${
                          borrow.status === 'Returned'
                            ? 'bg-gray-300 text-gray-600 cursor-not-allowed'
                            : 'bg-green-500 text-white hover:bg-green-600'
                        }`}
                      >
                        Trả sách
                      </button>
                      <button
                        onClick={() => {
                          Swal.fire({
                            title: 'Nhập hạn mới',
                            input: 'date',
                            inputLabel: 'Ngày hạn trả mới',
                            inputAttributes: {
                              min: borrow.dueDate // không cho nhập trước hạn cũ
                            },
                            showCancelButton: true,
                            confirmButtonText: 'Gia hạn',
                            cancelButtonText: 'Hủy'
                          }).then((result) => {
                            if (result.isConfirmed && result.value) {
                              renewalMutation.mutate({
                                borrowId: borrow.id,
                                newDueDate: result.value
                              })
                            }
                          })
                        }}
                        disabled={borrow.status === 'RETURNED'}
                        className={`px-3 py-1 text-sm rounded-lg transition ${
                          borrow.status === 'RETURNED'
                            ? 'bg-gray-300 text-gray-600 cursor-not-allowed'
                            : 'bg-purple-600 text-white hover:bg-purple-700'
                        }`}
                      >
                        Gia hạn
                      </button>
                    </div>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>

        <Pagination
          currentPage={data?.data.result.currentPage ?? 0}
          totalPages={data?.data.result.totalPages ?? 1}
          hasNextPage={data?.data.result.hasNextPage ?? false}
          hasPreviousPage={data?.data.result.hasPreviousPage ?? false}
          onPageChange={(page) => setPage(page + 1)}
        />
      </div>
      <BorrowDetailPopup
        isOpen={isDetailOpen}
        borrowId={selectedBorrowId}
        onClose={() => {
          setIsDetailOpen(false)
          setSelectedBorrowId(null)
        }}
      />
    </div>
  )
}
