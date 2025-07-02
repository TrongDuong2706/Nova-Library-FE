import { useForm, type SubmitHandler } from 'react-hook-form'
import { useMutation, useQueryClient } from '@tanstack/react-query'
import Swal from 'sweetalert2'
import { registerAccount } from '../../apis/auth.api'

// Định nghĩa kiểu dữ liệu cho props của component
interface AddUserPopupProps {
  isOpen: boolean
  onClose: () => void
}

// Định nghĩa kiểu dữ liệu cho form, khớp với body của API
// Thêm confirmPassword để validation
type UserFormData = {
  username: string
  firstName: string
  lastName: string
  email: string
  phoneNumber: string
  password: string
  confirmPassword: string
}

export default function AddUserPopup({ isOpen, onClose }: AddUserPopupProps) {
  const queryClient = useQueryClient()

  const {
    register,
    handleSubmit,
    reset,
    watch, // Sử dụng watch để theo dõi giá trị của password
    formState: { errors }
  } = useForm<UserFormData>({
    defaultValues: {
      username: '',
      firstName: '',
      lastName: '',
      email: '',
      phoneNumber: '',
      password: '',
      confirmPassword: ''
    }
  })

  // Lấy giá trị password hiện tại để so sánh
  const passwordValue = watch('password')

  const { mutate, isPending } = useMutation({
    mutationFn: (body: Omit<UserFormData, 'confirmPassword'>) => registerAccount(body),
    onSuccess: () => {
      Swal.fire({
        toast: true,
        position: 'bottom-end',
        icon: 'success',
        title: 'Thêm người dùng thành công!',
        showConfirmButton: false,
        timer: 3000,
        timerProgressBar: true
      })
      onClose() // Đóng popup
      reset() // Reset form về giá trị mặc định
      queryClient.invalidateQueries({ queryKey: ['users'] }) // 🔁 Refetch danh sách người dùng
    },
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    onError: (error: any) => {
      const errorMessage = error?.response?.data?.message || 'Có lỗi xảy ra khi thêm người dùng.'
      Swal.fire({
        icon: 'error',
        title: 'Thất bại',
        text: errorMessage
      })
    }
  })

  const onSubmit: SubmitHandler<UserFormData> = (data) => {
    // Loại bỏ confirmPassword trước khi gửi lên API
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    const { confirmPassword, ...apiData } = data
    mutate(apiData)
  }

  // Nếu popup không mở thì không render gì cả
  if (!isOpen) return null

  return (
    <div className='fixed inset-0 bg-black bg-opacity-40 flex justify-center items-center z-50'>
      <div className='bg-white rounded-2xl p-6 w-full max-w-2xl relative shadow-xl'>
        <button className='absolute top-3 right-3 text-gray-500 hover:text-red-500 text-lg' onClick={onClose}>
          ×
        </button>
        <h2 className='text-xl font-semibold text-gray-800 mb-6'>➕ Thêm người dùng mới</h2>

        <form className='space-y-4' onSubmit={handleSubmit(onSubmit)}>
          <div className='grid grid-cols-1 md:grid-cols-2 gap-4'>
            {/* First Name */}
            <div>
              <label className='text-sm font-medium text-gray-700'>Tên</label>
              <input
                type='text'
                {...register('firstName', { required: 'Tên là bắt buộc' })}
                className='w-full mt-1 px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500'
                placeholder='VD: An'
              />
              {errors.firstName && <p className='text-red-500 text-sm mt-1'>{errors.firstName.message}</p>}
            </div>

            {/* Last Name */}
            <div>
              <label className='text-sm font-medium text-gray-700'>Họ</label>
              <input
                type='text'
                {...register('lastName', { required: 'Họ là bắt buộc' })}
                className='w-full mt-1 px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500'
                placeholder='VD: Nguyễn Văn'
              />
              {errors.lastName && <p className='text-red-500 text-sm mt-1'>{errors.lastName.message}</p>}
            </div>
          </div>

          {/* Username */}
          <div>
            <label className='text-sm font-medium text-gray-700'>Tên đăng nhập</label>
            <input
              type='text'
              {...register('username', { required: 'Tên đăng nhập là bắt buộc' })}
              className='w-full mt-1 px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500'
              placeholder='VD: nvan.dev'
            />
            {errors.username && <p className='text-red-500 text-sm mt-1'>{errors.username.message}</p>}
          </div>

          {/* Email */}
          <div>
            <label className='text-sm font-medium text-gray-700'>Email</label>
            <input
              type='email'
              {...register('email', {
                required: 'Email là bắt buộc',
                pattern: {
                  value: /^[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,}$/i,
                  message: 'Địa chỉ email không hợp lệ'
                }
              })}
              className='w-full mt-1 px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500'
              placeholder='VD: example@email.com'
            />
            {errors.email && <p className='text-red-500 text-sm mt-1'>{errors.email.message}</p>}
          </div>

          {/* Phone Number */}
          <div>
            <label className='text-sm font-medium text-gray-700'>Số điện thoại</label>
            <input
              type='tel'
              {...register('phoneNumber', { required: 'Số điện thoại là bắt buộc' })}
              className='w-full mt-1 px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500'
              placeholder='VD: 0987654321'
            />
            {errors.phoneNumber && <p className='text-red-500 text-sm mt-1'>{errors.phoneNumber.message}</p>}
          </div>

          <div className='grid grid-cols-1 md:grid-cols-2 gap-4'>
            {/* Password */}
            <div>
              <label className='text-sm font-medium text-gray-700'>Mật khẩu</label>
              <input
                type='password'
                {...register('password', {
                  required: 'Mật khẩu là bắt buộc',
                  minLength: {
                    value: 6,
                    message: 'Mật khẩu phải có ít nhất 6 ký tự'
                  }
                })}
                className='w-full mt-1 px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500'
              />
              {errors.password && <p className='text-red-500 text-sm mt-1'>{errors.password.message}</p>}
            </div>

            {/* Confirm Password */}
            <div>
              <label className='text-sm font-medium text-gray-700'>Xác nhận mật khẩu</label>
              <input
                type='password'
                {...register('confirmPassword', {
                  required: 'Vui lòng xác nhận mật khẩu',
                  validate: (value) => value === passwordValue || 'Mật khẩu không khớp'
                })}
                className='w-full mt-1 px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500'
              />
              {errors.confirmPassword && <p className='text-red-500 text-sm mt-1'>{errors.confirmPassword.message}</p>}
            </div>
          </div>

          {/* Buttons */}
          <div className='flex justify-end gap-3 pt-4'>
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
              {isPending ? 'Đang lưu...' : 'Lưu'}
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}
