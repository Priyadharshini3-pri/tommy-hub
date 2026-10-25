import { useState } from 'react'
import { useNavigate, useSearchParams } from 'react-router-dom'
import { ShoppingBag } from 'lucide-react'
import CategoryGrid from '../components/CategoryGrid'
import ProductForm from '../components/ProductForm'
import CartPanel from '../components/CartPanel'
import { useBill } from '../context/BillContext'
import { useToast } from '../components/Toast'
import { createBill } from '../services/api'

export default function BillingEntry() {
  const navigate = useNavigate()
  const [params, setParams] = useSearchParams()
  const category = params.get('category') || ''
  const { state, totals, clearDraft } = useBill()
  const { showToast } = useToast()
  const [drawerOpen, setDrawerOpen] = useState(false)
  const [checkingOut, setCheckingOut] = useState(false)

  async function handleCheckout() {
    setCheckingOut(true)
    try {
      const idempotencyKey = `draft-${state.customer.id}-${totals.lineItems.length}-${totals.grandTotal}`
      const bill = await createBill({
        customer_id: state.customer.id,
        payment_mode: state.paymentMode,
        idempotency_key: idempotencyKey,
        items: totals.lineItems.map((i) => ({
          product_name: i.product_name,
          category: i.category,
          quantity: i.quantity,
          price: i.price,
          discount_percentage: i.discount_percentage,
        })),
      })
      showToast('Invoice generated.', 'success')
      navigate(`/invoice/${bill.bill_number}`)
      clearDraft()
    } catch (err) {
      const detail = err?.response?.data?.detail
      showToast(typeof detail === 'string' ? detail : 'Could not generate invoice.', 'error')
    } finally {
      setCheckingOut(false)
    }
  }

  return (
    <div className="min-h-screen bg-slate xl:flex xl:gap-4 xl:p-4">
      <div className="flex-1 px-5 py-6 xl:px-0 xl:py-0 pb-28 xl:pb-0">
        <div className="max-w-3xl mx-auto xl:max-w-none space-y-5">
          <CategoryGrid selected={category} onSelect={(cat) => setParams({ category: cat })} />
          <ProductForm category={category} />
        </div>
      </div>

      <CartPanel
        open={drawerOpen}
        onClose={() => setDrawerOpen(false)}
        onCheckout={handleCheckout}
        checkingOut={checkingOut}
      />

      {/* Mobile sticky bottom bar */}
      <button
        onClick={() => setDrawerOpen(true)}
        className="xl:hidden no-print fixed bottom-4 left-5 right-5 min-h-touch rounded-xl bg-navy text-white font-semibold flex items-center justify-between px-5 shadow-card"
      >
        <span className="flex items-center gap-2"><ShoppingBag size={18} /> {totals.lineItems.length} item(s)</span>
        <span>₹{totals.grandTotal.toFixed(2)}</span>
      </button>
    </div>
  )
}
