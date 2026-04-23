import { useState, useEffect } from 'react'
import './MapScreen.css'

// Pon a false cuando hayas ajustado los waypoints
const DEBUG_WAYPOINTS = false

interface GameNode {
  id: number
  icon: string
  title: string
  top: string
  left: string
}

// ⚠️ Posiciones de los botones circulares sobre Mapa.png
const GAME_NODES: GameNode[] = [
  { id: 0, icon: '', title: 'Necesidad vs Deseo',  top: '33%',    left: '23.7%' },
  { id: 1, icon: '', title: '¿Cuánto cuesta?',     top: '24.34%', left: '46.4%'  },
  { id: 2, icon: '', title: 'Ahorro con Objetivo', top: '37%',    left: '66.5%'  },
  { id: 3, icon: '', title: 'Comparar Ofertas',    top: '80%',    left: '48.2%'  },
  { id: 4, icon: '', title: 'El Cambio',           top: '87%',    left: '22.2%'  },
]

// ⚠️ Camino completo de la ficha, definido libremente.
//    PATH_SEGMENTS[N] = todos los puntos que recorre la ficha al ir del estado N al estado N+1.
//      - El PRIMER punto es donde arranca (o donde ya está la ficha al inicio del tramo).
//      - El ÚLTIMO punto es donde se detiene al llegar al siguiente nodo.
//    PATH_SEGMENTS[0][0] es también la posición inicial de la ficha al entrar al mapa.
//    Añade o quita puntos intermedios libremente para seguir el trazo del camino.
const PATH_SEGMENTS: { top: string; left: string }[][] = [
  // Tramo 0: posición inicial → nodo 1
  [
    { top: '31%',    left: '11%' },
    { top: '44%',    left: '11%' },
    { top: '52%',    left: '22%' },
    { top: '43%',    left: '23.7%' },
  ],
  [
    { top: '43%',    left: '23.7%' },
    { top: '40.6%',    left: '34%'   },
    { top: '34%',    left: '42.7%'   },
  ],
  // Tramo 1: nodo 1 → nodo 2
  [
    { top: '24.34%', left: '52%' },
    { top: '24.34%', left: '52%' },
    { top: '27%',    left: '57%'   },
    { top: '32%',    left: '62.1%'   },
  ],
  // Tramo 2: nodo 2 → nodo 3
  [
    { top: '46%', left: '68.5%' },
    { top: '46%', left: '68.5%' },
    { top: '55%', left: '71%'   },
    { top: '65%', left: '68%'   },
    { top: '68%', left: '59.9%'   },
    { top: '74%', left: '53%'   },
  ],
  // Tramo 3: nodo 3 → nodo 4
  [
    { top: '78%', left: '42.2%' },
    { top: '78%', left: '42.2%' },
    { top: '75.5%', left: '35%'   },
    { top: '87%', left: '28.2%' },
  ],
]

const STEP_MS = 900  // ms por waypoint

// Posición de reposo de la ficha según cuántos juegos se han completado
// completedCount=0 → casa (inicio), completedCount=N → final del segmento N-1
function getRestPos(completedCount: number) {
  if (completedCount === 0) return PATH_SEGMENTS[0][0]
  const seg = PATH_SEGMENTS[completedCount - 1]
  return seg[seg.length - 1]
}

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

const FICHA_SRCS: Record<'coche' | 'perro' | 'pato', string> = {
  coche: '/FichaCoche.png',
  perro: '/FichaPerro.png',
  pato:  '/FichaPato.png',
}

interface MapScreenProps {
  player: { name: string; character: 'girl' | 'boy'; ficha: 'coche' | 'perro' | 'pato' }
  completedGames: number[]
  points: number
  onGameSelect: (gameIndex: number) => void
}

export default function MapScreen({ player, completedGames, points, onGameSelect }: MapScreenProps) {
  const completedCount = completedGames.length
  const charSrc = player.character === 'girl' ? '/Niña.png' : '/Niño.png'
  const fullText = getGuideMessage(completedCount, player.name)

  const [fichaPos, setFichaPos] = useState(getRestPos(completedCount))
  const [animating, setAnimating] = useState(false)

  const animateSteps = (steps: { top: string; left: string }[], onDone: () => void) => {
    if (steps.length === 0) { onDone(); return }
    const [next, ...rest] = steps
    setFichaPos(next)
    setTimeout(() => animateSteps(rest, onDone), STEP_MS)
  }

  const handleNodeClick = (gameIndex: number) => {
    if (animating) return
    setAnimating(true)
    // PATH_SEGMENTS[gameIndex] va de la posición actual al nodo gameIndex
    // slice(1) porque la ficha ya está en el primer punto del segmento
    const segment = (PATH_SEGMENTS[gameIndex] ?? []).slice(1)
    animateSteps(segment, () => {
      setAnimating(false)
      onGameSelect(gameIndex)
    })
  }

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
      <div className="map-bg" />

      {/* Debug: puntos rojos = todos los waypoints de PATH_SEGMENTS, azules = GAME_NODES */}
      {DEBUG_WAYPOINTS && <>
        {PATH_SEGMENTS.flat().map((p, i) => (
          <div key={`wp-${i}`} style={{
            position: 'absolute', top: p.top, left: p.left,
            width: 14, height: 14, borderRadius: '50%',
            background: 'red', border: '2px solid #fff',
            transform: 'translate(-50%,-50%)', zIndex: 99,
            pointerEvents: 'none',
          }} />
        ))}
        {GAME_NODES.map((n) => (
          <div key={`nd-${n.id}`} style={{
            position: 'absolute', top: n.top, left: n.left,
            width: 14, height: 14, borderRadius: '50%',
            background: 'blue', border: '2px solid #fff',
            transform: 'translate(-50%,-50%)', zIndex: 99,
            pointerEvents: 'none',
          }} />
        ))}
      </>}

      {/* Ficha que recorre el camino */}
      <img
        src={FICHA_SRCS[player.ficha]}
        alt="ficha"
        className={`map-ficha${animating ? ' map-ficha--moving' : ''}`}
        style={{ top: fichaPos.top, left: fichaPos.left }}
      />

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
              disabled={!isUnlocked || isCompleted || animating}
              onClick={() => handleNodeClick(node.id)}
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
          <span className="map-guide-ghost">{fullText}</span>
          <span className="map-guide-typed">{displayed}</span>
        </div>
        <img src="/Cerdito.png" alt="Huchín" className="map-guide-cerdito" />
      </div>
    </div>
  )
}
