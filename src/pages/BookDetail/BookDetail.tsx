import { useState } from 'react'
import { ChevronLeft, BookOpen, BookCheck } from 'lucide-react'
import { Link, useParams } from 'react-router-dom'
import { useQuery } from '@tanstack/react-query'
import { getOneBook, getAllBookWithGenre } from '../../apis/books.api'
import BorrowPopup from '../../components/BorrowPopup/BorrowPopup'
import Slider from 'react-slick'

export default function BookDetail() {
  const [isModalOpen, setIsModalOpen] = useState(false)
  const { bookId } = useParams<{ bookId: string }>()

  const { data: bookData } = useQuery({
    queryKey: ['book', bookId],
    queryFn: () => getOneBook(bookId as string),
    enabled: !!bookId
  })

  const book = bookData?.data.result

  // Lấy related books dựa vào genre của sách hiện tại
  const { data: relatedBooksData } = useQuery({
    queryKey: ['relatedBooks', book?.genre.name],
    queryFn: () => getAllBookWithGenre(book?.genre.name as string, 0, 4),
    enabled: !!book?.genre.name
  })

  const relatedBooks = relatedBooksData?.data.result.elements.filter((b) => b.id !== book?.id) || []

  return (
    <div className='bg-slate-900 text-white min-h-screen font-sans'>
      {/* Sticky Header */}
      <header className='sticky top-0 z-50 bg-slate-900/80 backdrop-blur-sm border-b border-slate-800'>
        <div className='container mx-auto px-4 sm:px-6 lg:px-8'>
          <div className='flex items-center justify-between h-16'>
            <a href='#' className='flex items-center gap-2 text-white hover:text-teal-400 transition-colors'>
              <BookOpen className='h-6 w-6 text-teal-500' />
              <span className='text-xl font-bold'>Nova Library</span>
            </a>
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
        {/* Wrapper để làm gọn layout */}
        <div className='max-w-6xl mx-auto'>
          <div className='flex flex-col lg:flex-row gap-8 lg:gap-12'>
            <div className='lg:w-1/3 lg:sticky lg:top-24 self-start'>
              <div className='w-full max-w-sm mx-auto'>
                {book?.images && book.images.length > 1 ? (
                  <Slider
                    dots={true}
                    infinite={true}
                    speed={500}
                    slidesToShow={1}
                    slidesToScroll={1}
                    arrows={true}
                    autoplay={false}
                  >
                    {book?.images.map((img, index) => (
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
                    src={book?.images[0]?.imageUrl}
                    alt={book?.title}
                    className='w-full aspect-[2/3] object-cover rounded-lg shadow-2xl shadow-slate-950'
                  />
                )}
              </div>
            </div>

            <div className='lg:w-2/3'>
              <span className='inline-block bg-slate-700 text-teal-400 text-xs font-semibold px-3 py-1 rounded-full mb-3'>
                {book?.genre.name}
              </span>

              <h1 className='text-3xl lg:text-4xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-teal-300 to-cyan-400 mb-2'>
                {book?.title}
              </h1>

              <p className='text-lg text-slate-300 mb-6'>
                bởi{' '}
                <a href='#' className='font-semibold hover:text-teal-400 transition-colors'>
                  {book?.author.name}
                </a>
              </p>

              <div className='flex items-center gap-4 mb-8'>
                <button
                  onClick={() => setIsModalOpen(true)}
                  className='flex items-center justify-center gap-2 w-full sm:w-auto px-6 py-3 bg-teal-500 text-white font-bold rounded-full hover:bg-teal-600 transition-all duration-300 shadow-lg transform hover:scale-105'
                >
                  <BookCheck className='h-5 w-5' />
                  Mượn Ngay
                </button>
              </div>

              <div className='mb-8'>
                <h2 className='text-xl font-bold mb-3 border-l-4 border-teal-400 pl-3'>Mô tả sách</h2>
                <p className='text-slate-300 leading-relaxed'>{book?.description}</p>
              </div>

              <div>
                <h2 className='text-xl font-bold mb-3 border-l-4 border-teal-400 pl-3'>Về tác giả</h2>
                <div className='flex items-start gap-4 p-4 bg-slate-800/50 rounded-lg border border-slate-800'>
                  <div>
                    <h3 className='text-lg font-bold text-white'>{book?.author.name}</h3>
                    <p className='text-slate-400 text-sm leading-snug'>{book?.author.bio}</p>
                  </div>
                </div>
              </div>

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

      <section className='mt-12 py-12 bg-slate-800/30'>
        <div className='max-w-7xl mx-auto px-4 sm:px-6 lg:px-8'>
          <h2 className='text-2xl font-bold mb-6 text-center'>Có thể bạn cũng thích</h2>
          <div className='grid grid-cols-2 sm:grid-cols-4 md:grid-cols-4 lg:grid-cols-4 gap-6'>
            {relatedBooks.map((b) => (
              <Link to={`/book/${b.id}`}>
                <div key={b.id} className='group cursor-pointer'>
                  <div className='overflow-hidden rounded-lg shadow-lg transform group-hover:-translate-y-2 transition-transform duration-300'>
                    <img src={b.images[0]?.imageUrl} alt={b.title} className='w-full aspect-[2/3] object-cover' />
                  </div>
                  <div className='mt-3 text-left'>
                    <h3 className='text-md font-bold text-slate-100 truncate group-hover:text-teal-400 transition-colors duration-300'>
                      {b.title}
                    </h3>
                    <h3>{b.author.name}</h3>
                  </div>
                </div>
              </Link>
            ))}
          </div>
        </div>
        <BorrowPopup
          isOpen={isModalOpen}
          onClose={() => setIsModalOpen(false)}
          selectedBooks={
            book
              ? [
                  {
                    id: book.id,
                    title: book.title,
                    author: book.author.name,
                    imageUrl: book.images[0]?.imageUrl || ''
                  }
                ]
              : []
          }
        />
      </section>
    </div>
  )
}
