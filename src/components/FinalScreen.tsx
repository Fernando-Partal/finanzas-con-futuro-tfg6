import { useState } from 'react'
import './FinalScreen.css'

interface FinalScreenProps {
  points: number
  playerName: string
  onRestart: () => void
}

interface DialogLine {
  title?: string
  text: string
}

export default function FinalScreen({ points, playerName, onRestart }: FinalScreenProps) {
  const DIALOG_LINES: DialogLine[] = [
    {
      title: '¡Lo has conseguido!',
      text: `¡Enhorabuena, ${playerName}! Has terminado todas las aventuras. Estoy súper orgulloso de ti.`,
    },
    {
      title: 'Tu puntuación final',
      text: 'Mira cuántos puntos has reunido en todo el viaje. ¡Es un montón! Vamos a repasar todo lo que has aprendido…',
    },
    {
      title: 'Necesidad vs Deseo',
      text: 'Aprendiste a distinguir lo que NECESITAS (comida, agua, ropa…) de lo que solo es un DESEO (caprichos). ¡Lo primero siempre va antes!',
    },
    {
      title: '¿Cuánto cuesta?',
      text: 'Ahora conoces el precio de las cosas del día a día. Saber lo que cuestan te ayuda a no gastar de más.',
    },
    {
      title: 'Ahorro con Objetivo',
      text: 'Descubriste el poder del AHORRO: si guardas un poquito cada semana, puedes alcanzar metas grandes como un móvil, una bici o un viaje.',
    },
    {
      title: 'Comparar Ofertas',
      text: '¡La etiqueta más barata no siempre es la mejor compra! Aprendiste a comparar el precio por unidad o por kilo para gastar mejor.',
    },
    {
      title: 'El Cajero',
      text: 'Y como todo un cajero, sabes calcular el cambio exacto y dar el dinero con las menos monedas posibles.',
    },
    {
      title: '¡Sigue ahorrando!',
      text: 'Recuerda: cuidar tu dinero hoy es construir tu futuro. ¡Gracias por jugar conmigo, sigue ahorrando con Huchín!',
    },
  ]

  const [step, setStep] = useState(0)
  const [leaving, setLeaving] = useState(false)

  const isLast = step === DIALOG_LINES.length - 1
  const current = DIALOG_LINES[step]

  const handleAdvance = () => {
    if (!isLast) {
      setStep((s) => s + 1)
    } else {
      setLeaving(true)
      setTimeout(onRestart, 550)
    }
  }

  return (
    <div className={`final-screen${leaving ? ' final-screen--leaving' : ''}`}>
      <header className="final-header">
        <h1 className="final-title">
          <span className="final-title-line">¡Aventura</span>
          <span className="final-title-line final-title-line--accent">Completada!</span>
        </h1>

        <div className="final-score-badge" aria-label={`Puntuación final: ${points} puntos`}>
          <span className="final-score-label">Puntos</span>
          <span className="final-score-value">{points}</span>
        </div>
      </header>

      <main className="final-stage">
        <div className="final-pig">
          <img
            src="/Cerdito.png"
            alt="Huchín"
            className="final-cerdito"
            draggable={false}
          />
        </div>

        <div key={`d-${step}`} className="final-bubble" role="status">
          {current.title && (
            <span className="final-bubble-title">{current.title}</span>
          )}
          <span className="final-bubble-text">{current.text}</span>

          <span className="final-bubble-progress" aria-hidden>
            {DIALOG_LINES.map((_, i) => (
              <span
                key={i}
                className={`final-dot${i === step ? ' final-dot--active' : ''}${i < step ? ' final-dot--done' : ''}`}
              />
            ))}
          </span>
        </div>
      </main>

      <button className="final-btn" onClick={handleAdvance}>
        {isLast ? '¡Volver al inicio!' : 'Continuar →'}
      </button>

      <span className="final-credit">by Fernando Partal</span>
    </div>
  )
}
