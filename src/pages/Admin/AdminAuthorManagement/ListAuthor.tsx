import { useState } from 'react'
import { Pencil, Trash2, Plus } from 'lucide-react'
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import Pagination from '../../../components/Pagination/Pagination'
import type { Author } from '../../../types/author.type'
import { deleteAuthor, getAuthors } from '../../../apis/author.api'
import AddAuthorPopup from '../../../components/AdminComponents/AddAuthorPopup'
import EditAuthorPopup from '../../../components/AdminComponents/EditAuthorPopup'
import Swal from 'sweetalert2'

export default function ListAuthor() {
  const queryClient = useQueryClient()

  const [page, setPage] = useState(1)
  const size = 5
  const [isModalOpen, setIsModalOpen] = useState(false)
  const [selectedAuthorId, setSelectedAuthorId] = useState<string | null>(null)
  const [isEditModalOpen, setIsEditModalOpen] = useState(false)

  const { data, isLoading, isError } = useQuery({
    queryKey: ['authors', page],
    queryFn: () => getAuthors(page, size)
  })

  const authors: Author[] = data?.data.result.elements || []

  //Call API Delete Author
  const { mutate: deleteAuthorById } = useMutation({
    mutationFn: (id: string) => deleteAuthor(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['authors'] })
      Swal.fire({
        toast: true,
        position: 'top-end',
        icon: 'success',
        title: 'Xóa Tác Giả thành công!',
        showConfirmButton: false,
        timer: 3000,
        timerProgressBar: true
      })
    },
    onError: () => {
      Swal.fire('❌ Xóa thất bại', 'Đã xảy ra lỗi khi xóa tác giả.', 'error')
    }
  })

  // Hàm handleDelete với SweetAlert
  const handleDelete = (id: string) => {
    Swal.fire({
      title: 'Bạn có chắc chắn?',
      text: 'Bạn sẽ không thể khôi phục sau khi xóa!',
      icon: 'warning',
      showCancelButton: true,
      confirmButtonColor: '#3085d6',
      cancelButtonColor: '#d33',
      confirmButtonText: 'Xóa!',
      cancelButtonText: 'Hủy'
    }).then((result) => {
      if (result.isConfirmed) {
        deleteAuthorById(id)
      }
    })
  }

  return (
    <div className='bg-white rounded-2xl shadow-md p-6'>
      <div className='flex items-center justify-between mb-6'>
        <h1 className='text-2xl font-semibold text-gray-800'>✍️ Danh sách tác giả</h1>

        <button
          onClick={() => setIsModalOpen(true)}
          className='flex items-center gap-2 px-4 py-2 bg-purple-500 text-white rounded-xl hover:bg-purple-600 transition shadow-sm'
        >
          <Plus size={18} />
          <span className='text-sm font-medium'>Thêm tác giả</span>
        </button>
      </div>

      <div className='overflow-x-auto'>
        <table className='min-w-full table-fixed text-sm border-separate border-spacing-y-2'>
          <thead>
            <tr className='text-left text-gray-600'>
              <th className='px-4 py-2'>ID</th>
              <th className='px-4 py-2'>Tên tác giả</th>
              <th className='px-4 py-2'>Tiểu sử</th>
              <th className='px-4 py-2 text-center'>Hành động</th>
            </tr>
          </thead>
          <tbody>
            {isLoading ? (
              <tr>
                <td colSpan={4} className='text-center py-4 text-gray-500'>
                  Đang tải dữ liệu...
                </td>
              </tr>
            ) : isError ? (
              <tr>
                <td colSpan={4} className='text-center py-4 text-red-500'>
                  Lỗi khi tải dữ liệu.
                </td>
              </tr>
            ) : authors.length === 0 ? (
              <tr>
                <td colSpan={4} className='text-center py-4 text-gray-400 italic'>
                  Không có tác giả nào.
                </td>
              </tr>
            ) : (
              authors.map((author) => (
                <tr key={author.id} className='bg-gray-50 hover:bg-gray-100 rounded-xl shadow-sm transition'>
                  <td className='px-4 py-3 rounded-l-xl'>{author.id}</td>
                  <td className='px-4 py-3'>{author.name}</td>
                  <td className='px-4 py-3'>{author.bio}</td>
                  <td className='px-4 py-3 text-center rounded-r-xl'>
                    <div className='flex justify-center gap-3'>
                      <button
                        onClick={() => {
                          setSelectedAuthorId(author.id)
                          setIsEditModalOpen(true)
                        }}
                        className='text-blue-500 hover:text-blue-700 transition'
                        title='Chỉnh sửa'
                      >
                        <Pencil size={18} />
                      </button>
                      <button
                        onClick={() => handleDelete(author.id)}
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

        <Pagination
          currentPage={data?.data.result.currentPage ?? 0}
          totalPages={data?.data.result.totalPages ?? 1}
          hasNextPage={data?.data.result.hasNextPage ?? false}
          hasPreviousPage={data?.data.result.hasPreviousPage ?? false}
          onPageChange={(page) => setPage(page + 1)}
        />
      </div>

      <AddAuthorPopup isOpen={isModalOpen} onClose={() => setIsModalOpen(false)} />
      <EditAuthorPopup
        isOpen={isEditModalOpen}
        authorId={selectedAuthorId}
        onClose={() => {
          setIsEditModalOpen(false)
          setSelectedAuthorId(null)
        }}
      />
    </div>
  )
}
