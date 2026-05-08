import { useEffect, useRef, useState } from 'react'
import './HomeScreen.css'

interface HomeScreenProps {
  onStart: () => void
}

type PigState = 'sleeping' | 'annoyed' | 'sneezing' | 'awake'

const PIG_SRC: Record<PigState, string> = {
  sleeping: '/CerditoDurmiendo.png',
  annoyed:  '/CerditoDormidoMolestado.png',
  sneezing: '/CerditoEstornudando.png',
  awake:    '/Cerdito.png',
}

const ANNOYED_MS = 1000
const SNEEZE_MS = 1000
const WAKE_THRESHOLD = 3

const DIALOG_LINES = [
  '¡Aaay! ¡Me has despertado de mi siesta!',
  'Bueno… ya que estoy despierto: soy Huchín, tu guía.',
  '¡Acompáñame a aprender a ahorrar y cuidar tu dinero jugando!',
]

export default function HomeScreen({ onStart }: HomeScreenProps) {
  const [pigState, setPigState]     = useState<PigState>('sleeping')
  const [noseTaps, setNoseTaps]     = useState(0)
  const [dialogStep, setDialogStep] = useState(0)
  const [leaving, setLeaving]       = useState(false)
  const pigTimer = useRef<number | null>(null)

  useEffect(() => () => {
    if (pigTimer.current) window.clearTimeout(pigTimer.current)
  }, [])

  const handleNosePoke = () => {
    if (pigState !== 'sleeping') return

    const next = noseTaps + 1
    setNoseTaps(next)

    if (next < WAKE_THRESHOLD) {
      setPigState('annoyed')
      pigTimer.current = window.setTimeout(() => {
        setPigState('sleeping')
      }, ANNOYED_MS)
    } else {
      setPigState('sneezing')
      pigTimer.current = window.setTimeout(() => {
        setPigState('awake')
        setDialogStep(0)
      }, SNEEZE_MS)
    }
  }

  const handleAdvance = () => {
    if (dialogStep < DIALOG_LINES.length - 1) {
      setDialogStep((s) => s + 1)
    } else {
      setLeaving(true)
      setTimeout(onStart, 550)
    }
  }

  const isAwake     = pigState === 'awake'
  const isSneezing  = pigState === 'sneezing'
  const isLast      = dialogStep === DIALOG_LINES.length - 1
  const buttonLabel = isAwake && !isLast ? 'Continuar →' : '¡Empezar!'

  return (
    <div className={`home-screen${leaving ? ' home-screen--leaving' : ''}`}>
      <h1 className="home-title">
        <span className="home-title-line">¡La Aventura</span>
        <span className="home-title-line home-title-line--accent">del Ahorro!</span>
      </h1>

      <div className="home-stage">
        <div className={`home-pig home-pig--${pigState}`}>
          <img
            src={PIG_SRC[pigState]}
            alt="Huchín"
            className="home-cerdito"
            draggable={false}
          />
          {pigState === 'sleeping' && (
            <button
              type="button"
              className="home-nose-hit"
              aria-label="Toca a Huchín para despertarlo"
              onClick={handleNosePoke}
            />
          )}
        </div>

        {isSneezing && (
          <div key="achis" className="home-bubble home-bubble--achis" role="status">
            ¡ACHÍS!
          </div>
        )}

        {isAwake && (
          <div key={`d-${dialogStep}`} className="home-bubble" role="status">
            {DIALOG_LINES[dialogStep]}
          </div>
        )}
      </div>

      <button
        className="home-start-btn"
        onClick={handleAdvance}
        disabled={!isAwake}
      >
        {buttonLabel}
      </button>

      <span className="home-credit">by Fernando Partal</span>
    </div>
  )
}
