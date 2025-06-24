import React from 'react'
import Footer from '../../components/Footer/Footer'
interface Props {
  children?: React.ReactNode
}
export default function DefaultLayout({ children }: Props) {
  return (
    <div className='min-h-screen bg-gray-50 flex flex-col'>
      {children}
      <Footer />
    </div>
  )
}
