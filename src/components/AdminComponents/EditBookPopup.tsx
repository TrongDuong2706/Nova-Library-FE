import { useEffect } from 'react'
import { useForm } from 'react-hook-form'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { getAuthors } from '../../apis/author.api'
import { getGenres } from '../../apis/genre.api'
import Swal from 'sweetalert2'
import { getOneBook, updateBook } from '../../apis/books.api'

interface EditBookPopupProps {
  isOpen: boolean
  onClose: () => void
  bookId: string | null
}

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

export default function EditBookPopup({ isOpen, onClose, bookId }: EditBookPopupProps) {
  const queryClient = useQueryClient()
  const {
    register,
    handleSubmit,
    reset,
    formState: { errors }
  } = useForm<BookFormData>()

  const { data: bookData } = useQuery({
    queryKey: ['book', bookId],
    queryFn: () => getOneBook(bookId!),
    enabled: isOpen && !!bookId
  })

  const { data: authorsData } = useQuery({
    queryKey: ['authors'],
    queryFn: () => getAuthors(1, 100)
  })

  const { data: genresData } = useQuery({
    queryKey: ['genres'],
    queryFn: () => getGenres(1, 100)
  })

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
        publicationDate
      })
    }
  }, [bookData, reset])

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
      onClose()
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

    if (data.images && data.images.length > 0) {
      for (let i = 0; i < data.images.length; i++) {
        formData.append('images', data.images[i])
      }
    } else {
      formData.append('images', new Blob([]), '')
    }

    mutate(formData)
  })

  if (!isOpen) return null

  return (
    <div className='fixed inset-0 bg-black bg-opacity-40 flex justify-center items-center z-50'>
      <div className='bg-white rounded-2xl p-6 w-full max-w-md relative shadow-xl'>
        <button className='absolute top-3 right-3 text-gray-500 hover:text-red-500 text-lg' onClick={onClose}>
          &times;
        </button>
        <h2 className='text-xl font-semibold text-gray-800 mb-4'>✏️ Chỉnh sửa sách</h2>

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
                  pattern: {
                    value: /^\d{13}$/,
                    message: 'ISBN phải gồm đúng 13 chữ số'
                  }
                })}
                className='w-full mt-1 px-4 py-2 border border-gray-300 rounded-lg'
              />
              {errors.isbn && <p className='text-red-500 text-sm mt-1'>{errors.isbn.message}</p>}
            </div>

            <div>
              <label className='text-sm font-medium text-gray-700'>Tác giả</label>
              <select
                {...register('authorId', { required: 'Chọn tác giả' })}
                className='w-full mt-1 px-4 py-2 border border-gray-300 rounded-lg'
              >
                <option value=''>-- Chọn tác giả --</option>
                {authorsData?.data.result.elements.map((author) => (
                  <option key={author.id} value={author.id}>
                    {author.name}
                  </option>
                ))}
              </select>
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
                {...register('stock', {
                  required: 'Số lượng là bắt buộc',
                  valueAsNumber: true
                })}
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
            <label className='text-sm font-medium text-gray-700 flex items-center gap-2'>
              Còn phục vụ
              <input type='checkbox' {...register('status')} className='mt-1' />
            </label>
          </div>

          <div>
            <label className='text-sm font-medium text-gray-700'>Cập nhật ảnh mới (nếu có)</label>
            <input
              type='file'
              multiple
              accept='image/*'
              {...register('images')}
              className='w-full mt-1 px-2 py-1 border border-gray-300 rounded-lg'
            />
          </div>

          <div className='flex justify-end gap-3'>
            <button
              type='button'
              onClick={onClose}
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
    </div>
  )
}
