import { useState } from 'react'
import Calculator from './Calculator'
import './CompararOfertas.css'

interface Props {
  onComplete: (score: number) => void
  onBack: () => void
}

type GamePhase = 'intro' | 'playing' | 'result'
type RoundPhase = 'choosing' | 'feedback'
type Difficulty = 'easy' | 'medium' | 'hard'

interface Option {
  id: string
  quantityLabel: string
  priceLabel: string
  perUnitLabel: string
  img?: string
  isPromo?: boolean
  promoNote?: string
}

interface Round {
  difficulty: Difficulty
  productName: string
  productImg: string
  question: string
  points: number
  options: Option[]
  correctId: string
}

const ROUNDS: Round[] = [
  // ── FÁCIL ────────────────────────────────────────────────────────────────
  {
    difficulty: 'easy',
    productName: 'Brick de Leche',
    productImg: '/Articulos/Leche.png',
    question: '¿Qué pack de leche sale más barato por unidad?',
    points: 15,
    correctId: 'b',
    options: [
      { id: 'a', quantityLabel: '2 bricks', priceLabel: '1,80 €', perUnitLabel: '0,90 €/ud', img: '/Articulos/2Leche.png' },
      { id: 'b', quantityLabel: '3 bricks', priceLabel: '2,40 €', perUnitLabel: '0,80 €/ud', img: '/Articulos/3Leche.png' },
    ],
  },
  {
    difficulty: 'easy',
    productName: 'Refresco',
    productImg: '/Articulos/Refresco.png',
    question: '¿Qué pack sale más barato por botella?',
    points: 15,
    correctId: 'b',
    options: [
      { id: 'a', quantityLabel: '3 botellas', priceLabel: '2,70 €', perUnitLabel: '0,90 €/botella', img: '/Articulos/3Refrescos.png' },
      { id: 'b', quantityLabel: '2 botellas', priceLabel: '1,60 €', perUnitLabel: '0,80 €/botella', img: '/Articulos/2Refrescos.png' },
    ],
  },
  // ── MEDIO ────────────────────────────────────────────────────────────────
  {
    difficulty: 'medium',
    productName: 'Paquete de Arroz',
    productImg: '/Articulos/Arroz.png',
    question: '¿Qué paquete de arroz tiene mejor precio por kilo?',
    points: 20,
    correctId: 'a',
    options: [
      { id: 'a', quantityLabel: '500 g', priceLabel: '0,70 €', perUnitLabel: '1,40 €/kg' },
      { id: 'b', quantityLabel: '1 kg', priceLabel: '1,60 €', perUnitLabel: '1,60 €/kg' },
    ],
  },
  {
    difficulty: 'medium',
    productName: 'Paquete de Pasta',
    productImg: '/Articulos/Pasta.png',
    question: '¿Qué paquete de pasta tiene mejor precio por kilo?',
    points: 20,
    correctId: 'a',
    options: [
      { id: 'a', quantityLabel: '500 g', priceLabel: '1,00 €', perUnitLabel: '2,00 €/kg' },
      { id: 'b', quantityLabel: '1 kg', priceLabel: '2,40 €', perUnitLabel: '2,40 €/kg' },
    ],
  },
  // ── DIFÍCIL ───────────────────────────────────────────────────────────────
  {
    difficulty: 'hard',
    productName: 'Plátanos',
    productImg: '/Articulos/Platanos.png',
    question: '¿Qué plátanos tienen mejor precio por kilo?',
    points: 15,
    correctId: 'b',
    options: [
      { id: 'a', quantityLabel: '500 g', priceLabel: '1,50 €', perUnitLabel: '3,00 €/kg' },
      { id: 'b', quantityLabel: '1 kg', priceLabel: '2,40 €', perUnitLabel: '2,40 €/kg' },
      { id: 'c', quantityLabel: '2 kg', priceLabel: '5,60 €', perUnitLabel: '2,80 €/kg' },
    ],
  },
  {
    difficulty: 'hard',
    productName: 'Tableta de Chocolate',
    productImg: '/Articulos/Chocolate.png',
    question: '¿Qué oferta de chocolate es mejor?',
    points: 15,
    correctId: 'c',
    options: [
      { id: 'a', quantityLabel: '1 tableta', priceLabel: '1,20 €', perUnitLabel: '1,20 €/tableta' },
      { id: 'b', quantityLabel: '2 tabletas', priceLabel: '2,20 €', perUnitLabel: '1,10 €/tableta', img: '/Articulos/2Chocolates.png' },
      {
        id: 'c',
        quantityLabel: 'Promo 3×2',
        priceLabel: '2,40 €',
        perUnitLabel: '0,80 €/tableta',
        img: '/Articulos/3Chocolates.png',
        isPromo: true,
        promoNote: 'Llevas 3, pagas 2',
      },
    ],
  },
]

const TOTAL_ROUNDS = ROUNDS.length
const PASS_SCORE = 70
const DIFFICULTY_LABEL: Record<Difficulty, string> = {
  easy: 'Fácil',
  medium: 'Medio',
  hard: 'Difícil',
}

export default function CompararOfertas({ onComplete, onBack }: Props) {
  const [gamePhase, setGamePhase] = useState<GamePhase>('intro')
  const [introSlide, setIntroSlide] = useState<1 | 2>(1)
  const [round, setRound] = useState(0)
  const [roundPhase, setRoundPhase] = useState<RoundPhase>('choosing')
  const [selectedId, setSelectedId] = useState<string | null>(null)
  const [score, setScore] = useState(0)
  const [leaving, setLeaving] = useState(false)

  const currentRound = ROUNDS[round]
  const passed = score >= PASS_SCORE

  function handleSelect(optionId: string) {
    if (roundPhase !== 'choosing') return

    const isCorrect = optionId === currentRound.correctId
    setScore((prev) => (isCorrect ? Math.min(prev + currentRound.points, 100) : prev))
    setSelectedId(optionId)
    setRoundPhase('feedback')

    setTimeout(() => {
      const nextRound = round + 1
      if (nextRound >= TOTAL_ROUNDS) {
        setGamePhase('result')
      } else {
        setSelectedId(null)
        setRoundPhase('choosing')
        setRound(nextRound)
      }
    }, 1800)
  }

  function exit(withScore: boolean) {
    setLeaving(true)
    setTimeout(() => (withScore ? onComplete(score) : onBack()), 550)
  }

  return (
    <div className={`co-screen${leaving ? ' co-screen--leaving' : ''}`}>
      <div className="co-bg" />
      <div className="co-overlay" />

      {/* ── INTRO ── */}
      {gamePhase === 'intro' && (
        <div className="co-intro">
          <div className="co-intro-content">
            <div className="co-intro-bubble" key={introSlide}>
              {introSlide === 1 ? (
                <>
                  <p>¡Bienvenido al reto <strong>Comparar Ofertas</strong>!</p>
                  <p>A veces el mismo producto se vende en distintas cantidades y precios.</p>
                  <p>¡Aprende a encontrar la <strong>mejor oferta</strong>!</p>
                </>
              ) : (
                <>
                  <p>Mira bien la <strong>cantidad</strong> y el <strong>precio</strong> de cada opción.</p>
                  <p>Elige la que tenga mejor <strong>precio por unidad</strong> o por kilo.</p>
                  <p>¡Usa la calculadora si la necesitas!</p>
                </>
              )}
            </div>
            <img src="/Cerdito.png" alt="Huchín" className="co-intro-huchin" />
          </div>
          {introSlide === 1 ? (
            <button className="co-btn co-btn--continue" onClick={() => setIntroSlide(2)}>
              Continuar →
            </button>
          ) : (
            <button className="co-btn co-btn--continue" onClick={() => setGamePhase('playing')}>
              ¡Entendido! ¡Jugar!
            </button>
          )}
        </div>
      )}

      {/* ── PLAYING ── */}
      {gamePhase === 'playing' && currentRound && (
        <>
          <header className="co-header">
            <div className="co-score-badge">
              {score} <span className="co-score-label">pts</span>
            </div>
            <div className="co-round-label">Ronda {round + 1} / {TOTAL_ROUNDS}</div>
          </header>

          <main className="co-play-area">
            <section className="co-challenge" key={round}>
              <div className="co-challenge-top">
                <img
                  src={currentRound.productImg}
                  alt={currentRound.productName}
                  className="co-product-img"
                />
                <div className="co-challenge-info">
                  <span className={`co-difficulty co-difficulty--${currentRound.difficulty}`}>
                    {DIFFICULTY_LABEL[currentRound.difficulty]}
                  </span>
                  <h2 className="co-product-name">{currentRound.productName}</h2>
                </div>
              </div>

              <p className="co-question">{currentRound.question}</p>

              <div className={`co-options co-options--${currentRound.options.length}`}>
                {currentRound.options.map((opt) => {
                  const isSelected = selectedId === opt.id
                  const isCorrect = opt.id === currentRound.correctId
                  const inFeedback = roundPhase === 'feedback'

                  const cardClass = [
                    'co-option-card',
                    inFeedback && isCorrect ? 'co-option-card--correct' : '',
                    inFeedback && isSelected && !isCorrect ? 'co-option-card--wrong' : '',
                    inFeedback && !isCorrect && !isSelected ? 'co-option-card--dim' : '',
                  ].filter(Boolean).join(' ')

                  return (
                    <button
                      key={opt.id}
                      className={cardClass}
                      type="button"
                      onClick={() => handleSelect(opt.id)}
                      disabled={inFeedback}
                    >
                      {opt.isPromo && <span className="co-promo-badge">★ Promo</span>}
                      {inFeedback && (isCorrect || isSelected) && (
                        <span className={`co-card-badge${isCorrect ? ' co-card-badge--ok' : ' co-card-badge--no'}`}>
                          {isCorrect ? '✓' : '✗'}
                        </span>
                      )}
                      <img
                        src={opt.img ?? currentRound.productImg}
                        alt={currentRound.productName}
                        className="co-option-img"
                      />
                      <span className="co-option-qty">{opt.quantityLabel}</span>
                      {opt.promoNote && <span className="co-promo-note">{opt.promoNote}</span>}
                      <span className="co-option-price">{opt.priceLabel}</span>
                      {inFeedback && (
                        <span className={`co-per-unit${isCorrect ? ' co-per-unit--best' : ''}`}>
                          {opt.perUnitLabel}
                        </span>
                      )}
                    </button>
                  )
                })}
              </div>

              {roundPhase === 'feedback' && (
                <p className={`co-feedback${selectedId === currentRound.correctId ? ' co-feedback--correct' : ' co-feedback--wrong'}`}>
                  {selectedId === currentRound.correctId
                    ? '¡Correcto! ¡Esa es la mejor oferta!'
                    : `¡Casi! La mejor oferta era: ${currentRound.options.find((o) => o.id === currentRound.correctId)?.quantityLabel}`}
                </p>
              )}
            </section>

            <Calculator className="co-calculator" />
          </main>
        </>
      )}

      {/* ── RESULT ── */}
      {gamePhase === 'result' && (
        <div className="co-result">
          <div className="co-result-huchin-wrap">
            <div className={`co-result-bubble${passed ? ' co-result-bubble--pass' : ' co-result-bubble--fail'}`}>
              {passed
                ? '¡Eres un experto comparando precios!'
                : '¡Casi! Practica con la calculadora y vuelve a intentarlo.'}
            </div>
            <img src="/Cerdito.png" alt="Huchín" className="co-result-huchin" />
          </div>

          <div className={`co-result-score${passed ? ' co-result-score--pass' : ' co-result-score--fail'}`}>
            {score} pts
          </div>

          <p className="co-result-sub">
            {passed
              ? '¡Has desbloqueado el siguiente nivel!'
              : 'Necesitas 70 puntos para avanzar al siguiente nivel.'}
          </p>

          <div className="co-result-actions">
            {passed ? (
              <button className="co-btn co-btn--continue" onClick={() => exit(true)}>
                ¡Continuar!
              </button>
            ) : (
              <button className="co-btn co-btn--retry" onClick={() => exit(false)}>
                ¡Intentar de nuevo!
              </button>
            )}
          </div>
        </div>
      )}
    </div>
  )
}
