import { Shirt, Watch, Footprints } from 'lucide-react'

// lucide-react has no dedicated "pant/trouser/track" icons, so we reuse
// Shirt/Footprints/Watch with distinct labels + colors for visual variety.
export const CATEGORIES = [
  { key: 'Shirt', label: 'Shirt', icon: Shirt, emoji: '👔' },
  { key: 'Pant', label: 'Pant', icon: Shirt, emoji: '👖' },
  { key: 'Footwear', label: 'Footwear', icon: Footprints, emoji: '👟' },
  { key: 'Trouser', label: 'Trouser', icon: Shirt, emoji: '👖' },
  { key: 'Track', label: 'Track', icon: Footprints, emoji: '🏃' },
  { key: 'T-Shirt', label: 'T-Shirt', icon: Shirt, emoji: '👕' },
  { key: 'Accessories', label: 'Accessories', icon: Watch, emoji: '⌚' },
]

export default function CategoryGrid({ onSelect, selected }) {
  return (
    <div className="grid grid-cols-2 md:grid-cols-4 xl:grid-cols-7 gap-3">
      {CATEGORIES.map((cat) => {
        const isActive = selected === cat.key
        return (
          <button
            key={cat.key}
            onClick={() => onSelect(cat.key)}
            className={`min-h-touch flex flex-col items-center justify-center gap-2 rounded-2xl p-4 aspect-square shadow-card transition-all duration-200
              ${isActive
                ? 'bg-navy text-gold ring-2 ring-gold scale-[1.02]'
                : 'bg-white text-navy hover:-translate-y-0.5'}`}
          >
            <span className="text-3xl" aria-hidden>{cat.emoji}</span>
            <span className="text-sm font-semibold font-body">{cat.label}</span>
          </button>
        )
      })}
    </div>
  )
}
