import { useState } from 'react'
import HomeScreen from './components/HomeScreen'

type Screen = 'home' | 'game'

function App() {
  const [screen, setScreen] = useState<Screen>('home')

  if (screen === 'home') {
    return <HomeScreen onStart={() => setScreen('game')} />
  }

  return (
    <div style={{ minHeight: '100vh', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', background: '#fffde7', gap: '1rem' }}>
      <h2 style={{ color: '#e65100', fontSize: '2rem' }}>¡El juego empieza pronto! 🎮</h2>
      <button
        onClick={() => setScreen('home')}
        style={{ padding: '0.6em 1.8em', fontSize: '1.1rem', borderRadius: '40px', border: 'none', background: '#ff6f00', color: '#fff', cursor: 'pointer', fontWeight: 700 }}
      >
        ← Volver
      </button>
    </div>
  )
}

export default App
