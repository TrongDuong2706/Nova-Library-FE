import type { UserResponse } from '../types/user.typte'
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
