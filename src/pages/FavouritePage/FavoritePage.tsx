import React, { useState, useMemo } from 'react' // Thêm useMemo
import { Heart, Trash2, BookOpen, ChevronLeft } from 'lucide-react'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { Link } from 'react-router-dom'
import Swal from 'sweetalert2'
import { getMyFavorite, deleteFavorite } from '../../apis/favorite.api'
import BorrowPopup from '../../components/BorrowPopup/BorrowPopup'
import Pagination from '../../components/Pagination/Pagination'

export default function FavoritePage() {
  const [isModalOpen, setIsModalOpen] = useState(false)
  const [page, setPage] = useState(1)
  const size = 5

  const queryClient = useQueryClient()

  const { data, isLoading } = useQuery({
    queryKey: ['favorites', page, size],
    queryFn: () => getMyFavorite(page, size)
  })

  const { mutate: removeFavorite, isPending } = useMutation({
    mutationFn: (bookId: string) => deleteFavorite(bookId),
    onSuccess: () => {
      Swal.fire({
        icon: 'success',
        title: 'Đã xóa khỏi yêu thích!',
        toast: true,
        position: 'bottom-end',
        timer: 3000,
        showConfirmButton: false
      })
      // Invalidate để query lại dữ liệu mới
      queryClient.invalidateQueries({ queryKey: ['favorites'] })
    },
    onError: (error: any) => {
      const message = error?.response?.data?.message || 'Đã xảy ra lỗi khi xóa.'
      Swal.fire({
        icon: 'error',
        title: 'Lỗi',
        text: message
      })
    }
  })

  // Dữ liệu sách yêu thích
  const favorites = data?.data.result.elements || []

  // Xử lý sự kiện xóa
  const handleRemoveFavorite = (e: React.MouseEvent<HTMLButtonElement>, bookId: string) => {
    e.preventDefault() // Ngăn chặn hành vi mặc định của Link
    e.stopPropagation() // Ngăn sự kiện nổi bọt lên Link
    removeFavorite(bookId)
  }

  // Chuẩn bị dữ liệu cho BorrowPopup, tính toán lại chỉ khi favorites thay đổi
  const selectedBooks = useMemo(() => {
    return favorites.map((book: any) => ({
      id: book.bookId,
      title: book.title,
      // Tạo chuỗi tên các tác giả
      author: book.authors?.map((author: any) => author.name).join(', ') || 'N/A',
      imageUrl: book.images?.[0]?.imageUrl || ''
    }))
  }, [favorites])

  return (
    <div className='bg-slate-900 text-white min-h-screen font-sans'>
      {/* Header */}
      <header className='sticky top-0 z-50 bg-slate-900/80 backdrop-blur-sm border-b border-slate-800'>
        <div className='container mx-auto px-4 sm:px-6 lg:px-8'>
          <div className='flex items-center justify-between h-16'>
            <Link to='/' className='flex items-center gap-2 text-white hover:text-teal-400 transition-colors '>
              <BookOpen className='h-6 w-6 text-teal-500' />
              <span className='text-xl font-bold'>Nova Library</span>
            </Link>
            <Link
              to='/'
              className='flex items-center gap-1.5 px-3 py-1.5 bg-slate-800 text-slate-300 border border-slate-700 rounded-full text-sm hover:bg-slate-700 hover:text-white transition-colors duration-300'
            >
              <ChevronLeft className='h-4 w-4' />
              Quay lại trang chủ
            </Link>
          </div>
        </div>
      </header>

      <main className='container mx-auto px-6 py-10'>
        {/* Tiêu đề trang */}
        <div className='text-center mb-12'>
          <Heart className='mx-auto h-16 w-16 text-red-400' />
          <h1 className='text-4xl md:text-5xl font-extrabold tracking-tight'>Danh sách Yêu thích</h1>
          <p className='mt-3 max-w-2xl mx-auto text-lg text-slate-400'>
            Những cuốn sách đã chiếm trọn trái tim của bạn.
          </p>
        </div>

        <div className='max-w-7xl mx-auto'>
          {/* Xử lý trạng thái loading */}
          {isLoading ? (
            <div className='text-center py-16 text-slate-500'>Đang tải danh sách...</div>
          ) : favorites.length === 0 ? (
            // Trường hợp không có sách yêu thích
            <div className='text-center py-16'>
              <p className='text-slate-500 text-xl italic'>Bạn chưa có sách yêu thích nào.</p>
              <Link
                to='/'
                className='mt-6 inline-block bg-teal-500 text-white font-bold px-6 py-3 rounded-full hover:bg-teal-600 transition-colors duration-300 shadow-lg'
              >
                Khám phá sách ngay
              </Link>
            </div>
          ) : (
            // Hiển thị danh sách
            <>
              <div className='text-center mb-8'>
                <button
                  onClick={() => setIsModalOpen(true)}
                  className='inline-flex items-center gap-2 bg-teal-500 text-white font-bold px-6 py-3 rounded-full hover:bg-teal-600 transition-colors duration-300 shadow-lg'
                >
                  <BookOpen className='h-5 w-5' />
                  Mượn tất cả
                </button>
              </div>

              <div className='grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-6 md:gap-8'>
                {favorites.map((book: any) => (
                  <Link to={`/book/${book.bookId}`} key={book.favoriteId}>
                    {' '}
                    {/* Dùng favoriteId làm key */}
                    <div className='group cursor-pointer'>
                      <div className='relative overflow-hidden rounded-lg shadow-lg transform group-hover:-translate-y-2 transition-transform duration-300'>
                        <img
                          src={book.images?.[0]?.imageUrl || 'https://via.placeholder.com/400x600.png?text=No+Image'}
                          alt={book.title}
                          className='w-full aspect-[2/3] object-cover'
                        />
                        <button
                          onClick={(e) => handleRemoveFavorite(e, book.bookId)}
                          disabled={isPending}
                          className='absolute top-2 right-2 p-2 bg-black/40 rounded-full text-white opacity-0 group-hover:opacity-100 hover:bg-red-600/80 transition-all duration-300'
                          title='Xóa khỏi yêu thích'
                        >
                          <Trash2 className='h-4 w-4' />
                        </button>
                      </div>
                      <div className='mt-3 text-left'>
                        <h3 className='text-md font-bold text-slate-100 truncate group-hover:text-teal-400 transition-colors duration-300'>
                          {book.title}
                        </h3>
                        {/* Hiển thị chuỗi tên các tác giả */}
                        <p className='text-sm text-slate-400 truncate'>
                          {book.authors?.map((author: any) => author.name).join(', ')}
                        </p>
                      </div>
                    </div>
                  </Link>
                ))}
              </div>
            </>
          )}
        </div>

        {/* Phân trang */}
        {favorites.length > 0 && (
          <Pagination
            currentPage={data?.data.result.currentPage ?? 0}
            totalPages={data?.data.result.totalPages ?? 1}
            hasNextPage={data?.data.result.hasNextPage ?? false}
            hasPreviousPage={data?.data.result.hasPreviousPage ?? false}
            onPageChange={(page) => setPage(page + 1)}
          />
        )}
      </main>

      {/* Popup mượn sách */}
      <BorrowPopup isOpen={isModalOpen} onClose={() => setIsModalOpen(false)} selectedBooks={selectedBooks} />

      {/* Footer */}
      <footer className='mt-16 py-8 border-t border-slate-800'>
        <div className='container mx-auto px-6 text-center text-slate-500'>
          <p>© {new Date().getFullYear()} Thư Viện Tri Thức. All rights reserved.</p>
        </div>
      </footer>
    </div>
  )
}
