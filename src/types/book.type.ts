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
  authors: Author[]
  genres: Genre[]
  isbn: string
  publicationDate: string
  status: number
  stock: number
}
//for favorite
export interface Favorite {
  id: string
  title: string
  description: string
  authors: Author[]
  genres: Genre[]
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
  authors: Author[]
  genres: Genre[]
  createAt: Date
  stock: number
  status: number
  isbn: string
  publicationDate: string
  images: Image[]
}

export type SimpleBookSingleResponse = {
  id: string
  title: string
  description: string
  bookId: string
  authors: Author[]
  genres: Genre[]
  images: Image[]
}

export type BookOneResponse = SuccessResponse<BookSingleResponse>
export type FavoriteSingleResponse = SuccessResponse<SimpleBookSingleResponse>
