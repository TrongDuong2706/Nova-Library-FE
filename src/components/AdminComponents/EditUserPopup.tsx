import { useEffect } from 'react'
import { useForm } from 'react-hook-form'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import Swal from 'sweetalert2'
import { getOneUser, updateUser } from '../../apis/user.api' // ⚠️ Thay đổi đường dẫn này cho đúng

// Kiểu dữ liệu cho props
interface EditUserPopupProps {
  isOpen: boolean
  onClose: () => void
  userId: string | null // User ID để biết cần edit ai
}

// Kiểu dữ liệu cho form, password và confirmPassword là optional
type UserFormData = {
  firstName: string
  lastName: string
  email: string
  phoneNumber: string
  roleName: string
  password?: string // Mật khẩu không bắt buộc
  confirmPassword?: string
}

export default function EditUserPopup({ isOpen, onClose, userId }: EditUserPopupProps) {
  const queryClient = useQueryClient()

  const {
    register,
    handleSubmit,
    reset,
    watch,
    formState: { errors }
  } = useForm<UserFormData>()

  // Lấy giá trị password mới để so sánh
  const newPassword = watch('password')

  // 1. Dùng useQuery để lấy thông tin chi tiết của user khi popup mở
  const { data: userData } = useQuery({
    queryKey: ['user', userId], // Query key độc nhất cho user này
    queryFn: () => getOneUser(userId!),
    enabled: isOpen && !!userId // Chỉ chạy query khi popup mở VÀ có userId
  })

  // 2. Dùng useEffect để điền dữ liệu từ API vào form khi có
  useEffect(() => {
    if (userData?.data.result) {
      const user = userData.data.result
      reset({
        firstName: user.firstName,
        lastName: user.lastName,
        email: user.email,
        phoneNumber: user.phoneNumber,
        roleName: user.roles[0].name // Giả sử role nằm trong user.role.name
      })
    } else {
      // Nếu không có data (ví dụ khi đóng popup), reset form
      reset({
        firstName: '',
        lastName: '',
        email: '',
        phoneNumber: '',
        roleName: '',
        password: '',
        confirmPassword: ''
      })
    }
  }, [userData, reset, isOpen]) // Chạy lại khi userData hoặc trạng thái mở/đóng thay đổi

  // 3. Dùng useMutation để thực hiện việc cập nhật user
  const { mutate, isPending } = useMutation({
    mutationFn: (body: Omit<UserFormData, 'confirmPassword'>) => {
      // Nếu người dùng không nhập password mới, loại bỏ nó khỏi body gửi đi
      if (!body.password) {
        delete body.password
      }
      return updateUser(userId!, body)
    },
    onSuccess: () => {
      Swal.fire({
        toast: true,
        position: 'bottom-end',
        icon: 'success',
        title: 'Cập nhật người dùng thành công!',
        showConfirmButton: false,
        timer: 3000,
        timerProgressBar: true
      })
      queryClient.invalidateQueries({ queryKey: ['users'] }) // 🔁 Refetch danh sách users
      onClose()
    },
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    onError: (error: any) => {
      const errorMessage = error?.response?.data?.message || 'Có lỗi xảy ra khi cập nhật.'
      Swal.fire({
        icon: 'error',
        title: 'Thất bại',
        text: errorMessage
      })
    }
  })

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const onSubmit = (formData: any) => {
    if (!userId) return
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    const { confirmPassword, ...apiData } = formData
    mutate(apiData)
  }

  if (!isOpen) return null

  return (
    <div className='fixed inset-0 bg-black bg-opacity-40 flex justify-center items-center z-50'>
      <div className='bg-white rounded-2xl p-6 w-full max-w-2xl relative shadow-xl'>
        <button className='absolute top-3 right-3 text-gray-500 hover:text-red-500 text-lg' onClick={onClose}>
          ×
        </button>
        <h2 className='text-xl font-semibold text-gray-800 mb-6'>✏️ Chỉnh sửa thông tin người dùng</h2>

        <form className='space-y-4' onSubmit={handleSubmit(onSubmit)}>
          <div className='grid grid-cols-1 md:grid-cols-2 gap-4'>
            {/* First Name */}
            <div>
              <label className='text-sm font-medium text-gray-700'>Tên</label>
              <input
                type='text'
                {...register('firstName', { required: 'Tên là bắt buộc' })}
                className='w-full mt-1 px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500'
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
              />
              {errors.lastName && <p className='text-red-500 text-sm mt-1'>{errors.lastName.message}</p>}
            </div>
          </div>

          {/* Email - Thường email sẽ không cho sửa, nhưng API có nên vẫn làm */}
          <div>
            <label className='text-sm font-medium text-gray-700'>Email</label>
            <input
              type='email'
              {...register('email', {
                required: 'Email là bắt buộc',
                pattern: { value: /^[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,}$/i, message: 'Email không hợp lệ' }
              })}
              className='w-full mt-1 px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500'
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
            />
            {errors.phoneNumber && <p className='text-red-500 text-sm mt-1'>{errors.phoneNumber.message}</p>}
          </div>

          {/* Role Name - Có thể cải tiến thành dropdown */}
          <div>
            <label className='text-sm font-medium text-gray-700'>Vai trò (Role)</label>
            <select
              {...register('roleName', { required: 'Vai trò là bắt buộc' })}
              className='w-full mt-1 px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500'
            >
              <option value=''>-- Chọn vai trò --</option>
              <option value='ADMIN'>ADMIN</option>
              <option value='USER'>USER</option>
            </select>
            {errors.roleName && <p className='text-red-500 text-sm mt-1'>{errors.roleName.message}</p>}
          </div>

          <p className='text-sm text-gray-500 pt-2'>Để trống phần mật khẩu nếu bạn không muốn thay đổi.</p>
          <div className='grid grid-cols-1 md:grid-cols-2 gap-4'>
            {/* New Password */}
            <div>
              <label className='text-sm font-medium text-gray-700'>Mật khẩu mới</label>
              <input
                type='password'
                {...register('password', {
                  minLength: { value: 6, message: 'Mật khẩu phải có ít nhất 6 ký tự' }
                })}
                className='w-full mt-1 px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500'
              />
              {errors.password && <p className='text-red-500 text-sm mt-1'>{errors.password.message}</p>}
            </div>

            {/* Confirm New Password */}
            <div>
              <label className='text-sm font-medium text-gray-700'>Xác nhận mật khẩu mới</label>
              <input
                type='password'
                {...register('confirmPassword', {
                  validate: (value) => value === newPassword || 'Mật khẩu không khớp'
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
              {isPending ? 'Đang cập nhật...' : 'Cập nhật'}
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}
