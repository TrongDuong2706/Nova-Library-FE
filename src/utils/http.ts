import axios, { AxiosError, HttpStatusCode, type AxiosInstance } from 'axios'
import type { LoginResponse } from '../types/auth.type'
import { clearAccessTokenFromLS, getAccessTokenFromLS, saveAccessTokenToLS } from './auth'

class Http {
  instance: AxiosInstance
  private accessToken: string

  constructor() {
    this.accessToken = getAccessTokenFromLS()
    this.instance = axios.create({
      baseURL: 'http://localhost:9192/api/',
      timeout: 10000,
      headers: {
        'Content-Type': 'application/json'
      }
    })
    this.instance.interceptors.request.use(
      (config) => {
        if (this.accessToken && config.headers) {
          config.headers.Authorization = this.accessToken
        }
        return config
      },
      (error) => {
        return Promise.reject(error)
      }
    )
    this.instance.interceptors.response.use(
      (response) => {
        const { url } = response.config
        if (url === '/auth') {
          const token = (response.data as LoginResponse).result.token
          if (token) {
            this.setAccessToken('Bearer ' + token)
          } else {
            console.error('Token không tồn tại trong response')
          }
        } else if (url === '/auth/logout') {
          this.accessToken = ''
          clearAccessTokenFromLS()
        }

        return response
      },
      (error: AxiosError) => {
        if (error.response?.status !== HttpStatusCode.UnprocessableEntity) {
          // const data: any | undefined = error.response?.data;
          // const message = data?.message || error.message;
          //toast.error(message)
        }
        return Promise.reject(error)
      }
    )
  }

  // Phương thức để cập nhật token
  setAccessToken(token: string) {
    this.accessToken = token
    saveAccessTokenToLS(token)
  }
}

const http = new Http().instance

export default http

// Xuất đối tượng Http để có thể sử dụng phương thức setAccessToken
export const httpClient = new Http()
