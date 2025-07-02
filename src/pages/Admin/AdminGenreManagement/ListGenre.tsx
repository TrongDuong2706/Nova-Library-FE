import { useState } from 'react'
import { Pencil, Trash2, Plus } from 'lucide-react'
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import Pagination from '../../../components/Pagination/Pagination'
import type { Genre } from '../../../types/genre.type'
import AddGenrePopup from '../../../components/AdminComponents/AddGenrePopup'
import { deleteGenre, getGenres } from '../../../apis/genre.api'
import EditGenrePopup from '../../../components/AdminComponents/EditGenrePopup'
import Swal from 'sweetalert2'

export default function ListGenre() {
  const queryClient = useQueryClient()

  const [page, setPage] = useState(1)
  const size = 5 // số item / trang, bạn có thể đổi tùy ý
  const [isModalOpen, setIsModalOpen] = useState(false)

  const [selectedGenreId, setSelectedGenreId] = useState<string | null>(null)
  const [isEditModalOpen, setIsEditModalOpen] = useState(false)

  const { data, isLoading, isError } = useQuery({
    queryKey: ['genres', page],
    queryFn: () => getGenres(page, size)
  })

  const genres: Genre[] = data?.data.result.elements || []

  //Call API Delete Genre
  const { mutate: deleteGenreById } = useMutation({
    mutationFn: (id: string) => deleteGenre(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['genres'] })
      Swal.fire({
        toast: true,
        position: 'bottom-end',
        icon: 'success',
        title: 'Xóa Thể loại thành công!',
        showConfirmButton: false,
        timer: 3000,
        timerProgressBar: true
      })
    },
    onError: () => {
      Swal.fire('❌ Xóa thất bại', 'Đã xảy ra lỗi khi xóa loại giỏ hàng.', 'error')
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
        deleteGenreById(id)
      }
    })
  }

  return (
    <div className='bg-white rounded-2xl shadow-md p-6'>
      <div className='flex items-center justify-between mb-6'>
        <h1 className='text-2xl font-semibold text-gray-800'>📚 Danh sách thể loại</h1>

        <button
          onClick={() => setIsModalOpen(true)}
          className='flex items-center gap-2 px-4 py-2 bg-purple-500 text-white rounded-xl hover:bg-purple-600 transition shadow-sm'
        >
          <Plus size={18} />
          <span className='text-sm font-medium'>Thêm thể loại</span>
        </button>
      </div>

      <div className='overflow-x-auto'>
        <table className='min-w-full table-fixed text-sm border-separate border-spacing-y-2'>
          <thead>
            <tr className='text-left text-gray-600'>
              <th className='px-4 py-2'>ID</th>
              <th className='px-4 py-2'>Tên thể loại</th>
              <th className='px-4 py-2'>Mô tả</th>
              <th className='px-4 py-2 text-center'>Hành động</th>
            </tr>
          </thead>
          <tbody>
            {isLoading ? (
              <tr>
                <td colSpan={3} className='text-center py-4 text-gray-500'>
                  Đang tải dữ liệu...
                </td>
              </tr>
            ) : isError ? (
              <tr>
                <td colSpan={3} className='text-center py-4 text-red-500'>
                  Lỗi khi tải dữ liệu.
                </td>
              </tr>
            ) : genres.length === 0 ? (
              <tr>
                <td colSpan={3} className='text-center py-4 text-gray-400 italic'>
                  Không có thể loại nào.
                </td>
              </tr>
            ) : (
              genres.map((genre) => (
                <tr key={genre.id} className='bg-gray-50 hover:bg-gray-100 rounded-xl shadow-sm transition'>
                  <td className='px-4 py-3 rounded-l-xl'>{genre.id}</td>
                  <td className='px-4 py-3'>{genre.name}</td>
                  <td className='px-4 py-3'>{genre.description} </td>
                  <td className='px-4 py-3 text-center rounded-r-xl'>
                    <div className='flex justify-center gap-3'>
                      <button
                        onClick={() => {
                          setSelectedGenreId(genre.id)
                          setIsEditModalOpen(true)
                        }}
                        className='text-blue-500 hover:text-blue-700 transition'
                        title='Chỉnh sửa'
                      >
                        <Pencil size={18} />
                      </button>
                      <button
                        onClick={() => handleDelete(genre.id)}
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
      <AddGenrePopup isOpen={isModalOpen} onClose={() => setIsModalOpen(false)} />
      <EditGenrePopup
        isOpen={isEditModalOpen}
        genreId={selectedGenreId}
        onClose={() => {
          setIsEditModalOpen(false)
          setSelectedGenreId(null)
        }}
      />
    </div>
  )
}
