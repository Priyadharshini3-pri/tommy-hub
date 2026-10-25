import { useNavigate } from 'react-router-dom'
import CategoryGrid from '../components/CategoryGrid'

export default function CategoryDashboard() {
  const navigate = useNavigate()

  return (
    <div className="min-h-screen bg-slate px-5 py-8">
      <div className="max-w-4xl mx-auto">
        <p className="text-charcoal text-sm">Billing</p>
        <h2 className="font-display text-2xl text-navy mb-6">New Bill</h2>
        <CategoryGrid onSelect={(cat) => navigate(`/billing?category=${encodeURIComponent(cat)}`)} />
      </div>
    </div>
  )
}
