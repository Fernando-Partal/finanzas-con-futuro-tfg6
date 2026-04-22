import { useState, useEffect } from 'react'
import './MapScreen.css'

interface GameNode {
  id: number
  icon: string
  title: string
  // Posiciones en % sobre la imagen Mapa.png — ajusta si no coinciden con los círculos del fondo
  top: string
  left: string
}

// ⚠️ Ajusta estas coordenadas para que coincidan con los círculos de Mapa.png
const GAME_NODES: GameNode[] = [
  { id: 0, icon: '', title: 'Necesidad vs Deseo',  top: '33%',  left: '23.7%' },
  { id: 1, icon: '', title: '¿Cuánto cuesta?',     top: '24.34%', left: '46.4%' },
  { id: 2, icon: '', title: 'Ahorro con Objetivo', top: '37%', left: '66.5%' },
  { id: 3, icon: '', title: 'Comparar Ofertas',   top: '80%', left: '48.2%' },
  { id: 4, icon: '', title: 'El Cambio',           top: '87%', left: '22.2%' },
]

function getGuideMessage(completedCount: number, name: string): string {
  if (completedCount === 0)
    return `¡Pulsa el primer círculo para comenzar tu aventura, ${name}!`
  if (completedCount === 1)
    return '¡Muy bien! ¡Sigue al siguiente punto del camino!'
  if (completedCount < 4)
    return `¡Lo estás haciendo genial, ${name}! ¡Continúa!`
  if (completedCount === 4)
    return '¡Ya casi llegas! ¡Un minijuego más!'
  return `¡Enhorabuena, ${name}! ¡Has completado toda la aventura! 🎉`
}

interface MapScreenProps {
  player: { name: string; character: 'girl' | 'boy' }
  completedGames: number[]
  points: number
  onGameSelect: (gameIndex: number) => void
}

export default function MapScreen({ player, completedGames, points, onGameSelect }: MapScreenProps) {
  const completedCount = completedGames.length
  const charSrc = player.character === 'girl' ? '/Niña.png' : '/Niño.png'
  const fullText = getGuideMessage(completedCount, player.name)

  // Typewriter: se reinicia cada vez que cambia el mensaje
  const [displayed, setDisplayed] = useState('')
  useEffect(() => {
    setDisplayed('')
    let i = 0
    const id = setInterval(() => {
      i++
      setDisplayed(fullText.slice(0, i))
      if (i >= fullText.length) clearInterval(id)
    }, 38)
    return () => clearInterval(id)
  }, [fullText])

  return (
    <div className="map-screen">
      {/* Fondo Mapa.png */}
      <div className="map-bg" />

      {/* Personaje estático + puntos — esquina inferior izquierda */}
      <div className="map-player">
        <div className="map-player-points">
          <span className="map-player-points-label">Puntos</span>
          <span className="map-player-points-value">{points}</span>
        </div>
        <img src={charSrc} alt={player.name} className="map-player-char" />
      </div>

      {/* Nodos de minijuegos */}
      {GAME_NODES.map((node) => {
        const isCompleted = completedGames.includes(node.id)
        const isUnlocked  = node.id === 0 || completedGames.includes(node.id - 1)
        const isNext      = isUnlocked && !isCompleted

        const stateClass = isCompleted
          ? 'map-node--done'
          : isNext
            ? 'map-node--next'
            : 'map-node--locked'

        return (
          <div
            key={node.id}
            className="map-node-wrapper"
            style={{ top: node.top, left: node.left }}
          >
            <button
              className={`map-node ${stateClass}`}
              disabled={!isUnlocked || isCompleted}
              onClick={() => onGameSelect(node.id)}
              aria-label={node.title}
            >
              {isCompleted ? (
                <span className="map-node-check">✓</span>
              ) : isUnlocked ? (
                <>
                  <span className="map-node-num">{node.id + 1}</span>
                  <span className="map-node-ico">{node.icon}</span>
                </>
              ) : (
                <span className="map-node-ico">🔒</span>
              )}
            </button>
          </div>
        )
      })}

      {/* Huchín guía — arriba a la derecha: bocadillo a la izquierda, cerdito a la derecha */}
      <div className="map-guide">
        <div className="map-guide-bubble">
          {/* Ghost: fija el tamaño del bocadillo desde el primer frame */}
          <span className="map-guide-ghost">{fullText}</span>
          {/* Texto animado superpuesto */}
          <span className="map-guide-typed">{displayed}</span>
        </div>
        <img src="/Cerdito.png" alt="Huchín" className="map-guide-cerdito" />
      </div>
    </div>
  )
}
