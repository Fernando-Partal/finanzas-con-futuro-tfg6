import { useState } from 'react'
// Reutiliza exactamente el mismo CSS que CharacterSelect
import './CharacterSelect.css'

type FichaType = 'coche' | 'perro' | 'pato'

const FICHAS: { id: FichaType; src: string; label: string }[] = [
  { id: 'coche', src: '/FichaCoche.png', label: '¡El coche!' },
  { id: 'perro', src: '/FichaPerro.png', label: '¡El perro!' },
  { id: 'pato',  src: '/FichaPato.png',  label: '¡El pato!'  },
]

interface FichaSelectProps {
  onConfirm: (ficha: FichaType) => void
}

export default function FichaSelect({ onConfirm }: FichaSelectProps) {
  const [ficha, setFicha] = useState<FichaType | null>(null)
  const [leaving, setLeaving] = useState(false)

  const handleConfirm = () => {
    if (!ficha) return
    setLeaving(true)
    setTimeout(() => onConfirm(ficha), 550)
  }

  return (
    <div className={`char-select${leaving ? ' char-select--leaving' : ''}`}>
      {/* Huchín lateral */}
      <div className="char-left" style={{ transform: 'translateX(-6rem)' }}>
        <div className="char-cerdito-wrapper">
          <div className="char-bubble">
            ¡Que no se te olvide elegir tu ficha para el camino!
          </div>
          <img src="/Cerdito.png" alt="Huchín" className="char-cerdito" style={{ marginLeft: '0rem' }} />
        </div>
      </div>

      {/* Panel de selección */}
      <div className="char-right">
        <div className="char-cards">
          {FICHAS.map(({ id, src, label }) => (
            <button
              key={id}
              className={`char-card${ficha === id ? ' char-card--selected' : ''}`}
              onClick={() => setFicha(id)}
              type="button"
            >
              <img src={src} alt={label} />
              <span>{label}</span>
            </button>
          ))}
        </div>

        <button
          className="char-confirm-btn"
          onClick={handleConfirm}
          disabled={ficha === null}
          type="button"
        >
          ¡Continuar!
        </button>
      </div>
    </div>
  )
}
