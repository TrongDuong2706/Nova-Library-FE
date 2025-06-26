import type { UserOneResponse, UserResponse } from '../types/user.typte'
import http from '../utils/http'

export const getUserWithFilter = (
  name: string | null = null,
  studentCode: string | null = null,
  phoneNumber: string | null = null,
  page: number,
  size: number
) =>
  http.get<UserResponse>('/users/filter', {
    params: { name, studentCode, phoneNumber, page, size }
  })

export const updateUser = (
  userId: string,
  body: {
    firstName: string
    password: string
    lastName: string
    email: string
    phoneNumber: string
    roleName: string
  }
) => http.put<UserOneResponse>(`/users/${userId}`, body)

export const getOneUser = (userId: string) => http.get<UserOneResponse>(`/users/${userId}`)
export const deleteOneUser = (userId: string) => http.put<UserOneResponse>(`/users/softDelete/${userId}`)
