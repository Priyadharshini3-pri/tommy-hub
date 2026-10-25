import { Trash2, X } from 'lucide-react'
import { useBill } from '../context/BillContext'

const PAYMENT_MODES = ['Cash', 'UPI', 'Card']

export default function CartPanel({ open, onClose, onCheckout, checkingOut }) {
  const { state, dispatch, totals } = useBill()

  const content = (
    <div className="flex flex-col h-full">
      <div className="flex items-center justify-between px-5 py-4 border-b border-slate-100">
        <h3 className="font-display text-lg text-navy">Live Invoice</h3>
        <button onClick={onClose} className="xl:hidden min-h-touch min-w-touch flex items-center justify-center">
          <X size={20} />
        </button>
      </div>

      <div className="flex-1 overflow-y-auto px-5 py-3 space-y-3">
        {totals.lineItems.length === 0 && (
          <p className="text-charcoal text-sm text-center py-10">No items added yet.</p>
        )}
        {totals.lineItems.map((item) => (
          <div key={item._id} className="bg-slate rounded-xl p-3 flex justify-between items-start">
            <div>
              <p className="font-medium text-navy text-sm">{item.product_name}</p>
              <p className="text-xs text-charcoal">
                {item.quantity} × ₹{item.price} {item.discount_percentage > 0 && `· ${item.discount_percentage}% off`}
              </p>
            </div>
            <div className="flex items-center gap-2">
              <span className="text-sm font-semibold text-navy">₹{item.lineFinal.toFixed(2)}</span>
              <button
                onClick={() => dispatch({ type: 'REMOVE_ITEM', payload: item._id })}
                className="text-coral min-h-touch min-w-touch flex items-center justify-center"
                aria-label="Remove item"
              >
                <Trash2 size={16} />
              </button>
            </div>
          </div>
        ))}
      </div>

      <div className="border-t border-slate-100 px-5 py-4 space-y-3">
        <div className="flex gap-2">
          {PAYMENT_MODES.map((mode) => (
            <button
              key={mode}
              onClick={() => dispatch({ type: 'SET_PAYMENT_MODE', payload: mode })}
              className={`flex-1 min-h-touch rounded-xl text-sm font-medium transition
                ${state.paymentMode === mode ? 'bg-navy text-gold' : 'bg-slate text-charcoal'}`}
            >
              {mode === 'UPI' ? 'UPI / QR' : mode}
            </button>
          ))}
        </div>

        <div className="text-sm space-y-1">
          <div className="flex justify-between text-charcoal"><span>Subtotal</span><span>₹{totals.subtotal.toFixed(2)}</span></div>
          <div className="flex justify-between text-charcoal"><span>Savings</span><span>-₹{totals.discountTotal.toFixed(2)}</span></div>
          <div className="flex justify-between font-display text-lg text-navy border-t border-dashed border-slate-200 pt-2 mt-1">
            <span>Grand Total</span><span>₹{totals.grandTotal.toFixed(2)}</span>
          </div>
        </div>

        <button
          disabled={totals.lineItems.length === 0 || checkingOut}
          onClick={onCheckout}
          className="w-full min-h-touch rounded-xl bg-gold text-navy font-bold disabled:opacity-40 disabled:cursor-not-allowed hover:brightness-95 transition"
        >
          {checkingOut ? 'Finalizing…' : 'Generate Invoice'}
        </button>
      </div>
    </div>
  )

  return (
    <>
      {/* Desktop: sticky side panel */}
      <div className="hidden xl:block xl:w-[40%] xl:sticky xl:top-4 xl:self-start bg-white rounded-2xl shadow-card h-[calc(100vh-2rem)]">
        {content}
      </div>

      {/* Mobile/tablet: bottom drawer */}
      {open && (
        <div className="xl:hidden fixed inset-0 z-40 flex flex-col justify-end">
          <div className="absolute inset-0 bg-navy/40" onClick={onClose} />
          <div className="relative bg-white rounded-t-3xl shadow-card max-h-[85vh] flex flex-col animate-[slideUp_.2s_ease-out]">
            {content}
          </div>
        </div>
      )}
    </>
  )
}
