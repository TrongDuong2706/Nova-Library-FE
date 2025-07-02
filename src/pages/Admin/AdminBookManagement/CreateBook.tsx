import { useState, useEffect } from 'react'
import { useForm, useWatch, Controller } from 'react-hook-form'
import { useMutation, useQueryClient, useQuery } from '@tanstack/react-query'
import { useNavigate } from 'react-router-dom'
import Swal from 'sweetalert2'
import Select from 'react-select'
import { Info } from 'lucide-react'
import { getAuthorsByName } from '../../../apis/author.api'
import { getGenres } from '../../../apis/genre.api'
import { createBook } from '../../../apis/books.api'
import type { Author } from '../../../types/book.type'

// Định dạng dữ liệu cho react-select
type SelectOption = {
  value: string
  label: string
}

// Định dạng dữ liệu của form
interface BookFormData {
  title: string
  description: string
  authorIds: string[]
  genreIds: string[]
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
    control,
    setValue, // Cần setValue để cập nhật form state một cách có kiểm soát
    formState: { errors }
  } = useForm<BookFormData>({
    // Khởi tạo giá trị mặc định để tránh lỗi 'undefined'
    defaultValues: {
      authorIds: [],
      genreIds: []
    }
  })

  // --- Logic quản lý Tác giả ---
  const [authorSearchTerm, setAuthorSearchTerm] = useState('')
  const [selectedAuthors, setSelectedAuthors] = useState<SelectOption[]>([])

  const { data: authorSuggestionsData, isLoading: isSearchingAuthors } = useQuery({
    queryKey: ['authorSuggestions', authorSearchTerm],
    queryFn: () => getAuthorsByName(authorSearchTerm, 1, 20),
    enabled: !!authorSearchTerm,
    staleTime: 1000 * 30
  })

  // Định dạng lại kết quả tìm kiếm
  const authorSuggestionOptions: SelectOption[] =
    authorSuggestionsData?.data.result.elements.map((author: Author) => ({
      value: author.id,
      label: author.name
    })) || []

  // Kết hợp danh sách đã chọn và danh sách gợi ý để hiển thị
  const authorDisplayOptions = [
    ...selectedAuthors,
    ...authorSuggestionOptions.filter((opt) => !selectedAuthors.some((selected) => selected.value === opt.value))
  ]

  // Hàm xử lý khi người dùng thay đổi lựa chọn tác giả
  const handleAuthorChange = (selectedOptions: readonly SelectOption[]) => {
    // Cập nhật state UI
    setSelectedAuthors(selectedOptions as SelectOption[])
    // Cập nhật state của react-hook-form
    setValue(
      'authorIds',
      selectedOptions.map((opt) => opt.value),
      { shouldValidate: true }
    )
  }

  // --- Logic quản lý Thể loại ---
  const { data: genresData } = useQuery({
    queryKey: ['genres'],
    queryFn: () => getGenres(1, 100)
  })

  const genreOptions: SelectOption[] =
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    genresData?.data.result.elements.map((genre: any) => ({
      value: genre.id,
      label: genre.name
    })) || []

  // --- Logic xem trước ảnh ---
  const [imagePreviews, setImagePreviews] = useState<string[]>([])
  const imagesWatch = useWatch({
    control,
    name: 'images'
  })

  useEffect(() => {
    if (imagesWatch && imagesWatch.length > 0) {
      const newPreviews = Array.from(imagesWatch).map((file) => URL.createObjectURL(file))
      setImagePreviews(newPreviews)
      return () => {
        newPreviews.forEach((url) => URL.revokeObjectURL(url))
      }
    } else {
      setImagePreviews([])
    }
  }, [imagesWatch])

  // --- Logic Mutation và Submit ---
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
      authorIds: data.authorIds,
      genreIds: data.genreIds,
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
        <div className='grid grid-cols-1 md:grid-cols-2 gap-6'>
          {/* Tiêu đề */}
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

          {/* ISBN */}
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

          {/* Tác giả */}
          <div>
            <label className='text-sm font-medium text-gray-700'>Tác giả (chọn nhiều)</label>
            <Controller
              name='authorIds'
              control={control}
              rules={{ validate: (value) => value.length > 0 || 'Vui lòng chọn ít nhất một tác giả' }}
              render={() => (
                <Select
                  isMulti
                  options={authorDisplayOptions}
                  value={selectedAuthors}
                  isLoading={isSearchingAuthors}
                  onInputChange={(value) => setAuthorSearchTerm(value)}
                  onChange={handleAuthorChange}
                  className='mt-1'
                  placeholder='Nhập để tìm và chọn tác giả...'
                  noOptionsMessage={() => (authorSearchTerm ? 'Không tìm thấy tác giả' : 'Nhập để tìm kiếm')}
                />
              )}
            />
            {errors.authorIds && <p className='text-red-500 text-sm mt-1'>{errors.authorIds.message as string}</p>}
          </div>

          {/* Thể loại */}
          <div>
            <label className='text-sm font-medium text-gray-700'>Thể loại (chọn nhiều)</label>
            <Controller
              name='genreIds'
              control={control}
              rules={{ validate: (value) => value.length > 0 || 'Vui lòng chọn ít nhất một thể loại' }}
              render={({ field }) => (
                <Select
                  isMulti
                  options={genreOptions}
                  onChange={(selectedOptions) => field.onChange(selectedOptions.map((option) => option.value))}
                  value={genreOptions.filter((option) => field.value?.includes(option.value))}
                  className='mt-1'
                  placeholder='-- Chọn thể loại --'
                />
              )}
            />
            {errors.genreIds && <p className='text-red-500 text-sm mt-1'>{errors.genreIds.message as string}</p>}
          </div>

          {/* Số lượng */}
          <div>
            <label className='text-sm font-medium text-gray-700'>Số lượng</label>
            <input
              type='number'
              {...register('stock', {
                required: 'Số lượng là bắt buộc',
                valueAsNumber: true,
                min: { value: 0, message: 'Số lượng không được âm' }
              })}
              className='w-full mt-1 px-4 py-2 border border-gray-300 rounded-lg'
              placeholder='Nhập số lượng...'
            />
            {errors.stock && <p className='text-red-500 text-sm mt-1'>{errors.stock.message}</p>}
          </div>

          {/* Ngày xuất bản */}
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

        {/* Mô tả */}
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

        {/* Ảnh bìa */}
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

        {/* Status */}
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

        {/* Buttons */}
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
