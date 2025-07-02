import { useState, useEffect } from 'react'
import { useForm, useWatch, Controller } from 'react-hook-form'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { useParams, useNavigate } from 'react-router-dom'
import Swal from 'sweetalert2'
import Select from 'react-select'
import { Info } from 'lucide-react'
import { getAuthorsByName } from '../../../apis/author.api'
import { getGenres } from '../../../apis/genre.api'
import { getOneBook, updateBook } from '../../../apis/books.api'
import type { Author } from '../../../types/author.type'

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
    control,
    formState: { errors }
  } = useForm<BookFormData>({
    defaultValues: {
      authorIds: [],
      genreIds: []
    }
  })

  // --- Logic quản lý State ---
  const [selectedAuthors, setSelectedAuthors] = useState<SelectOption[]>([])
  const [authorSearchTerm, setAuthorSearchTerm] = useState('')

  // --- Logic Fetch dữ liệu ---

  // 1. Lấy dữ liệu sách cần chỉnh sửa
  const {
    data: bookData,
    isLoading: isBookLoading,
    isError: isBookError
  } = useQuery({
    queryKey: ['book', bookId],
    queryFn: () => getOneBook(bookId!),
    enabled: !!bookId
  })

  // 2. Lấy danh sách gợi ý tác giả dựa trên từ khóa tìm kiếm
  const { data: authorSuggestionsData, isLoading: isSearchingAuthors } = useQuery({
    queryKey: ['authorSuggestions', authorSearchTerm],
    queryFn: () => getAuthorsByName(authorSearchTerm, 1, 20),
    enabled: !!authorSearchTerm,
    staleTime: 1000 * 30
  })

  // 3. Lấy toàn bộ danh sách thể loại
  const { data: genresData } = useQuery({ queryKey: ['genres'], queryFn: () => getGenres(1, 100) })

  // --- Logic xử lý và định dạng dữ liệu cho Select ---
  const authorSuggestionOptions: SelectOption[] =
    authorSuggestionsData?.data.result.elements.map((author: Author) => ({
      value: author.id,
      label: author.name
    })) || []

  const authorDisplayOptions = [
    ...selectedAuthors,
    ...authorSuggestionOptions.filter((opt) => !selectedAuthors.some((selected) => selected.value === opt.value))
  ]

  const genreOptions: SelectOption[] =
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    genresData?.data.result.elements.map((genre: any) => ({
      value: genre.id,
      label: genre.name
    })) || []

  // --- Logic điền dữ liệu ban đầu vào form ---
  useEffect(() => {
    if (bookData) {
      const { title, description, authors, genres, stock, status, isbn, publicationDate } = bookData.data.result

      // Chuyển đổi dữ liệu tác giả và thể loại ban đầu sang định dạng của react-select
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      const initialAuthors = authors.map((author: any) => ({ value: author.id, label: author.name }))
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      const initialGenres = genres.map((genre: any) => ({ value: genre.id, label: genre.name }))

      // Cập nhật state UI
      setSelectedAuthors(initialAuthors)

      // Reset toàn bộ form với dữ liệu ban đầu
      reset({
        title,
        description,
        authorIds: initialAuthors.map((a) => a.value),
        genreIds: initialGenres.map((g) => g.value),
        stock,
        status,
        isbn,
        publicationDate: new Date(publicationDate).toISOString().split('T')[0]
      })
    }
  }, [bookData, reset])

  // --- Logic xem trước ảnh mới ---
  const [newImagePreviews, setNewImagePreviews] = useState<string[]>([])
  const imagesWatch = useWatch({ control, name: 'images' })
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

  // --- Logic Mutation và Submit ---
  const { mutate, isPending } = useMutation({
    mutationFn: (formData: FormData) => updateBook(bookId!, formData),
    onSuccess: () => {
      Swal.fire({
        toast: true,
        position: 'bottom-end',
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
        position: 'bottom-end',
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
      authorIds: data.authorIds,
      genreIds: data.genreIds,
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

  // Hàm xử lý khi người dùng thay đổi lựa chọn tác giả
  const handleAuthorChange = (selectedOptions: readonly SelectOption[]) => {
    setSelectedAuthors(selectedOptions as SelectOption[])
    setValue(
      'authorIds',
      selectedOptions.map((opt) => opt.value),
      { shouldValidate: true }
    )
  }

  // --- Render ---
  if (isBookLoading) return <div className='p-8 text-center'>Đang tải dữ liệu sách...</div>
  if (isBookError || !bookData) return <div className='p-8 text-center text-red-500'>Không thể tải dữ liệu sách.</div>

  return (
    <div className='bg-white rounded-2xl shadow-md p-6 max-w-6xl mx-auto'>
      <h2 className='text-2xl font-semibold text-gray-800 mb-6 border-b pb-4'>✏️ Chỉnh sửa sách</h2>
      <form className='space-y-4' onSubmit={onSubmit}>
        <div className='grid grid-cols-1 md:grid-cols-2 gap-6'>
          {/* ... Tiêu đề, ISBN ... */}
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

          {/* ... Số lượng, Ngày xuất bản ... */}
          <div>
            <label className='text-sm font-medium text-gray-700'>Số lượng</label>
            <input
              type='number'
              {...register('stock', {
                required: 'Số lượng là bắt buộc',
                valueAsNumber: true,
                min: { value: 0, message: 'Số lượng không âm' }
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

        {/* ... Mô tả, Ảnh, Status, Buttons ... */}
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
                {/* eslint-disable-next-line @typescript-eslint/no-explicit-any */}
                {bookData.data.result.images.map((image: any) => (
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
