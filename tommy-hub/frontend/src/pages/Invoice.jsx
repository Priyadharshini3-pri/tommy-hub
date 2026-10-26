import { useEffect, useState } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import { Printer, MessageSquareText } from 'lucide-react'
import { getBill, sendBillSms } from '../services/api'
import { useToast } from '../components/Toast'

export default function Invoice() {
  const { billNumber } = useParams()
  const navigate = useNavigate()
  const { showToast } = useToast()
  const [bill, setBill] = useState(null)
  const [printSize, setPrintSize] = useState('80mm') // '58mm' | '80mm' | 'a4'
  const [sendingSms, setSendingSms] = useState(false)

  useEffect(() => {
    getBill(billNumber)
      .then(setBill)
      .catch(() => showToast('Could not load this invoice.', 'error'))
  }, [billNumber])

  function handlePrint() {
    document.getElementById('invoice-print').className =
      printSize === '58mm' ? 'print-58mm' : printSize === 'a4' ? 'print-a4' : ''
    window.print()
  }

  async function handleSms() {
    setSendingSms(true)
    try {
      const res = await sendBillSms(billNumber)
      showToast(res.message, res.sent ? 'success' : 'error')
    } catch {
      showToast('SMS request failed. You can retry.', 'error')
    } finally {
      setSendingSms(false)
    }
  }

  if (!bill) return <div className="min-h-screen bg-slate flex items-center justify-center text-charcoal">Loading invoice…</div>

  return (
    <div className="min-h-screen bg-slate px-5 py-8">
      <div className="max-w-md mx-auto space-y-4">

        {/* Print size toggle - screen only */}
        <div className="no-print flex gap-2 justify-center text-sm">
          {['58mm', '80mm', 'a4'].map((size) => (
            <button
              key={size}
              onClick={() => setPrintSize(size)}
              className={`px-3 py-1.5 rounded-lg ${printSize === size ? 'bg-navy text-gold' : 'bg-white text-charcoal'}`}
            >
              {size.toUpperCase()}
            </button>
          ))}
        </div>

        <div id="invoice-print" className="bg-white rounded-2xl shadow-card p-6">
          <div className="text-center mb-4">
            <h1 className="font-display text-2xl text-navy">TOMMY HUB</h1>
            <p className="text-xs text-charcoal">Opposite HP Petrol Bunk, Lorry Shed, Jolarpettai, Tirupattur District, Tamil Nadu 635853 · GSTIN: 33ABCDE1234F1Z5</p>
            <p className="text-xs text-charcoal mt-1">
              {new Date(bill.created_at).toLocaleString('en-IN')}
            </p>
            <p className="text-sm font-semibold text-navy mt-1">Bill No: {bill.bill_number}</p>
          </div>

          <table className="w-full text-xs mb-3">
            <thead>
              <tr className="border-b border-dashed border-slate-300 text-charcoal">
                <th className="text-left py-1">Item</th>
                <th className="text-right py-1">Qty</th>
                <th className="text-right py-1">Price</th>
                <th className="text-right py-1">Disc%</th>
                <th className="text-right py-1">Net</th>
              </tr>
            </thead>
            <tbody>
              {bill.items.map((item) => (
                <tr key={item.id} className="border-b border-slate-100">
                  <td className="py-1">{item.product_name}</td>
                  <td className="text-right">{item.quantity}</td>
                  <td className="text-right">{Number(item.price).toFixed(2)}</td>
                  <td className="text-right">{Number(item.discount_percentage).toFixed(0)}</td>
                  <td className="text-right">{Number(item.final_amount).toFixed(2)}</td>
                </tr>
              ))}
            </tbody>
          </table>

          <div className="text-sm space-y-1">
            <div className="flex justify-between text-charcoal"><span>Subtotal</span><span>₹{Number(bill.subtotal).toFixed(2)}</span></div>
            <div className="flex justify-between text-charcoal"><span>Total Savings</span><span>-₹{Number(bill.discount_amount).toFixed(2)}</span></div>
            <div className="invoice-total flex justify-between font-display text-lg text-navy">
              <span>Grand Total</span><span>₹{Number(bill.grand_total).toFixed(2)}</span>
            </div>
            <p className="text-xs text-charcoal pt-1">Payment: {bill.payment_mode}</p>
          </div>

          <p className="text-center text-xs text-charcoal mt-4">Thank you for shopping at TOMMY HUB!</p>
        </div>

        <div className={`no-print grid ${bill.customer_id ? 'grid-cols-2' : 'grid-cols-1'} gap-3`}>
          <button
            onClick={handlePrint}
            className="min-h-touch rounded-xl bg-charcoal text-white font-semibold flex items-center justify-center gap-2"
          >
            <Printer size={18} /> Print Bill
          </button>
          {bill.customer_id && (
            <button
              onClick={handleSms}
              disabled={sendingSms}
              className="min-h-touch rounded-xl bg-emerald text-white font-semibold flex items-center justify-center gap-2 disabled:opacity-50"
            >
              <MessageSquareText size={18} /> {sendingSms ? 'Sending…' : 'Send SMS'}
            </button>
          )}
        </div>

        <button
          onClick={() => navigate('/categories')}
          className="no-print w-full min-h-touch rounded-xl bg-white shadow-card text-navy font-medium"
        >
          Start Next Bill
        </button>
      </div>
    </div>
  )
}
