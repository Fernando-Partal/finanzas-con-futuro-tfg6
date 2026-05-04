import { useState } from 'react'
import Calculator from './Calculator'
import './AhorroObjetivo.css'

interface Props {
  onComplete: (score: number) => void
  onBack: () => void
}

type GamePhase = 'intro' | 'playing' | 'result'
type IntroStep = 1 | 2 | 3
type GoalId = 'play5' | 'viaje' | 'bicicleta' | 'movil'
type RoundPhase = 'answering' | 'feedback'

interface Goal {
  id: GoalId
  name: string
  price: number
  img: string
}

interface Round {
  weekly: number
  weeks: number
}

const GOALS: Goal[] = [
  { id: 'play5', name: 'Play5', price: 500, img: '/Articulos/Play5.png' },
  { id: 'viaje', name: 'Viaje', price: 240, img: '/Articulos/Viaje.png' },
  { id: 'bicicleta', name: 'Bicicleta', price: 90, img: '/Articulos/Bicicleta.png' },
  { id: 'movil', name: 'Móvil', price: 180, img: '/Articulos/Movil.png' },
]

const ROUNDS_BY_GOAL: Record<GoalId, Round[]> = {
  // Play5 500 €  → 490 NO · 540 SÍ · 504 SÍ
  play5: [
    { weekly: 35, weeks: 14 },
    { weekly: 45, weeks: 12 },
    { weekly: 28, weeks: 18 },
  ],
  // Viaje 240 €  → 224 NO · 264 SÍ · 240 SÍ (justo)
  viaje: [
    { weekly: 32, weeks:  7 },
    { weekly: 24, weeks: 11 },
    { weekly: 16, weeks: 15 },
  ],
  // Bicicleta 90 €  → 96 SÍ · 78 NO · 105 SÍ
  bicicleta: [
    { weekly: 12, weeks: 8 },
    { weekly: 13, weeks: 6 },
    { weekly: 15, weeks: 7 },
  ],
  // Movil 180 €  → 198 SÍ · 162 NO · 182 SÍ (por poco)
  movil: [
    { weekly: 22, weeks:  9 },
    { weekly: 18, weeks:  9 },
    { weekly: 14, weeks: 13 },
  ],
}

const ROUND_POINTS = [33, 33, 34] as const
const TOTAL_ROUNDS = ROUND_POINTS.length
const PASS_SCORE = 50

export default function AhorroObjetivo({ onComplete, onBack }: Props) {
  const [gamePhase, setGamePhase] = useState<GamePhase>('intro')
  const [introStep, setIntroStep] = useState<IntroStep>(1)
  const [selectedGoal, setSelectedGoal] = useState<Goal | null>(null)
  const [round, setRound] = useState(0)
  const [roundPhase, setRoundPhase] = useState<RoundPhase>('answering')
  const [score, setScore] = useState(0)
  const [lastAnswerCorrect, setLastAnswerCorrect] = useState<boolean | null>(null)
  const [leaving, setLeaving] = useState(false)

  const rounds = selectedGoal ? ROUNDS_BY_GOAL[selectedGoal.id] : []
  const currentRound = rounds[round]
  const savedAmount = currentRound ? currentRound.weekly * currentRound.weeks : 0
  const correctAnswer = selectedGoal ? savedAmount >= selectedGoal.price : false
  const passed = score >= PASS_SCORE

  function startGame() {
    if (!selectedGoal) return
    setRound(0)
    setRoundPhase('answering')
    setScore(0)
    setLastAnswerCorrect(null)
    setGamePhase('playing')
  }

  function handleAnswer(answer: boolean) {
    if (!selectedGoal || roundPhase !== 'answering') return

    const isCorrect = answer === correctAnswer
    const nextScore = isCorrect ? Math.min(score + ROUND_POINTS[round], 100) : score
    setScore(nextScore)
    setLastAnswerCorrect(isCorrect)
    setRoundPhase('feedback')

    setTimeout(() => {
      const nextRound = round + 1
      if (nextRound >= TOTAL_ROUNDS) {
        setGamePhase('result')
      } else {
        setLastAnswerCorrect(null)
        setRoundPhase('answering')
        setRound(nextRound)
      }
    }, 1200)
  }

  function exit(withScore: boolean) {
    setLeaving(true)
    setTimeout(() => (withScore ? onComplete(score) : onBack()), 550)
  }

  return (
    <div className={`ao-screen${leaving ? ' ao-screen--leaving' : ''}`}>
      <div className="ao-bg" />
      <div className="ao-overlay" />

      {gamePhase === 'intro' && introStep < 3 && (
        <div className="ao-intro">
          <div className="ao-intro-content">
            <div className="ao-intro-bubble" key={introStep}>
              {introStep === 1 ? (
                <>
                  <p>¡Bienvenido al reto <strong>Ahorro con objetivo</strong>!</p>
                  <p>Cuando queremos comprar algo grande, podemos guardar un poco de dinero cada semana.</p>
                  <p>¡Así el objetivo se acerca paso a paso!</p>
                </>
              ) : (
                <>
                  <p>Verás cuánto ahorras <strong>cada semana</strong> y durante <strong>cuántas semanas</strong>.</p>
                  <p>Usa la calculadora para saber el total y decide: <strong>¿llegas al precio o no?</strong></p>
                  <p>Si llegas, pulsa <strong>Sí</strong>. Si te falta dinero, pulsa <strong>No</strong>.</p>
                </>
              )}
            </div>
            <img src="/Cerdito.png" alt="Huchín" className="ao-intro-huchin" />
          </div>
          {introStep === 1 ? (
            <button className="ao-btn ao-btn--continue" onClick={() => setIntroStep(2)}>
              Continuar →
            </button>
          ) : (
            <button className="ao-btn ao-btn--continue" onClick={() => setIntroStep(3)}>
              ¡Entendido! ¡Jugar!
            </button>
          )}
        </div>
      )}

      {gamePhase === 'intro' && introStep === 3 && (
        <div className="ao-goal-select">
          <div className="ao-goal-left">
            <div className="ao-goal-huchin-wrap">
              <div className="ao-goal-bubble">¡Elige tu objetivo de ahorro!</div>
              <img src="/Cerdito.png" alt="Huchín" className="ao-goal-huchin" />
            </div>
          </div>

          <div className="ao-goal-right">
            <div className="ao-goal-cards">
              {GOALS.map((goal) => (
                <button
                  key={goal.id}
                  className={`ao-goal-card${selectedGoal?.id === goal.id ? ' ao-goal-card--selected' : ''}`}
                  type="button"
                  onClick={() => setSelectedGoal(goal)}
                >
                  <img src={goal.img} alt={goal.name} />
                  <span>{goal.name}</span>
                  <strong>{goal.price} €</strong>
                </button>
              ))}
            </div>

            <button className="ao-btn ao-btn--continue" type="button" onClick={startGame} disabled={!selectedGoal}>
              ¡Empezar!
            </button>
          </div>
        </div>
      )}

      {gamePhase === 'playing' && selectedGoal && currentRound && (
        <>
          <header className="ao-header">
            <div className="ao-score-badge">
              {score} <span className="ao-score-label">pts</span>
            </div>
            <div className="ao-round-label">Ronda {round + 1} / {TOTAL_ROUNDS}</div>
          </header>

          <main className="ao-play-area">
            <section
              className={[
                'ao-challenge',
                roundPhase === 'feedback' && lastAnswerCorrect === true ? 'ao-challenge--correct' : '',
                roundPhase === 'feedback' && lastAnswerCorrect === false ? 'ao-challenge--wrong' : '',
              ].filter(Boolean).join(' ')}
            >
              <div className="ao-target">
                <img src={selectedGoal.img} alt={selectedGoal.name} className="ao-target-img" />
                <div className="ao-target-info">
                  <span className="ao-target-label">Objetivo</span>
                  <h2>{selectedGoal.name}</h2>
                  <strong>{selectedGoal.price} €</strong>
                </div>
              </div>

              <p className="ao-question">
                Si ahorro <strong>{currentRound.weekly} €</strong> a la semana...
                en <strong>{currentRound.weeks} semanas</strong>, ¿he llegado a comprármelo?
              </p>

              <div className="ao-answer-actions">
                <button
                  className="ao-answer-btn ao-answer-btn--yes"
                  type="button"
                  onClick={() => handleAnswer(true)}
                  disabled={roundPhase !== 'answering'}
                >
                  Sí
                </button>
                <button
                  className="ao-answer-btn ao-answer-btn--no"
                  type="button"
                  onClick={() => handleAnswer(false)}
                  disabled={roundPhase !== 'answering'}
                >
                  No
                </button>
              </div>

              {roundPhase === 'feedback' && (
                <div className={`ao-feedback${lastAnswerCorrect ? ' ao-feedback--correct' : ' ao-feedback--wrong'}`}>
                  {lastAnswerCorrect ? '¡Correcto!' : '¡Casi! Mira bien la multiplicación.'}
                </div>
              )}
            </section>

            <Calculator className="ao-calculator" />
          </main>
        </>
      )}

      {gamePhase === 'result' && (
        <div className="ao-result">
          <div className="ao-result-huchin-wrap">
            <div className={`ao-result-bubble${passed ? ' ao-result-bubble--pass' : ' ao-result-bubble--fail'}`}>
              {passed
                ? '¡Muy bien! ¡Ya sabes planear un ahorro!'
                : '¡Casi! Prueba otra vez con la calculadora.'}
            </div>
            <img src="/Cerdito.png" alt="Huchín" className="ao-result-huchin" />
          </div>

          <div className={`ao-result-score${passed ? ' ao-result-score--pass' : ' ao-result-score--fail'}`}>
            {score} pts
          </div>

          <p className="ao-result-sub">
            {passed
              ? '¡Has desbloqueado el siguiente nivel!'
              : 'Necesitas 50 puntos para avanzar al siguiente nivel.'}
          </p>

          <div className="ao-result-actions">
            {passed ? (
              <button className="ao-btn ao-btn--continue" onClick={() => exit(true)}>
                ¡Continuar!
              </button>
            ) : (
              <button className="ao-btn ao-btn--retry" onClick={() => exit(false)}>
                ¡Intentar de nuevo!
              </button>
            )}
          </div>
        </div>
      )}
    </div>
  )
}
