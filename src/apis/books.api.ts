import type { BookOneResponse, BookResponse, BookSingleResponse } from '../types/book.type'
import http from '../utils/http'

export const getBooks = (page: number, size: number) => http.get<BookResponse>('/books', { params: { page, size } })

export const createBook = (body: FormData) =>
  http.post<BookSingleResponse>('/books', body, {
    headers: {
      'Content-Type': 'multipart/form-data'
    }
  })

export const updateBook = (bookId: string, body: FormData) =>
  http.put<BookSingleResponse>(`/books/${bookId}`, body, {
    headers: {
      'Content-Type': 'multipart/form-data'
    }
  })

export const getOneBook = (bookId: string) => http.get<BookOneResponse>(`/books/${bookId}`)

//Get books with filter

export const getBooksWithFilter = (
  authorName: string | null = null,
  genreName: string | null = null,
  title: string | null = null,
  description: string | null = null,
  page: number,
  size: number
) =>
  http.get<BookResponse>('/books/filter', {
    params: { authorName, genreName, title, description, page, size }
  })

export const getBooksWithAdminFilter = (
  authorName: string | null = null,
  genreName: string | null = null,
  title: string | null = null,
  status: number | null = null,
  page: number,
  size: number
) =>
  http.get<BookResponse>('/books/filterAdmin', {
    params: { authorName, genreName, title, status, page, size }
  })

export const softDeleteBook = (bookId: string) => http.delete(`/books/${bookId}`)
export const countBook = () => http.get('/books/countBook')

export const getAllBookZeroStock = (page: number, size: number) =>
  http.get<BookResponse>('/books/getAllBookZeroStock', { params: { page, size } })

export const getAllBookWithGenre = (genreName: string, page: number, size: number) =>
  http.get<BookResponse>('/books/getBookWithGenre', { params: { genreName, page, size } })
