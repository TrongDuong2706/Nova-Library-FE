import { useForm } from 'react-hook-form'
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import Swal from 'sweetalert2'
import { BookCheck, X } from 'lucide-react'
import { createBorrow } from '../../apis/borrow.api'
import { getMyInfor } from '../../apis/auth.api'
import { useEffect } from 'react'

interface BorrowModalProps {
  isOpen: boolean
  onClose: () => void
  selectedBooks: {
    id: string
    title: string
    author: string
    imageUrl: string
  }[]
}
interface BorrowFormData {
  studentCode: string
  dueDate: string
}

export default function BorrowPopup({ isOpen, onClose, selectedBooks }: BorrowModalProps) {
  const queryClient = useQueryClient()
  const {
    register,
    handleSubmit,
    reset,
    setValue,
    formState: { errors }
  } = useForm<BorrowFormData>()

  const { data: userInfo } = useQuery({
    queryKey: ['my-info'],
    queryFn: getMyInfor
  })

  // Gán studentCode khi có dữ liệu
  useEffect(() => {
    if (userInfo?.data?.result.studentCode) {
      setValue('studentCode', userInfo.data.result.studentCode)
    }
  }, [userInfo, setValue])

  const { mutate, isPending } = useMutation({
    mutationFn: (data: BorrowFormData) => {
      const payload = {
        studentCode: data.studentCode,
        dueDate: data.dueDate,
        bookIds: selectedBooks.map((book) => book.id)
      }
      return createBorrow(payload) // API nhận JSON object
    },
    onSuccess: () => {
      Swal.fire({
        toast: true,
        position: 'top-end',
        icon: 'success',
        title: 'Mượn sách thành công!',
        showConfirmButton: false,
        timer: 3000,
        timerProgressBar: true
      })
      queryClient.invalidateQueries({ queryKey: ['borrows'] })
      queryClient.invalidateQueries({ queryKey: ['favorites'] })

      reset()
      onClose()
    },
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    onError: (error: any) => {
      // Giả sử lỗi trả về có dạng { message: 'Lỗi thông báo' }
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

  const onSubmit = (data: BorrowFormData) => {
    mutate(data)
  }

  if (!isOpen) return null

  const today = new Date().toISOString().split('T')[0]

  return (
    <div className='fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-60 backdrop-blur-sm'>
      <div className='bg-slate-800 rounded-2xl shadow-xl w-full max-w-lg m-4 border border-slate-700'>
        <form onSubmit={handleSubmit(onSubmit)}>
          {/* Header */}
          <div className='flex items-start justify-between p-5 border-b border-slate-700'>
            <h3 className='text-xl font-bold text-slate-100'>Xác nhận lượt mượn</h3>
            <button
              type='button'
              onClick={onClose}
              className='p-1 text-slate-400 hover:text-white hover:bg-slate-700 rounded-full'
            >
              <X size={20} />
            </button>
          </div>

          {/* Body */}
          <div className='p-5 space-y-6'>
            <div>
              <h4 className='text-sm font-semibold text-slate-400 mb-3'>Sách được chọn</h4>
              <ul className='space-y-3 max-h-48 overflow-y-auto pr-2'>
                {selectedBooks.map((book) => (
                  <li
                    key={book.id}
                    className='flex items-center gap-3 bg-slate-900/50 p-2 rounded-lg border border-slate-700/50'
                  >
                    <img
                      src={book.imageUrl}
                      alt={book.title}
                      className='w-10 h-14 object-cover rounded-md flex-shrink-0'
                    />
                    <div>
                      <p className='font-semibold text-slate-200'>{book.title}</p>
                      <p className='text-xs text-slate-400'>{book.author}</p>
                    </div>
                  </li>
                ))}
              </ul>
            </div>

            <div className='space-y-4'>
              <div>
                <label className='block mb-2 text-sm font-medium text-slate-300'>Mã số sinh viên</label>
                <input
                  type='text'
                  {...register('studentCode', { required: 'Vui lòng nhập mã số sinh viên' })}
                  readOnly
                  className='bg-slate-700 border border-slate-600 text-white text-sm rounded-lg block w-full p-2.5 cursor-not-allowed opacity-70'
                  placeholder='VD: STU-F82420F4'
                />

                {errors.studentCode && <p className='text-red-500 text-xs'>{errors.studentCode.message}</p>}
              </div>
              <div>
                <label className='block mb-2 text-sm font-medium text-slate-300'>Hạn trả sách</label>
                <input
                  type='date'
                  min={today}
                  {...register('dueDate', { required: 'Vui lòng chọn hạn trả' })}
                  className='bg-slate-700 border border-slate-600 text-white text-sm rounded-lg block w-full p-2.5'
                />
                {errors.dueDate && <p className='text-red-500 text-xs'>{errors.dueDate.message}</p>}
              </div>
            </div>
          </div>

          {/* Footer */}
          <div className='flex items-center justify-end gap-3 p-5 border-t border-slate-700'>
            <button
              type='button'
              onClick={onClose}
              className='px-4 py-2 bg-slate-700 text-slate-300 rounded hover:bg-slate-600'
            >
              Hủy bỏ
            </button>
            <button
              type='submit'
              disabled={isPending}
              className='px-4 py-2 bg-teal-500 text-white rounded hover:bg-teal-600 flex items-center gap-2'
            >
              <BookCheck size={16} />
              {isPending ? 'Đang mượn...' : 'Xác nhận'}
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}
