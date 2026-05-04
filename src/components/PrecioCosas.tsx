import { useState, useEffect, useRef } from 'react'
import './PrecioCosas.css'

interface Article {
  name: string
  img: string
  price: string
}

// 5 rondas × 4 artículos — precios bien diferenciados dentro de cada ronda
const ROUNDS: Article[][] = [
  [
    { name: 'Chucherías',         img: '/Articulos/Chucherias.png',        price: '0,50 €' },
    { name: 'Arroz',              img: '/Articulos/Arroz.png',             price: '1,20 €' },
    { name: 'Cuadernos',          img: '/Articulos/Cuadernos.png',         price: '3,50 €' },
    { name: 'Muñeca',             img: '/Articulos/Muñeca.png',            price: '22,00 €' },
  ],
  [
    { name: 'Leche',              img: '/Articulos/Leche.png',             price: '0,90 €' },
    { name: 'Verduras',           img: '/Articulos/Verduras.png',          price: '2,00 €' },
    { name: 'Filete',             img: '/Articulos/Filete.png',            price: '8,50 €' },
    { name: 'Coche teledirigido', img: '/Articulos/CocheTeledirigido.png', price: '35,00 €' },
  ],
  [
    { name: 'Pasta',              img: '/Articulos/Pasta.png',             price: '1,10 €' },
    { name: 'Fruta',              img: '/Articulos/Fruta.png',             price: '2,80 €' },
    { name: 'Pescado',            img: '/Articulos/Pescado.png',           price: '7,50 €' },
    { name: 'Mando de juego',     img: '/Articulos/MandoPlay.png',         price: '60,00 €' },
  ],
  [
    { name: 'Chucherías',         img: '/Articulos/Chucherias.png',        price: '0,50 €' },
    { name: 'Chocolate',          img: '/Articulos/Chocolate.png',         price: '4,00 €' },
    { name: 'Muñeca',             img: '/Articulos/Muñeca.png',            price: '22,00 €' },
    { name: 'Bicicleta',          img: '/Articulos/Bicicleta.png',         price: '90,00 €' },
  ],
  [
    { name: 'Leche',              img: '/Articulos/Leche.png',             price: '0,90 €' },
    { name: 'Donuts',             img: '/Articulos/Donuts.png',            price: '2,20 €' },
    { name: 'Pescado',            img: '/Articulos/Pescado.png',           price: '7,50 €' },
    { name: 'Coche teledirigido', img: '/Articulos/CocheTeledirigido.png', price: '35,00 €' },
  ],
]

const TOTAL_ROUNDS    = ROUNDS.length
const PTS_PER_CORRECT = 5  // 5 pts × 20 posibles = 100 máx

type GamePhase  = 'intro' | 'playing' | 'result'
type RoundPhase = 'placing' | 'revealing'

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

export default function PrecioCosas({ onComplete, onBack }: Props) {
  const [gamePhase,      setGamePhase]      = useState<GamePhase>('intro')
  const [introSlide,     setIntroSlide]     = useState<1 | 2>(1)
  const [round,          setRound]          = useState(0)
  const [roundPhase,     setRoundPhase]     = useState<RoundPhase>('placing')
  const [placements,     setPlacements]     = useState<(string | null)[]>([null, null, null, null])
  const [shuffledPrices, setShuffledPrices] = useState<string[]>([])
  const [correctness,    setCorrectness]    = useState<(boolean | null)[]>([null, null, null, null])
  const [dragOverCard,   setDragOverCard]   = useState<number | null>(null)
  const [score,          setScore]          = useState(0)
  const [leaving,        setLeaving]        = useState(false)

  // Almacena info del drag en curso; useRef evita stale closures
  const dragInfo = useRef<{ price: string; from: 'bank' | number } | null>(null)

  // Inicializa cada ronda: mezcla precios, resetea colocaciones
  useEffect(() => {
    if (gamePhase !== 'playing') return
    const prices = ROUNDS[round].map(a => a.price)
    setShuffledPrices(shuffle(prices))
    setPlacements([null, null, null, null])
    setCorrectness([null, null, null, null])
    setRoundPhase('placing')
  }, [round, gamePhase])

  function handleDropOnCard(cardIdx: number) {
    if (roundPhase !== 'placing') return
    const info = dragInfo.current
    if (!info) return
    setDragOverCard(null)

    // Soltar sobre la misma tarjeta de origen → sin cambio
    if (info.from === cardIdx) {
      dragInfo.current = null
      return
    }

    setPlacements(prev => {
      const next = [...prev]
      if (typeof info.from === 'number') {
        // Viene de otra tarjeta → intercambiar
        next[info.from] = prev[cardIdx]
      }
      next[cardIdx] = info.price
      return next
    })
    dragInfo.current = null
  }

  function handleDropOnBank() {
    if (roundPhase !== 'placing') return
    const info = dragInfo.current
    if (!info || info.from === 'bank') {
      dragInfo.current = null
      return
    }
    setPlacements(prev => {
      const next = [...prev]
      next[info.from as number] = null
      return next
    })
    dragInfo.current = null
  }

  function handleValidate() {
    if (roundPhase !== 'placing') return
    const articles = ROUNDS[round]
    const newCorrectness = placements.map((placed, i) => placed === articles[i].price)
    const correctCount   = newCorrectness.filter(Boolean).length

    setScore(s => Math.min(s + correctCount * PTS_PER_CORRECT, 100))
    setCorrectness(newCorrectness)
    setRoundPhase('revealing')

    setTimeout(() => {
      const next = round + 1
      if (next >= TOTAL_ROUNDS) {
        setGamePhase('result')
      } else {
        setRound(next)
      }
    }, 2500)
  }

  function exit(withScore: boolean) {
    setLeaving(true)
    setTimeout(() => (withScore ? onComplete(score) : onBack()), 550)
  }

  const allPlaced  = placements.every(p => p !== null)
  const bankLabels = shuffledPrices.filter(p => !placements.includes(p))
  const passed     = score >= 70

  return (
    <div className={`pc-screen${leaving ? ' pc-screen--leaving' : ''}`}>
      <div className="pc-bg" />
      <div className="pc-overlay" />

      {/* ══════════════════════════════════
          INTRO — Huchín explica
          ══════════════════════════════════ */}
      {gamePhase === 'intro' && (
        <div className="pc-intro">
          <div className="pc-intro-content">
            <div className="pc-intro-bubble" key={introSlide}>
              {introSlide === 1 ? (
                <>
                  <p>¡Bienvenido al segundo reto de <strong>La Aventura del Ahorro</strong>!</p>
                  <p>¿Sabes cuánto cuestan las cosas que compramos?</p>
                  <p>¡Vamos a comprobarlo!</p>
                </>
              ) : (
                <>
                  <p>En cada ronda verás <strong>4 artículos</strong>.</p>
                  <p>
                    Abajo tendrás sus <strong>precios mezclados</strong>.
                    ¡Arrástralos hasta el artículo correcto!
                  </p>
                  <p>
                    Cuando los hayas colocado todos, pulsa <strong>¡Validar!</strong>
                  </p>
                </>
              )}
            </div>
            <img src="/Cerdito.png" alt="Huchín" className="pc-intro-huchin" />
          </div>
          {introSlide === 1 ? (
            <button className="pc-btn pc-btn--continue" onClick={() => setIntroSlide(2)}>
              Continuar →
            </button>
          ) : (
            <button className="pc-btn pc-btn--continue" onClick={() => setGamePhase('playing')}>
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
          <header className="pc-header">
            <div className="pc-score-badge">
              {score} <span className="pc-score-label">pts</span>
            </div>
            <div className="pc-round-label">Ronda {round + 1} / {TOTAL_ROUNDS}</div>
          </header>

          <div className="pc-play-area">
            <p className="pc-hint">Arrastra el precio correcto a cada artículo</p>

            {/* Tarjetas de artículos (2 × 2) */}
            <div className="pc-cards-grid">
              {ROUNDS[round].map((article, i) => {
                const placed    = placements[i]
                const result    = correctness[i]
                const isDragOver = dragOverCard === i && roundPhase === 'placing'
                return (
                  <div
                    key={`${round}-${i}`}
                    className={[
                      'pc-card',
                      result === true  ? 'pc-card--correct' : '',
                      result === false ? 'pc-card--wrong'   : '',
                      isDragOver       ? 'pc-card--dragover' : '',
                    ].filter(Boolean).join(' ')}
                    onDragOver={(e) => { e.preventDefault(); setDragOverCard(i) }}
                    onDragLeave={() => setDragOverCard(null)}
                    onDrop={() => handleDropOnCard(i)}
                  >
                    <img src={article.img} alt={article.name} className="pc-card-img" />
                    <span className="pc-card-name">{article.name}</span>

                    {/* Ranura de precio */}
                    <div className={`pc-card-slot${placed ? ' pc-card-slot--filled' : ' pc-card-slot--empty'}`}>
                      {placed ? (
                        <span
                          className="pc-price-chip pc-price-chip--placed"
                          draggable={roundPhase === 'placing'}
                          onDragStart={(e) => {
                            e.stopPropagation()
                            dragInfo.current = { price: placed, from: i }
                          }}
                        >
                          {placed}
                        </span>
                      ) : (
                        <span className="pc-slot-placeholder">?</span>
                      )}
                    </div>

                    {result === true  && <span className="pc-card-badge pc-card-badge--ok">✓</span>}
                    {result === false && <span className="pc-card-badge pc-card-badge--no">✗</span>}
                  </div>
                )
              })}
            </div>

            {/* Banco de etiquetas de precio */}
            <div
              className="pc-bank"
              onDragOver={(e) => e.preventDefault()}
              onDrop={handleDropOnBank}
            >
              {bankLabels.map(price => (
                <span
                  key={price}
                  className="pc-price-chip pc-price-chip--bank"
                  draggable
                  onDragStart={() => { dragInfo.current = { price, from: 'bank' } }}
                >
                  {price}
                </span>
              ))}
              {/* Mantiene altura mínima cuando el banco está vacío */}
              {bankLabels.length === 0 && (
                <span className="pc-bank-empty">¡Todos colocados!</span>
              )}
            </div>

            <button
              className="pc-btn pc-btn--validate"
              onClick={handleValidate}
              disabled={!allPlaced || roundPhase === 'revealing'}
            >
              ¡Validar!
            </button>
          </div>
        </>
      )}

      {/* ══════════════════════════════════
          RESULTADO
          ══════════════════════════════════ */}
      {gamePhase === 'result' && (
        <div className="pc-result">
          <div className="pc-result-huchin-wrap">
            <div className={`pc-result-bubble${passed ? ' pc-result-bubble--pass' : ' pc-result-bubble--fail'}`}>
              {passed
                ? '¡Muy bien! ¡Conoces los precios!'
                : '¡Casi! Los precios son difíciles, ¡inténtalo otra vez!'}
            </div>
            <img src="/Cerdito.png" alt="Huchín" className="pc-result-huchin" />
          </div>

          <div className={`pc-result-score${passed ? ' pc-result-score--pass' : ' pc-result-score--fail'}`}>
            {score} pts
          </div>

          <p className="pc-result-sub">
            {passed
              ? '¡Has desbloqueado el siguiente nivel!'
              : 'Necesitas 70 puntos para avanzar al siguiente nivel.'}
          </p>

          <div className="pc-result-actions">
            {passed ? (
              <button className="pc-btn pc-btn--continue" onClick={() => exit(true)}>
                ¡Continuar!
              </button>
            ) : (
              <button className="pc-btn pc-btn--retry" onClick={() => exit(false)}>
                ¡Intentar de nuevo!
              </button>
            )}
          </div>
        </div>
      )}
    </div>
  )
}
