import type { SuccessResponse } from './response'

//Get All phân trang
export type AuthorResponse = SuccessResponse<{
  totalItems: number
  totalPages: number
  currentPage: number
  pageSize: number
  hasNextPage: boolean
  hasPreviousPage: boolean
  elements: Author[]
}>

export interface Author {
  id: string
  name: string
  bio: string
}

//Get One

export type AuthorSingleResponse = {
  id: string
  bio: string
  name: string
}

export type AuthorOneResponse = SuccessResponse<AuthorSingleResponse>
