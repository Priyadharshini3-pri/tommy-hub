import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { lookupCustomer, createCustomer } from '../services/api'
import { useBill } from '../context/BillContext'
import { useToast } from '../components/Toast'

const PHONE_RE = /^[6-9]\d{9}$/

export default function Login() {
  const navigate = useNavigate()
  const { dispatch } = useBill()
  const { showToast } = useToast()

  const [customerName, setCustomerName] = useState('')
  const [phone, setPhone] = useState('')
  const [errors, setErrors] = useState({})
  const [loading, setLoading] = useState(false)
  const [returningCustomer, setReturningCustomer] = useState(null)

  async function handlePhoneBlur() {
    if (!PHONE_RE.test(phone)) return
    try {
      const customer = await lookupCustomer(phone)
      setReturningCustomer(customer)
      setCustomerName(customer.name)
    } catch {
      setReturningCustomer(null)
    }
  }

  async function handleContinue(e) {
    e.preventDefault()
    const errs = {}
    if (customerName.trim().length < 2) errs.name = 'Enter a valid name.'
    if (!PHONE_RE.test(phone)) errs.phone = 'Enter a valid 10-digit mobile number.'
    setErrors(errs)
    if (Object.keys(errs).length) return

    setLoading(true)
    try {
      const customer = returningCustomer?.phone === phone
        ? returningCustomer
        : await createCustomer(customerName.trim(), phone)
      dispatch({ type: 'SET_CUSTOMER', payload: customer })
      navigate('/categories')
    } catch {
      showToast('Could not save customer. Please try again.', 'error')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen bg-slate flex items-center justify-center px-5 py-10">
      <div className="w-full max-w-md bg-white rounded-2xl shadow-card p-6 space-y-6">
        <h2 className="font-display text-2xl text-navy text-center">Customer Details</h2>

        <form onSubmit={handleContinue} className="space-y-3">
          <div>
            <input
              placeholder="Customer Name"
              value={customerName}
              onChange={(e) => setCustomerName(e.target.value)}
              className="w-full min-h-touch rounded-xl border border-slate-200 px-4 focus:outline-none focus:ring-2 focus:ring-gold"
            />
            {errors.name && <p className="text-coral text-xs mt-1">{errors.name}</p>}
          </div>
          <div>
            <input
              placeholder="10-Digit Mobile Number"
              value={phone}
              maxLength={10}
              onChange={(e) => setPhone(e.target.value.replace(/\D/g, ''))}
              onBlur={handlePhoneBlur}
              className="w-full min-h-touch rounded-xl border border-slate-200 px-4 focus:outline-none focus:ring-2 focus:ring-gold"
            />
            {errors.phone && <p className="text-coral text-xs mt-1">{errors.phone}</p>}
            {returningCustomer && (
              <p className="text-emerald text-xs mt-1">
                Welcome back, {returningCustomer.name} — {returningCustomer.previous_visits} previous visit(s).
              </p>
            )}
          </div>
          <button
            disabled={loading}
            className="w-full min-h-touch rounded-xl bg-emerald text-white font-semibold disabled:opacity-50"
          >
            {loading ? 'Please wait…' : 'Continue'}
          </button>
        </form>
      </div>
    </div>
  )
}