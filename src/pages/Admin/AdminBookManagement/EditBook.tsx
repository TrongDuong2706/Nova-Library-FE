// src/pages/Admin/EditBook/EditBook.tsx

import { useState, useEffect, useRef } from 'react'
import { useForm, useWatch } from 'react-hook-form'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { useParams, useNavigate } from 'react-router-dom'
import Swal from 'sweetalert2'
import { Info } from 'lucide-react'
import { getAuthorsByName } from '../../../apis/author.api' // Thay đổi API
import { getGenres } from '../../../apis/genre.api'
import { getOneBook, updateBook } from '../../../apis/books.api'
import type { Author } from '../../../types/author.type' // Import type

interface BookFormData {
  title: string
  description: string
  authorId: string
  genreId: string
  images: FileList
  stock: number
  status: number
  isbn: string
  publicationDate: string
}

export default function EditBook() {
  const { bookId } = useParams<{ bookId: string }>()
  const navigate = useNavigate()
  const queryClient = useQueryClient()

  const {
    register,
    handleSubmit,
    reset,
    setValue,
    control, // Cần cho useWatch
    formState: { errors }
  } = useForm<BookFormData>()

  // --- Logic tìm kiếm tác giả ---
  const [authorSearchTerm, setAuthorSearchTerm] = useState('')
  const [debouncedSearchTerm, setDebouncedSearchTerm] = useState('')
  const [isSuggestionsOpen, setIsSuggestionsOpen] = useState(false)
  const authorInputRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    const timerId = setTimeout(() => {
      setDebouncedSearchTerm(authorSearchTerm)
    }, 300)
    return () => clearTimeout(timerId)
  }, [authorSearchTerm])

  const handleSelectAuthor = (author: Author) => {
    setValue('authorId', author.id, { shouldValidate: true })
    setAuthorSearchTerm(author.name)
    setIsSuggestionsOpen(false)
  }

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (authorInputRef.current && !authorInputRef.current.contains(event.target as Node)) {
        setIsSuggestionsOpen(false)
      }
    }
    document.addEventListener('mousedown', handleClickOutside)
    return () => document.removeEventListener('mousedown', handleClickOutside)
  }, [])
  // --- Kết thúc Logic tìm kiếm tác giả ---

  // --- Logic xem trước ảnh ---
  const [newImagePreviews, setNewImagePreviews] = useState<string[]>([])
  const imagesWatch = useWatch({
    control,
    name: 'images'
  })

  useEffect(() => {
    if (imagesWatch && imagesWatch.length > 0) {
      const newPreviews = Array.from(imagesWatch).map((file) => URL.createObjectURL(file))
      setNewImagePreviews(newPreviews)
      return () => {
        newPreviews.forEach((url) => URL.revokeObjectURL(url))
      }
    } else {
      setNewImagePreviews([])
    }
  }, [imagesWatch])
  // --- Kết thúc Logic xem trước ảnh ---

  // Lấy dữ liệu sách để điền vào form
  const {
    data: bookData,
    isLoading: isBookLoading,
    isError: isBookError
  } = useQuery({
    queryKey: ['book', bookId],
    queryFn: () => getOneBook(bookId!),
    enabled: !!bookId
  })
  const { data: authorSuggestionsData, isLoading: isSearchingAuthors } = useQuery({
    queryKey: ['authorSuggestions', debouncedSearchTerm],
    queryFn: () => getAuthorsByName(debouncedSearchTerm, 1, 10),
    enabled: !!debouncedSearchTerm && debouncedSearchTerm !== bookData?.data.result.author.name,
    staleTime: 1000 * 60
  })

  // Lấy danh sách thể loại (không cần lấy tất cả tác giả nữa)
  const { data: genresData } = useQuery({ queryKey: ['genres'], queryFn: () => getGenres(1, 100) })

  // Điền dữ liệu vào form sau khi fetch thành công
  useEffect(() => {
    if (bookData) {
      const { title, description, author, genre, stock, status, isbn, publicationDate } = bookData.data.result
      reset({
        title,
        description,
        authorId: author.id,
        genreId: genre.id,
        stock,
        status,
        isbn,
        publicationDate: new Date(publicationDate).toISOString().split('T')[0]
      })
      // Điền sẵn tên tác giả vào ô tìm kiếm
      setAuthorSearchTerm(author.name)
    }
  }, [bookData, reset])

  // Mutation để cập nhật sách
  const { mutate, isPending } = useMutation({
    mutationFn: (formData: FormData) => updateBook(bookId!, formData),
    onSuccess: () => {
      Swal.fire({
        toast: true,
        position: 'top-end',
        icon: 'success',
        title: 'Sách đã được cập nhật!',
        showConfirmButton: false,
        timer: 3000,
        timerProgressBar: true
      })
      queryClient.invalidateQueries({ queryKey: ['books'] })
      queryClient.invalidateQueries({ queryKey: ['book', bookId] })
      navigate('/admin/books')
    },

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    onError: (error: any) => {
      const errorMessage = error?.response?.data?.message || 'Có lỗi xảy ra!'
      Swal.fire({
        toast: true,
        position: 'top-end',
        icon: 'error',
        title: errorMessage,
        showConfirmButton: false,
        timer: 3000,
        timerProgressBar: true
      })
    }
  })

  const onSubmit = handleSubmit((data) => {
    const formData = new FormData()
    const book = {
      title: data.title,
      description: data.description,
      authorId: data.authorId,
      genreId: data.genreId,
      stock: data.stock,
      status: data.status ? 1 : 0,
      isbn: data.isbn,
      publicationDate: data.publicationDate
    }
    formData.append('books', new Blob([JSON.stringify(book)], { type: 'application/json' }))
    // Chỉ gửi ảnh mới nếu người dùng đã chọn
    if (data.images && data.images.length > 0) {
      for (let i = 0; i < data.images.length; i++) {
        formData.append('images', data.images[i])
      }
    } else {
      // Đảm bảo vẫn gửi key 'images' để backend không lỗi
      formData.append('images', new Blob([]), '')
    }

    mutate(formData)
  })

  if (isBookLoading) return <div className='p-8 text-center'>Đang tải dữ liệu sách...</div>
  if (isBookError || !bookData) return <div className='p-8 text-center text-red-500'>Không thể tải dữ liệu sách.</div>

  return (
    <div className='bg-white rounded-2xl shadow-md p-6 max-w-6xl mx-auto'>
      <h2 className='text-2xl font-semibold text-gray-800 mb-6 border-b pb-4'>✏️ Chỉnh sửa sách</h2>
      <form className='space-y-4' onSubmit={onSubmit}>
        <div className='grid grid-cols-1 md:grid-cols-2 gap-4'>
          <div>
            <label className='text-sm font-medium text-gray-700'>Tiêu đề</label>
            <input
              type='text'
              {...register('title', { required: 'Tiêu đề là bắt buộc' })}
              className='w-full mt-1 px-4 py-2 border border-gray-300 rounded-lg'
            />
            {errors.title && <p className='text-red-500 text-sm mt-1'>{errors.title.message}</p>}
          </div>
          <div>
            <label className='text-sm font-medium text-gray-700'>ISBN</label>
            <input
              type='text'
              {...register('isbn', {
                required: 'ISBN là bắt buộc',
                pattern: { value: /^\d{13}$/, message: 'ISBN phải gồm đúng 13 chữ số' }
              })}
              className='w-full mt-1 px-4 py-2 border border-gray-300 rounded-lg'
            />
            {errors.isbn && <p className='text-red-500 text-sm mt-1'>{errors.isbn.message}</p>}
          </div>

          <div className='relative' ref={authorInputRef}>
            <label className='text-sm font-medium text-gray-700'>Tác giả</label>
            <input
              type='text'
              className='w-full mt-1 px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-1 focus:ring-purple-500 focus:border-purple-500'
              placeholder='Nhập tên tác giả để tìm kiếm...'
              value={authorSearchTerm}
              onChange={(e) => {
                setAuthorSearchTerm(e.target.value)
                setIsSuggestionsOpen(true)
                setValue('authorId', '')
              }}
              onFocus={() => setIsSuggestionsOpen(true)}
              autoComplete='off'
            />
            <input type='hidden' {...register('authorId', { required: 'Vui lòng chọn một tác giả' })} />
            {errors.authorId && <p className='text-red-500 text-sm mt-1'>{errors.authorId.message}</p>}

            {isSuggestionsOpen && (
              <div className='absolute z-10 w-full bg-white border border-gray-300 rounded-lg shadow-lg max-h-60 overflow-y-auto'>
                {isSearchingAuthors ? (
                  <div className='p-3 text-sm text-gray-500 italic text-center'>Đang tìm...</div>
                ) : authorSuggestionsData?.data.result.elements.length === 0 ? (
                  <div className='p-3 text-sm text-gray-500 italic text-center'>Không tìm thấy tác giả.</div>
                ) : (
                  <ul>
                    {authorSuggestionsData?.data.result.elements.map((author) => (
                      <li
                        key={author.id}
                        className='px-4 py-2 hover:bg-purple-100 cursor-pointer text-sm'
                        onClick={() => handleSelectAuthor(author)}
                      >
                        {author.name}
                      </li>
                    ))}
                  </ul>
                )}
              </div>
            )}
          </div>

          <div>
            <label className='text-sm font-medium text-gray-700'>Thể loại</label>
            <select
              {...register('genreId', { required: 'Chọn thể loại' })}
              className='w-full mt-1 px-4 py-2 border border-gray-300 rounded-lg'
            >
              <option value=''>-- Chọn thể loại --</option>
              {genresData?.data.result.elements.map((genre) => (
                <option key={genre.id} value={genre.id}>
                  {genre.name}
                </option>
              ))}
            </select>
          </div>
          <div>
            <label className='text-sm font-medium text-gray-700'>Số lượng</label>
            <input
              type='number'
              {...register('stock', { required: 'Số lượng là bắt buộc', valueAsNumber: true })}
              className='w-full mt-1 px-4 py-2 border border-gray-300 rounded-lg'
            />
            {errors.stock && <p className='text-red-500 text-sm mt-1'>{errors.stock.message}</p>}
          </div>
          <div>
            <label className='text-sm font-medium text-gray-700'>Ngày xuất bản</label>
            <input
              type='date'
              {...register('publicationDate', { required: 'Ngày xuất bản là bắt buộc' })}
              className='w-full mt-1 px-4 py-2 border border-gray-300 rounded-lg'
            />
            {errors.publicationDate && <p className='text-red-500 text-sm mt-1'>{errors.publicationDate.message}</p>}
          </div>
        </div>
        <div>
          <label className='text-sm font-medium text-gray-700'>Mô tả</label>
          <textarea
            {...register('description', { required: 'Mô tả là bắt buộc' })}
            className='w-full mt-1 px-4 py-2 border border-gray-300 rounded-lg'
            rows={3}
          />
          {errors.description && <p className='text-red-500 text-sm mt-1'>{errors.description.message}</p>}
        </div>

        <div>
          <label className='text-sm font-medium text-gray-700'>Ảnh bìa</label>
          <div className='mt-2'>
            <span className='block text-xs text-gray-500 mb-2'>Ảnh hiện tại:</span>
            {bookData.data.result.images.length > 0 ? (
              <div className='grid grid-cols-3 sm:grid-cols-4 md:grid-cols-6 gap-3'>
                {bookData.data.result.images.map((image) => (
                  <div key={image.imageUrl} className='aspect-w-1 aspect-h-1'>
                    <img
                      src={image.imageUrl}
                      alt='Current book'
                      className='object-cover w-full h-full rounded-md shadow-sm'
                    />
                  </div>
                ))}
              </div>
            ) : (
              <p className='text-xs text-gray-400 italic'>Sách này chưa có ảnh.</p>
            )}
          </div>
          <div className='mt-4'>
            <label className='text-sm font-medium text-gray-700'>
              Cập nhật ảnh mới (thao tác này sẽ thay thế toàn bộ ảnh cũ)
            </label>
            <input
              type='file'
              multiple
              accept='image/*'
              {...register('images')}
              className='w-full mt-1 file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-sm file:font-semibold file:bg-purple-50 file:text-purple-700 hover:file:bg-purple-100 cursor-pointer'
            />
            {newImagePreviews.length > 0 && (
              <div className='mt-4 grid grid-cols-3 sm:grid-cols-4 md:grid-cols-6 gap-3'>
                {newImagePreviews.map((preview, index) => (
                  <div key={index} className='aspect-w-1 aspect-h-1'>
                    <img
                      src={preview}
                      alt={`New preview ${index + 1}`}
                      className='object-cover w-full h-full rounded-md shadow-sm border-2 border-purple-500'
                    />
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>

        <div>
          <label className='text-sm font-medium text-gray-700 flex items-center gap-2'>
            Còn phục vụ
            <input type='checkbox' {...register('status')} className='mt-1' />
            <div className='group relative flex items-center'>
              <Info size={16} className='text-gray-400' />
              <div className='absolute bottom-full mb-2 hidden w-60 rounded-md bg-gray-800 p-2 text-center text-xs text-white group-hover:block'>
                Sách sẽ không hiển thị trên trang chủ nếu không còn phục vụ.
                <div className='absolute left-1/2 -translate-x-1/2 top-full w-0 h-0 border-x-4 border-x-transparent border-t-4 border-t-gray-800'></div>
              </div>
            </div>
          </label>
        </div>

        <div className='flex justify-end gap-3 pt-4 border-t'>
          <button
            type='button'
            onClick={() => navigate(-1)}
            className='bg-gray-200 hover:bg-gray-300 text-gray-800 font-medium px-4 py-2 rounded-lg'
          >
            Quay lại
          </button>
          <button
            type='submit'
            disabled={isPending}
            className={`font-medium px-4 py-2 rounded-lg text-white transition ${
              isPending ? 'bg-gray-400 cursor-not-allowed' : 'bg-purple-600 hover:bg-purple-700'
            }`}
          >
            {isPending ? 'Đang cập nhật...' : 'Cập nhật'}
          </button>
        </div>
      </form>
    </div>
  )
}
