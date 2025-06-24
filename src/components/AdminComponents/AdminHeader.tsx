import { useContext } from 'react'
import Swal from 'sweetalert2'
import { getAccessTokenFromLS } from '../../utils/auth'
import { Link, useNavigate } from 'react-router-dom'
import { useMutation } from '@tanstack/react-query'
import { logout } from '../../apis/auth.api'
import { AppContext } from '../../contexts/app.context'

export default function AdminHeader() {
  const { setIsAuthenticated } = useContext(AppContext)
  const navigate = useNavigate()
  const { mutate: logoutMutate } = useMutation({
    mutationFn: (token: string) => logout({ token }),
    onSuccess: () => {
      navigate('/login', { replace: true })
      setIsAuthenticated(false)

      Swal.fire({
        toast: true,
        position: 'top-end',
        icon: 'success',
        title: 'Đăng xuất thành công!',
        showConfirmButton: false,
        timer: 3000,
        timerProgressBar: true
      })
    },
    onError: () => {
      Swal.fire({
        icon: 'error',
        title: 'Lỗi khi đăng xuất',
        text: 'Vui lòng thử lại.',
        confirmButtonText: 'Đóng'
      })
    }
  })

  const handleLogout = () => {
    const rawToken = getAccessTokenFromLS()
    const token = rawToken.startsWith('Bearer ') ? rawToken.slice(7) : rawToken
    logoutMutate(token)
  }

  return (
    <header className='bg-white px-6 py-4 shadow-sm flex justify-between items-center'>
      <Link to='/admin'>
        <h2 className='text-lg font-semibold text-purple-800'>Dashboard</h2>
      </Link>{' '}
      <button
        onClick={handleLogout}
        className='bg-purple-600 text-white text-xs font-semibold px-4 py-2 rounded-full hover:bg-purple-700 transition-colors'
      >
        Đăng xuất
      </button>
    </header>
  )
}
