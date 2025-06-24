import { useForm } from 'react-hook-form'
import { useMutation, useQueryClient, useQuery } from '@tanstack/react-query'
import Swal from 'sweetalert2'
import { getAuthors } from '../../apis/author.api'
import { getGenres } from '../../apis/genre.api'
import { createBook } from '../../apis/books.api'

interface AddBookPopupProps {
  isOpen: boolean
  onClose: () => void
}

interface BookFormData {
  title: string
  description: string
  authorId: string
  genreId: string
  images: FileList
  status: number
  stock: number
}

export default function AddBookPopup({ isOpen, onClose }: AddBookPopupProps) {
  const queryClient = useQueryClient()

  const {
    register,
    handleSubmit,
    reset,
    formState: { errors }
  } = useForm<BookFormData>()

  const { data: authorsData } = useQuery({
    queryKey: ['authors'],
    queryFn: () => getAuthors(1, 100)
  })

  const { data: genresData } = useQuery({
    queryKey: ['genres'],
    queryFn: () => getGenres(1, 100)
  })

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
      onClose()
    },
    onError: () => {
      Swal.fire({
        icon: 'error',
        title: 'Thêm sách thất bại!',
        text: 'Vui lòng kiểm tra lại thông tin hoặc thử lại sau.'
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
      status: data.status ? 1 : 0, // Đảm bảo trả đúng 1 hoặc 0
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

  if (!isOpen) return null

  return (
    <div className='fixed inset-0 bg-black bg-opacity-40 flex justify-center items-center z-50'>
      <div className='bg-white rounded-2xl p-6 w-full max-w-md relative shadow-xl'>
        <button className='absolute top-3 right-3 text-gray-500 hover:text-red-500 text-lg' onClick={onClose}>
          &times;
        </button>
        <h2 className='text-xl font-semibold text-gray-800 mb-4'>➕ Thêm sách mới</h2>

        <form className='space-y-4' onSubmit={onSubmit}>
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
            <label className='text-sm font-medium text-gray-700'>Tác giả</label>
            <select
              {...register('authorId', { required: 'Vui lòng chọn tác giả' })}
              className='w-full mt-1 px-4 py-2 border border-gray-300 rounded-lg'
            >
              <option value=''>-- Chọn tác giả --</option>
              {authorsData?.data.result.elements.map((author) => (
                <option key={author.id} value={author.id}>
                  {author.name}
                </option>
              ))}
            </select>
            {errors.authorId && <p className='text-red-500 text-sm mt-1'>{errors.authorId.message}</p>}
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
              {...register('stock', {
                required: 'Số lượng là bắt buộc',
                valueAsNumber: true // Ép thành số
              })}
              className='w-full mt-1 px-4 py-2 border border-gray-300 rounded-lg'
              placeholder='Nhập số lượng...'
            />

            {errors.stock && <p className='text-red-500 text-sm mt-1'>{errors.stock.message}</p>}
          </div>

          <div>
            <label className='text-sm font-medium text-gray-700'>Ảnh bìa (có thể chọn nhiều)</label>
            <input
              type='file'
              multiple
              accept='image/*'
              {...register('images')}
              className='w-full mt-1 px-2 py-1 border border-gray-300 rounded-lg'
            />
          </div>
          <div>
            <label className='text-sm font-medium text-gray-700 flex items-center gap-2'>
              Còn phục vụ
              <input type='checkbox' {...register('status')} className='mt-1' />
            </label>
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
    </div>
  )
}
