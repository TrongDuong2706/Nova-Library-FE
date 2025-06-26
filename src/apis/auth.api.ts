import type { getMyInforResponse, LoginResponse, RegisterResponse } from '../types/auth.type'
import http from '../utils/http'

export const loginAccount = (body: { username: string; password: string }) => http.post<LoginResponse>('/auth', body)

export const registerAccount = (body: {
  username: string
  firstName: string
  password: string
  lastName: string
  email: string
  phoneNumber: string
}) => http.post<RegisterResponse>('/users', body)

export const getMyInfor = () => http.get<getMyInforResponse>('/users/getMyInfor')

export const logout = (body: { token: string }) => http.post('/auth/logout', body)
