import { useState } from 'react'
import './HomeScreen.css'

interface HomeScreenProps {
  onStart: () => void
}

export default function HomeScreen({ onStart }: HomeScreenProps) {
  const [starting, setStarting] = useState(false)

  const handleStart = () => {
    setStarting(true)
    setTimeout(onStart, 600)
  }

  return (
    <div className={`home-screen${starting ? ' home-screen--starting' : ''}`}>
      <h1 className="home-title">¡La Aventura del Ahorro!</h1>

      <div className="home-center">
        <img src="/Niña.png" alt="Niña" className="home-character" />

        <div className="home-cerdito-wrapper">
          <div className="home-bubble">¡Hola, soy Cerdito!</div>
          <img src="/Cerdito.png" alt="Cerdito hucha" className="home-cerdito" />
        </div>

        <img src="/Niño.png" alt="Niño" className="home-character" />
      </div>

      <button className="home-start-btn" onClick={handleStart}>
        ¡Empezar!
      </button>
    </div>
  )
}
