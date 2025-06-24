import type { GenreOneResponse, GenreResponse } from '../types/genre.type'
import http from '../utils/http'

export const getGenres = (page: number, size: number) => http.get<GenreResponse>('/genres', { params: { page, size } })

export const createGenre = (name: string, description: string) =>
  http.post<GenreOneResponse>('/genres', {
    name,
    description
  })

export const getOneGenre = (genreId: string) => http.get<GenreOneResponse>(`/genres/${genreId}`)

export const updateGenre = (genreId: string, name: string, description: string) =>
  http.put<GenreOneResponse>(`/genres/${genreId}`, {
    name,
    description
  })

export const deleteGenre = (genreId: string) => http.delete<GenreOneResponse>(`/genres/${genreId}`)
