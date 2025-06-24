import { useQuery } from '@tanstack/react-query'
import { countBook } from '../../../apis/books.api'
import { countBorrowed, countOverdue } from '../../../apis/borrow.api'

export default function Dashboard() {
  const { data: countBookData } = useQuery({
    queryKey: ['countBook'],
    queryFn: () => countBook()
  })
  const countBookDataRespone = countBookData?.data.result

  const { data: countBorrowedData } = useQuery({
    queryKey: ['countBorrowed'],
    queryFn: () => countBorrowed()
  })
  const countBorrowedResponse = countBorrowedData?.data.result

  const { data: countOverdueData } = useQuery({
    queryKey: ['countOverdue'],
    queryFn: () => countOverdue()
  })
  const countOverdueResponse = countOverdueData?.data.result

  return (
    <main className='flex-1 px-6 py-5 overflow-auto'>
      {/* Stats */}
      <div className='grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4'>
        <div className='bg-white p-4 rounded-lg shadow border-l-4 border-purple-500'>
          <p className='text-gray-500 text-xs'>Total Books</p>
          <p className='text-xl font-bold text-purple-700 mt-1'>{countBookDataRespone}</p>
        </div>
        <div className='bg-white p-4 rounded-lg shadow border-l-4 border-purple-500'>
          <p className='text-gray-500 text-xs'>Currently Borrowed</p>
          <p className='text-xl font-bold text-purple-700 mt-1'>{countBorrowedResponse}</p>
        </div>
        <div className='bg-white p-4 rounded-lg shadow border-l-4 border-red-400'>
          <p className='text-gray-500 text-xs'>Overdue</p>
          <p className='text-xl font-bold text-red-600 mt-1'>{countOverdueResponse}</p>
        </div>
      </div>

      {/* Recent activity */}
      <section className='mt-6'>
        <h3 className='text-base font-semibold text-purple-800 mb-3'>Recent Activities</h3>
        <ul className='bg-white rounded-lg shadow-sm divide-y divide-gray-100'>
          <li className='px-4 py-2'>📌 Nguyen Van A borrowed 2 books</li>
          <li className='px-4 py-2'>⚠️ Tran Thi B returned books 3 days late</li>
          <li className='px-4 py-2'>✅ Admin added new book "Java Basics"</li>
        </ul>
      </section>
    </main>
  )
}
