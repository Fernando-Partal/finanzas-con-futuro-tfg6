# 🐷 Proyecto: Videojuego Educativo sobre el Dinero

## 📌 Contexto General

Este proyecto consiste en el desarrollo de una **aplicación web en React** para un programa de **cooperación social de la Universidad de Sevilla**.

El objetivo es enseñar a niños de **3º a 6º de Primaria** (aprox. 8–12 años), especialmente de **barriadas desfavorecidas de Sevilla**, el **valor del dinero** mediante un enfoque lúdico.

La aplicación es un **videojuego educativo interactivo** donde el alumno avanza a través de un **mapa/camino**, completando minijuegos.

---

## ⚙️ Stack Tecnológico

- **Framework:** React 19 + TypeScript (`.tsx`)
- **Build tool:** Vite 8
- **Estilos:** Vanilla CSS con CSS Variables y CSS Nesting — **sin Tailwind**
- **Linting:** ESLint 9 + TypeScript ESLint
- **Gestión de estado:** `useState` / `useReducer` (sin librerías externas)
- **SPA:** Sin router — navegación por estado en `App.tsx`

---

## 📁 Estructura de Archivos

```
src/
├── App.tsx                          ← Controlador de flujo principal
├── main.tsx                         ← Entry point (React 19 createRoot)
├── index.css                        ← Reset global + variables CSS
├── App.css                          ← Vacío / no usado
└── components/
    ├── HomeScreen.tsx / .css        ← Pantalla de inicio
    ├── IntroScreen.tsx / .css       ← Monólogo del cerdito (typewriter)
    ├── CharacterSelect.tsx / .css   ← Selección de personaje + nombre
    ├── FichaSelect.tsx              ← Selección de ficha (reutiliza CharacterSelect.css)
    ├── MapScreen.tsx / .css         ← Mapa de aventuras (5 nodos + ficha animada)
    └── NecesidadDeseo.tsx / .css    ← Minijuego 0 — IMPLEMENTADO ✅

public/
├── Cerdito.png       ← Mascota principal (Huchín)
├── Niña.png          ← Personaje femenino
├── Niño.png          ← Personaje masculino
├── Paisaje.png       ← Fondo pantallas intro/selección
├── Mapa.png          ← Fondo del mapa de aventuras
├── FichaCoche.png    ← Ficha seleccionable: coche
├── FichaPerro.png    ← Ficha seleccionable: perro
├── FichaPato.png     ← Ficha seleccionable: pato
├── FondoMinijuego1.png  ← Fondo del minijuego 0
└── Articulos/        ← 16 imágenes de productos (necesidades y deseos)
    ├── Arroz.png, Cuadernos.png, Filete.png, Fruta.png,
    │   Leche.png, Pasta.png, Pescado.png, Verduras.png   ← NECESIDADES (8)
    └── Bicicleta.png, Chocolate.png, Chucherias.png,
        CocheTeledirigido.png, Donuts.png, MandoPlay.png,
        Muñeca.png, Refresco.png                          ← DESEOS (8)
```

> Las imágenes están en `/public/` y se referencian desde la raíz: `/Cerdito.png`, etc.

---

## 🗂️ Estado Global en App.tsx

```typescript
type Screen = 'home' | 'intro' | 'character-select' | 'ficha-select' | 'map' | 'minigame'

interface PlayerData {
  name: string
  character: 'girl' | 'boy'
  ficha: 'coche' | 'perro' | 'pato'
}

// Estados en App:
const [screen, setScreen]            // pantalla activa
const [player, setPlayer]            // datos del jugador (PlayerData | null)
const [completedGames, setCompleted] // number[] — índices de minijuegos completados
const [currentGame, setCurrentGame]  // number | null — minijuego activo
const [points, setPoints]            // number — puntuación acumulada
```

---

## 🎮 Flujo de Pantallas Implementado

### Pantalla 1 — `HomeScreen`
- Fondo: `Paisaje.png`
- Título: "¡La Aventura del Ahorro!"
- Cerdito (Huchín) centrado, clickable con animación `idlePulse`
- Al clic: bocadillo "¡Hola! Soy Huchín..."
- Botón "¡Empezar!" deshabilitado hasta hablar con Huchín (`met === true`)
- Transición de salida: fade-out + scale (`home-screen--leaving`)

### Pantalla 2 — `IntroScreen`
- Fondo: `Paisaje.png`
- Huchín con bocadillo typewriter (38ms/carácter)
- Truco ghost: texto invisible fija el tamaño del bocadillo desde el frame 0
- Clic en bocadillo → salta al final; botón "Continuar →" deshabilitado hasta que termina
- Transición: fade-out

### Pantalla 3 — `CharacterSelect`
- Fondo: `Paisaje.png` con overlay oscuro `rgba(8, 4, 24, 0.7)`
- Layout horizontal: Huchín izquierda con bocadillo fijo, panel derecho
- Dos tarjetas (Niña / Niño), borde dorado al seleccionar
- Input de nombre (máx. 20 chars, Enter confirma)
- Botón "¡Vamos!" deshabilitado hasta personaje + nombre
- Al confirmar → guarda `name` y `character`, va a `ficha-select`

### Pantalla 4 — `FichaSelect`
- **Mismo layout y CSS que CharacterSelect** (`CharacterSelect.css`)
- Huchín izquierda con bocadillo: "¡Que no se te olvide elegir tu ficha para el camino!"
- Huchín desplazado a la izquierda con `transform: translateX(-6rem)` (sin afectar el layout flex)
- 3 tarjetas seleccionables: FichaCoche, FichaPerro, FichaPato
- Botón "¡Continuar!" deshabilitado hasta elegir ficha
- Al confirmar → guarda `ficha` en player, va a `map`

### Pantalla 5 — `MapScreen` (mapa interactivo)
- Fondo: `Mapa.png`
- **5 nodos circulares** posicionados en `%` sobre el fondo (ajustables en `GAME_NODES`)
- **Estados de nodo:**
  - `--next`: naranja pulsante (desbloqueado, listo para jugar)
  - `--done`: verde con ✓ (completado, no rejugable — `disabled`)
  - `--locked`: gris con 🔒 (bloqueado hasta completar el anterior)
- Solo el primer nodo desbloqueado al entrar; los siguientes se desbloquean en orden
- **Ficha animada** (FichaCoche/FichaPerro/FichaPato según selección):
  - Sigue el camino de `PATH_SEGMENTS` — array de waypoints `{top, left}` en `%`
  - `PATH_SEGMENTS[N]` = ruta completa para ir al nodo N (incluye inicio + intermedios + final)
  - `PATH_SEGMENTS[0][0]` = posición inicial de la ficha (la "casa" en el mapa)
  - Animación: 900ms por waypoint (`STEP_MS`), CSS transition 800ms ease-in-out
  - Balanceo (`fichaBounce`) mientras se desplaza
  - Botones bloqueados durante la animación (`animating`)
- **Personaje** (Niña/Niño) estático en esquina inferior izquierda, grande
- **Contador de puntos** sobre el personaje (estilo naranja/dorado)
- **Huchín guía** arriba a la derecha: bocadillo a su izquierda con typewriter (38ms/carácter) y truco ghost; triángulo apunta hacia la derecha (al cerdito); mensaje cambia según progreso
- `DEBUG_WAYPOINTS = false` — cuando es `true` muestra puntos rojos (PATH_SEGMENTS) y azules (GAME_NODES) para calibrar posiciones

### Pantalla 6 — `minigame`
- Para `currentGame === 0`: renderiza `<NecesidadDeseo>` (implementado ✅)
- Para `currentGame === 1–4`: placeholder genérico (botón "Completar prueba")
- Contrato de los minijuegos reales: reciben `onComplete(score: number)` y `onBack()`
- `onComplete`: si `score >= 70` Y no estaba completado → añade a `completedGames` y suma `score` a puntos globales
- `onBack`: vuelve al mapa sin registrar nada

---

## 🎯 Orden de Minijuegos (índices 0–4)

| Índice | Nombre              |
|--------|---------------------|
| 0      | Necesidad vs Deseo  |
| 1      | ¿Cuánto cuesta?     |
| 2      | Ahorro con Objetivo |
| 3      | Comparar Ofertas    |
| 4      | El Cambio           |

---

## 🧩 Minijuegos

### 0. 🛒 Necesidad vs Deseo — ✅ IMPLEMENTADO
**Archivo:** `src/components/NecesidadDeseo.tsx` / `.css`
**Fondo:** `FondoMinijuego1.png` + overlay permanente `rgba(0,0,0,0.65)` sobre toda la pantalla en todo momento (incluyendo gameplay).

---

#### Fases del componente (`GamePhase`):
1. `'intro'` — Huchín con bocadillo. **Dos slides** navegables:
   - Slide 1: bienvenida al primer reto, explica qué son necesidades y deseos. Botón "Continuar →".
   - Slide 2: instrucciones del juego (tocar necesidades, perder puntos por errores). Botón "¡Entendido! ¡Jugar!".
   - El bocadillo tiene `key={introSlide}` para reanimar el `ndPopIn` al cambiar de slide.
2. `'playing'` — Gameplay activo (8 rondas).
3. `'result'` — Pantalla de resultado centrada con overlay oscuro, Huchín con bocadillo pass/fail, puntuación grande, botones.

#### Pantalla de resultado:
- Si **aprueba** (≥ 70 pts): botón verde "Ver respuestas" + botón naranja "¡Continuar!". **Sin botón "Volver al mapa"**.
- Si **suspende**: solo botón naranja "¡Intentar de nuevo!". **Sin botón "Volver al mapa"**.
- El botón "Ver respuestas" abre `showAnswers = true`.

#### Pantalla de respuestas (`showAnswers`):
- Se activa con `useState(false)` → `setShowAnswers(true)`.
- `position: absolute; inset: 0; z-index: 20` — tapa completamente la pantalla de resultado.
- Fondo: `FondoMinijuego1.png` con `background-blend-mode: darken` sobre `rgba(0,0,0,0.96)` — opaco, no se ve nada detrás.
- Muestra dos columnas lado a lado: **izquierda** todas las necesidades, **derecha** todos los deseos (imagen pequeña + nombre).
- Botón "← Volver" → `setShowAnswers(false)`.

---

#### Mecánica de juego (estilo whack-a-mole):
- 8 rondas con varios objetos a la vez en pantalla
- El jugador **toca** los que sean NECESIDAD; ignora los DESEOS
- Sin botones de categoría — interacción directa sobre las tarjetas
- Rondas cada vez más cortas y con más deseos que necesidades

#### Configuración de rondas (`ROUND_CONFIGS`):
| Ronda | Necesidades (`n`) | Deseos (`d`) | Duración |
|-------|-------------------|--------------|----------|
| 1 | 3 | 1 | 9 s |
| 2 | 3 | 2 | 8 s |
| 3 | 2 | 3 | 7 s |
| 4 | 2 | 3 | 6 s |
| 5 | 2 | 3 | 5 s |
| 6 | 2 | 4 | 4 s |
| 7 | 2 | 4 | 3 s |
| 8 | 2 | 4 | 2.5 s |

Total necesidades: 18. `PTS_CORRECT = 6` → 18 × 6 = 108 → cap 100. Se necesitan ~17/18 aciertos para llegar a 100.

#### Puntuación:
- `PTS_CORRECT = 6` por tocar necesidad (cap global en 100)
- `PTS_WRONG = 5` por tocar deseo (mín. 0)
- **Aprueba con ≥ 70 pts**

#### Indicador flotante de puntos:
- Al clicar una tarjeta aparece un número (`+6` verde / `-5` rojo) en `position: fixed` en el centro de la tarjeta.
- Sube y desaparece en 900ms con animación `ndPointPop`.
- Implementado con estado `pointPops: PointPop[]` y `popCounter` ref para IDs únicos.

#### Cuenta atrás (timer):
- **Círculo** posicionado `position: absolute; top: 0.75rem; left: 2rem` dentro de `.nd-play-area`.
- Tamaño: `clamp(5.5rem, 12vw, 7.5rem)`. Fuente: `clamp(2.5rem, 6.5vw, 3.8rem)`.
- Color del borde y texto: verde → amarillo → rojo según `progress` (inline style).
- Clase `--urgent` cuando `progress < 0.25`: fondo rojizo + pulso `ndTimerPulse`.
- Valor: `Math.ceil(progress * ROUND_CONFIGS[round].ms / 1000)`.
- Timer implementado con `requestAnimationFrame` para suavidad.

#### Header durante gameplay:
- **Izquierda:** puntuación (`nd-score-badge`) — `clamp(1.4rem, 3.5vw, 2rem)`.
- **Centro:** "Ronda X / 8" (`nd-round-label`) — `clamp(1.3rem, 3vw, 1.8rem)`.
- **Derecha:** botón ✕ para salir sin puntuar.

#### Hint de juego:
- Texto "Toca las NECESIDADES" — `clamp(1.4rem, 3.5vw, 2rem)`, pastilla oscura.

#### Estados de ítems (`ItemPhase`): `active` → `correct` | `wrong` | `missed` | `ignored`
- `correct`: flash verde + sube y desaparece
- `wrong`: sacudida roja + desaparece
- `missed`: pulso rojo al acabar tiempo (necesidad no tocada)
- `ignored`: desvanece suave (deseo no tocado — correcto)

#### Gestión de pools (sin repeticiones dentro de ronda):
- `needPool` / `wantPool` como `useRef<Item[]>` — se inicializan al empezar y se reponen al agotarse.

#### Bug crítico resuelto:
El efecto `[roundPhase, round]` se re-ejecutaba con `roundPhase='ended'` cuando cambiaba `round`. Fix: llamar `setRoundPhase('active')` + `setRound(next)` en el mismo `setTimeout` para que React 18 los batchee en un único render.

#### Estado del componente:
```typescript
const [gamePhase,   setGamePhase]   = useState<GamePhase>('intro')
const [round,       setRound]       = useState(0)
const [roundPhase,  setRoundPhase]  = useState<RoundPhase>('active')
const [items,       setItems]       = useState<ItemState[]>([])
const [score,       setScore]       = useState(0)
const [progress,    setProgress]    = useState(1)
const [leaving,     setLeaving]     = useState(false)
const [introSlide,  setIntroSlide]  = useState<1 | 2>(1)
const [pointPops,   setPointPops]   = useState<PointPop[]>([])
const [showAnswers, setShowAnswers] = useState(false)

const needPool   = useRef<Item[]>([])
const wantPool   = useRef<Item[]>([])
const popCounter = useRef(0)
```

#### Estructura CSS (clases clave):
| Clase | Descripción |
|-------|-------------|
| `.nd-screen` | Raíz, flex column, 100vh |
| `.nd-bg` | Fondo absoluto z-index 0 |
| `.nd-overlay` | Overlay negro 0.65 permanente z-index 1 |
| `.nd-intro` | Pantalla intro absoluta z-index 10 |
| `.nd-header` | Header gameplay z-index 2 |
| `.nd-play-area` | Área de juego, flex, position relative |
| `.nd-countdown` | Círculo de cuenta atrás, absoluto en play-area |
| `.nd-hint` | Texto "Toca las NECESIDADES" |
| `.nd-items-grid` | Grid flex de tarjetas |
| `.nd-item-card` | Tarjeta de objeto |
| `.nd-result` | Resultado absoluto z-index 10, centrado |
| `.nd-answers` | Pantalla respuestas absoluta z-index 20, opaca |
| `.nd-result-items` | Contenedor dos columnas (answers screen) |
| `.nd-point-pop` | Indicador flotante puntos, position fixed |
| `.nd-btn--answers` | Botón verde "Ver respuestas" |
| `.nd-btn--continue` | Botón naranja continuar/jugar |
| `.nd-btn--retry` | Botón naranja reintentar |
| `.nd-btn--map` | Botón translúcido "← Volver" (solo en answers) |

---

### 1. 💸 ¿Cuánto cuesta?
- Mostrar producto → elegir rango de precio (<1€, 1-5€, 5-20€, >20€)
- Validación + feedback

### 2. 🐖 Ahorro con Objetivo
- Objetivo con coste → elegir ahorro semanal → calcular semanas
- Barra de progreso visual

### 3. 🏷️ Comparar Ofertas
- Varias opciones de un producto → elegir la mejor (precio/unidad)
- Explicación del resultado

### 4. 💰 El Cambio
- Modelo: producto + precio, billete de pago, cálculo de cambio
- Vista comprador: acepta o reclama el cambio
- Vista cajero: selecciona monedas/billetes para dar cambio

---

## 🎨 Decisiones de Diseño Establecidas

- **Fondo universal intro/selección:** `Paisaje.png` con `background-size: cover; background-position: bottom center`
- **Fondo mapa:** `Mapa.png` con `background-size: cover; background-position: center center`
- **Paleta:** naranja/amarillo para botones (`#ff6f00` → `#ffa000`), sombra `#bf360c`; dorado `#ffcc02` para bordes de bocadillos
- **Bocadillos:** fondo blanco, borde `#ffcc02`, triángulo CSS, sombra
- **Botones principales:** `border-radius: 60px`, gradiente naranja, sombra 3D, hover = translateY(-4px)
- **Botones deshabilitados:** `opacity: 0.4`, `cursor: not-allowed` — **nunca se ocultan**
- **Transiciones de pantalla:** `opacity + scale`, 550ms, clase `--leaving` en el componente raíz
- **Sin animación bounce** en ninguna pantalla
- **Sin Tailwind** — todo vanilla CSS con `clamp()` para responsive
- **Typewriter:** 38ms/carácter; truco ghost (texto invisible) fija el tamaño del bocadillo desde el frame 0

---

## 🐷 Mascota: Huchín

- Nombre: **Huchín**
- Imagen: `/Cerdito.png`
- Rol: guía narrativo, aparece en todas las pantallas con bocadillos
- En HomeScreen: clickable para presentarse
- En IntroScreen: typewriter con bocadillo
- En CharacterSelect / FichaSelect: estático con bocadillo fijo
- En MapScreen: arriba a la derecha, bocadillo a su izquierda con typewriter, mensaje según progreso
- En NecesidadDeseo intro: bocadillo con dos slides navegables

---

## 🧠 Instrucciones para Claude

- Prioriza **componentes reutilizables en React**
- Mantén **lógica separada de UI**
- Usa **estado claro (useState / useReducer si necesario)**
- Diseña pensando en **niños (simplicidad extrema)**
- Incluye **feedback visual inmediato**
- Evita complejidad innecesaria
- Usa **TypeScript** (`.tsx`), no JavaScript puro
- Usa **vanilla CSS**, no Tailwind ni librerías de UI
- Las imágenes del `/public/` se referencian desde la raíz: `/Cerdito.png` etc.
- Los botones deshabilitados usan `disabled` + `opacity: 0.4`, **nunca se ocultan**
- Las transiciones entre pantallas duran 550ms con clase CSS `--leaving`
- Al implementar un minijuego real, añade un `if (currentGame === N)` dentro del bloque `if (screen === 'minigame')` en `App.tsx`; el componente recibe `onComplete(score: number)` y `onBack()`
- Ver `NecesidadDeseo.tsx` como referencia de estructura: fases `intro → playing → result`, timer con RAF, pools de ítems con `useRef`, transición de salida con clase `--leaving` + 550ms
- **Patrón de avance entre rondas:** siempre hacer batch de `setRoundPhase('active') + setRound(next)` en el mismo callback para evitar que el efecto de `roundPhase==='ended'` se re-ejecute con el nuevo índice de ronda
- **Overlay permanente:** en NecesidadDeseo el fondo oscuro está siempre visible mediante `<div className="nd-overlay" />` (z-index 1), no dentro de cada fase individualmente
- **Pantallas superpuestas:** las pantallas de resultado (`z-index: 10`) y respuestas (`z-index: 20`) son `position: absolute; inset: 0` dentro de `nd-screen`, apiladas sobre el gameplay
