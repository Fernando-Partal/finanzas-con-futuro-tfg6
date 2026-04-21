import { useEffect, useRef, useState } from 'react'
import './IntroScreen.css'

const INTRO_TEXT =
  '¡Genial! Vamos a aprender juntos mucho en esta aventura del ahorro... ' +
  'Descubrirás cómo funciona el dinero, aprenderás a ahorrar ' +
  'y serás un auténtico campeón de las finanzas. ' +
  '¡¡¡¡Comencemos!!!!'

const SPEED_MS = 38

interface IntroScreenProps {
  onContinue: () => void
}

export default function IntroScreen({ onContinue }: IntroScreenProps) {
  const [displayed, setDisplayed] = useState('')
  const [done, setDone] = useState(false)
  const [leaving, setLeaving] = useState(false)
  const indexRef = useRef(0)

  useEffect(() => {
    const id = setInterval(() => {
      indexRef.current++
      setDisplayed(INTRO_TEXT.slice(0, indexRef.current))
      if (indexRef.current >= INTRO_TEXT.length) {
        clearInterval(id)
        setDone(true)
      }
    }, SPEED_MS)
    return () => clearInterval(id)
  }, [])

  const skipToEnd = () => {
    indexRef.current = INTRO_TEXT.length
    setDisplayed(INTRO_TEXT)
    setDone(true)
  }

  const handleContinue = () => {
    setLeaving(true)
    setTimeout(onContinue, 550)
  }

  return (
    <div className={`intro-screen${leaving ? ' intro-screen--leaving' : ''}`}>
      <div className="intro-wrapper">
        <div
          className="intro-bubble"
          onClick={!done ? skipToEnd : undefined}
          style={{ cursor: done ? 'default' : 'pointer' }}
          title={done ? '' : 'Clic para saltar'}
        >
          {/* Texto completo invisible: reserva el tamaño final del bocadillo */}
          <span aria-hidden="true" className="intro-bubble-ghost">{INTRO_TEXT}</span>
          {/* Texto visible que se va escribiendo, superpuesto */}
          <span className="intro-bubble-text">
            {displayed}
            {!done && <span className="intro-cursor">|</span>}
          </span>
        </div>

        <img src="/Cerdito.png" alt="Cerdito" className="intro-cerdito" />
      </div>

      <button
        className="intro-continue-btn"
        onClick={handleContinue}
        disabled={!done}
      >
        Continuar →
      </button>
    </div>
  )
}
