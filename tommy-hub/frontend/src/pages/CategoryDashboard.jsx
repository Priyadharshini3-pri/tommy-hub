import { useNavigate } from 'react-router-dom'
import CategoryGrid from '../components/CategoryGrid'
import { useBill } from '../context/BillContext'

export default function CategoryDashboard() {
  const navigate = useNavigate()
  const { state } = useBill()

  if (!state.customer) {
    navigate('/login')
    return null
  }

  return (
    <div className="min-h-screen bg-slate px-5 py-8">
      <div className="max-w-4xl mx-auto">
        <p className="text-charcoal text-sm">Billing for</p>
        <h2 className="font-display text-2xl text-navy mb-6">{state.customer.name}</h2>
        <CategoryGrid onSelect={(cat) => navigate(`/billing?category=${encodeURIComponent(cat)}`)} />
      </div>
    </div>
  )
}
