import { Link } from 'react-router-dom'

export default function Sidebar() {
  return (
    <aside className='w-56 bg-purple-700 text-white px-4 py-6 space-y-6 shadow-md'>
      <Link to='/admin'>
        <h1 className='text-xl font-bold tracking-wide'>📚 Nova Library</h1>
      </Link>
      <nav className='flex flex-col gap-2 text-[14px]'>
        <Link className='hover:bg-purple-600 px-3 py-2 rounded-md' to='/admin/genres'>
          📂 Genres
        </Link>
        <Link className='hover:bg-purple-600 px-3 py-2 rounded-md' to='/admin/authors'>
          ✍️ Authors
        </Link>
        <Link className='hover:bg-purple-600 px-3 py-2 rounded-md' to='/admin/books'>
          📘 Books
        </Link>
        <Link className='hover:bg-purple-600 px-3 py-2 rounded-md' to='/admin/borrows'>
          📄 Borrowing Orders
        </Link>
        <Link className='hover:bg-purple-600 px-3 py-2 rounded-md' to='/admin/users'>
          👤 Users
        </Link>
      </nav>
    </aside>
  )
}
