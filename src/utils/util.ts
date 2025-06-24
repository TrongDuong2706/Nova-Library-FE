import { jwtDecode } from 'jwt-decode'

interface DecodedToken {
  scope?: string
  role?: string[]
}

export function isAdmin() {
  const token = localStorage.getItem('access_token')
  if (!token) return false

  try {
    const decoded: DecodedToken = jwtDecode(token)
    return decoded.role?.includes('ROLE_ADMIN')
  } catch (error) {
    console.log(error)
    return false
  }
}
