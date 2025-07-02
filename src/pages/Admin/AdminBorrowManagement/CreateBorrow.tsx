// src/pages/Admin/CreateBorrow/CreateBorrow.tsx

import { useState, useEffect, useRef } from 'react'
import { useForm } from 'react-hook-form'
import { useMutation, useInfiniteQuery, useQueryClient } from '@tanstack/react-query'
import { useNavigate } from 'react-router-dom'
import Swal from 'sweetalert2'
import { useInView } from 'react-intersection-observer'
import { BookCheck, Search, Trash2 } from 'lucide-react'
import type { Book } from '../../../types/book.type'
import { getAllBookWithTitle } from '../../../apis/books.api'
import { createBorrow } from '../../../apis/borrow.api'

// Dữ liệu form chính
interface BorrowFormData {
  studentCode: string
  dueDate: string
}

export default function CreateBorrow() {
  const navigate = useNavigate()
  const queryClient = useQueryClient()
  const {
    register,
    handleSubmit,
    reset,
    formState: { errors }
  } = useForm<BorrowFormData>()

  // --- State quản lý logic tìm và chọn sách ---
  const [bookSearchTerm, setBookSearchTerm] = useState('')
  const [debouncedSearchTerm, setDebouncedSearchTerm] = useState('')
  const [selectedBooks, setSelectedBooks] = useState<Book[]>([])
  const [isSuggestionsOpen, setIsSuggestionsOpen] = useState(false)
  const searchContainerRef = useRef<HTMLDivElement>(null)

  // --- Logic cho "Infinite Scroll" tìm kiếm sách ---
  const { ref: loadMoreRef, inView: isLoadMoreVisible } = useInView() // Hook để phát hiện khi người dùng cuộn đến cuối

  // Debounce input để không gọi API liên tục
  useEffect(() => {
    const timerId = setTimeout(() => setDebouncedSearchTerm(bookSearchTerm), 500)
    return () => clearTimeout(timerId)
  }, [bookSearchTerm])

  // useInfiniteQuery để lấy dữ liệu sách theo trang
  const {
    data: bookResults,
    fetchNextPage,
    hasNextPage,
    isFetchingNextPage,
    isLoading: isSearchingBooks
  } = useInfiniteQuery({
    queryKey: ['bookSearch', debouncedSearchTerm],
    queryFn: ({ pageParam = 1 }) => getAllBookWithTitle(debouncedSearchTerm, pageParam, 10), // Mỗi lần tải 10 sách
    getNextPageParam: (lastPage) => {
      // API của bạn cần trả về thông tin hasNextPage và currentPage
      if (lastPage.data.result.hasNextPage) {
        return lastPage.data.result.currentPage + 1
      }
      return undefined // Trả về undefined khi không có trang tiếp theo
    },
    initialPageParam: 1,
    enabled: !!debouncedSearchTerm // Chỉ bật query khi có từ khóa tìm kiếm
  })

  // Tự động gọi fetchNextPage khi người dùng cuộn đến phần tử `loadMoreRef`
  useEffect(() => {
    if (isLoadMoreVisible && hasNextPage && !isFetchingNextPage) {
      fetchNextPage()
    }
  }, [isLoadMoreVisible, hasNextPage, isFetchingNextPage, fetchNextPage])

  // --- Các hàm xử lý ---
  const handleAddBook = (book: Book) => {
    // Ngăn việc thêm sách trùng lặp
    if (!selectedBooks.some((selected) => selected.id === book.id)) {
      setSelectedBooks((prev) => [...prev, book])
    }
    // Xóa input và đóng hộp gợi ý
    setBookSearchTerm('')
    setIsSuggestionsOpen(false)
  }

  const handleRemoveBook = (bookId: string) => {
    setSelectedBooks((prev) => prev.filter((book) => book.id !== bookId))
  }

  // Đóng hộp gợi ý khi click ra ngoài
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (searchContainerRef.current && !searchContainerRef.current.contains(event.target as Node)) {
        setIsSuggestionsOpen(false)
      }
    }
    document.addEventListener('mousedown', handleClickOutside)
    return () => document.removeEventListener('mousedown', handleClickOutside)
  }, [])

  // --- Mutation để tạo đơn mượn ---
  const { mutate, isPending } = useMutation({
    mutationFn: (data: BorrowFormData) => {
      const payload = {
        studentCode: data.studentCode,
        dueDate: data.dueDate,
        bookIds: selectedBooks.map((book) => book.id)
      }
      return createBorrow(payload)
    },
    onSuccess: () => {
      Swal.fire({
        icon: 'success',
        title: 'Tạo đơn mượn thành công!',
        showConfirmButton: false,
        timer: 1500
      })
      queryClient.invalidateQueries({ queryKey: ['borrows'] })
      reset()
      setSelectedBooks([])
      navigate('/admin/borrows') // Chuyển đến trang danh sách đơn mượn
    },
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    onError: (error: any) => {
      const errorMessage = error?.response?.data?.message || 'Có lỗi xảy ra khi tạo đơn mượn!'
      Swal.fire({ icon: 'error', title: 'Thất bại', text: errorMessage })
    }
  })

  const onSubmit = (data: BorrowFormData) => {
    if (selectedBooks.length === 0) {
      Swal.fire({ icon: 'warning', title: 'Chưa chọn sách', text: 'Vui lòng chọn ít nhất một quyển sách để mượn.' })
      return
    }
    mutate(data)
  }

  const today = new Date().toISOString().split('T')[0]
  const allFoundBooks = bookResults?.pages.flatMap((page) => page.data.result.elements) || []

  return (
    <div className='bg-white rounded-2xl shadow-md p-6 max-w-6xl mx-auto my-8'>
      <h2 className='text-2xl font-semibold text-gray-800 mb-6 border-b pb-4'>📝 Tạo đơn mượn sách</h2>
      <form onSubmit={handleSubmit(onSubmit)} className='grid grid-cols-1 lg:grid-cols-2 gap-8'>
        {/* Cột bên trái: Form nhập liệu */}
        <div className='space-y-6'>
          {/* Tìm kiếm sách */}
          <div className='relative' ref={searchContainerRef}>
            <label className='block mb-2 text-sm font-medium text-gray-700'>Tìm và chọn sách</label>
            <div className='relative'>
              <Search size={18} className='absolute left-3 top-1/2 -translate-y-1/2 text-gray-400' />
              <input
                type='text'
                value={bookSearchTerm}
                onChange={(e) => setBookSearchTerm(e.target.value)}
                onFocus={() => setIsSuggestionsOpen(true)}
                placeholder='Nhập tiêu đề sách...'
                className='w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-1 focus:ring-purple-500'
                autoComplete='off'
              />
            </div>
            {/* Hộp gợi ý sách */}
            {isSuggestionsOpen && !!debouncedSearchTerm && (
              <div className='absolute z-20 w-full mt-1 bg-white border border-gray-200 rounded-lg shadow-lg max-h-80 overflow-y-auto'>
                {isSearchingBooks && allFoundBooks.length === 0 ? (
                  <p className='p-3 text-sm text-gray-500 text-center'>Đang tìm kiếm...</p>
                ) : allFoundBooks.length > 0 ? (
                  <ul>
                    {allFoundBooks.map((book) => (
                      <li
                        key={book.id}
                        onClick={() => handleAddBook(book)}
                        className='flex items-center gap-3 p-3 hover:bg-purple-50 cursor-pointer border-b border-gray-100'
                      >
                        <img
                          src={book.images[0]?.imageUrl || '/default-book-cover.png'}
                          alt={book.title}
                          className='w-10 h-14 object-cover rounded-md flex-shrink-0'
                        />
                        <div>
                          <p className='font-semibold text-gray-800 text-sm'>{book.title}</p>
                          <p className='text-xs text-gray-500'>Tác giả: {book.authors.map((author, index)=> (
                        <span key = {index}> {author.name}</span>
                      ))}</p>
                          <p className={`text-xs font-semibold ${book.stock > 0 ? 'text-green-600' : 'text-red-600'}`}>
                            Tồn kho: {book.stock}
                          </p>
                        </div>
                      </li>
                    ))}
                    {/* Phần tử để trigger load more */}
                    <div ref={loadMoreRef} className='p-2 text-center'>
                      {isFetchingNextPage && <p className='text-sm text-gray-500'>Đang tải thêm...</p>}
                      {!hasNextPage && allFoundBooks.length > 0 && <p className='text-sm text-gray-400'>Đã hết sách</p>}
                    </div>
                  </ul>
                ) : (
                  <p className='p-3 text-sm text-gray-500 text-center'>Không tìm thấy sách nào.</p>
                )}
              </div>
            )}
          </div>

          {/* Form nhập mã sinh viên và ngày trả */}
          <div>
            <label htmlFor='studentCode' className='block mb-2 text-sm font-medium text-gray-700'>
              Mã số sinh viên
            </label>
            <input
              id='studentCode'
              type='text'
              {...register('studentCode', { required: 'Vui lòng nhập mã số sinh viên' })}
              className='w-full px-4 py-2 border border-gray-300 rounded-lg'
              placeholder='VD: SE170001'
            />
            {errors.studentCode && <p className='text-red-500 text-xs mt-1'>{errors.studentCode.message}</p>}
          </div>

          <div>
            <label htmlFor='dueDate' className='block mb-2 text-sm font-medium text-gray-700'>
              Hạn trả sách
            </label>
            <input
              id='dueDate'
              type='date'
              min={today}
              {...register('dueDate', { required: 'Vui lòng chọn hạn trả' })}
              className='w-full px-4 py-2 border border-gray-300 rounded-lg'
            />
            {errors.dueDate && <p className='text-red-500 text-xs mt-1'>{errors.dueDate.message}</p>}
          </div>
        </div>

        {/* Cột bên phải: Danh sách sách đã chọn */}
        <div className='bg-gray-50 p-4 rounded-lg border border-gray-200'>
          <h3 className='text-lg font-semibold text-gray-700 mb-4'>Sách đã chọn ({selectedBooks.length})</h3>
          {selectedBooks.length > 0 ? (
            <ul className='space-y-3 max-h-[400px] overflow-y-auto pr-2'>
              {selectedBooks.map((book) => (
                <li
                  key={book.id}
                  className='flex items-center justify-between gap-3 bg-white p-2 rounded-lg border border-gray-200 shadow-sm'
                >
                  <div className='flex items-center gap-3 overflow-hidden'>
                    <img
                      src={book.images[0]?.imageUrl || '/default-book-cover.png'}
                      alt={book.title}
                      className='w-10 h-14 object-cover rounded-md flex-shrink-0'
                    />
                    <div className='flex-1 min-w-0'>
                      <p className='font-semibold text-gray-800 text-sm truncate'>{book.title}</p>
                      <p className='text-xs text-gray-500 truncate'>Tác giả: {book.authors.map((author, index)=> (
                        <span key = {index}> {author.name}</span>
                      ))}</p>
                    </div>
                  </div>
                  <button
                    type='button'
                    onClick={() => handleRemoveBook(book.id)}
                    className='p-1 text-red-500 hover:text-red-700 hover:bg-red-100 rounded-full flex-shrink-0'
                    title='Bỏ chọn sách này'
                  >
                    <Trash2 size={16} />
                  </button>
                </li>
              ))}
            </ul>
          ) : (
            <div className='flex flex-col items-center justify-center h-48 border-2 border-dashed border-gray-300 rounded-lg'>
              <p className='text-gray-500'>Chưa có sách nào được chọn.</p>
              <p className='text-sm text-gray-400'>Hãy tìm và thêm sách ở ô bên cạnh.</p>
            </div>
          )}
        </div>

        {/* Nút submit */}
        <div className='lg:col-span-2 flex justify-end gap-3 pt-4 border-t mt-4'>
          <button
            type='button'
            onClick={() => navigate('/admin/borrows')}
            className='bg-gray-200 hover:bg-gray-300 text-gray-800 font-medium px-6 py-2 rounded-lg'
          >
            Hủy
          </button>
          <button
            type='submit'
            disabled={isPending}
            className={`font-medium px-6 py-2 rounded-lg text-white transition flex items-center gap-2 ${
              isPending ? 'bg-gray-400 cursor-not-allowed' : 'bg-purple-600 hover:bg-purple-700'
            }`}
          >
            <BookCheck size={18} />
            {isPending ? 'Đang xử lý...' : 'Tạo đơn mượn'}
          </button>
        </div>
      </form>
    </div>
  )
}
