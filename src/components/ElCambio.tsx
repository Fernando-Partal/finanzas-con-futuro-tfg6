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
    productName:  'Chucherías',
    productImg:   '/Articulos/Chucherias.png',
    priceCents:   50,
    paymentCents: 100,
    paymentImg:   '/Dinero/1euro.png',
    paymentLabel: '1 €',
    points:       20,
  },
  {
    productName:  'Paquete de Arroz',
    productImg:   '/Articulos/Arroz.png',
    priceCents:   120,
    paymentCents: 200,
    paymentImg:   '/Dinero/2%20euros.png',
    paymentLabel: '2 €',
    points:       20,
  },
  {
    productName:  'Cuadernos',
    productImg:   '/Articulos/Cuadernos.png',
    priceCents:   350,
    paymentCents: 500,
    paymentImg:   '/Dinero/5euros.png',
    paymentLabel: '5 €',
    points:       20,
  },
  {
    productName:  'Tableta de Chocolate',
    productImg:   '/Articulos/Chocolate.png',
    priceCents:   400,
    paymentCents: 1000,
    paymentImg:   '/Dinero/10euros.png',
    paymentLabel: '10 €',
    points:       20,
  },
  {
    productName:  'Muñeca',
    productImg:   '/Articulos/Mu%C3%B1eca.png',
    priceCents:   1200,
    paymentCents: 2000,
    paymentImg:   '/Dinero/20euros.png',
    paymentLabel: '20 €',
    points:       20,
  },
]

function formatEuros(cents: number): string {
  return (cents / 100).toFixed(2).replace('.', ',') + ' €'
}

const PASS_SCORE   = 70
const TOTAL_ROUNDS = ROUNDS.length

export default function ElCambio({ onComplete, onBack }: Props) {
  const [gamePhase,   setGamePhase]   = useState<GamePhase>('intro')
  const [introSlide,  setIntroSlide]  = useState<1 | 2>(1)
  const [round,       setRound]       = useState(0)
  const [counts,      setCounts]      = useState<number[]>(DENOMINATIONS.map(() => 0))
  const [roundPhase,  setRoundPhase]  = useState<RoundPhase>('waiting')
  const [lastCorrect, setLastCorrect] = useState<boolean | null>(null)
  const [score,       setScore]       = useState(0)
  const [leaving,     setLeaving]     = useState(false)

  const currentRound  = ROUNDS[round]
  const changeCents   = currentRound.paymentCents - currentRound.priceCents
  const totalSelected = counts.reduce(
    (sum, count, i) => sum + count * DENOMINATIONS[i].valueCents,
    0,
  )
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
    setScore((prev) => Math.min(prev + (isCorrect ? currentRound.points : 0), 100))
    setLastCorrect(isCorrect)
    setRoundPhase('feedback')

    setTimeout(() => {
      const nextRound = round + 1
      if (nextRound >= TOTAL_ROUNDS) {
        setGamePhase('result')
      } else {
        setCounts(DENOMINATIONS.map(() => 0))
        setLastCorrect(null)
        setRoundPhase('waiting')
        setRound(nextRound)
      }
    }, 2200)
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
                  <p>Abre la <strong>caja registradora</strong> y elige las monedas y billetes para dar el cambio exacto.</p>
                  <p>¡Usa la calculadora si necesitas ayuda!</p>
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
            <div className="ch-score-badge">
              {score} <span className="ch-score-label">pts</span>
            </div>
            <div className="ch-round-label">Ronda {round + 1} / {TOTAL_ROUNDS}</div>
          </header>

          {/* ── Pantalla ronda ── */}
          <main className="ch-play-area">
            <aside className="ch-tool-panel ch-tool-panel--calculator" aria-label="Calculadora de ayuda">
              <Calculator className="ch-calculator" />
            </aside>

            <div className="ch-main-panel">
              <section className="ch-challenge" key={round}>
                <h2 className="ch-challenge-title">¿Cuánto cambio debes dar?</h2>

                <div className="ch-challenge-cards">
                  <div className="ch-info-card">
                    <span className="ch-card-header">Producto</span>
                    <img
                      src={currentRound.productImg}
                      alt={currentRound.productName}
                      className="ch-product-img"
                    />
                    <span className="ch-product-name">{currentRound.productName}</span>
                    <span className="ch-price-tag">{formatEuros(currentRound.priceCents)}</span>
                  </div>

                  <div className="ch-arrow">→</div>

                  <div className="ch-info-card ch-info-card--payment">
                    <span className="ch-card-header">El cliente paga</span>
                    <img
                      src={currentRound.paymentImg}
                      alt={`Billete/moneda de ${currentRound.paymentLabel}`}
                      className={`ch-payment-img${currentRound.paymentCents >= 500 ? ' ch-payment-img--bill' : ''}`}
                    />
                    <span className="ch-payment-amount">{currentRound.paymentLabel}</span>
                  </div>
                </div>

                {/* ── Selección de monedas ── */}
                <div className="ch-selection-area" aria-live="polite">
                  {counts.some((c) => c > 0) ? (
                    <div className="ch-selected-coins">
                      {DENOMINATIONS.map((den, idx) =>
                        counts[idx] > 0 ? (
                          <div key={den.valueCents} className="ch-selected-item">
                            <img
                              src={den.img}
                              alt={den.label}
                              className={`ch-selected-item-img${den.isBill ? ' ch-selected-item-img--bill' : ''}${den.valueCents === 100 ? ' ch-selected-item-img--one-euro' : ''}`}
                            />
                            <span className="ch-selected-item-count">×{counts[idx]}</span>
                          </div>
                        ) : null
                      )}
                    </div>
                  ) : (
                    <p className="ch-selection-hint">Elige el cambio en la caja registradora.</p>
                  )}
                </div>

                {/* ── Footer: total + validar / feedback ── */}
                <div className={`ch-round-footer${roundPhase === 'feedback' ? (lastCorrect ? ' ch-round-footer--pass' : ' ch-round-footer--fail') : ''}`}>
                  {roundPhase === 'waiting' ? (
                    <>
                      <div className="ch-total">
                        <strong className="ch-total-value">{formatEuros(totalSelected)}</strong>
                      </div>
                      <button className="ch-btn ch-btn--validate" onClick={handleValidate}>
                        Validar
                      </button>
                    </>
                  ) : (
                    <div className={`ch-feedback-msg${lastCorrect ? ' ch-feedback-msg--pass' : ' ch-feedback-msg--fail'}`}>
                      {lastCorrect
                        ? '¡Cambio correcto! ¡Eres un gran cajero! 🎉'
                        : `¡Casi! El cambio exacto era ${formatEuros(changeCents)}`}
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
                <div className="ch-register-total">{formatEuros(totalSelected)}</div>
              </div>

              <div className="ch-coins-grid">
                {DENOMINATIONS.map((den, idx) => (
                  <div
                    key={den.valueCents}
                    className={`ch-coin-card${counts[idx] > 0 ? ' ch-coin-card--active' : ''}`}
                  >
                    <img
                      src={den.img}
                      alt={den.label}
                      className={`ch-coin-img${den.valueCents === 100 ? ' ch-coin-img--one-euro' : ''}`}
                    />
                    <div className="ch-coin-controls">
                      <button
                        className="ch-coin-btn ch-coin-btn--minus"
                        onClick={() => adjustCount(idx, -1)}
                        disabled={counts[idx] === 0}
                        aria-label={`Quitar ${den.label}`}
                      >
                        −
                      </button>
                      <span className={`ch-coin-count${counts[idx] > 0 ? ' ch-coin-count--active' : ''}`}>
                        {counts[idx]}
                      </span>
                      <button
                        className="ch-coin-btn ch-coin-btn--plus"
                        onClick={() => adjustCount(idx, 1)}
                        aria-label={`Añadir ${den.label}`}
                      >
                        +
                      </button>
                    </div>
                  </div>
                ))}
              </div>

              <div className="ch-register-footer">
                <div className="ch-total">
                  <strong className="ch-total-value">{formatEuros(totalSelected)}</strong>
                </div>
              </div>
            </aside>
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
