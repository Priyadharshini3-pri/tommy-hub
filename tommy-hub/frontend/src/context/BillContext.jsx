import { createContext, useContext, useReducer, useEffect, useCallback } from 'react'

const BillContext = createContext(null)
const DRAFT_KEY = 'th_draft_bill'

const initialState = {
  customer: null,      // { id, name, phone }
  items: [],            // [{ product_name, category, quantity, price, discount_percentage }]
  paymentMode: 'Cash',
}

function reducer(state, action) {
  switch (action.type) {
    case 'SET_CUSTOMER':
      return { ...state, customer: action.payload }
    case 'ADD_ITEM':
      return { ...state, items: [...state.items, { ...action.payload, _id: crypto.randomUUID() }] }
    case 'REMOVE_ITEM':
      return { ...state, items: state.items.filter((i) => i._id !== action.payload) }
    case 'SET_PAYMENT_MODE':
      return { ...state, paymentMode: action.payload }
    case 'CLEAR_BILL':
      return { ...initialState }
    case 'RESTORE':
      return { ...state, ...action.payload }
    default:
      return state
  }
}

export function BillProvider({ children }) {
  const [state, dispatch] = useReducer(reducer, initialState, (init) => {
    try {
      const saved = localStorage.getItem(DRAFT_KEY)
      return saved ? { ...init, ...JSON.parse(saved) } : init
    } catch {
      return init
    }
  })

  useEffect(() => {
    localStorage.setItem(DRAFT_KEY, JSON.stringify(state))
  }, [state])

  const clearDraft = useCallback(() => {
    localStorage.removeItem(DRAFT_KEY)
    dispatch({ type: 'CLEAR_BILL' })
  }, [])

  const totals = calculateTotals(state.items)

  return (
    <BillContext.Provider value={{ state, dispatch, totals, clearDraft }}>
      {children}
    </BillContext.Provider>
  )
}

export function calculateTotals(items) {
  let subtotal = 0
  let discountTotal = 0
  const lineItems = items.map((item) => {
    const lineSubtotal = item.price * item.quantity
    const lineDiscount = lineSubtotal * (item.discount_percentage / 100)
    const lineFinal = lineSubtotal - lineDiscount
    subtotal += lineSubtotal
    discountTotal += lineDiscount
    return { ...item, lineSubtotal, lineDiscount, lineFinal }
  })
  return {
    lineItems,
    subtotal: round2(subtotal),
    discountTotal: round2(discountTotal),
    grandTotal: round2(subtotal - discountTotal),
  }
}

function round2(n) {
  return Math.round(n * 100) / 100
}

export function useBill() {
  const ctx = useContext(BillContext)
  if (!ctx) throw new Error('useBill must be used within a BillProvider')
  return ctx
}
