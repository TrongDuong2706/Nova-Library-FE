import { useRoutes } from 'react-router-dom'
import Login from './pages/Login/Login'
import Register from './pages/Register/Register'
// import { useContext } from 'react'
// import { AppContext } from './contexts/app.context'
import Dashboard from './pages/Admin/Dashboard/Dashboard'
import AdminLayout from './layouts/AdminLayout/AdminLayout'
import ListGenre from './pages/Admin/AdminGenreManagement/ListGenre'
import ListAuthor from './pages/Admin/AdminAuthorManagement/ListAuthor'
import ListBook from './pages/Admin/AdminBookManagement/ListBook'
import ListBorrow from './pages/Admin/AdminBorrowManagement/ListBorrow'
import AdminRoute from './components/AdminRoute/AdminRoute'
import Home from './pages/Home/Home'
import BookDetail from './pages/BookDetail/BookDetail'
import MyBorrow from './pages/MyBorrow/MyBorrow'
import FavoritePage from './pages/FavouritePage/FavoritePage'
import ListUser from './pages/Admin/AdminUserManagement/ListUser'

export default function useRouteElements() {
  // function ProtectedRoute() {
  //   const { isAuthenticated } = useContext(AppContext)
  //   return isAuthenticated ? <Outlet /> : <Navigate to='/login' />
  // }

  // function RejectedRoute() {
  //   const { isAuthenticated } = useContext(AppContext)
  //   return !isAuthenticated ? <Outlet /> : <Navigate to='/' />
  // }
  const routeElements = useRoutes([
    {
      path: '',
      // element: <RejectedRoute />,
      children: [
        {
          path: '/register',
          element: <Register />
        },
        {
          path: '/login',
          element: <Login />
        }
      ]
    },
    {
      path: '/',
      index: true,
      element: <Home />
    },

    {
      path: '/book/:bookId',
      index: true,
      element: <BookDetail />
    },
    {
      path: '/favorite',
      index: true,
      element: <FavoritePage />
    },

    {
      path: '/my-borrows',
      index: true,
      element: <MyBorrow />
    },
    {
      path: '/admin',
      element: <AdminRoute />,
      children: [
        {
          path: '',
          element: (
            <AdminLayout>
              <Dashboard />
            </AdminLayout>
          )
        },
        {
          path: 'genres',
          element: (
            <AdminLayout>
              <ListGenre />
            </AdminLayout>
          )
        },
        {
          path: 'authors',
          element: (
            <AdminLayout>
              <ListAuthor />
            </AdminLayout>
          )
        },
        {
          path: 'books',
          element: (
            <AdminLayout>
              <ListBook />
            </AdminLayout>
          )
        },
        {
          path: 'borrows',
          element: (
            <AdminLayout>
              <ListBorrow />
            </AdminLayout>
          )
        },
        {
          path: 'users',
          element: (
            <AdminLayout>
              <ListUser />
            </AdminLayout>
          )
        }
      ]
    }
  ])
  return routeElements
}
