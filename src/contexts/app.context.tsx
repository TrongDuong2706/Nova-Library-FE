import { createContext, useState } from 'react'
import { getAccessTokenFromLS } from '../utils/auth'

interface AppContextInterface {
  isAuthenticated: boolean
  setIsAuthenticated: React.Dispatch<React.SetStateAction<boolean>>
  refetchCartCount?: () => void // ✅ thêm hàm refetch
  setRefetchCartCount?: React.Dispatch<React.SetStateAction<() => void>> // ✅ setter
}

const initialAppContext: AppContextInterface = {
  isAuthenticated: Boolean(getAccessTokenFromLS()),
  setIsAuthenticated: () => null,
  refetchCartCount: () => {}, // ✅ default là hàm trống
  setRefetchCartCount: () => {} // ✅ default
}

export const AppContext = createContext<AppContextInterface>(initialAppContext)

export const AppProvider = ({ children }: { children: React.ReactNode }) => {
  const [isAuthenticated, setIsAuthenticated] = useState<boolean>(initialAppContext.isAuthenticated)
  const [refetchCartCount, setRefetchCartCount] = useState<() => void>(() => {}) // ✅ thêm state

  return (
    <AppContext.Provider
      value={{
        isAuthenticated,
        setIsAuthenticated,
        refetchCartCount,
        setRefetchCartCount
      }}
    >
      {' '}
      {children}
    </AppContext.Provider>
  )
}
