import { useNavigate } from 'react-router-dom'

export default function Splash() {
  const navigate = useNavigate()
  return (
    <div className="min-h-screen bg-navy flex flex-col items-center justify-center px-6 text-center">
      <h1 className="font-display text-5xl md:text-6xl text-white tracking-wide">TOMMY HUB</h1>
      <p className="mt-3 text-gold font-medium tracking-[0.15em] uppercase text-sm md:text-base">
        Premium Apparel Billing Terminal
      </p>
      <button
        onClick={() => navigate('/login')}
        className="mt-10 min-h-touch px-8 rounded-xl bg-gold text-navy font-bold hover:brightness-95 active:scale-[0.99] transition"
      >
        Start New Billing
      </button>
    </div>
  )
}
