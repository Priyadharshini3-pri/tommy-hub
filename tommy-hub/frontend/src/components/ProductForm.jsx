import { useState, useMemo } from 'react'
import { PlusCircle } from 'lucide-react'
import { useBill } from '../context/BillContext'

export default function ProductForm({ category }) {
  const { dispatch } = useBill()
  const [name, setName] = useState('')
  const [price, setPrice] = useState('')
  const [qty, setQty] = useState(1)
  const [discount, setDiscount] = useState(0)
  const [error, setError] = useState('')

  const preview = useMemo(() => {
    const p = parseFloat(price) || 0
    const q = parseInt(qty) || 0
    const d = parseFloat(discount) || 0
    const subtotal = p * q
    const discountAmount = subtotal * (d / 100)
    return { subtotal, discountAmount, final: subtotal - discountAmount }
  }, [price, qty, discount])

  function handleAdd() {
    if (!name.trim()) return setError('Enter an item name or variant.')
    const p = parseFloat(price)
    const q = parseInt(qty)
    const d = parseFloat(discount)
    if (!(p > 0)) return setError('Price must be greater than 0.')
    if (!(q > 0)) return setError('Quantity must be at least 1.')
    if (d < 0 || d > 100) return setError('Discount must be between 0 and 100%.')

    dispatch({
      type: 'ADD_ITEM',
      payload: { product_name: name.trim(), category, price: p, quantity: q, discount_percentage: d },
    })
    setName(''); setPrice(''); setQty(1); setDiscount(0); setError('')
  }

  if (!category) {
    return (
      <div className="bg-white rounded-2xl shadow-card p-6 text-center text-charcoal">
        Select a category above to start adding items.
      </div>
    )
  }

  return (
    <div className="bg-white rounded-2xl shadow-card p-5 space-y-4">
      <h3 className="font-display text-lg text-navy">Add {category} Item</h3>

      <div>
        <label className="text-sm font-medium text-charcoal">Item Name / Variant</label>
        <input
          value={name}
          onChange={(e) => setName(e.target.value)}
          placeholder="e.g. Slim Fit Chinos - Beige, size 32"
          className="mt-1 w-full min-h-touch rounded-xl border border-slate-200 px-4 focus:outline-none focus:ring-2 focus:ring-gold"
        />
      </div>

      <div className="grid grid-cols-3 gap-3">
        <div>
          <label className="text-sm font-medium text-charcoal">Price (₹)</label>
          <input
            type="number" min="0" step="0.01" value={price}
            onChange={(e) => setPrice(e.target.value)}
            className="mt-1 w-full min-h-touch rounded-xl border border-slate-200 px-3 focus:outline-none focus:ring-2 focus:ring-gold"
          />
        </div>
        <div>
          <label className="text-sm font-medium text-charcoal">Qty</label>
          <input
            type="number" min="1" value={qty}
            onChange={(e) => setQty(e.target.value)}
            className="mt-1 w-full min-h-touch rounded-xl border border-slate-200 px-3 focus:outline-none focus:ring-2 focus:ring-gold"
          />
        </div>
        <div>
          <label className="text-sm font-medium text-charcoal">Disc %</label>
          <input
            type="number" min="0" max="100" value={discount}
            onChange={(e) => setDiscount(e.target.value)}
            className="mt-1 w-full min-h-touch rounded-xl border border-slate-200 px-3 focus:outline-none focus:ring-2 focus:ring-gold"
          />
        </div>
      </div>

      <div className="bg-slate rounded-xl px-4 py-3 text-sm text-charcoal flex justify-between">
        <span>Line total</span>
        <span className="font-semibold text-navy">₹{preview.final.toFixed(2)}</span>
      </div>

      {error && <p className="text-coral text-sm">{error}</p>}

      <button
        onClick={handleAdd}
        className="w-full min-h-touch flex items-center justify-center gap-2 rounded-xl bg-emerald text-white font-semibold hover:brightness-95 active:scale-[0.99] transition"
      >
        <PlusCircle size={18} /> Add Item to Bill
      </button>
    </div>
  )
}
