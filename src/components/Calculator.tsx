import { useState } from 'react'
import './Calculator.css'

type Operator = '+' | '-' | '*' | '/'

interface CalculatorProps {
  className?: string
}

const BUTTONS = [
  'C', '⌫', '÷', '×',
  '7', '8', '9', '-',
  '4', '5', '6', '+',
  '1', '2', '3', '=',
  '0', '.',
]

function formatResult(value: number): string {
  if (!Number.isFinite(value)) return 'Error'
  return Number(value.toFixed(8)).toString()
}

function calculate(a: number, b: number, operator: Operator): string {
  if (operator === '+') return formatResult(a + b)
  if (operator === '-') return formatResult(a - b)
  if (operator === '*') return formatResult(a * b)
  if (b === 0) return 'Error'
  return formatResult(a / b)
}

export default function Calculator({ className = '' }: CalculatorProps) {
  const [display, setDisplay] = useState('0')
  const [storedValue, setStoredValue] = useState<number | null>(null)
  const [operator, setOperator] = useState<Operator | null>(null)
  const [waitingForNext, setWaitingForNext] = useState(false)

  function clear() {
    setDisplay('0')
    setStoredValue(null)
    setOperator(null)
    setWaitingForNext(false)
  }

  function inputDigit(value: string) {
    if (display === 'Error') {
      setDisplay(value === '.' ? '0.' : value)
      setWaitingForNext(false)
      return
    }

    if (waitingForNext) {
      setDisplay(value === '.' ? '0.' : value)
      setWaitingForNext(false)
      return
    }

    if (value === '.' && display.includes('.')) return
    if (display === '0' && value !== '.') {
      setDisplay(value)
      return
    }
    setDisplay((current) => `${current}${value}`.slice(0, 12))
  }

  function chooseOperator(nextOperator: Operator) {
    if (display === 'Error') {
      clear()
      return
    }

    const currentValue = Number(display)
    if (storedValue !== null && operator && !waitingForNext) {
      const result = calculate(storedValue, currentValue, operator)
      setDisplay(result)
      setStoredValue(result === 'Error' ? null : Number(result))
    } else {
      setStoredValue(currentValue)
    }
    setOperator(nextOperator)
    setWaitingForNext(true)
  }

  function resolve() {
    if (storedValue === null || operator === null || display === 'Error') return
    const result = calculate(storedValue, Number(display), operator)
    setDisplay(result)
    setStoredValue(null)
    setOperator(null)
    setWaitingForNext(true)
  }

  function backspace() {
    if (waitingForNext || display === 'Error' || display.length === 1) {
      setDisplay('0')
      setWaitingForNext(false)
      return
    }
    setDisplay((current) => current.slice(0, -1))
  }

  function handleButton(value: string) {
    if (/^\d$/.test(value) || value === '.') {
      inputDigit(value)
      return
    }
    if (value === 'C') clear()
    if (value === '⌫') backspace()
    if (value === '+') chooseOperator('+')
    if (value === '-') chooseOperator('-')
    if (value === '×') chooseOperator('*')
    if (value === '÷') chooseOperator('/')
    if (value === '=') resolve()
  }

  return (
    <div className={`calc${className ? ` ${className}` : ''}`} aria-label="Calculadora">
      <div className="calc-top">
        <span className="calc-title">Calculadora</span>
        <span className="calc-operator">{operator ? operator.replace('*', '×').replace('/', '÷') : ''}</span>
      </div>
      <div className="calc-display" aria-live="polite">{display}</div>
      <div className="calc-keys">
        {BUTTONS.map((button) => (
          <button
            key={button}
            className={[
              'calc-key',
              /[+\-×÷=]/.test(button) ? 'calc-key--op' : '',
              button === 'C' || button === '⌫' ? 'calc-key--tool' : '',
              button === '0' ? 'calc-key--wide' : '',
            ].filter(Boolean).join(' ')}
            type="button"
            onClick={() => handleButton(button)}
          >
            {button}
          </button>
        ))}
      </div>
    </div>
  )
}
