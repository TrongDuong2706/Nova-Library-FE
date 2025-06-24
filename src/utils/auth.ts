export const saveAccessTokenToLS = (access_token: string) => {
  localStorage.setItem('access_token', access_token)
}

export const clearAccessTokenFromLS = () => {
  localStorage.removeItem('access_token')
}

export const getAccessTokenFromLS = (): string => {
  return localStorage.getItem('access_token') || ''
}

export const KEY_TOKEN = 'accessToken'

export const setToken = (token: string) => {
  localStorage.setItem(KEY_TOKEN, token)
}

export const getToken = () => {
  return localStorage.getItem(KEY_TOKEN)
}

export const removeToken = () => {
  return localStorage.removeItem(KEY_TOKEN)
}

//Lấy userId
export const setUserId = (userId: string) => {
  localStorage.setItem('userId', userId)
}

export const getUserId = (): string => {
  return localStorage.getItem('userId') || ''
}
export const removeUserId = () => {
  return localStorage.removeItem('userId')
}
