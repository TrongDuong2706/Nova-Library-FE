import React, { useState } from 'react'
import { Heart, Trash2, BookOpen, ChevronLeft } from 'lucide-react'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { getMyFavorite, deleteFavorite } from '../../apis/favorite.api'
import Pagination from '../../components/Pagination/Pagination'
import BorrowPopup from '../../components/BorrowPopup/BorrowPopup'
import Swal from 'sweetalert2'
import { Link } from 'react-router-dom'

export default function FavoritePage() {
  const [isModalOpen, setIsModalOpen] = useState(false)
  const [page, setPage] = useState(1)
  const size = 5

  const queryClient = useQueryClient()

  const { data } = useQuery({
    queryKey: ['favorites', page],
    queryFn: () => getMyFavorite(page, size)
  })

  const { mutate: removeFavorite, isPending } = useMutation({
    mutationFn: (bookId: string) => deleteFavorite(bookId),
    onSuccess: () => {
      Swal.fire({
        icon: 'success',
        title: 'Đã xóa khỏi yêu thích!',
        toast: true,
        position: 'top-end',
        timer: 3000,
        showConfirmButton: false
      })
      queryClient.invalidateQueries({ queryKey: ['favorites'] })
    },
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    onError: (error: any) => {
      const message = error?.response?.data?.message || 'Đã xảy ra lỗi khi xóa.'
      Swal.fire({
        icon: 'error',
        title: 'Lỗi',
        text: message
      })
    }
  })

  const favorites = data?.data.result.elements || []

  const handleRemoveFavorite = (e: React.MouseEvent<HTMLButtonElement>, bookId: string) => {
    e.preventDefault()
    removeFavorite(bookId)
  }

  const selectedBooks = favorites.map((book) => ({
    id: book.bookId,
    title: book.title,
    author: book.author.name,
    imageUrl: book.images[0]?.imageUrl || ''
  }))

  return (
    <div className='bg-slate-900 text-white min-h-screen font-sans'>
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
        <div className='text-center mb-12'>
          <Heart className='mx-auto h-16 w-16 text-red-400 ' />
          <h1 className='text-4xl md:text-5xl font-extrabold tracking-tight'>Danh sách Yêu thích</h1>
          <p className='mt-3 max-w-2xl mx-auto text-lg text-slate-400'>
            Những cuốn sách đã chiếm trọn trái tim của bạn.
          </p>
        </div>

        <div className='max-w-7xl mx-auto'>
          {favorites.length === 0 ? (
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
                {favorites.map((book) => (
                  <Link to={`/book/${book.bookId}`} key={book.id}>
                    <div className='group cursor-pointer'>
                      <div className='relative overflow-hidden rounded-lg shadow-lg transform group-hover:-translate-y-2 transition-transform duration-300'>
                        <img
                          src={book.images[0]?.imageUrl || 'https://via.placeholder.com/150'}
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
                        <p className='text-sm text-slate-400'>{book.author.name}</p>
                      </div>
                    </div>
                  </Link>
                ))}
              </div>
            </>
          )}
        </div>

        <Pagination
          currentPage={data?.data.result.currentPage ?? 0}
          totalPages={data?.data.result.totalPages ?? 1}
          hasNextPage={data?.data.result.hasNextPage ?? false}
          hasPreviousPage={data?.data.result.hasPreviousPage ?? false}
          onPageChange={(page) => setPage(page + 1)}
        />
      </main>

      <BorrowPopup isOpen={isModalOpen} onClose={() => setIsModalOpen(false)} selectedBooks={selectedBooks} />

      <footer className='mt-16 py-8 border-t border-slate-800'>
        <div className='container mx-auto px-6 text-center text-slate-500'>
          <p>© {new Date().getFullYear()} Thư Viện Tri Thức. All rights reserved.</p>
        </div>
      </footer>
    </div>
  )
}
