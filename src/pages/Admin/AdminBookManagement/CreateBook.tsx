// src/pages/Admin/CreateBook/CreateBook.tsx

import { useState, useEffect, useRef } from 'react'
import { useForm, useWatch } from 'react-hook-form'
import { useMutation, useQueryClient, useQuery } from '@tanstack/react-query'
import { useNavigate } from 'react-router-dom'
import Swal from 'sweetalert2'
import { Info } from 'lucide-react'
import { getAuthorsByName } from '../../../apis/author.api'
import { getGenres } from '../../../apis/genre.api'
import { createBook } from '../../../apis/books.api'
import type { Author } from '../../../types/book.type'

interface BookFormData {
  title: string
  description: string
  authorId: string
  genreId: string
  images: FileList
  status: number
  stock: number
  isbn: string
  publicationDate: string
}

export default function CreateBook() {
  const navigate = useNavigate()
  const queryClient = useQueryClient()

  const {
    register,
    handleSubmit,
    reset,
    setValue,
    control, // Cần `control` cho useWatch
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

  const { data: authorSuggestionsData, isLoading: isSearchingAuthors } = useQuery({
    queryKey: ['authorSuggestions', debouncedSearchTerm],
    queryFn: () => getAuthorsByName(debouncedSearchTerm, 1, 10),
    enabled: debouncedSearchTerm.length > 0,
    staleTime: 1000 * 60
  })

  const { data: genresData } = useQuery({
    queryKey: ['genres'],
    queryFn: () => getGenres(1, 100)
  })

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

  // --- Logic xem trước ảnh đã chọn ---
  const [imagePreviews, setImagePreviews] = useState<string[]>([])
  const imagesWatch = useWatch({
    control,
    name: 'images'
  })

  useEffect(() => {
    if (imagesWatch && imagesWatch.length > 0) {
      const newPreviews = Array.from(imagesWatch).map((file) => URL.createObjectURL(file))
      setImagePreviews(newPreviews)

      // Cleanup function để giải phóng bộ nhớ khi component unmount hoặc ảnh thay đổi
      return () => {
        newPreviews.forEach((url) => URL.revokeObjectURL(url))
      }
    } else {
      setImagePreviews([])
    }
  }, [imagesWatch])
  // --- Kết thúc Logic xem trước ảnh ---

  const mutation = useMutation({
    mutationFn: (formData: FormData) => createBook(formData),
    onSuccess: () => {
      Swal.fire({
        toast: true,
        position: 'top-end',
        icon: 'success',
        title: '📚 Sách đã được thêm!',
        showConfirmButton: false,
        timer: 3000,
        timerProgressBar: true
      })
      queryClient.invalidateQueries({ queryKey: ['books'] })
      reset()
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
    const bookJson = {
      title: data.title,
      description: data.description,
      authorId: data.authorId,
      genreId: data.genreId,
      status: data.status ? 1 : 0,
      isbn: data.isbn,
      publicationDate: data.publicationDate,
      stock: data.stock
    }
    formData.append('books', new Blob([JSON.stringify(bookJson)], { type: 'application/json' }))
    if (data.images && data.images.length > 0) {
      for (let i = 0; i < data.images.length; i++) {
        formData.append('images', data.images[i])
      }
    }
    mutation.mutate(formData)
  })

  return (
    <div className='bg-white rounded-2xl shadow-md p-6 max-w-6xl mx-auto '>
      <h2 className='text-2xl font-semibold text-gray-800 mb-6 border-b pb-4'>➕ Thêm sách mới</h2>
      <form className='space-y-4' onSubmit={onSubmit}>
        <div className='grid grid-cols-1 md:grid-cols-2 gap-4'>
          <div>
            <label className='text-sm font-medium text-gray-700'>Tiêu đề</label>
            <input
              type='text'
              {...register('title', { required: 'Tiêu đề là bắt buộc' })}
              className='w-full mt-1 px-4 py-2 border border-gray-300 rounded-lg'
              placeholder='Nhập tiêu đề...'
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
              placeholder='Nhập ISBN (13 chữ số)...'
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

            {isSuggestionsOpen && debouncedSearchTerm.length > 0 && (
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
              {...register('genreId', { required: 'Vui lòng chọn thể loại' })}
              className='w-full mt-1 px-4 py-2 border border-gray-300 rounded-lg'
            >
              <option value=''>-- Chọn thể loại --</option>
              {genresData?.data.result.elements.map((genre) => (
                <option key={genre.id} value={genre.id}>
                  {genre.name}
                </option>
              ))}
            </select>
            {errors.genreId && <p className='text-red-500 text-sm mt-1'>{errors.genreId.message}</p>}
          </div>
          <div>
            <label className='text-sm font-medium text-gray-700'>Số lượng</label>
            <input
              type='number'
              {...register('stock', { required: 'Số lượng là bắt buộc', valueAsNumber: true })}
              className='w-full mt-1 px-4 py-2 border border-gray-300 rounded-lg'
              placeholder='Nhập số lượng...'
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
            placeholder='Nhập mô tả...'
            rows={3}
          />
          {errors.description && <p className='text-red-500 text-sm mt-1'>{errors.description.message}</p>}
        </div>

        <div>
          <label className='text-sm font-medium text-gray-700'>Ảnh bìa (có thể chọn nhiều)</label>
          <input
            type='file'
            multiple
            accept='image/*'
            {...register('images')}
            className='w-full mt-1 file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-sm file:font-semibold file:bg-purple-50 file:text-purple-700 hover:file:bg-purple-100 cursor-pointer'
          />
          {imagePreviews.length > 0 && (
            <div className='mt-4 grid grid-cols-3 sm:grid-cols-4 md:grid-cols-6 gap-3'>
              {imagePreviews.map((preview, index) => (
                <div key={index} className='aspect-w-1 aspect-h-1'>
                  <img
                    src={preview}
                    alt={`Preview ${index + 1}`}
                    className='object-cover w-full h-full rounded-md shadow-sm'
                  />
                </div>
              ))}
            </div>
          )}
        </div>

        <div>
          <label className='text-sm font-medium text-gray-700 flex items-center gap-2'>
            Còn phục vụ
            <input type='checkbox' {...register('status')} className='mt-1' defaultChecked />
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
            disabled={mutation.isPending}
            className={`font-medium px-4 py-2 rounded-lg text-white transition ${
              mutation.isPending ? 'bg-gray-400 cursor-not-allowed' : 'bg-purple-600 hover:bg-purple-700'
            }`}
          >
            {mutation.isPending ? 'Đang lưu...' : 'Lưu'}
          </button>
        </div>
      </form>
    </div>
  )
}
