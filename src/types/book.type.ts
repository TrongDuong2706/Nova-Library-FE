import type { SuccessResponse } from './response'

export type BookResponse = SuccessResponse<{
  totalItems: number
  totalPages: number
  currentPage: number
  pageSize: number
  hasNextPage: boolean
  hasPreviousPage: boolean
  elements: Book[]
}>

export type FavoriteResponse = SuccessResponse<{
  totalItems: number
  totalPages: number
  currentPage: number
  pageSize: number
  hasNextPage: boolean
  hasPreviousPage: boolean
  elements: Favorite[]
}>

export interface Book {
  id: string
  title: string
  description: string
  createdAt: string
  images: Image[]
  author: Author
  genre: Genre
  status: number
  stock: number
}
//for favorite
export interface Favorite {
  id: string
  title: string
  description: string
  author: Author
  genre: Genre
  bookId: string
  images: Image[]
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

export type BookSingleResponse = {
  id: string
  title: string
  description: string
  author: Author
  genre: Genre
  createAt: Date
  stock: number
  status: number
  images: Image[]
}

export type SimpleBookSingleResponse = {
  id: string
  title: string
  description: string
  bookId: string
  author: Author
  genre: Genre
  images: Image[]
}

export type BookOneResponse = SuccessResponse<BookSingleResponse>
export type FavoriteSingleResponse = SuccessResponse<SimpleBookSingleResponse>
