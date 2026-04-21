import { useState } from 'react'
import './CharacterSelect.css'

type Character = 'girl' | 'boy'

interface CharacterSelectProps {
  onConfirm: (name: string, character: Character) => void
}

export default function CharacterSelect({ onConfirm }: CharacterSelectProps) {
  const [name, setName] = useState('')
  const [character, setCharacter] = useState<Character | null>(null)
  const [leaving, setLeaving] = useState(false)

  const canConfirm = name.trim().length > 0 && character !== null

  const handleConfirm = () => {
    if (!canConfirm) return
    setLeaving(true)
    setTimeout(() => onConfirm(name.trim(), character!), 550)
  }

  return (
    <div className={`char-select${leaving ? ' char-select--leaving' : ''}`}>
      {/* Cerdito lateral */}
      <div className="char-left">
        <div className="char-cerdito-wrapper">
          <div className="char-bubble">
            Antes de nada... ¡dime cómo te llamas y cómo eres!
          </div>
          <img src="/Cerdito.png" alt="Cerdito" className="char-cerdito" />
        </div>
      </div>

      {/* Panel de selección */}
      <div className="char-right">
        {/* Tarjetas de personaje */}
        <div className="char-cards">
          <button
            className={`char-card${character === 'girl' ? ' char-card--selected' : ''}`}
            onClick={() => setCharacter('girl')}
            type="button"
          >
            <img src="/Niña.png" alt="Niña" />
            <span>¡Soy ella!</span>
          </button>
          <button
            className={`char-card${character === 'boy' ? ' char-card--selected' : ''}`}
            onClick={() => setCharacter('boy')}
            type="button"
          >
            <img src="/Niño.png" alt="Niño" />
            <span>¡Soy él!</span>
          </button>
        </div>

        {/* Campo de nombre */}
        <div className="char-name-section">
          <label htmlFor="player-name" className="char-name-label">
            ¿Cómo te llamas?
          </label>
          <input
            id="player-name"
            className="char-name-input"
            type="text"
            placeholder="Escribe tu nombre..."
            value={name}
            onChange={e => setName(e.target.value)}
            onKeyDown={e => e.key === 'Enter' && handleConfirm()}
            maxLength={20}
            autoComplete="off"
          />
        </div>

        <button
          className="char-confirm-btn"
          onClick={handleConfirm}
          disabled={!canConfirm}
          type="button"
        >
          ¡Vamos!
        </button>
      </div>
    </div>
  )
}
