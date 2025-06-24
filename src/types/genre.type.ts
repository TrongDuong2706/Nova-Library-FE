import type { SuccessResponse } from './response'

//Get All phân trang
export type GenreResponse = SuccessResponse<{
  totalItems: number
  totalPages: number
  currentPage: number
  pageSize: number
  hasNextPage: boolean
  hasPreviousPage: boolean
  elements: Genre[]
}>

export interface Genre {
  id: string
  name: string
  description: string
}

//Get One

export type GenreSingleResponse = {
  id: string
  description: string
  name: string
}

export type GenreOneResponse = SuccessResponse<GenreSingleResponse>
