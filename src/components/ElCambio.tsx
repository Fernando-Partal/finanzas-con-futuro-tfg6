import { useState } from 'react'
import Calculator from './Calculator'
import './ElCambio.css'

interface Props {
  onComplete: (score: number) => void
  onBack: () => void
}

type GamePhase = 'intro' | 'playing' | 'result'
type RoundPhase = 'waiting' | 'feedback'

interface Denomination {
  valueCents: number
  label: string
  img: string
  isBill: boolean
}

interface RoundData {
  productName: string
  productImg: string
  priceCents: number
  paymentCents: number
  paymentImg: string
  paymentLabel: string
  points: number
  optimalCount: number
}

const DENOMINATIONS: Denomination[] = [
  { valueCents: 1,    label: '1 c',  img: '/Dinero/1centimo.png',   isBill: false },
  { valueCents: 2,    label: '2 c',  img: '/Dinero/2centimos.png',  isBill: false },
  { valueCents: 5,    label: '5 c',  img: '/Dinero/5centimos.png',  isBill: false },
  { valueCents: 10,   label: '10 c', img: '/Dinero/10centimos.png', isBill: false },
  { valueCents: 20,   label: '20 c', img: '/Dinero/20centimos.png', isBill: false },
  { valueCents: 50,   label: '50 c', img: '/Dinero/50centimos.png', isBill: false },
  { valueCents: 100,  label: '1 €',  img: '/Dinero/1euro.png',      isBill: false },
  { valueCents: 200,  label: '2 €',  img: '/Dinero/2%20euros.png',  isBill: false },
  { valueCents: 500,  label: '5 €',  img: '/Dinero/5euros.png',     isBill: true  },
  { valueCents: 1000, label: '10 €', img: '/Dinero/10euros.png',    isBill: true  },
  { valueCents: 2000, label: '20 €', img: '/Dinero/20euros.png',    isBill: true  },
]

const ROUNDS: RoundData[] = [
  {
    productName:  'Pan',
    productImg:   '/Articulos/Pan.png',
    priceCents:   76,
    paymentCents: 100,
    paymentImg:   '/Dinero/1euro.png',
    paymentLabel: '1 €',
    points:       20,
    optimalCount: 3, // 20c + 2c + 2c = 24c
  },
  {
    productName:  'Paquete de Arroz',
    productImg:   '/Articulos/Arroz.png',
    priceCents:   147,
    paymentCents: 200,
    paymentImg:   '/Dinero/2%20euros.png',
    paymentLabel: '2 €',
    points:       20,
    optimalCount: 3, // 50c + 2c + 1c = 53c
  },
  {
    productName:  'Tableta de Chocolate',
    productImg:   '/Articulos/Chocolate.png',
    priceCents:   368,
    paymentCents: 500,
    paymentImg:   '/Dinero/5euros.png',
    paymentLabel: '5 €',
    points:       20,
    optimalCount: 4, // 1€ + 20c + 10c + 2c = 132c
  },
  {
    productName:  'Auriculares',
    productImg:   '/Articulos/Auriculares.png',
    priceCents:   849,
    paymentCents: 1000,
    paymentImg:   '/Dinero/10euros.png',
    paymentLabel: '10 €',
    points:       20,
    optimalCount: 3, // 1€ + 50c + 1c = 151c
  },
  {
    productName:  'Mochila Escolar',
    productImg:   '/Articulos/Mochila%20Escolar.png',
    priceCents:   1429,
    paymentCents: 2000,
    paymentImg:   '/Dinero/20euros.png',
    paymentLabel: '20 €',
    points:       20,
    optimalCount: 4, // 5€ + 50c + 20c + 1c = 571c
  },
]

function formatEuros(cents: number): string {
  return (cents / 100).toFixed(2).replace('.', ',') + ' €'
}

const PASS_SCORE   = 70
const MAX_SCORE    = 150
const BONUS_POINTS = 10
const TOTAL_ROUNDS = ROUNDS.length

export default function ElCambio({ onComplete, onBack }: Props) {
  const [gamePhase,   setGamePhase]   = useState<GamePhase>('intro')
  const [introSlide,  setIntroSlide]  = useState<1 | 2>(1)
  const [round,       setRound]       = useState(0)
  const [counts,      setCounts]      = useState<number[]>(DENOMINATIONS.map(() => 0))
  const [roundPhase,  setRoundPhase]  = useState<RoundPhase>('waiting')
  const [lastCorrect, setLastCorrect] = useState<boolean | null>(null)
  const [lastOptimal, setLastOptimal] = useState<boolean>(false)
  const [score,       setScore]       = useState(0)
  const [leaving,     setLeaving]     = useState(false)

  const currentRound  = ROUNDS[round]
  const changeCents   = currentRound.paymentCents - currentRound.priceCents
  const totalSelected = counts.reduce(
    (sum, count, i) => sum + count * DENOMINATIONS[i].valueCents,
    0,
  )
  const totalCoins = counts.reduce((sum, c) => sum + c, 0)
  const passed = score >= PASS_SCORE

  function adjustCount(idx: number, delta: number) {
    if (roundPhase === 'feedback') return
    setCounts((prev) => {
      const next = [...prev]
      next[idx] = Math.max(0, Math.min(next[idx] + delta, 10))
      return next
    })
  }

  function handleValidate() {
    if (roundPhase !== 'waiting') return
    const isCorrect = totalSelected === changeCents
    const isOptimal = isCorrect && totalCoins === currentRound.optimalCount
    const earned    = isCorrect ? currentRound.points + (isOptimal ? BONUS_POINTS : 0) : 0
    setScore((prev) => Math.min(prev + earned, MAX_SCORE))
    setLastCorrect(isCorrect)
    setLastOptimal(isOptimal)
    setRoundPhase('feedback')

    setTimeout(() => {
      const nextRound = round + 1
      if (nextRound >= TOTAL_ROUNDS) {
        setGamePhase('result')
      } else {
        setCounts(DENOMINATIONS.map(() => 0))
        setLastCorrect(null)
        setLastOptimal(false)
        setRoundPhase('waiting')
        setRound(nextRound)
      }
    }, 2400)
  }

  function exit(withScore: boolean) {
    setLeaving(true)
    setTimeout(() => (withScore ? onComplete(score) : onBack()), 550)
  }

  return (
    <div className={`ch-screen${leaving ? ' ch-screen--leaving' : ''}`}>
      <div className="ch-bg" />
      <div className="ch-overlay" />

      {/* ══ INTRO ══════════════════════════════════════════════════════ */}
      {gamePhase === 'intro' && (
        <div className="ch-intro">
          <div className="ch-intro-content">
            <div className="ch-intro-bubble" key={introSlide}>
              {introSlide === 1 ? (
                <>
                  <p>¡Bienvenido al reto <strong>El Cajero</strong>!</p>
                  <p>Hoy serás tú el cajero del supermercado.</p>
                  <p>Cuando alguien te paga, tienes que darle el <strong>cambio exacto</strong>.</p>
                </>
              ) : (
                <>
                  <p>Verás el <strong>precio</strong> del producto y cuánto te paga el cliente.</p>
                  <p>Elige las monedas y billetes de la <strong>caja registradora</strong> para dar el cambio exacto.</p>
                  <p>🌟 Si usas <strong>las mínimas monedas y billetes posibles</strong>, ¡ganarás puntos extra!</p>
                </>
              )}
            </div>
            <img src="/Cerdito.png" alt="Huchín" className="ch-intro-huchin" />
          </div>

          {introSlide === 1 ? (
            <button className="ch-btn ch-btn--continue" onClick={() => setIntroSlide(2)}>
              Continuar →
            </button>
          ) : (
            <button className="ch-btn ch-btn--continue" onClick={() => setGamePhase('playing')}>
              ¡Entendido! ¡Jugar!
            </button>
          )}
        </div>
      )}

      {/* ══ PLAYING ════════════════════════════════════════════════════ */}
      {gamePhase === 'playing' && currentRound && (
        <>
          <header className="ch-header">
            <div className="ch-header-left">
              <span className="ch-header-emoji" aria-hidden>🛒</span>
              <div className="ch-header-titles">
                <span className="ch-header-role">¡Eres el cajero!</span>
                <span className="ch-round-label">Ronda {round + 1} / {TOTAL_ROUNDS}</span>
              </div>
            </div>
            <div className="ch-score-badge">
              {score} <span className="ch-score-label">pts</span>
            </div>
          </header>

          {/* ── Pantalla ronda ── */}
          <main className="ch-play-area">
            <div className="ch-main-panel">
              <section className="ch-challenge" key={round}>
                <h2 className="ch-challenge-title">¿Cuánto cambio devuelves?</h2>

                <div className="ch-challenge-cards">
                  <div className="ch-info-card ch-info-card--payment">
                    <span className="ch-card-header">El cliente paga</span>
                    <img
                      src={currentRound.paymentImg}
                      alt={`Billete/moneda de ${currentRound.paymentLabel}`}
                      className={`ch-payment-img${currentRound.paymentCents >= 500 ? ' ch-payment-img--bill' : ''}`}
                    />
                    <span className="ch-payment-amount">{currentRound.paymentLabel}</span>
                  </div>

                  <div className="ch-info-card">
                    <span className="ch-card-header">a cambio de</span>
                    <img
                      src={currentRound.productImg}
                      alt={currentRound.productName}
                      className="ch-product-img"
                    />
                    <span className="ch-product-name">{currentRound.productName}</span>
                    <span className="ch-price-tag">{formatEuros(currentRound.priceCents)}</span>
                  </div>

                  <div
                    className={`ch-info-card ch-info-card--mystery${roundPhase === 'feedback' ? (lastCorrect ? ' ch-info-card--pass' : ' ch-info-card--fail') : ''}${counts.some((c) => c > 0) && roundPhase === 'waiting' ? ' ch-info-card--building' : ''}`}
                    aria-live="polite"
                  >
                    <span className="ch-card-header">le corresponde</span>
                    {counts.some((c) => c > 0) ? (
                      <div className="ch-mystery-tray">
                        {DENOMINATIONS.map((den, idx) =>
                          counts[idx] > 0 ? (
                            <div key={den.valueCents} className="ch-mystery-item">
                              <img
                                src={den.img}
                                alt={den.label}
                                className={`ch-mystery-item-img${den.isBill ? ' ch-mystery-item-img--bill' : ''}`}
                              />
                              <span className="ch-mystery-item-count">×{counts[idx]}</span>
                            </div>
                          ) : null
                        )}
                      </div>
                    ) : null}
                  </div>
                </div>

                {/* ── Footer: validar / feedback ── */}
                <div className={`ch-round-footer${roundPhase === 'feedback' ? (lastCorrect ? ' ch-round-footer--pass' : ' ch-round-footer--fail') : ''}`}>
                  {roundPhase === 'waiting' ? (
                    <button
                      className="ch-btn ch-btn--validate"
                      onClick={handleValidate}
                      disabled={totalSelected === 0}
                    >
                      ✓ Dar cambio
                    </button>
                  ) : (
                    <div className={`ch-feedback-msg${lastCorrect ? ' ch-feedback-msg--pass' : ' ch-feedback-msg--fail'}`}>
                      {lastCorrect ? (
                        lastOptimal ? (
                          <>
                            <span className="ch-feedback-main">🌟 ¡Cambio óptimo! +{currentRound.points + BONUS_POINTS} pts</span>
                          </>
                        ) : (
                          <>
                            <span className="ch-feedback-main">¡Cambio correcto! +{currentRound.points} pts</span>
                          </>
                        )
                      ) : (
                        <span className="ch-feedback-main">¡Casi! El cambio exacto era {formatEuros(changeCents)}</span>
                      )}
                    </div>
                  )}
                </div>
              </section>
            </div>

            <aside className="ch-register-wrap" aria-label="Caja registradora">
              <div className="ch-register-topbar">
                <div className="ch-register-title-row">
                  <img src="/Articulos/CajaRegistradora.png" alt="" className="ch-register-icon" />
                  <span className="ch-register-title">Caja</span>
                </div>
              </div>

              <div className="ch-coins-sections">
                <div className="ch-coins-section">
                  <div className="ch-coins-section-label">
                    <span className="ch-coins-section-icon" aria-hidden>🪙</span>
                    Céntimos
                  </div>
                  <div className="ch-coins-grid">
                    {DENOMINATIONS.slice(0, 6).map((den, i) => {
                      const idx = i
                      const isFeedback = roundPhase === 'feedback'
                      return (
                        <div
                          key={den.valueCents}
                          className={`ch-coin-card${counts[idx] > 0 ? ' ch-coin-card--active' : ''}${isFeedback ? ' ch-coin-card--locked' : ''}`}
                          onClick={() => !isFeedback && adjustCount(idx, 1)}
                          onKeyDown={(e) => {
                            if (isFeedback) return
                            if (e.key === 'Enter' || e.key === ' ') {
                              e.preventDefault()
                              adjustCount(idx, 1)
                            }
                          }}
                          role="button"
                          tabIndex={isFeedback ? -1 : 0}
                          aria-label={`Añadir ${den.label}. Llevas ${counts[idx]}`}
                        >
                          <div className="ch-coin-img-wrap">
                            <img
                              src={den.img}
                              alt=""
                              className={`ch-coin-img${den.valueCents === 100 ? ' ch-coin-img--one-euro' : ''}`}
                            />
                            {counts[idx] > 0 && (
                              <span className="ch-coin-badge">×{counts[idx]}</span>
                            )}
                          </div>
                          {counts[idx] > 0 && !isFeedback && (
                            <button
                              type="button"
                              className="ch-coin-remove"
                              onClick={(e) => {
                                e.stopPropagation()
                                adjustCount(idx, -1)
                              }}
                              aria-label={`Quitar ${den.label}`}
                            >
                              −
                            </button>
                          )}
                        </div>
                      )
                    })}
                  </div>
                </div>

                <div className="ch-coins-section">
                  <div className="ch-coins-section-label">
                    <span className="ch-coins-section-icon" aria-hidden>💶</span>
                    Euros
                  </div>
                  <div className="ch-coins-grid">
                    {DENOMINATIONS.slice(6).map((den, i) => {
                      const idx = i + 6
                      const isFeedback = roundPhase === 'feedback'
                      return (
                        <div
                          key={den.valueCents}
                          className={`ch-coin-card${counts[idx] > 0 ? ' ch-coin-card--active' : ''}${isFeedback ? ' ch-coin-card--locked' : ''}`}
                          onClick={() => !isFeedback && adjustCount(idx, 1)}
                          onKeyDown={(e) => {
                            if (isFeedback) return
                            if (e.key === 'Enter' || e.key === ' ') {
                              e.preventDefault()
                              adjustCount(idx, 1)
                            }
                          }}
                          role="button"
                          tabIndex={isFeedback ? -1 : 0}
                          aria-label={`Añadir ${den.label}. Llevas ${counts[idx]}`}
                        >
                          <div className="ch-coin-img-wrap">
                            <img
                              src={den.img}
                              alt=""
                              className={`ch-coin-img${den.valueCents === 100 ? ' ch-coin-img--one-euro' : ''}`}
                            />
                            {counts[idx] > 0 && (
                              <span className="ch-coin-badge">×{counts[idx]}</span>
                            )}
                          </div>
                          {counts[idx] > 0 && !isFeedback && (
                            <button
                              type="button"
                              className="ch-coin-remove"
                              onClick={(e) => {
                                e.stopPropagation()
                                adjustCount(idx, -1)
                              }}
                              aria-label={`Quitar ${den.label}`}
                            >
                              −
                            </button>
                          )}
                        </div>
                      )
                    })}
                  </div>
                </div>
              </div>
            </aside>

            <Calculator className="ch-calculator" />
          </main>
        </>
      )}

      {/* ══ RESULT ═════════════════════════════════════════════════════ */}
      {gamePhase === 'result' && (
        <div className="ch-result">
          <div className="ch-result-huchin-wrap">
            <div className={`ch-result-bubble${passed ? ' ch-result-bubble--pass' : ' ch-result-bubble--fail'}`}>
              {passed
                ? '¡Eres un cajero increíble! ¡Siempre das el cambio exacto!'
                : '¡Casi lo logras! Practica con la calculadora y vuelve a intentarlo.'}
            </div>
            <img src="/Cerdito.png" alt="Huchín" className="ch-result-huchin" />
          </div>

          <div className={`ch-result-score${passed ? ' ch-result-score--pass' : ' ch-result-score--fail'}`}>
            {score} pts
          </div>

          <p className="ch-result-sub">
            {passed
              ? '¡Has desbloqueado el siguiente nivel!'
              : 'Necesitas 70 puntos para avanzar al siguiente nivel.'}
          </p>

          <div className="ch-result-actions">
            {passed ? (
              <button className="ch-btn ch-btn--continue" onClick={() => exit(true)}>
                ¡Continuar!
              </button>
            ) : (
              <button className="ch-btn ch-btn--retry" onClick={() => exit(false)}>
                ¡Intentar de nuevo!
              </button>
            )}
          </div>
        </div>
      )}
    </div>
  )
}
