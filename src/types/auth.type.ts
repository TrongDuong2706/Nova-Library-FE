import type { SuccessResponse } from './response'

export type LoginResponse = SuccessResponse<{
  token: string
  authenticated: boolean
}>

export type RegisterResponse = SuccessResponse<{
  token: string
  authenticated: boolean
}>

export type getMyInforResponse = SuccessResponse<{
  firstName: string
  lastName: boolean
}>
