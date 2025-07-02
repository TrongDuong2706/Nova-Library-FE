import { useState } from 'react'
import { Pencil, Trash2, Plus, Search } from 'lucide-react'
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { useForm } from 'react-hook-form'
import Swal from 'sweetalert2'

import Pagination from '../../../components/Pagination/Pagination'
import AddBookPopup from '../../../components/AdminComponents/AddBookPopup'
// import EditBookPopup from '../../../components/AdminComponents/EditBookPopup'

import type { Book } from '../../../types/book.type'
import { getBooksWithAdminFilter, softDeleteBook } from '../../../apis/books.api'
import { getGenres } from '../../../apis/genre.api'
import { Link } from 'react-router-dom'

// Định nghĩa kiểu dữ liệu cho form lọc
type FilterFormData = {
  keyword: string
  authorName: string
  genreName: string
  status: string // Form value luôn là string
  isbn: string
}

export default function ListBook() {
  const [page, setPage] = useState(1)
  const size = 5
  const [isModalOpen, setIsModalOpen] = useState(false)
  // const [selectedBookId, setSelectedBookId] = useState<string | null>(null)
  // const [isEditModalOpen, setIsEditModalOpen] = useState(false)

  const { register, handleSubmit, reset } = useForm<FilterFormData>()

  // State thực tế dùng để trigger query, các giá trị này lấy từ form
  const [filterKeyword, setFilterKeyword] = useState('')
  const [filterAuthorName, setFilterAuthorName] = useState('')
  const [filterGenreName, setFilterGenreName] = useState('')
  const [filterStatus, setFilterStatus] = useState('') // Giữ là string để khớp với form
  const [filterIsbn, setFilterIsbn] = useState('')

  const queryClient = useQueryClient()

  const { data, isLoading, isError } = useQuery({
    queryKey: ['books', { filterKeyword, filterAuthorName, filterGenreName, filterStatus, filterIsbn, page }],
    queryFn: () => {
      // ===== ĐÂY LÀ PHẦN SỬA ĐỔI QUAN TRỌNG =====
      // Chuyển đổi status từ string sang number | null trước khi gọi API
      const numericStatus = filterStatus === '' ? null : parseInt(filterStatus, 10)

      // Gọi API với các tham số đúng thứ tự và đúng kiểu dữ liệu
      return getBooksWithAdminFilter(
        filterAuthorName,
        filterGenreName,
        filterKeyword,
        numericStatus,
        filterIsbn, // ✅ đúng vị trí
        page,
        size
      )
    }
  })

  const { data: genresData } = useQuery({
    queryKey: ['genres'],
    queryFn: () => getGenres(1, 100)
  })

  const genres = genresData?.data.result.elements || []
  const books: Book[] = data?.data.result.elements || []

  const { mutate: deleteBookById } = useMutation({
    mutationFn: (id: string) => softDeleteBook(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['books'] })
      Swal.fire({
        toast: true,
        position: 'bottom-end',
        icon: 'success',
        title: 'Xóa sách thành công!',
        showConfirmButton: false,
        timer: 3000,
        timerProgressBar: true
      })
    },
    onError: () => {
      Swal.fire('❌ Xóa thất bại', 'Đã xảy ra lỗi khi xóa sách.', 'error')
    }
  })

  const handleDelete = (id: string) => {
    Swal.fire({
      title: 'Bạn có chắc chắn muốn xóa?',
      text: 'Sách sẽ được chuyển vào thùng rác!',
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

  const onSubmit = (formData: FilterFormData) => {
    setPage(1)
    setFilterKeyword(formData.keyword || '')
    setFilterAuthorName(formData.authorName || '')
    setFilterGenreName(formData.genreName || '')
    setFilterStatus(formData.status || '') // Cập nhật state string
    setFilterIsbn(formData.isbn || '')
  }

  const handleClearFilter = () => {
    reset({ keyword: '', authorName: '', genreName: '', status: '', isbn: '' })
    setFilterIsbn('')
    setPage(1)
    setFilterKeyword('')
    setFilterAuthorName('')
    setFilterGenreName('')
    setFilterStatus('')
  }

  return (
    <div className='bg-white rounded-2xl shadow-md p-6'>
      <div className='flex items-center justify-between mb-4'>
        <h1 className='text-2xl font-semibold text-gray-800'>📚 Danh sách sách</h1>
        <Link
          to='/admin/books/create' // Điều hướng đến trang thêm sách mới
          className='flex items-center gap-2 px-4 py-2 bg-purple-500 text-white rounded-xl hover:bg-purple-600 transition shadow-sm'
        >
          <Plus size={18} />
          <span className='text-sm font-medium'>Thêm sách</span>
        </Link>
      </div>

      {/* ===== KHU VỰC BỘ LỌC ===== */}
      <form onSubmit={handleSubmit(onSubmit)} className='mb-4'>
        <div className='grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-3 gap-4'>
          {/* Tiêu đề */}
          {/* Từ khóa */}
          <div>
            <label className='block text-xs text-gray-600 mb-1'>Từ khóa</label>
            <input
              {...register('keyword')}
              type='text'
              placeholder='Nhập tiêu đề hoặc mô tả'
              className='w-full px-3 py-2 border border-gray-300 rounded-md text-sm focus:outline-none focus:ring-1 focus:ring-purple-500'
            />
          </div>

          {/* Tác giả */}
          <div>
            <label className='block text-xs text-gray-600 mb-1'>Tác giả</label>
            <input
              {...register('authorName')}
              type='text'
              placeholder='Nhập tên tác giả'
              className='w-full px-3 py-2 border border-gray-300 rounded-md text-sm focus:outline-none focus:ring-1 focus:ring-purple-500'
            />
          </div>

          {/* ISBN */}
          <div>
            <label className='block text-xs text-gray-600 mb-1'>ISBN</label>
            <input
              {...register('isbn')}
              type='text'
              placeholder='Nhập mã ISBN'
              className='w-full px-3 py-2 border border-gray-300 rounded-md text-sm focus:outline-none focus:ring-1 focus:ring-purple-500'
            />
          </div>

          {/* Thể loại */}
          <div>
            <label className='block text-xs text-gray-600 mb-1'>Thể loại</label>
            <select
              {...register('genreName')}
              className='w-full px-3 py-2 border border-gray-300 rounded-md text-sm focus:outline-none focus:ring-1 focus:ring-purple-500'
            >
              <option value=''>-- Chọn thể loại --</option>
              {genres.map((genre) => (
                <option key={genre.id} value={genre.name}>
                  {genre.name}
                </option>
              ))}
            </select>
          </div>

          {/* Trạng thái */}
          <div>
            <label className='block text-xs text-gray-600 mb-1'>Tình trạng</label>
            <select
              {...register('status')}
              className='w-full px-3 py-2 border border-gray-300 rounded-md text-sm focus:outline-none focus:ring-1 focus:ring-purple-500'
            >
              <option value=''>-- Chọn tình trạng --</option>
              <option value='1'>Còn phục vụ</option>
              <option value='0'>Ngưng phục vụ</option>
            </select>
          </div>

          {/* Button group */}
          <div className='flex items-end justify-start gap-2'>
            <button
              type='submit'
              className='flex items-center gap-1 px-4 py-2 bg-blue-500 text-white rounded-md text-sm hover:bg-blue-600 transition'
            >
              <Search size={16} />
              Lọc
            </button>
            <button
              type='button'
              onClick={handleClearFilter}
              className='flex items-center gap-1 px-4 py-2 bg-gray-200 text-gray-800 rounded-md text-sm hover:bg-gray-300 transition'
            >
              🧹 Xóa lọc
            </button>
          </div>
        </div>
      </form>

      {/* ===== KẾT THÚC BỘ LỌC ===== */}

      <div className='overflow-x-auto'>
        <table className='min-w-full table-fixed text-sm border-separate border-spacing-y-2'>
          <thead>
            <tr className='text-left text-gray-600'>
              <th className='px-4 py-2'>ISBN</th>
              <th className='px-4 py-2'>Hình ảnh</th>
              <th className='px-4 py-2'>Tiêu đề</th>
              <th className='px-4 py-2'>Mô tả</th>
              <th className='px-4 py-2'>Tác giả</th>
              <th className='px-4 py-2'>Thể loại</th>
              <th className='px-4 py-2'>Ngày tạo</th>
              <th className='px-4 py-2'>Ngày xuất bản</th>
              <th className='px-4 py-2'>Tồn kho</th>
              <th className='px-4 py-2'>Tình trạng</th>
              <th className='px-4 py-2 text-center'>Hành động</th>
            </tr>
          </thead>
          <tbody>
            {isLoading ? (
              <tr>
                <td colSpan={11} className='text-center py-4 text-gray-500'>
                  Đang tải dữ liệu...
                </td>
              </tr>
            ) : isError ? (
              <tr>
                <td colSpan={11} className='text-center py-4 text-red-500'>
                  Lỗi khi tải dữ liệu.
                </td>
              </tr>
            ) : books.length === 0 ? (
              <tr>
                <td colSpan={11} className='text-center py-4 text-gray-400 italic'>
                  Không tìm thấy sách nào khớp với bộ lọc.
                </td>
              </tr>
            ) : (
              books.map((book) => (
                <tr key={book.id} className='bg-gray-50 hover:bg-gray-100 rounded-xl shadow-sm transition'>
                  <td className='px-4 py-3 rounded-l-xl'>{book.isbn}</td>
                  <td className='px-4 py-3'>
                    {book.images && book.images.length > 0 ? (
                      <img src={book.images[0].imageUrl} alt='Book' className='h-10 w-10 object-cover rounded' />
                    ) : (
                      <span className='text-gray-400 italic'>Không có ảnh</span>
                    )}
                  </td>
                  <td className='px-4 py-3'>{book.title}</td>
                  <td className='px-4 py-3 truncate max-w-xs'>{book.description}</td>
                  <td className='px-4 py-3'>
                    {book.authors.map((author, index) => (
                      <span key={index}>
                        {author.name}
                        {index < book.authors.length - 1 && ', '}
                      </span>
                    ))}
                  </td>
                  <td className='px-4 py-3'>
                    {book.genres.map((genre, index) => (
                      <span key={index}>
                        {genre.name}
                        {index < book.genres.length - 1 && ', '}
                      </span>
                    ))}
                  </td>
                  <td className='px-4 py-3'>{new Date(book.createdAt).toLocaleDateString()}</td>
                  <td className='px-4 py-3'>{new Date(book.publicationDate).toLocaleDateString()}</td>
                  <td className='px-4 py-3 text-center'>{book.stock}</td>
                  <td className='px-4 py-3'>
                    <span
                      className={`px-2 py-1 text-xs font-semibold rounded-full ${
                        book.status === 1 ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'
                      }`}
                    >
                      {book.status === 1 ? 'Còn phục vụ' : 'Ngưng phục vụ'}
                    </span>
                  </td>
                  <td className='px-4 py-3 text-center rounded-r-xl'>
                    <div className='flex justify-center gap-3'>
                      <Link
                        to={`/admin/books/edit/${book.id}`} // URL động với bookId
                        className='text-blue-500 hover:text-blue-700 transition'
                        title='Chỉnh sửa'
                      >
                        <Pencil size={18} />
                      </Link>
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
          onPageChange={(pageNumber) => setPage(pageNumber + 1)}
        />
      </div>

      <AddBookPopup isOpen={isModalOpen} onClose={() => setIsModalOpen(false)} />
      {/* <EditBookPopup
        isOpen={isEditModalOpen}
        bookId={selectedBookId}
        onClose={() => {
          setIsEditModalOpen(false)
          setSelectedBookId(null)
        }}
      /> */}
    </div>
  )
}
