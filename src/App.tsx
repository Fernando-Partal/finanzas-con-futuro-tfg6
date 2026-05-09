import { useState } from 'react'
import HomeScreen from './components/HomeScreen'
import CharacterSelect from './components/CharacterSelect'
import FichaSelect from './components/FichaSelect'
import MapScreen from './components/MapScreen'
import NecesidadDeseo from './components/NecesidadDeseo'
import PrecioCosas from './components/PrecioCosas'
import AhorroObjetivo from './components/AhorroObjetivo'
import CompararOfertas from './components/CompararOfertas'
import ElCambio from './components/ElCambio'
import FinalScreen from './components/FinalScreen'

type Screen = 'home' | 'character-select' | 'ficha-select' | 'map' | 'minigame' | 'final'

interface PlayerData {
  name: string
  character: 'girl' | 'boy'
  ficha: 'coche' | 'perro' | 'pato'
}

// =============================================================================
// DEBUG — pon `enabled: true` y edita los campos para saltar a cualquier estado
//
// Presets de ejemplo (copia uno en los campos de abajo):
//
//   Mapa vacío (solo nodo 0 activo):
//     screen: 'map', completedGames: [], currentGame: null, points: 0
//
//   Mapa con primeros 3 completados:
//     screen: 'map', completedGames: [0, 1, 2], currentGame: null, points: 300
//
//   Ir directo al minijuego 0 (Necesidad vs Deseo):
//     screen: 'minigame', currentGame: 0
//
//   Ir directo al minijuego 1 (¿Cuánto cuesta?):
//     screen: 'minigame', currentGame: 1
//
//   Ir directo al minijuego 2 (Ahorro con Objetivo):
//     screen: 'minigame', currentGame: 2
//
//   Ir directo al minijuego 4 (El Cajero — para probar la transición a la final):
//     screen: 'minigame', currentGame: 4, completedGames: [0, 1, 2, 3], points: 380
//
//   Pantalla final directa (con todos los minijuegos completados):
//     screen: 'final', currentGame: null, completedGames: [0, 1, 2, 3, 4], points: 480
// =============================================================================
const DEBUG = {
  enabled: false,

  screen:         'final'           as Screen,
  currentGame:    null              as number | null,
  completedGames: [0, 1, 2, 3, 4]   as number[],
  points:         480,
  player: {
    name:      'Tester',
    character: 'boy'   as const,
    ficha:     'perro' as const,
  },
}
// =============================================================================

const D = DEBUG.enabled ? DEBUG : null

function App() {
  const [screen, setScreen]            = useState<Screen>(D?.screen ?? 'home')
  const [player, setPlayer]            = useState<PlayerData | null>(D?.player ?? null)
  const [completedGames, setCompleted] = useState<number[]>(D?.completedGames ?? [])
  const [currentGame, setCurrentGame]  = useState<number | null>(D?.currentGame ?? null)
  const [points, setPoints]            = useState<number>(D?.points ?? 0)

  if (screen === 'home') {
    return <HomeScreen onStart={() => setScreen('character-select')} />
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

  if (screen === 'final' && player) {
    return (
      <FinalScreen
        points={points}
        playerName={player.name}
        onRestart={() => {
          setPlayer(null)
          setCompleted([])
          setCurrentGame(null)
          setPoints(0)
          setScreen('home')
        }}
      />
    )
  }

  if (screen === 'minigame' && player && currentGame !== null) {
    const handleComplete = (score: number) => {
      const passScore = currentGame === 2 ? 50 : 70
      const passed = score >= passScore

      if (passed && !completedGames.includes(currentGame)) {
        setCompleted((prev) => [...prev, currentGame])
        setPoints((prev) => prev + score)
      }
      setCurrentGame(null)
      setScreen(passed && currentGame === 4 ? 'final' : 'map')
    }

    const handleBack = () => {
      setCurrentGame(null)
      setScreen('map')
    }

    if (currentGame === 0) {
      return <NecesidadDeseo onComplete={handleComplete} onBack={handleBack} />
    }

    if (currentGame === 1) {
      return <PrecioCosas onComplete={handleComplete} onBack={handleBack} />
    }

    if (currentGame === 2) {
      return <AhorroObjetivo onComplete={handleComplete} onBack={handleBack} />
    }

    if (currentGame === 3) {
      return <CompararOfertas onComplete={handleComplete} onBack={handleBack} />
    }

    if (currentGame === 4) {
      return <ElCambio onComplete={handleComplete} onBack={handleBack} />
    }
  }

  return null
}

export default App
