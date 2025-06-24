import { ChevronLeft, ChevronRight } from 'lucide-react'

interface PaginationProps {
  currentPage: number
  totalPages: number
  hasNextPage: boolean
  hasPreviousPage: boolean
  onPageChange: (page: number) => void
}

export default function Pagination({
  currentPage,
  totalPages,
  hasNextPage,
  hasPreviousPage,
  onPageChange
}: PaginationProps) {
  const getVisiblePages = () => {
    const pages: number[] = []

    if (totalPages <= 5) {
      // Hiển thị toàn bộ nếu <= 5 trang
      for (let i = 0; i < totalPages; i++) pages.push(i)
    } else {
      if (currentPage <= 2) {
        pages.push(0, 1, 2, -1, totalPages - 1)
      } else if (currentPage >= totalPages - 3) {
        pages.push(0, -1, totalPages - 3, totalPages - 2, totalPages - 1)
      } else {
        pages.push(0, -1, currentPage, -2, totalPages - 1)
      }
    }

    return pages
  }

  const pages = getVisiblePages()

  return (
    <div className='flex items-center justify-center gap-2 mt-6 select-none'>
      {/* Previous */}
      <button
        onClick={() => onPageChange(currentPage - 1)}
        disabled={!hasPreviousPage}
        className='px-2 py-1 rounded-full text-gray-600 hover:bg-gray-200 disabled:opacity-50 disabled:cursor-not-allowed'
      >
        <ChevronLeft size={16} />
      </button>

      {/* Page Numbers */}
      {pages.map((page, index) => {
        if (page === -1 || page === -2)
          return (
            <span key={index} className='px-2 text-gray-500'>
              ...
            </span>
          )
        return (
          <button
            key={page}
            onClick={() => onPageChange(page)}
            className={`px-3 py-1 rounded-full transition ${
              page === currentPage ? 'bg-purple-600 text-white font-medium' : 'text-gray-700 hover:bg-gray-100'
            }`}
          >
            {page + 1}
          </button>
        )
      })}

      {/* Next */}
      <button
        onClick={() => onPageChange(currentPage + 1)}
        disabled={!hasNextPage}
        className='px-2 py-1 rounded-full text-gray-600 hover:bg-gray-200 disabled:opacity-50 disabled:cursor-not-allowed'
      >
        <ChevronRight size={16} />
      </button>
    </div>
  )
}
