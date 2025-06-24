import { useState } from 'react'
import { Pencil, Trash2, Plus } from 'lucide-react'
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import Pagination from '../../../components/Pagination/Pagination'
import type { Book } from '../../../types/book.type'
import { getBooks, softDeleteBook } from '../../../apis/books.api'
import AddBookPopup from '../../../components/AdminComponents/AddBookPopup'
import EditBookPopup from '../../../components/AdminComponents/EditBookPopup'
import Swal from 'sweetalert2'

export default function ListBook() {
  const [page, setPage] = useState(1)
  const size = 5
  const [isModalOpen, setIsModalOpen] = useState(false)
  const [selectedBookId, setSelectedBookId] = useState<string | null>(null)
  const [isEditModalOpen, setIsEditModalOpen] = useState(false)
  const queryClient = useQueryClient()
  const { data, isLoading, isError } = useQuery({
    queryKey: ['books', page],
    queryFn: () => getBooks(page, size)
  })

  const books: Book[] = data?.data.result.elements || []
  //delete book

  const { mutate: deleteBookById } = useMutation({
    mutationFn: (id: string) => softDeleteBook(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['books'] })
      Swal.fire({
        toast: true,
        position: 'top-end',
        icon: 'success',
        title: 'Xóa Tác Giả thành công!',
        showConfirmButton: false,
        timer: 3000,
        timerProgressBar: true
      })
    },
    onError: () => {
      Swal.fire('❌ Xóa thất bại', 'Đã xảy ra lỗi khi xóa tác giả.', 'error')
    }
  })

  // Hàm handleDelete với SweetAlert
  const handleDelete = (id: string) => {
    Swal.fire({
      title: 'Bạn có chắc chắn?',
      icon: 'warning',
      showCancelButton: true,
      confirmButtonColor: '#3085d6',
      cancelButtonColor: '#d33',
      confirmButtonText: 'Xóa!',
      cancelButtonText: 'Hủy'
    }).then((result) => {
      if (result.isConfirmed) {
        deleteBookById(id)
      }
    })
  }

  return (
    <div className='bg-white rounded-2xl shadow-md p-6'>
      <div className='flex items-center justify-between mb-6'>
        <h1 className='text-2xl font-semibold text-gray-800'>📚 Danh sách sách</h1>

        <button
          onClick={() => setIsModalOpen(true)}
          className='flex items-center gap-2 px-4 py-2 bg-purple-500 text-white rounded-xl hover:bg-purple-600 transition shadow-sm'
        >
          <Plus size={18} />
          <span className='text-sm font-medium'>Thêm sách</span>
        </button>
      </div>

      <div className='overflow-x-auto'>
        <table className='min-w-full table-fixed text-sm border-separate border-spacing-y-2'>
          <thead>
            <tr className='text-left text-gray-600'>
              <th className='px-4 py-2'>ID</th>
              <th className='px-4 py-2'>Hình ảnh</th>
              <th className='px-4 py-2'>Tiêu đề</th>
              <th className='px-4 py-2'>Mô tả</th>
              <th className='px-4 py-2'>Tác giả</th>
              <th className='px-4 py-2'>Thể loại</th>
              <th className='px-4 py-2'>Ngày tạo</th>
              <th className='px-4 py-2'>Số lượng tồn kho</th>
              <th className='px-4 py-2'>Tình trạng</th>

              <th className='px-4 py-2 text-center'>Hành động</th>
            </tr>
          </thead>
          <tbody>
            {isLoading ? (
              <tr>
                <td colSpan={8} className='text-center py-4 text-gray-500'>
                  Đang tải dữ liệu...
                </td>
              </tr>
            ) : isError ? (
              <tr>
                <td colSpan={8} className='text-center py-4 text-red-500'>
                  Lỗi khi tải dữ liệu.
                </td>
              </tr>
            ) : books.length === 0 ? (
              <tr>
                <td colSpan={8} className='text-center py-4 text-gray-400 italic'>
                  Không có sách nào.
                </td>
              </tr>
            ) : (
              books.map((book) => (
                <tr key={book.id} className='bg-gray-50 hover:bg-gray-100 rounded-xl shadow-sm transition'>
                  <td className='px-4 py-3 rounded-l-xl'>{book.id}</td>
                  <td className='px-4 py-3'>
                    {book.images && book.images.length > 0 ? (
                      <img src={book.images[0].imageUrl} alt='Book' className='h-10 w-10 object-cover rounded' />
                    ) : (
                      <span className='text-gray-400 italic'>Không có ảnh</span>
                    )}
                  </td>
                  <td className='px-4 py-3'>{book.title}</td>
                  <td className='px-4 py-3 truncate max-w-xs'>{book.description}</td>
                  <td className='px-4 py-3'>{book.author.name}</td>
                  <td className='px-4 py-3'>{book.genre.name}</td>
                  <td className='px-4 py-3'>{book.createdAt}</td>
                  <td className='px-4 py-3'>{book.stock}</td>
                  <td className='px-4 py-3'>{book.status === 1 ? 'Còn phục vụ' : 'Tạm ngưng phục vụ'}</td>

                  <td className='px-4 py-3 text-center rounded-r-xl'>
                    <div className='flex justify-center gap-3'>
                      <button
                        onClick={() => {
                          setSelectedBookId(book.id)
                          setIsEditModalOpen(true)
                        }}
                        className='text-blue-500 hover:text-blue-700 transition'
                        title='Chỉnh sửa'
                      >
                        <Pencil size={18} />
                      </button>
                      <button
                        onClick={() => handleDelete(book.id)}
                        className='text-red-500 hover:text-red-700 transition'
                        title='Xóa'
                      >
                        <Trash2 size={18} />
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

      <AddBookPopup isOpen={isModalOpen} onClose={() => setIsModalOpen(false)} />
      <EditBookPopup
        isOpen={isEditModalOpen}
        bookId={selectedBookId}
        onClose={() => {
          setIsEditModalOpen(false)
          setSelectedBookId(null)
        }}
      />
    </div>
  )
}
