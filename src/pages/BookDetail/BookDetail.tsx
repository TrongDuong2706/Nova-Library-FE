import { useState, useMemo, useContext } from 'react' // Thêm useMemo
import { ChevronLeft, BookOpen, BookCheck } from 'lucide-react'
import { Link, useNavigate, useParams } from 'react-router-dom'
import { useQuery } from '@tanstack/react-query'
import Slider from 'react-slick'
import { getOneBook, getAllBookWithGenre } from '../../apis/books.api'
import BorrowPopup from '../../components/BorrowPopup/BorrowPopup'
import { AppContext } from '../../contexts/app.context'

export default function BookDetail() {
  const [isModalOpen, setIsModalOpen] = useState(false)
  const { bookId } = useParams<{ bookId: string }>()

  const { data: bookData, isLoading: isBookLoading } = useQuery({
    queryKey: ['book', bookId],
    queryFn: () => getOneBook(bookId as string),
    enabled: !!bookId
  })

  const navigate = useNavigate()
  const { isAuthenticated } = useContext(AppContext)
  const book = bookData?.data.result

  // Lấy thể loại đầu tiên trong danh sách để tìm sách liên quan
  const primaryGenreName = book?.genres?.[0]?.name

  const { data: relatedBooksData } = useQuery({
    queryKey: ['relatedBooks', primaryGenreName],
    // Chỉ gọi API nếu có thể loại đầu tiên
    queryFn: () => getAllBookWithGenre(primaryGenreName as string, 0, 8),
    enabled: !!primaryGenreName
  })

  // Lọc ra sách hiện tại và chỉ lấy 4 sách liên quan để hiển thị
  const relatedBooks = useMemo(() => {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    return relatedBooksData?.data.result.elements.filter((b: any) => b.id !== book?.id).slice(0, 4) || []
  }, [relatedBooksData, book?.id])

  // Dùng useMemo để chỉ tính toán lại khi book thay đổi
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const authorsString = useMemo(() => book?.authors?.map((author: any) => author.name).join(', ') || '', [book])
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const genresString = useMemo(() => book?.genres?.map((genre: any) => genre.name).join(' • ') || '', [book])

  if (isBookLoading) {
    return <div className='bg-slate-900 text-white min-h-screen flex justify-center items-center'>Đang tải...</div>
  }

  return (
    <div className='bg-slate-900 text-white min-h-screen font-sans'>
      {/* Sticky Header */}
      <header className='sticky top-0 z-50 bg-slate-900/80 backdrop-blur-sm border-b border-slate-800'>
        <div className='container mx-auto px-4 sm:px-6 lg:px-8'>
          <div className='flex items-center justify-between h-16'>
            <Link to='/' className='flex items-center gap-2 text-white hover:text-teal-400 transition-colors'>
              <BookOpen className='h-6 w-6 text-teal-500' />
              <span className='text-xl font-bold'>Nova Library</span>
            </Link>
            <Link
              to='/'
              className='flex items-center gap-1.5 px-3 py-1.5 bg-slate-800 text-slate-300 border border-slate-700 rounded-full text-sm hover:bg-slate-700 hover:text-white transition-colors duration-300'
            >
              <ChevronLeft className='h-4 w-4' />
              Quay lại
            </Link>
          </div>
        </div>
      </header>

      <main className='container mx-auto px-4 sm:px-6 lg:px-8 py-10'>
        <div className='max-w-6xl mx-auto'>
          <div className='flex flex-col lg:flex-row gap-8 lg:gap-12'>
            {/* Ảnh sách */}
            <div className='lg:w-1/3 lg:sticky lg:top-24 self-start'>
              <div className='w-full max-w-sm mx-auto'>
                {book?.images && book.images.length > 1 ? (
                  <Slider dots={true} infinite={true} speed={500} slidesToShow={1} slidesToScroll={1} arrows={true}>
                    {/* eslint-disable-next-line @typescript-eslint/no-explicit-any */}
                    {book?.images.map((img: any, index: number) => (
                      <div key={index} className='w-full aspect-[2/3] relative'>
                        <img
                          src={img.imageUrl}
                          alt={`${book.title} ${index + 1}`}
                          className='w-full h-full object-cover rounded-lg shadow-2xl shadow-slate-950'
                        />
                      </div>
                    ))}
                  </Slider>
                ) : (
                  <img
                    src={book?.images?.[0]?.imageUrl || 'https://via.placeholder.com/400x600.png?text=No+Image'}
                    alt={book?.title}
                    className='w-full aspect-[2/3] object-cover rounded-lg shadow-2xl shadow-slate-950'
                  />
                )}
              </div>
            </div>

            {/* Thông tin chi tiết sách */}
            <div className='lg:w-2/3'>
              {/* Thẻ Genres */}
              <span className='inline-block bg-slate-700 text-teal-400 text-xs font-semibold px-3 py-1 rounded-full mb-3'>
                {genresString}
              </span>

              {/* Tiêu đề sách */}
              <h1 className='text-3xl lg:text-4xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-teal-300 to-cyan-400 mb-2'>
                {book?.title}
              </h1>

              {/* Tên tác giả */}
              <p className='text-lg text-slate-300 mb-6'>
                bởi <span className='font-semibold text-teal-400'>{authorsString}</span>
              </p>

              {/* Nút mượn sách */}
              <div className='flex items-center gap-4 mb-8'>
                <button
                  onClick={() => {
                    if (!isAuthenticated) {
                      navigate('/login', { replace: true })
                      return
                    }
                    setIsModalOpen(true)
                  }}
                  className='flex items-center justify-center gap-2 w-full sm:w-auto px-6 py-3 bg-teal-500 text-white font-bold rounded-full hover:bg-teal-600 transition-all duration-300 shadow-lg transform hover:scale-105'
                >
                  <BookCheck className='h-5 w-5' />
                  Mượn Ngay
                </button>
              </div>

              {/* Mô tả sách */}
              <div className='mb-8'>
                <h2 className='text-xl font-bold mb-3 border-l-4 border-teal-400 pl-3'>Mô tả sách</h2>
                <p className='text-slate-300 leading-relaxed'>{book?.description}</p>
              </div>

              {/* Thông tin tác giả */}
              <div>
                <h2 className='text-xl font-bold mb-3 border-l-4 border-teal-400 pl-3'>
                  Về tác giả
                  {book?.authors && book.authors.length > 1 ? ' (các tác giả)' : ''}
                </h2>
                <div className='space-y-4'>
                  {/* eslint-disable-next-line @typescript-eslint/no-explicit-any */}
                  {book?.authors?.map((author: any) => (
                    <div key={author.id} className='p-4 bg-slate-800/50 rounded-lg border border-slate-800'>
                      <h3 className='text-lg font-bold text-white'>{author.name}</h3>
                      <p className='text-slate-400 text-sm leading-snug mt-1'>{author.bio}</p>
                    </div>
                  ))}
                </div>
              </div>

              {/* Số lượng */}
              <div className='mt-6'>
                <h2 className='text-xl font-bold mb-3 border-l-4 border-teal-400 pl-3'>Số lượng sách</h2>
                <p className='text-lg text-slate-300'>
                  Số lượng sách còn lại: <span className='text-teal-500 font-semibold'>{book?.stock}</span>
                </p>
              </div>
            </div>
          </div>
        </div>
      </main>

      {/* Sách liên quan */}
      <section className='mt-12 py-12 bg-slate-800/30'>
        <div className='max-w-7xl mx-auto px-4 sm:px-6 lg:px-8'>
          <h2 className='text-2xl font-bold mb-6 text-center'>Có thể bạn cũng thích</h2>
          <div className='grid grid-cols-2 sm:grid-cols-4 md:grid-cols-4 lg:grid-cols-4 gap-6'>
            {/* eslint-disable-next-line @typescript-eslint/no-explicit-any */}
            {relatedBooks.map((b: any) => (
              <Link to={`/book/${b.id}`} key={b.id}>
                <div className='group cursor-pointer'>
                  <div className='overflow-hidden rounded-lg shadow-lg transform group-hover:-translate-y-2 transition-transform duration-300'>
                    <img
                      src={b.images?.[0]?.imageUrl || 'https://via.placeholder.com/400x600.png?text=No+Image'}
                      alt={b.title}
                      className='w-full aspect-[2/3] object-cover'
                    />
                  </div>
                  <div className='mt-3 text-left'>
                    <h3 className='text-md font-bold text-slate-100 truncate group-hover:text-teal-400 transition-colors duration-300'>
                      {b.title}
                    </h3>
                    {/* Hiển thị tác giả đầu tiên */}
                    <p className='text-sm text-slate-400 truncate'>
                      {/*  eslint-disable-next-line @typescript-eslint/no-explicit-any */}
                      {b.authors?.map((author: any) => author.name).join(', ')}
                    </p>
                  </div>
                </div>
              </Link>
            ))}
          </div>
        </div>
      </section>

      {/* Popup mượn sách */}
      <BorrowPopup
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        selectedBooks={
          book
            ? [
                {
                  id: book.id,
                  title: book.title,
                  // Truyền vào chuỗi tên các tác giả
                  author: authorsString,
                  imageUrl: book.images?.[0]?.imageUrl || ''
                }
              ]
            : []
        }
      />
    </div>
  )
}
