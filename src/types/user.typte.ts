import type { SuccessResponse } from './response'

export type UserResponse = SuccessResponse<{
  totalItems: number
  totalPages: number
  currentPage: number
  pageSize: number
  hasNextPage: boolean
  hasPreviousPage: boolean
  elements: User[]
}>

export interface User {
  id: string
  username: string
  firstName: string
  lastName: string
  studentCode: string
  email: string
  phoneNumber: string
  status: string
}
