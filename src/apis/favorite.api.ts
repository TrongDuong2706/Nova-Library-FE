import type { FavoriteResponse, FavoriteSingleResponse } from '../types/book.type'
import http from '../utils/http'

export const getMyFavorite = (page: number, size: number) =>
  http.get<FavoriteResponse>('/favorite', { params: { page, size } })
export const addFavorite = (bookId: string) => http.post<FavoriteSingleResponse>(`/favorite/${bookId}`)

export const deleteFavorite = (bookId: string) => http.delete(`/favorite/${bookId}`)
