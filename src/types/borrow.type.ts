import type { SuccessResponse } from './response'

export type BorrowsResponse = SuccessResponse<{
  totalItems: number
  totalPages: number
  currentPage: number
  pageSize: number
  hasNextPage: boolean
  hasPreviousPage: boolean
  elements: Borrow[]
}>

export interface Borrow {
  id: string
  borrowDate: string
  dueDate: string
  returnDate: string
  finalAmount: number
  status: string
  userResponse: User
  books: Book[]
}

export interface User {
  id: string
  username: string
  firstName: string
  lastName: string
  studentCode: string
}

export interface Book {
  id: string
  title: string
  description: string
  createdAt: string
  images: Image[]
  author: Author
  genre: Genre
}

export interface Image {
  imageUrl: string
}

export interface Author {
  id: string
  name: string
  bio: string
}

export interface Genre {
  id: string
  name: string
  description: string
}

//Get One

export type BorrowSingleResponse = {
  id: string
  borrowDate: string
  dueDate: string
  returnDate: string
  finalAmount: number
  status: string
  userResponse: User
  books: Book[]
}

export type BorrowOneResponse = SuccessResponse<BorrowSingleResponse>
