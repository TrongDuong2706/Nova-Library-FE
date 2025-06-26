import { useQuery } from '@tanstack/react-query'
import { getBookStat } from '../../apis/statistic.api'
import { Bar, BarChart, CartesianGrid, Legend, ResponsiveContainer, Tooltip, XAxis, YAxis } from 'recharts'

export default function StatisticalChart() {
  const { data: bookStatData } = useQuery({
    queryKey: ['monthlyRevenue'],
    queryFn: getBookStat
  })

  // Hàm để chuyển object thành mảng và sắp xếp giá trị tháng chính xác từ tháng 1 -> 12
  const formattedData = Object.keys(bookStatData?.data?.result || {})
    .map((key) => ({
      month: key, // '2024-11', '2024-10', etc.
      numberOfBooks: bookStatData?.data.result[key] // Đảm bảo đây là số lượng sách mượn trong tháng
    }))
    .sort((a, b) => {
      const [yearA, monthA] = a.month.split('-').map(Number)
      const [yearB, monthB] = b.month.split('-').map(Number)
      return new Date(yearA, monthA - 1).getTime() - new Date(yearB, monthB - 1).getTime()
    })

  return (
    <div className='bg-white rounded-lg shadow-lg p-6 mt-8'>
      <h5 className='text-lg font-semibold mb-2'>Số lượng sách được mượn theo tháng</h5>
      <ResponsiveContainer width='100%' height={400}>
        <BarChart data={formattedData} margin={{ top: 10, right: 30, left: 0, bottom: 0 }}>
          <XAxis dataKey='month' />
          <YAxis />
          <CartesianGrid strokeDasharray='3 3' />
          <Tooltip />
          <Legend />
          <Bar dataKey='numberOfBooks' fill='#3b82f6' />
        </BarChart>
      </ResponsiveContainer>
    </div>
  )
}
