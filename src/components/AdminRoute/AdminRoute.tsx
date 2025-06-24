import { Navigate, Outlet } from 'react-router-dom'
import { isAdmin } from '../../utils/util'

const AdminRoute = () => {
  return isAdmin() ? <Outlet /> : <Navigate to='/admin' replace />
}

export default AdminRoute
