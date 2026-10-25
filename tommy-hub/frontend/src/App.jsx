import { BrowserRouter, Routes, Route } from 'react-router-dom'
import { BillProvider } from './context/BillContext'
import { ToastProvider } from './components/Toast'
import Splash from './pages/Splash'
import Login from './pages/Login'
import CategoryDashboard from './pages/CategoryDashboard'
import BillingEntry from './pages/BillingEntry'
import Invoice from './pages/Invoice'

export default function App() {
  return (
    <ToastProvider>
      <BillProvider>
        <BrowserRouter>
          <Routes>
            <Route path="/" element={<Splash />} />
            <Route path="/login" element={<Login />} />
            <Route path="/categories" element={<CategoryDashboard />} />
            <Route path="/billing" element={<BillingEntry />} />
            <Route path="/invoice/:billNumber" element={<Invoice />} />
          </Routes>
        </BrowserRouter>
      </BillProvider>
    </ToastProvider>
  )
}
