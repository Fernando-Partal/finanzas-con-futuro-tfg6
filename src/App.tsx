import { useState } from 'react'
import HomeScreen from './components/HomeScreen'
import IntroScreen from './components/IntroScreen'
import CharacterSelect from './components/CharacterSelect'
import FichaSelect from './components/FichaSelect'
import MapScreen from './components/MapScreen'

type Screen = 'home' | 'intro' | 'character-select' | 'ficha-select' | 'map' | 'minigame'

interface PlayerData {
  name: string
  character: 'girl' | 'boy'
  ficha: 'coche' | 'perro' | 'pato'
}

function App() {
  const [screen, setScreen]            = useState<Screen>('home')
  const [player, setPlayer]            = useState<PlayerData | null>(null)
  const [completedGames, setCompleted] = useState<number[]>([])
  const [currentGame, setCurrentGame]  = useState<number | null>(null)
  const [points, setPoints]            = useState<number>(0)

  if (screen === 'home') {
    return <HomeScreen onStart={() => setScreen('intro')} />
  }

  if (screen === 'intro') {
    return <IntroScreen onContinue={() => setScreen('character-select')} />
  }

  if (screen === 'character-select') {
    return (
      <CharacterSelect
        onConfirm={(name, character) => {
          // Guardamos nombre y personaje; la ficha se elige en el paso siguiente
          setPlayer({ name, character, ficha: 'coche' /* temporal */ })
          setScreen('ficha-select')
        }}
      />
    )
  }

  if (screen === 'ficha-select' && player) {
    return (
      <FichaSelect
        onConfirm={(ficha) => {
          setPlayer({ ...player, ficha })
          setScreen('map')
        }}
      />
    )
  }

  if (screen === 'map' && player) {
    return (
      <MapScreen
        player={player}
        completedGames={completedGames}
        points={points}
        onGameSelect={(gameIndex) => {
          setCurrentGame(gameIndex)
          setScreen('minigame')
        }}
      />
    )
  }

  // Placeholder de minijuego — sustituir por cada minijuego real
  if (screen === 'minigame' && player && currentGame !== null) {
    const gameNames = [
      'Necesidad vs Deseo',
      '¿Cuánto cuesta?',
      'Ahorro con Objetivo',
      'Comparar Ofertas',
      'El Cambio',
    ]

    const handleComplete = () => {
      if (!completedGames.includes(currentGame)) {
        setCompleted((prev) => [...prev, currentGame])
        setPoints((prev) => prev + 100)
      }
      setCurrentGame(null)
      setScreen('map')
    }

    return (
      <div style={{
        minHeight: '100vh',
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        background: 'linear-gradient(160deg, #fffde7 0%, #ffe082 100%)',
        gap: '1.5rem',
        fontFamily: 'system-ui, sans-serif',
        padding: '2rem',
      }}>
        <h2 style={{ color: '#e65100', fontSize: '2.2rem', margin: 0, textAlign: 'center' }}>
          🎮 {gameNames[currentGame]}
        </h2>
        <p style={{ color: '#555', fontSize: '1.2rem', textAlign: 'center' }}>
          Minijuego en construcción...
        </p>
        <div style={{ display: 'flex', gap: '1rem', flexWrap: 'wrap', justifyContent: 'center' }}>
          <button
            onClick={handleComplete}
            style={{
              padding: '0.65em 2em', fontSize: '1.2rem', borderRadius: '60px',
              border: 'none', background: 'linear-gradient(135deg, #2e7d32, #66bb6a)',
              color: '#fff', cursor: 'pointer', fontWeight: 800, boxShadow: '0 5px 0 #1b5e20',
            }}
          >
            ✓ Completar (prueba)
          </button>
          <button
            onClick={() => { setCurrentGame(null); setScreen('map') }}
            style={{
              padding: '0.65em 2em', fontSize: '1.2rem', borderRadius: '60px',
              border: 'none', background: '#ff6f00', color: '#fff',
              cursor: 'pointer', fontWeight: 800, boxShadow: '0 5px 0 #bf360c',
            }}
          >
            ← Volver al mapa
          </button>
        </div>
      </div>
    )
  }

  return null
}

export default App
