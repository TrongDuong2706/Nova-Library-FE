import ScrollToTop from './components/ScrollToTop/ScrollToTop'
import useRouteElements from './useRouteElements'

function App() {
  const routeElements = useRouteElements()

  return (
    <div>
      <ScrollToTop />
      {routeElements}
    </div>
  )
}

export default App
