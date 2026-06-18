import { HashRouter, Route, Routes } from 'react-router'
import HomePage from './pages/Home'
import OrderFoodPage from './pages/orderfood'
import FoodAdminPage from './pages/foodadmin'

export default function App() {
  return (
    <HashRouter>
      <Routes>
        <Route path="/" element={<HomePage />} />
        <Route path="/orderfood" element={<OrderFoodPage />} />
        <Route path="/foodadmin" element={<FoodAdminPage />} />
      </Routes>
    </HashRouter>
  )
}
