import { Routes, Route } from 'react-router-dom'
import Calculator from './pages/Calculator.jsx'
import About from './pages/About.jsx'

export default function App() {
  return (
    <Routes>
      <Route path="/" element={<Calculator />} />
      <Route path="/about" element={<About />} />
    </Routes>
  )
}
import TransitCalc from './pages/TransitCalc.jsx'

// Add this inside <Routes>:
<Route path="/transit" element={<TransitCalc />} />