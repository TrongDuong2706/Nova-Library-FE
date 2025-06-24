import { useState } from 'react'
import { Pencil, Trash2, Plus, Search } from 'lucide-react'
import { useQuery } from '@tanstack/react-query'
import { useForm } from 'react-hook-form'

import Pagination from '../../../components/Pagination/Pagination'
import { getUserWithFilter } from '../../../apis/user.api' // Giả sử bạn đã import deleteUser
import type { User } from '../../../types/user.typte'

// import AddUserPopup from '../../../components/AdminComponents/AddUserPopup' // Placeholder
// import EditUserPopup from '../../../components/AdminComponents/EditUserPopup' // Placeholder

// Định nghĩa kiểu dữ liệu cho form lọc
type FilterFormData = {
  name: string
  studentCode: string
  phoneNumber: string
}

export default function ListUser() {
  //   const queryClient = useQueryClient()

  // --- State & Form Hook ---

  const [page, setPage] = useState(1)
  const size = 5 // số item / trang

  const { register, handleSubmit, reset } = useForm<FilterFormData>()

  // State thực tế dùng để trigger query, các giá trị này sẽ được cập nhật từ form khi submit
  const [nameFilter, setNameFilter] = useState('')
  const [studentCodeFilter, setStudentCodeFilter] = useState('')
  const [phoneNumberFilter, setPhoneNumberFilter] = useState('')

  // State cho việc mở modal (giữ nguyên cấu trúc)
  // const [isAddModalOpen, setIsAddModalOpen] = useState(false)
  // const [isEditModalOpen, setIsEditModalOpen] = useState(false)
  // const [selectedUserId, setSelectedUserId] = useState<string | null>(null)

  // --- React Query ---

  // Call API Get User với các bộ lọc
  // queryKey chỉ phụ thuộc vào các state (nameFilter,...) và page.
  // Query sẽ chỉ chạy lại khi các state này thay đổi (tức là khi submit form hoặc đổi trang).
  const { data, isLoading, isError } = useQuery({
    queryKey: ['users', { page, nameFilter, studentCodeFilter, phoneNumberFilter }],
    queryFn: () => getUserWithFilter(nameFilter, studentCodeFilter, phoneNumberFilter, page, size)
  })

  const users: User[] = data?.data.result.elements || []

  // Call API Delete User
  //   const { mutate: deleteUserById } = useMutation({
  //     mutationFn: (id: string) => deleteUser(id),
  //     onSuccess: () => {
  //       queryClient.invalidateQueries({ queryKey: ['users'] })
  //       Swal.fire({
  //         toast: true,
  //         position: 'top-end',
  //         icon: 'success',
  //         title: 'Xóa người dùng thành công!',
  //         showConfirmButton: false,
  //         timer: 3000,
  //         timerProgressBar: true
  //       })
  //     },
  //     onError: (error) => {
  //       console.error('Lỗi khi xóa người dùng:', error)
  //       Swal.fire('❌ Xóa thất bại', 'Đã xảy ra lỗi khi xóa người dùng.', 'error')
  //     }
  //   })

  // --- Handlers ---

  // Hàm handleDelete với SweetAlert
  //   const handleDelete = (id: string) => {
  //     Swal.fire({
  //       title: 'Bạn có chắc chắn?',
  //       text: 'Bạn sẽ không thể khôi phục sau khi xóa!',
  //       icon: 'warning',
  //       showCancelButton: true,
  //       confirmButtonColor: '#3085d6',
  //       cancelButtonColor: '#d33',
  //       confirmButtonText: 'Xóa!',
  //       cancelButtonText: 'Hủy'
  //     }).then((result) => {
  //       if (result.isConfirmed) {
  //         deleteUserById(id)
  //       }
  //     })
  //   }

  // Hàm được gọi khi submit form lọc
  const onSubmit = (formData: FilterFormData) => {
    setPage(1) // Quay về trang đầu khi có bộ lọc mới
    setNameFilter(formData.name || '')
    setStudentCodeFilter(formData.studentCode || '')
    setPhoneNumberFilter(formData.phoneNumber || '')
  }

  // Hàm để reset bộ lọc
  const handleClearFilters = () => {
    reset({ name: '', studentCode: '', phoneNumber: '' }) // Reset các trường input trong form
    setPage(1)
    setNameFilter('')
    setStudentCodeFilter('')
    setPhoneNumberFilter('')
  }

  // --- Render ---

  return (
    <div className='bg-white rounded-2xl shadow-md p-6'>
      <div className='flex items-center justify-between mb-4'>
        <h1 className='text-2xl font-semibold text-gray-800'>👤 Danh sách người dùng</h1>

        <button
          //   onClick={() => setIsAddModalOpen(true)}
          className='flex items-center gap-2 px-4 py-2 bg-purple-500 text-white rounded-xl hover:bg-purple-600 transition shadow-sm'
        >
          <Plus size={18} />
          <span className='text-sm font-medium'>Thêm người dùng</span>
        </button>
      </div>

      {/* --- Khu vực Filter sử dụng react-hook-form --- */}
      <form onSubmit={handleSubmit(onSubmit)} className='mb-6 p-4 bg-gray-50 rounded-lg border border-gray-200'>
        <div className='grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 items-center'>
          <input
            {...register('name')}
            type='text'
            placeholder='Tìm theo tên...'
            className='w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-400'
          />
          <input
            {...register('studentCode')}
            type='text'
            placeholder='Tìm theo MSSV...'
            className='w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-400'
          />
          <input
            {...register('phoneNumber')}
            type='text'
            placeholder='Tìm theo SĐT...'
            className='w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-400'
          />
          <div className='flex gap-2'>
            <button
              type='submit'
              className='flex-1 flex items-center justify-center gap-2 px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition shadow-sm'
            >
              <Search size={18} />
              <span>Lọc</span>
            </button>
            <button
              type='button'
              onClick={handleClearFilters}
              className='px-4 py-2 bg-gray-300 text-gray-700 rounded-lg hover:bg-gray-400 transition'
              title='Xóa bộ lọc'
            >
              🧹 Xóa lọc
            </button>
          </div>
        </div>
      </form>

      <div className='overflow-x-auto'>
        <table className='min-w-full table-auto text-sm border-separate border-spacing-y-2'>
          <thead>
            <tr className='text-left text-gray-600'>
              <th className='px-4 py-2'>Họ và tên</th>
              <th className='px-4 py-2'>Mã số sinh viên</th>
              <th className='px-4 py-2'>Số điện thoại</th>
              <th className='px-4 py-2'>Email</th>
              <th className='px-4 py-2 text-center'>Hành động</th>
            </tr>
          </thead>
          <tbody>
            {isLoading ? (
              <tr>
                <td colSpan={5} className='text-center py-4 text-gray-500'>
                  Đang tải dữ liệu...
                </td>
              </tr>
            ) : isError ? (
              <tr>
                <td colSpan={5} className='text-center py-4 text-red-500'>
                  Lỗi khi tải dữ liệu. Vui lòng thử lại.
                </td>
              </tr>
            ) : users.length === 0 ? (
              <tr>
                <td colSpan={5} className='text-center py-4 text-gray-400 italic'>
                  Không tìm thấy người dùng nào.
                </td>
              </tr>
            ) : (
              users.map((user) => (
                <tr key={user.id} className='bg-gray-50 hover:bg-gray-100 rounded-xl shadow-sm transition'>
                  <td className='px-4 py-3 font-medium rounded-l-xl'>
                    {user.firstName} {user.lastName}
                  </td>
                  <td className='px-4 py-3'>{user.studentCode}</td>
                  <td className='px-4 py-3'>{user.phoneNumber}</td>
                  <td className='px-4 py-3'>{user.email}</td>
                  <td className='px-4 py-3 text-center rounded-r-xl'>
                    <div className='flex justify-center gap-3'>
                      <button
                        // onClick={() => {
                        //   setSelectedUserId(user.id)
                        //   setIsEditModalOpen(true)
                        // }}
                        className='text-blue-500 hover:text-blue-700 transition'
                        title='Chỉnh sửa'
                      >
                        <Pencil size={18} />
                      </button>
                      <button
                        // onClick={() => handleDelete(user.id)}
                        className='text-red-500 hover:text-red-700 transition'
                        title='Xóa'
                      >
                        <Trash2 size={18} />
                      </button>
                    </div>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>

        {/* Pagination */}
        <Pagination
          currentPage={data?.data.result.currentPage ?? 0}
          totalPages={data?.data.result.totalPages ?? 1}
          hasNextPage={data?.data.result.hasNextPage ?? false}
          hasPreviousPage={data?.data.result.hasPreviousPage ?? false}
          onPageChange={(page) => setPage(page + 1)}
        />
      </div>

      {/* Placeholder for Popups - Bạn sẽ cần tạo các component này */}
      {/* <AddUserPopup isOpen={isAddModalOpen} onClose={() => setIsAddModalOpen(false)} />
      <EditUserPopup
        isOpen={isEditModalOpen}
        userId={selectedUserId}
        onClose={() => {
          setIsEditModalOpen(false)
          setSelectedUserId(null)
        }}
      /> */}
    </div>
  )
}
