import { useState, useEffect, useRef } from 'react'
import './NecesidadDeseo.css'

interface Item {
  name: string
  img: string
  type: 'necesidad' | 'deseo'
}

const ALL_ITEMS: Item[] = [
  { name: 'Arroz',              img: '/Articulos/Arroz.png',             type: 'necesidad' },
  { name: 'Bicicleta',          img: '/Articulos/Bicicleta.png',         type: 'deseo'     },
  { name: 'Chocolate',          img: '/Articulos/Chocolate.png',         type: 'deseo'     },
  { name: 'Chucherías',         img: '/Articulos/Chucherias.png',        type: 'deseo'     },
  { name: 'Coche teledirigido', img: '/Articulos/CocheTeledirigido.png', type: 'deseo'     },
  { name: 'Cuadernos',          img: '/Articulos/Cuadernos.png',         type: 'necesidad' },
  { name: 'Donuts',             img: '/Articulos/Donuts.png',            type: 'deseo'     },
  { name: 'Filete',             img: '/Articulos/Filete.png',            type: 'necesidad' },
  { name: 'Fruta',              img: '/Articulos/Fruta.png',             type: 'necesidad' },
  { name: 'Leche',              img: '/Articulos/Leche.png',             type: 'necesidad' },
  { name: 'Mando de juego',     img: '/Articulos/MandoPlay.png',         type: 'deseo'     },
  { name: 'Muñeca',             img: '/Articulos/Muñeca.png',            type: 'deseo'     },
  { name: 'Pasta',              img: '/Articulos/Pasta.png',             type: 'necesidad' },
  { name: 'Pescado',            img: '/Articulos/Pescado.png',           type: 'necesidad' },
  { name: 'Refresco',           img: '/Articulos/Refresco.png',          type: 'deseo'     },
  { name: 'Verduras',           img: '/Articulos/Verduras.png',          type: 'necesidad' },
]

const NECESIDAD_ITEMS = ALL_ITEMS.filter(i => i.type === 'necesidad')
const DESEO_ITEMS     = ALL_ITEMS.filter(i => i.type === 'deseo')

// 8 rondas — total necesidades = 3+3+2+2+2+2+2+2 = 18  →  cap en 100 puntos
// Dificultad: primeras rondas más tiempo y más necesidades; últimas más deseos y menos tiempo
const ROUND_CONFIGS = [
  { n: 3, d: 1, ms: 9000 },  // R1 — 4 ítems, 9 s
  { n: 3, d: 2, ms: 8000 },  // R2 — 5 ítems, 8 s
  { n: 2, d: 3, ms: 7000 },  // R3 — 5 ítems, 7 s
  { n: 2, d: 3, ms: 6000 },  // R4 — 5 ítems, 6 s
  { n: 2, d: 3, ms: 5000 },  // R5 — 5 ítems, 5 s
  { n: 2, d: 4, ms: 4000 },  // R6 — 6 ítems, 4 s
  { n: 2, d: 4, ms: 3000 },  // R7 — 6 ítems, 3 s
  { n: 2, d: 4, ms: 2500 },  // R8 — 6 ítems, 2.5 s
] as const

const TOTAL_ROUNDS = ROUND_CONFIGS.length
const PTS_CORRECT  = 6   // tocar una necesidad (18 necesidades × 6 = 108 → cap 100, necesitas ~17/18 para llegar a 100)
const PTS_WRONG    = 5   // tocar un deseo por error

type GamePhase  = 'intro' | 'playing' | 'result'
type RoundPhase = 'active' | 'ended'
type ItemPhase  = 'active' | 'correct' | 'wrong' | 'missed' | 'ignored'

interface ItemState {
  id: string
  data: Item
  phase: ItemPhase
}

interface PointPop {
  id: number
  x: number
  y: number
  value: number
}

interface Props {
  onComplete: (score: number) => void
  onBack: () => void
}

function shuffle<T>(arr: T[]): T[] {
  const a = [...arr]
  for (let i = a.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1))
    ;[a[i], a[j]] = [a[j], a[i]]
  }
  return a
}

export default function NecesidadDeseo({ onComplete, onBack }: Props) {
  const [gamePhase,  setGamePhase]  = useState<GamePhase>('intro')
  const [round,      setRound]      = useState(0)
  const [roundPhase, setRoundPhase] = useState<RoundPhase>('active')
  const [items,      setItems]      = useState<ItemState[]>([])
  const [score,      setScore]      = useState(0)
  const [progress,   setProgress]   = useState(1)
  const [leaving,    setLeaving]    = useState(false)
  const [introSlide,   setIntroSlide]   = useState<1 | 2>(1)
  const [pointPops,    setPointPops]    = useState<PointPop[]>([])
  const [showAnswers,  setShowAnswers]  = useState(false)

  // Refs para pools de ítems — evitan repeticiones entre rondas
  const needPool   = useRef<Item[]>([])
  const wantPool   = useRef<Item[]>([])
  const popCounter = useRef(0)

  // Inicializa los pools al empezar
  useEffect(() => {
    if (gamePhase !== 'playing') return
    needPool.current = shuffle([...NECESIDAD_ITEMS])
    wantPool.current = shuffle([...DESEO_ITEMS])
  }, [gamePhase])

  // Construye los ítems de cada ronda
  useEffect(() => {
    if (gamePhase !== 'playing') return

    const cfg = ROUND_CONFIGS[round]

    if (needPool.current.length < cfg.n) {
      needPool.current = [...needPool.current, ...shuffle([...NECESIDAD_ITEMS])]
    }
    if (wantPool.current.length < cfg.d) {
      wantPool.current = [...wantPool.current, ...shuffle([...DESEO_ITEMS])]
    }

    const picked = shuffle([
      ...needPool.current.splice(0, cfg.n),
      ...wantPool.current.splice(0, cfg.d),
    ])

    setItems(picked.map((item, i) => ({
      id: `r${round}-${i}-${item.name}`,
      data: item,
      phase: 'active',
    })))
    setRoundPhase('active')
    setProgress(1)
  }, [round, gamePhase])

  // Temporizador de ronda con RAF
  useEffect(() => {
    if (gamePhase !== 'playing' || roundPhase !== 'active') return

    const { ms } = ROUND_CONFIGS[round]
    const start  = performance.now()
    let raf: number

    const tick = (now: number) => {
      const remaining = ms - (now - start)
      setProgress(Math.max(0, remaining / ms))
      if (remaining <= 0) {
        setRoundPhase('ended')
        return
      }
      raf = requestAnimationFrame(tick)
    }

    raf = requestAnimationFrame(tick)
    return () => cancelAnimationFrame(raf)
  }, [round, roundPhase, gamePhase])

  // Al terminar la ronda: marcar ítems restantes y avanzar
  useEffect(() => {
    if (roundPhase !== 'ended') return

    setItems(prev => prev.map(item => ({
      ...item,
      phase: item.phase === 'active'
        ? (item.data.type === 'necesidad' ? 'missed' : 'ignored')
        : item.phase,
    })))

    const t = setTimeout(() => {
      const next = round + 1
      if (next >= TOTAL_ROUNDS) {
        setGamePhase('result')
      } else {
        // Batch ambos updates en el mismo render (React 18) para que el efecto
        // de roundPhase==='ended' no se re-ejecute con round=next todavía en 'ended'
        setRoundPhase('active')
        setRound(next)
      }
    }, 1500)

    return () => clearTimeout(t)
  }, [roundPhase, round])

  function handleItemClick(id: string, e: React.MouseEvent) {
    if (roundPhase !== 'active') return
    const item = items.find(i => i.id === id)
    if (!item || item.phase !== 'active') return

    const correct = item.data.type === 'necesidad'
    const delta   = correct ? PTS_CORRECT : -PTS_WRONG

    // Floating indicator at card center (viewport coords)
    const rect  = (e.currentTarget as HTMLElement).getBoundingClientRect()
    const popId = ++popCounter.current
    setPointPops(prev => [...prev, {
      id: popId,
      x: rect.left + rect.width  / 2,
      y: rect.top  + rect.height / 2,
      value: delta,
    }])
    setTimeout(() => setPointPops(prev => prev.filter(p => p.id !== popId)), 900)

    setScore(s => correct
      ? Math.min(s + PTS_CORRECT, 100)
      : Math.max(s - PTS_WRONG, 0)
    )
    setItems(prev => prev.map(i =>
      i.id === id ? { ...i, phase: correct ? 'correct' : 'wrong' } : i
    ))
  }

  function exit(withScore: boolean) {
    setLeaving(true)
    setTimeout(() => withScore ? onComplete(score) : onBack(), 550)
  }

  const timerColor =
    progress > 0.5  ? '#4caf50' :
    progress > 0.25 ? '#fdd835' :
                      '#ef5350'

  const passed = score >= 70

  return (
    <div className={`nd-screen${leaving ? ' nd-screen--leaving' : ''}`}>
      <div className="nd-bg" />
      <div className="nd-overlay" />

      {/* ══════════════════════════════════
          INTRO — Huchín explica el juego
          ══════════════════════════════════ */}
      {gamePhase === 'intro' && (
        <div className="nd-intro">
          <div className="nd-intro-content">
            <div className="nd-intro-bubble" key={introSlide}>
              {introSlide === 1 ? (
                <>
                  <p>¡Bienvenido al primer reto de <strong>La Aventura del Ahorro</strong>!</p>
                  <p>
                    Voy a enseñarte la diferencia entre una <strong>NECESIDAD</strong>{' '}
                    y un <strong>DESEO</strong>.
                  </p>
                  <p>
                    Las <strong>necesidades</strong> son cosas que nos hacen falta para vivir:
                    comida, ropa, libros… Los <strong>deseos</strong> son cosas que nos gustan,
                    ¡pero podemos vivir sin ellas!
                  </p>
                </>
              ) : (
                <>
                  <p>¡En cada ronda verás objetos mezclados!</p>
                  <p>
                    Toca solo los que sean una <strong>NECESIDAD</strong>{' '}
                    antes de que se acabe el tiempo.
                  </p>
                  <p>
                    Si tocas un <strong>deseo</strong> por error, ¡perderás puntos!
                    Cada ronda es más rápida, ¡así que ojo!
                  </p>
                </>
              )}
            </div>
            <img src="/Cerdito.png" alt="Huchín" className="nd-intro-huchin" />
          </div>
          {introSlide === 1 ? (
            <button
              className="nd-btn nd-btn--continue"
              onClick={() => setIntroSlide(2)}
            >
              Continuar →
            </button>
          ) : (
            <button
              className="nd-btn nd-btn--continue"
              onClick={() => setGamePhase('playing')}
            >
              ¡Entendido! ¡Jugar!
            </button>
          )}
        </div>
      )}

      {/* ══════════════════════════════════
          GAMEPLAY
          ══════════════════════════════════ */}
      {gamePhase === 'playing' && (
        <>
          <header className="nd-header">
            <div className="nd-score-badge">
              {score} <span className="nd-score-label">pts</span>
            </div>
            <div className="nd-round-label">
              Ronda {round + 1} / {TOTAL_ROUNDS}
            </div>
            <button
              className="nd-exit-btn"
              onClick={() => exit(false)}
              aria-label="Salir"
            >
              ✕
            </button>
          </header>

          <div className="nd-play-area">
            <div
              className={`nd-countdown${progress < 0.25 ? ' nd-countdown--urgent' : ''}`}
              style={{ color: timerColor, borderColor: timerColor }}
            >
              {Math.ceil(progress * ROUND_CONFIGS[round].ms / 1000)}
            </div>
            <p className="nd-hint">Toca las NECESIDADES</p>
            <div className="nd-items-grid">
              {items.map(item => (
                <div
                  key={item.id}
                  className={`nd-item-card nd-item-card--${item.phase}`}
                  onClick={(e) => handleItemClick(item.id, e)}
                >
                  <img
                    src={item.data.img}
                    alt={item.data.name}
                    className="nd-item-img"
                  />
                  <span className="nd-item-name">{item.data.name}</span>
                </div>
              ))}
            </div>
          </div>
        </>
      )}

      {/* Floating point indicators */}
      {pointPops.map(pop => (
        <div
          key={pop.id}
          className={`nd-point-pop nd-point-pop--${pop.value > 0 ? 'correct' : 'wrong'}`}
          style={{ left: pop.x, top: pop.y }}
        >
          {pop.value > 0 ? `+${pop.value}` : pop.value}
        </div>
      ))}

      {/* ══════════════════════════════════
          RESULTADO
          ══════════════════════════════════ */}
      {gamePhase === 'result' && (
        <div className="nd-result">
          <div className="nd-result-huchin-wrap">
            <div className={`nd-result-bubble${passed ? ' nd-result-bubble--pass' : ' nd-result-bubble--fail'}`}>
              {passed
                ? '¡Muy bien! ¡Lo has conseguido!'
                : '¡Casi! Inténtalo otra vez.'}
            </div>
            <img src="/Cerdito.png" alt="Huchín" className="nd-result-huchin" />
          </div>

          <div className={`nd-result-score${passed ? ' nd-result-score--pass' : ' nd-result-score--fail'}`}>
            {score} pts
          </div>

          <p className="nd-result-sub">
            {passed
              ? '¡Has desbloqueado el siguiente nivel!'
              : 'Necesitas 70 puntos para avanzar al siguiente nivel.'}
          </p>

          <div className="nd-result-actions">
            {passed ? (
              <>
                <button className="nd-btn nd-btn--answers" onClick={() => setShowAnswers(true)}>
                  Ver respuestas
                </button>
                <button className="nd-btn nd-btn--continue" onClick={() => exit(true)}>
                  ¡Continuar!
                </button>
              </>
            ) : (
              <button className="nd-btn nd-btn--retry" onClick={() => exit(false)}>
                ¡Intentar de nuevo!
              </button>
            )}
          </div>
        </div>
      )}

      {/* ══════════════════════════════════
          PANTALLA DE RESPUESTAS
          ══════════════════════════════════ */}
      {showAnswers && (
        <div className="nd-answers">
          <p className="nd-answers-title">¿Qué es cada cosa?</p>
          <div className="nd-result-items">
            <div className="nd-result-items-col">
              <span className="nd-result-items-title nd-result-items-title--need">✅ Necesidades</span>
              {NECESIDAD_ITEMS.map(item => (
                <div key={item.name} className="nd-result-item-mini">
                  <img src={item.img} alt={item.name} />
                  <span>{item.name}</span>
                </div>
              ))}
            </div>
            <div className="nd-result-items-col">
              <span className="nd-result-items-title nd-result-items-title--want">❌ Deseos</span>
              {DESEO_ITEMS.map(item => (
                <div key={item.name} className="nd-result-item-mini">
                  <img src={item.img} alt={item.name} />
                  <span>{item.name}</span>
                </div>
              ))}
            </div>
          </div>
          <button className="nd-btn nd-btn--map" onClick={() => setShowAnswers(false)}>
            ← Volver
          </button>
        </div>
      )}
    </div>
  )
}
