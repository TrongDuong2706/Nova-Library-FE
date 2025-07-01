import type { AuthorOneResponse, AuthorResponse } from '../types/author.type'
import http from '../utils/http'

export const getAuthors = (page: number, size: number) =>
  http.get<AuthorResponse>('/author', { params: { page, size } })

export const getAuthorsByName = (keyword: string, page: number, size: number) =>
  http.get<AuthorResponse>('/author/findByName', { params: { keyword, page, size } })

export const createAuthor = (name: string, bio: string) =>
  http.post<AuthorOneResponse>('/author', {
    name,
    bio
  })

export const getOneAuthor = (authorId: string) => http.get<AuthorOneResponse>(`/author/${authorId}`)

export const updateAuthor = (authorId: string, name: string, bio: string) =>
  http.put<AuthorOneResponse>(`/author/${authorId}`, {
    name,
    bio
  })

export const deleteAuthor = (authorId: string) => http.delete<AuthorOneResponse>(`/author/${authorId}`)
