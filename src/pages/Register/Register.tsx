import { yupResolver } from '@hookform/resolvers/yup'
import { useForm } from 'react-hook-form'
import { schema, type Schema } from '../../utils/rule'
import { useMutation } from '@tanstack/react-query'
import { Link, useNavigate } from 'react-router-dom'
import { registerAccount } from '../../apis/auth.api'
import { omit } from 'lodash'

type FormData = Schema

export default function Register() {
  const navigate = useNavigate()
  const {
    register,
    handleSubmit,
    formState: { errors },
    setError
  } = useForm<FormData>({
    resolver: yupResolver(schema)
  })

  const registerAccountMutation = useMutation({
    mutationFn: (body: Omit<FormData, 'confirm_password'>) => registerAccount(body)
  })

  const onSubmit = handleSubmit((data) => {
    const body = omit(data, ['confirm_password'])

    registerAccountMutation.mutate(body, {
      onSuccess: () => {
        navigate('/login')
      },
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      onError: (error: any) => {
        if (error.response?.data) {
          const { message, field } = error.response.data

          if (field === 'username' || message.includes('Username already exists')) {
            setError('username', { type: 'manual', message })
          } else if (field === 'password' || message.includes('Password')) {
            setError('password', { type: 'manual', message })
          } else {
            // fallback: nếu không xác định được field, vẫn gán vào password như bạn yêu cầu
            setError('password', { type: 'manual', message })
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
          "url('https://images.unsplash.com/photo-1507842217343-583bb7270b66?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=MnwxMTc3M3wwfDF8c2VhcmNofDF8fGxpYnJhcnl8ZW58MHx8fHwxNjU4NDAwNTQ4&ixlib=rb-1.2.1&q=80&w=2000')"
      }}
    >
      <div className='bg-black bg-opacity-60 backdrop-blur-sm p-10 rounded-lg w-full max-w-md text-white shadow-lg'>
        <h2 className='text-2xl font-semibold text-center mb-6'>LIBRARY MEMBER SIGN UP</h2>

        <form className='space-y-4' onSubmit={onSubmit}>
          <div>
            <label className='text-sm'>Username</label>
            <input
              type='text'
              {...register('username')}
              placeholder='Enter a username'
              className='w-full mt-1 px-4 py-2 rounded bg-transparent border border-gray-400 text-sm focus:outline-none focus:border-white'
            />
            {errors.username && <p className='text-red-300 text-xs mt-1'>{errors.username.message}</p>}
          </div>

          <div className='flex gap-3'>
            <div className='flex-1'>
              <label className='text-sm'>First Name</label>
              <input
                type='text'
                {...register('firstName')}
                placeholder='First name'
                className='w-full mt-1 px-4 py-2 rounded bg-transparent border border-gray-400 text-sm focus:outline-none focus:border-white'
              />
              {errors.firstName && <p className='text-red-300 text-xs mt-1'>{errors.firstName.message}</p>}
            </div>

            <div className='flex-1'>
              <label className='text-sm'>Last Name</label>
              <input
                type='text'
                {...register('lastName')}
                placeholder='Last name'
                className='w-full mt-1 px-4 py-2 rounded bg-transparent border border-gray-400 text-sm focus:outline-none focus:border-white'
              />
              {errors.lastName && <p className='text-red-300 text-xs mt-1'>{errors.lastName.message}</p>}
            </div>
          </div>

          <div>
            <label className='text-sm'>Email</label>
            <input
              type='email'
              {...register('email')}
              placeholder='Enter your email'
              className='w-full mt-1 px-4 py-2 rounded bg-transparent border border-gray-400 text-sm focus:outline-none focus:border-white'
            />
            {errors.email && <p className='text-red-300 text-xs mt-1'>{errors.email.message}</p>}
          </div>

          <div>
            <label className='text-sm'>Phone Number</label>
            <input
              type='text'
              {...register('phoneNumber')}
              placeholder='Enter your phone number'
              className='w-full mt-1 px-4 py-2 rounded bg-transparent border border-gray-400 text-sm focus:outline-none focus:border-white'
            />
            {errors.phoneNumber && <p className='text-red-300 text-xs mt-1'>{errors.phoneNumber.message}</p>}
          </div>

          <div>
            <label className='text-sm'>Password</label>
            <input
              type='password'
              {...register('password')}
              placeholder='Enter a password'
              className='w-full mt-1 px-4 py-2 rounded bg-transparent border border-gray-400 text-sm focus:outline-none focus:border-white'
            />
            {errors.password && <p className='text-red-300 text-xs mt-1'>{errors.password.message}</p>}
          </div>

          <div>
            <label className='text-sm'>Confirm Password</label>
            <input
              type='password'
              {...register('confirm_password')}
              placeholder='Re-enter password'
              className='w-full mt-1 px-4 py-2 rounded bg-transparent border border-gray-400 text-sm focus:outline-none focus:border-white'
            />
            {errors.confirm_password && <p className='text-red-300 text-xs mt-1'>{errors.confirm_password.message}</p>}
          </div>

          <button className='w-full bg-purple-600 hover:bg-purple-700 transition px-4 py-2 rounded text-sm font-semibold mt-2'>
            Sign Up
          </button>
        </form>

        <Link to='/login'>
          <footer className='text-center text-xs text-gray-400 mt-6'>Already have an account? </footer>
        </Link>
      </div>
    </div>
  )
}
