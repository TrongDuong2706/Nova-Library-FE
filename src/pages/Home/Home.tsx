import React, { useContext, useState } from 'react'
// ========== START: THÊM ICON HEART ==========
import { BookOpen, User, Search, ClipboardList, Heart } from 'lucide-react'
// ========== END: THÊM ICON HEART ==========
import Pagination from '../../components/Pagination/Pagination'
import { useMutation, useQuery } from '@tanstack/react-query'
import { getBooksWithFilter } from '../../apis/books.api'
import { getGenres } from '../../apis/genre.api'
import type { Book } from '../../types/book.type'
import type { Genre } from '../../types/genre.type'
import { useForm } from 'react-hook-form'
import { Link, useNavigate } from 'react-router-dom'
import { addFavorite } from '../../apis/favorite.api'
import Swal from 'sweetalert2'
import { AppContext } from '../../contexts/app.context'
import { getMyInfor, logout } from '../../apis/auth.api'
import { clearAccessTokenFromLS, getAccessTokenFromLS } from '../../utils/auth'

type FormData = {
  authorName: string
  genreName: string
  keyword: string
}

export default function Home() {
  const navigate = useNavigate()

  const { isAuthenticated, setIsAuthenticated } = useContext(AppContext)

  const { register, handleSubmit, reset } = useForm<FormData>({
    defaultValues: {
      authorName: '',
      genreName: '',
      keyword: ''
    }
  })

  const [page, setPage] = useState(1)
  const size = 10

  const [authorName, setAuthorName] = useState<string | null>(null)
  const [genreName, setGenreName] = useState<string | null>(null)
  const [keyword, setKeyword] = useState<string | null>(null)
  const [activeCategory, setActiveCategory] = useState<string>('Tất cả')

  const { data, isLoading, isError } = useQuery({
    queryKey: ['books', page, authorName, genreName, keyword],
    queryFn: () => getBooksWithFilter(authorName, genreName, keyword, page, size)
  })

  const books: Book[] = data?.data.result.elements || []
  const paginationData = data?.data.result

  const { data: genreQueryData } = useQuery({
    queryKey: ['genres'],
    queryFn: () => getGenres(1, 100)
  })

  const { data: getMyInforData } = useQuery({
    queryKey: ['myInfor'],
    queryFn: () => getMyInfor()
  })

  const user = getMyInforData?.data.result

  const genreData: Genre[] = genreQueryData?.data.result.elements || []

  const handleSearch = (formData: FormData) => {
    setPage(1)
    setAuthorName(formData.authorName || null)
    setKeyword(formData.keyword || null)

    if (formData.genreName) {
      setGenreName(formData.genreName)
      setActiveCategory(formData.genreName)
    }
  }

  const handleClearFilters = () => {
    reset()
    setAuthorName(null)
    setGenreName(null)
    setKeyword(null)
    setPage(1)
    setActiveCategory('Tất cả')
  }

  const handleCategoryClick = (category: string) => {
    setActiveCategory(category)
    setPage(1)
    setGenreName(category === 'Tất cả' ? null : category)
  }

  //Handle favorite
  const { mutate: addFavoriteMutate } = useMutation({
    mutationFn: (bookId: string) => addFavorite(bookId),
    onSuccess: () => {
      // Nếu muốn refetch dữ liệu hoặc thông báo thành công
      // queryClient.invalidateQueries(['favoriteBooks']) // nếu bạn có query này
      Swal.fire({
        toast: true,
        position: 'top-end',
        icon: 'success',
        title: 'Thêm vào yêu thích thành công!',
        showConfirmButton: false,
        timer: 3000,
        timerProgressBar: true
      })
    },
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    onError: (error: any) => {
      const message = error?.response?.data?.message || 'Đã xảy ra lỗi không xác định. Vui lòng thử lại.'

      Swal.fire({
        icon: 'error',
        title: 'Lỗi khi thêm sách vào yêu thích',
        text: message,
        confirmButtonText: 'Đóng'
      })
    }
  })

  const handleFavoriteClick = (e: React.MouseEvent<HTMLButtonElement>, bookId: string) => {
    e.preventDefault() // Ngăn chuyển trang
    addFavoriteMutate(bookId)
  }
  //logout

  const { mutate: logoutMutate } = useMutation({
    mutationFn: (token: string) => logout({ token }),
    onSuccess: () => {
      navigate('/login', { replace: true })
      setIsAuthenticated(false)

      Swal.fire({
        toast: true,
        position: 'top-end',
        icon: 'success',
        title: 'Đăng xuất thành công!',
        showConfirmButton: false,
        timer: 3000,
        timerProgressBar: true
      })
    },
    onError: () => {
      // Swal.fire({
      //   icon: 'error',
      //   title: 'Lỗi khi đăng xuất',
      //   text: 'Vui lòng thử lại.',
      //   confirmButtonText: 'Đóng'
      // })
      setIsAuthenticated(false)
      clearAccessTokenFromLS()
      navigate('/login')
    }
  })

  const handleLogout = () => {
    const rawToken = getAccessTokenFromLS()
    const token = rawToken.startsWith('Bearer ') ? rawToken.slice(7) : rawToken
    logoutMutate(token)
  }

  return (
    <div className='bg-slate-900 text-white min-h-screen font-sans'>
      <header className='relative pt-24 pb-16 text-center bg-gradient-to-b from-slate-800 to-slate-900'>
        <div className='container mx-auto px-6'>
          <div className='absolute top-6 right-6 flex items-center space-x-4 md:space-x-6'>
            {isAuthenticated ? (
              <>
                <Link
                  to='/profile'
                  className='flex items-center gap-2 text-slate-200 hover:text-teal-400 transition-colors duration-300'
                >
                  <User className='h-5 w-5' />
                  <span className='font-medium hidden sm:inline'>
                    Xin chào, {user?.firstName} {user?.lastName}
                  </span>
                </Link>

                <Link
                  to='/my-borrows'
                  className='flex items-center gap-2 text-slate-200 hover:text-teal-400 transition-colors duration-300'
                >
                  <ClipboardList className='h-5 w-5' />
                  <span className='font-medium hidden sm:inline'>Đơn mượn</span>
                </Link>

                <Link
                  to='/favorite'
                  className='flex items-center gap-2 text-slate-200 hover:text-teal-400 transition-colors duration-300'
                >
                  <Heart className='h-5 w-5' />
                  <span className='font-medium hidden sm:inline'>Yêu thích</span>
                </Link>
                <button
                  onClick={handleLogout}
                  className='flex items-center gap-2 bg-red-500 text-white font-bold px-4 py-2 rounded-lg hover:bg-red-600 transition-colors duration-300 text-sm shadow-lg'
                >
                  Đăng xuất
                </button>
              </>
            ) : null}

            {!isAuthenticated && (
              <Link
                to='/login'
                className='bg-teal-500 text-white font-bold px-4 py-2 rounded-lg hover:bg-teal-600 transition-colors duration-300 text-sm shadow-lg'
              >
                Đăng nhập
              </Link>
            )}
          </div>

          <BookOpen className='mx-auto h-16 w-16 text-teal-400' />
          <h1 className='mt-4 text-4xl md:text-6xl font-extrabold tracking-tight'>
            Chào mừng đến với{' '}
            <span className='bg-clip-text text-transparent bg-gradient-to-r from-teal-400 to-cyan-500'>
              Nova Library
            </span>
          </h1>
          <p className='mt-4 max-w-2xl mx-auto text-lg text-slate-300'>
            Khám phá thế giới qua từng trang sách. Tìm kiếm và đọc những cuốn sách bạn yêu thích.
          </p>

          <form
            className='mt-10 max-w-4xl mx-auto grid grid-cols-1 md:grid-cols-2 gap-4'
            onSubmit={handleSubmit(handleSearch)}
          >
            {/* Dòng 1: Input keyword */}
            <div className='relative'>
              <div className='absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none'>
                <Search className='h-5 w-5 text-slate-400' />
              </div>
              <input
                type='text'
                placeholder='Tìm theo tên hoặc mô tả...'
                className='w-full py-2.5 pl-10 pr-4 bg-slate-800 border border-slate-700 rounded-lg focus:outline-none focus:ring-2 focus:ring-teal-500 transition duration-300'
                {...register('keyword')}
              />
            </div>

            {/* Dòng 1: Input author */}
            <div className='relative'>
              <div className='absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none'>
                <User className='h-5 w-5 text-slate-400' />
              </div>
              <input
                type='text'
                placeholder='Tìm theo tác giả...'
                className='w-full py-2.5 pl-10 pr-4 bg-slate-800 border border-slate-700 rounded-lg focus:outline-none focus:ring-2 focus:ring-teal-500 transition duration-300'
                {...register('authorName')}
              />
            </div>

            {/* Dòng 2: Nút tìm kiếm và xóa lọc */}
            <div className='md:col-span-2 flex gap-4 justify-center mt-2'>
              <button
                type='submit'
                className='flex items-center justify-center gap-2 px-8 py-3 bg-teal-500 text-white font-bold rounded-full hover:bg-teal-600 transition-colors duration-300 shadow-lg transform hover:scale-105'
              >
                <Search className='h-5 w-5' />
                Tìm Kiếm
              </button>
              <button
                type='button'
                onClick={handleClearFilters}
                className='flex items-center justify-center gap-2 px-8 py-3 bg-red-500 text-white font-bold rounded-full hover:bg-red-600 transition-colors duration-300 shadow-lg transform hover:scale-105'
              >
                Xóa Lọc
              </button>
            </div>
          </form>
        </div>
      </header>

      <main className='container mx-auto px-6 py-10'>
        <div className='max-w-7xl mx-auto'>
          <div className='flex flex-wrap justify-center gap-2 md:gap-4 mb-10'>
            <button
              onClick={() => handleCategoryClick('Tất cả')}
              className={`px-5 py-2 text-sm font-medium rounded-full transition
                ${
                  activeCategory === 'Tất cả'
                    ? 'bg-teal-500 text-white shadow-lg'
                    : 'bg-slate-700 text-slate-300 hover:bg-slate-600'
                }`}
            >
              Tất cả
            </button>

            {genreData.map((category) => (
              <button
                key={category.id}
                onClick={() => handleCategoryClick(category.name)}
                className={`px-5 py-2 text-sm font-medium rounded-full transition
                  ${
                    activeCategory === category.name
                      ? 'bg-teal-500 text-white shadow-lg'
                      : 'bg-slate-700 text-slate-300 hover:bg-slate-600'
                  }`}
              >
                {category.name}
              </button>
            ))}
          </div>

          <div className='grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-6 md:gap-8'>
            {isLoading ? (
              <p className='col-span-full text-center text-slate-400'>Đang tải sách...</p>
            ) : isError ? (
              <p className='col-span-full text-center text-red-500'>Đã xảy ra lỗi khi tải sách.</p>
            ) : books.length === 0 ? (
              <p className='col-span-full text-center text-slate-500 italic'>Không tìm thấy sách phù hợp.</p>
            ) : (
              books.map((book) => (
                <Link to={`/book/${book.id}`} key={book.id}>
                  <div className='group cursor-pointer'>
                    {/* ========== START: THÊM NÚT YÊU THÍCH VÀO CARD SÁCH ========== */}
                    <div className='relative overflow-hidden rounded-lg shadow-lg transform group-hover:-translate-y-2 transition-transform duration-300'>
                      <img
                        src={
                          book.images[0]?.imageUrl ||
                          'https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcTed7ytmvKOdAhKD4DibQ3xEuFuBozev9PjLp3a00xpu94MUrWzIcX_pideQYkSK91kydw&usqp=CAU'
                        }
                        alt={book.title}
                        className='w-full aspect-[2/3] object-cover'
                      />
                      <button
                        onClick={(e) => handleFavoriteClick(e, book.id)}
                        className='absolute top-2 right-2 p-2 bg-black/40 rounded-full text-white opacity-0 group-hover:opacity-100 hover:bg-red-500/80 hover:text-white transition-all duration-300'
                        title='Thêm vào yêu thích'
                      >
                        <Heart className='h-4 w-4' />
                      </button>
                    </div>
                    {/* ========== END: THÊM NÚT YÊU THÍCH VÀO CARD SÁCH ========== */}
                    <div className='mt-3 text-left'>
                      <h3 className='text-md font-bold text-slate-100 truncate group-hover:text-teal-400 transition-colors duration-300'>
                        {book.title}
                      </h3>
                      <p className='text-sm text-slate-400'>{book.author.name}</p>
                    </div>
                  </div>
                </Link>
              ))
            )}
          </div>
        </div>

        <Pagination
          currentPage={paginationData?.currentPage ?? 0}
          totalPages={paginationData?.totalPages ?? 1}
          hasNextPage={paginationData?.hasNextPage ?? false}
          hasPreviousPage={paginationData?.hasPreviousPage ?? false}
          onPageChange={(newPage) => setPage(newPage + 1)}
        />
      </main>

      <footer className='mt-16 py-8 border-t border-slate-800'>
        <div className='container mx-auto px-6 text-center text-slate-500'>
          <p>© {new Date().getFullYear()} Thư Viện Tri Thức. All rights reserved.</p>
        </div>
      </footer>
    </div>
  )
}
