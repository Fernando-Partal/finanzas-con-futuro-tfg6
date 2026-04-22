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
  { id: 0, icon: '', title: '', top: '34%', left: '23.7%' },
  { id: 1, icon: '🛒', title: '',  top: '24.9%', left: '46.3%' },
  { id: 2, icon: '💸', title: '',    top: '37.6%', left: '66.6%' },
  { id: 3, icon: '🐖', title: '',   top: '80.3%', left: '48.2%' },
  { id: 4, icon: '🏷️', title: '',   top: '87.4%', left: '22.2%' },
]

// Posición del personaje para cada estado de progreso
const CHAR_POSITIONS = [
  { top: '82%', left: '8%'  },  // 0 completados → inicio del camino
  { top: '65%', left: '25%' },  // 1 completado
  { top: '50%', left: '44%' },  // 2 completados
  { top: '35%', left: '61%' },  // 3 completados
  { top: '20%', left: '76%' },  // 4 completados
  { top: '8%',  left: '87%' },  // 5 completados → final
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
  onGameSelect: (gameIndex: number) => void
}

export default function MapScreen({ player, completedGames, onGameSelect }: MapScreenProps) {
  const completedCount = completedGames.length
  const charPos = CHAR_POSITIONS[Math.min(completedCount, CHAR_POSITIONS.length - 1)]
  const charSrc = player.character === 'girl' ? '/Niña.png' : '/Niño.png'

  return (
    <div className="map-screen">
      {/* Fondo Mapa.png */}
      <div className="map-bg" />

      {/* Personaje en el camino */}
      <img
        src={charSrc}
        alt={player.name}
        className="map-character"
        style={{ top: charPos.top, left: charPos.left }}
      />

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
              disabled={!isUnlocked}
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
            <span className="map-node-label">{node.title}</span>
          </div>
        )
      })}

      {/* Huchín guía — arriba a la derecha */}
      <div className="map-guide">
        <div className="map-guide-bubble" key={completedCount}>
          {getGuideMessage(completedCount, player.name)}
        </div>
        <img src="/Cerdito.png" alt="Huchín" className="map-guide-cerdito" />
      </div>
    </div>
  )
}
