export default function Banner() {
  return (
    <div
      className='relative h-64 bg-cover bg-center flex items-center justify-center text-white'
      style={{ backgroundImage: "url('https://images.unsplash.com/photo-1512820790803-83ca734da794')" }}
    >
      <div className='absolute inset-0 bg-black opacity-40'></div>
      <h2 className='relative text-4xl font-bold drop-shadow-lg'>Chào mừng đến với thư viện!</h2>
    </div>
  )
}
