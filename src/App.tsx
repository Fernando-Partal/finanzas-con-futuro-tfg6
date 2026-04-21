import { useState } from 'react'
import HomeScreen from './components/HomeScreen'
import IntroScreen from './components/IntroScreen'
import CharacterSelect from './components/CharacterSelect'

type Screen = 'home' | 'intro' | 'character-select' | 'game'

interface PlayerData {
  name: string
  character: 'girl' | 'boy'
}

function App() {
  const [screen, setScreen] = useState<Screen>('home')
  const [player, setPlayer] = useState<PlayerData | null>(null)

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
          setPlayer({ name, character })
          setScreen('game')
        }}
      />
    )
  }

  // Placeholder — aquí irá el mapa/juego
  return (
    <div style={{
      minHeight: '100vh',
      display: 'flex',
      flexDirection: 'column',
      alignItems: 'center',
      justifyContent: 'center',
      background: 'linear-gradient(160deg, #fffde7 0%, #ffe082 100%)',
      gap: '1rem',
      fontFamily: 'system-ui, sans-serif',
    }}>
      <h2 style={{ color: '#e65100', fontSize: '2rem', margin: 0 }}>
        ¡Hola, {player?.name}! 🎮
      </h2>
      <p style={{ color: '#555', fontSize: '1.2rem' }}>El mapa de aventuras llegará pronto...</p>
      <button
        onClick={() => setScreen('home')}
        style={{ padding: '0.6em 1.8em', fontSize: '1.1rem', borderRadius: '40px', border: 'none', background: '#ff6f00', color: '#fff', cursor: 'pointer', fontWeight: 700 }}
      >
        ← Volver al inicio
      </button>
    </div>
  )
}

export default App
