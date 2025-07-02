import { useEffect } from 'react'
import { useForm } from 'react-hook-form'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { getOneAuthor, updateAuthor } from '../../apis/author.api'
import Swal from 'sweetalert2'

interface EditAuthorPopupProps {
  isOpen: boolean
  onClose: () => void
  authorId: string | null
}

interface AuthorFormData {
  name: string
  bio: string
}

export default function EditAuthorPopup({ isOpen, onClose, authorId }: EditAuthorPopupProps) {
  const queryClient = useQueryClient()

  const {
    register,
    handleSubmit,
    reset,
    formState: { errors }
  } = useForm<AuthorFormData>()

  const { data } = useQuery({
    queryKey: ['author', authorId],
    queryFn: () => getOneAuthor(authorId!),
    enabled: isOpen && !!authorId
  })

  useEffect(() => {
    if (data) {
      reset({
        name: data.data.result.name,
        bio: data.data.result.bio
      })
    }
  }, [data, reset])

  const { mutate, isPending } = useMutation({
    mutationFn: (formData: AuthorFormData) => updateAuthor(authorId!, formData.name, formData.bio),
    onSuccess: () => {
      Swal.fire({
        toast: true,
        position: 'bottom-end',
        icon: 'success',
        title: 'Tác giả đã được cập nhật!',
        showConfirmButton: false,
        timer: 3000,
        timerProgressBar: true
      })
      queryClient.invalidateQueries({ queryKey: ['authors'] }) // 🔁 refetch danh sách
      onClose()
    }
  })

  const onSubmit = (formData: AuthorFormData) => {
    if (!authorId) return
    mutate(formData)
  }

  if (!isOpen) return null

  return (
    <div className='fixed inset-0 bg-black bg-opacity-40 flex justify-center items-center z-50'>
      <div className='bg-white rounded-2xl p-6 w-full max-w-md relative shadow-xl'>
        <button className='absolute top-3 right-3 text-gray-500 hover:text-red-500 text-lg' onClick={onClose}>
          &times;
        </button>
        <h2 className='text-xl font-semibold text-gray-800 mb-4'>✏️ Chỉnh sửa tác giả</h2>

        <form className='space-y-4' onSubmit={handleSubmit(onSubmit)}>
          <div>
            <label className='text-sm font-medium text-gray-700'>Tên tác giả</label>
            <input
              type='text'
              {...register('name', { required: 'Tên tác giả là bắt buộc' })}
              className='w-full mt-1 px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500'
              placeholder='VD: J.K. Rowling'
            />
            {errors.name && <p className='text-red-500 text-sm mt-1'>{errors.name.message}</p>}
          </div>

          <div>
            <label className='text-sm font-medium text-gray-700'>Tiểu sử</label>
            <textarea
              rows={3}
              {...register('bio', { required: 'Tiểu sử là bắt buộc' })}
              className='w-full mt-1 px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500'
              placeholder='Nhập tiểu sử...'
            />
            {errors.bio && <p className='text-red-500 text-sm mt-1'>{errors.bio.message}</p>}
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
