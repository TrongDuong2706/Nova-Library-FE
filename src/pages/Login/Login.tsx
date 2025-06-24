import { useContext } from 'react'
import { useForm } from 'react-hook-form'
import { useMutation } from '@tanstack/react-query'
import { loginAccount } from '../../apis/auth.api'
import { Link, useNavigate } from 'react-router-dom'
import { yupResolver } from '@hookform/resolvers/yup'
import { schemaLogin, type LoginSchema } from '../../utils/rule'
import { AppContext } from '../../contexts/app.context'
import { isAdmin } from '../../utils/util'
type FormData = LoginSchema

export default function Login() {
  const { setIsAuthenticated } = useContext(AppContext)
  const navigate = useNavigate()

  const {
    register,
    handleSubmit,
    formState: { errors },
    setError
  } = useForm<FormData>({
    resolver: yupResolver(schemaLogin)
  })

  //CALL API LOGIN
  const loginMutation = useMutation({
    mutationFn: (body: FormData) => loginAccount(body)
  })

  const onSubmit = handleSubmit((data) => {
    loginMutation.mutate(data, {
      onSuccess: (data) => {
        if (isAdmin()) {
          navigate('/admin', { replace: true }) // Chuyển hướng admin
        } else {
          navigate('/', { replace: true }) // Chuyển hướng user thường
        } // Chuyển hướng user thường

        setIsAuthenticated(true)
        console.log(data)
      },
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      onError: (error: any) => {
        if (error.response?.data) {
          const { message } = error.response.data

          if (message.includes('Không tìm thấy username')) {
            setError('username', { type: 'manual', message: 'Tài khoản không tồn tại' })
          } else if (message.includes('Sai mật khẩu, vui lòng thử lại')) {
            setError('password', { type: 'manual', message: 'Sai mật khẩu, vui lòng thử lại' })
          } else {
            // fallback lỗi chung nếu có
            console.error('Unhandled login error:', message)
          }
        }
      }
    })
  })

  return (
    <div
      className='min-h-screen bg-cover bg-center flex items-center justify-center'
      style={{
        backgroundImage:
          "url('https://images.unsplash.com/photo-1507842217343-583bb7270b66?auto=format&fit=crop&w=2000&q=80')"
      }}
    >
      <div className='bg-black bg-opacity-60 backdrop-blur-sm p-10 rounded-lg w-full max-w-md text-white shadow-lg'>
        <h2 className='text-2xl font-semibold text-center mb-6'>NOVA ENGINE LIBRARY</h2>

        <form className='space-y-4' onSubmit={onSubmit}>
          <div>
            <label className='text-sm'>Username</label>
            <input
              type='text'
              {...register('username', { required: 'Username is required' })}
              className='w-full mt-1 px-4 py-2 rounded bg-transparent border border-gray-400 focus:outline-none focus:border-white text-sm'
              placeholder='Enter your username'
            />
            {errors.username && <p className='text-red-300 text-xs mt-1'>{errors.username.message}</p>}
          </div>

          <div>
            <label className='text-sm'>Password</label>
            <input
              type='password'
              {...register('password', { required: 'Password is required' })}
              className='w-full mt-1 px-4 py-2 rounded bg-transparent border border-gray-400 focus:outline-none focus:border-white text-sm'
              placeholder='Enter your password'
            />
            {errors.password && <p className='text-red-300 text-xs mt-1'>{errors.password.message}</p>}
          </div>

          <div className='flex items-center justify-between text-sm'>
            <label className='inline-flex items-center'>
              <input type='checkbox' className='form-checkbox mr-2' />
              Remember me
            </label>
            <a href='#' className='text-purple-300 hover:underline'>
              Forgot Password?
            </a>
          </div>

          <button
            type='submit'
            className='w-full bg-purple-600 hover:bg-purple-700 transition px-4 py-2 rounded text-sm font-semibold'
          >
            Login
          </button>
        </form>

        <Link to='/register'>
          <footer className='text-center text-xs text-gray-400 mt-6'>Register an account now</footer>
        </Link>
      </div>
    </div>
  )
}
