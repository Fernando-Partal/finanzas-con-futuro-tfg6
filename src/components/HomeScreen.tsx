import { useState } from 'react'
import './HomeScreen.css'

interface HomeScreenProps {
  onStart: () => void
}

export default function HomeScreen({ onStart }: HomeScreenProps) {
  const [met, setMet] = useState(false)
  const [leaving, setLeaving] = useState(false)

  const handleCerditoClick = () => {
    if (!met) setMet(true)
  }

  const handleStart = () => {
    setLeaving(true)
    setTimeout(onStart, 550)
  }

  return (
    <div className={`home-screen${leaving ? ' home-screen--leaving' : ''}`}>
      <h1 className="home-title">¡La Aventura del Ahorro!</h1>

      <div className="home-center">
        <div className="home-cerdito-wrapper">
          {met && (
            <div className="home-bubble">
              ¡Hola! Soy Huchín y voy a ser tu guía en esta aventura ¿Estás preparado?
            </div>
          )}
          <img
            src="/Cerdito.png"
            alt="Cerdito hucha — haz clic para presentarte"
            className={`home-cerdito${met ? '' : ' home-cerdito--idle'}`}
            onClick={handleCerditoClick}
          />
        </div>
      </div>

      <button
        className="home-start-btn"
        onClick={handleStart}
        disabled={!met}
      >
        ¡Empezar!
      </button>
    </div>
  )
}
