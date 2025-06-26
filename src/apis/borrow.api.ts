import type { BookSingleResponse } from '../types/book.type'
import type { BorrowOneResponse, BorrowsResponse } from '../types/borrow.type'
import http from '../utils/http'

export const getBorrows = (page: number, size: number) =>
  http.get<BorrowsResponse>('/borrowings', { params: { page, size } })

export const getOneBorrow = (borrowId: string) => http.get<BorrowOneResponse>(`/borrowings/${borrowId}`)

export const returnBook = (borrowId: string) => http.put<BorrowOneResponse>(`/borrowings/${borrowId}`)

export const getMyBorrows = (page: number, size: number) =>
  http.get<BorrowsResponse>('/borrowings/getMyBorrow', { params: { page, size } })

export const createBorrow = (body: { studentCode: string; dueDate: string; bookIds: string[] }) =>
  http.post<BookSingleResponse>('/borrowings', body)
export const countBorrowed = () => http.get('/borrowings/countBorrow')

export const countOverdue = () => http.get('/borrowings/countOverdue')

export const getBorrowWithFilter = (
  id: string | null = null,
  name: string | null = null,
  borrowDate: string | null = null,
  page: number,
  size: number
) =>
  http.get<BorrowsResponse>('/borrowings/filter', {
    params: { id, name, borrowDate, page, size }
  })
export const bookRenewal = (borrowId: string, body: { newDueDate: string }) =>
  http.put(`/borrowings/extends/${borrowId}`, body)

export const getAllOverdueBorrow = (page: number, size: number) =>
  http.get<BorrowsResponse>('/borrowings/getOverDueStatus', { params: { page, size } })

export const getAllBorrowByUserId = (userId: string, page: number, size: number) =>
  http.get<BorrowsResponse>(`/borrowings/getAllBorrowWithUser/${userId}`, { params: { page, size } })
