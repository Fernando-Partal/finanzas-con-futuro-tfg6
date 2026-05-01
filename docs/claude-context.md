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
    ├── NecesidadDeseo.tsx / .css    ← Minijuego 0 — IMPLEMENTADO ✅
    ├── PrecioCosas.tsx / .css       ← Minijuego 1 — IMPLEMENTADO ✅
    ├── AhorroObjetivo.tsx / .css    ← Minijuego 2 — IMPLEMENTADO ✅
    └── Calculator.tsx / .css        ← Calculadora reutilizable (usada en Minijuego 2)

public/
├── Cerdito.png          ← Mascota principal (Huchín)
├── Niña.png             ← Personaje femenino
├── Niño.png             ← Personaje masculino
├── Paisaje.png          ← Fondo pantallas intro/selección
├── Mapa.png             ← Fondo del mapa de aventuras
├── FichaCoche.png       ← Ficha seleccionable: coche
├── FichaPerro.png       ← Ficha seleccionable: perro
├── FichaPato.png        ← Ficha seleccionable: pato
├── FondoMinijuego1.png  ← Fondo compartido por minijuegos 0 y 1
└── Articulos/           ← 16 imágenes de productos (necesidades y deseos)
    ├── Arroz.png, Cuadernos.png, Filete.png, Fruta.png,
    │   Leche.png, Pasta.png, Pescado.png, Verduras.png   ← NECESIDADES (8)
    └── Bicicleta.png, Chocolate.png, Chucherias.png,
        CocheTeledirigido.png, Donuts.png, MandoPlay.png,
        Muñeca.png, Refresco.png                          ← DESEOS (8)
```

> Las imágenes están en `/public/` y se referencian desde la raíz: `/Cerdito.png`, etc.
> La carpeta `Articulos/` se ampliará en el futuro con más imágenes.

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
- Para `currentGame === 0`: renderiza `<NecesidadDeseo>` ✅
- Para `currentGame === 1`: renderiza `<PrecioCosas>` ✅
- Para `currentGame === 2`: renderiza `<AhorroObjetivo>` ✅
- Para `currentGame === 3–4`: placeholder genérico (botón "Completar prueba")
- **Contrato de los minijuegos:** reciben `onComplete(score: number)` y `onBack()`
- `onComplete`: umbral de aprobado **condicional por minijuego**:
  - Minijuego 2: `score >= 50`
  - Resto: `score >= 70`
  - Si aprueba Y no estaba completado → añade a `completedGames` y suma `score` a puntos globales
- `onBack`: vuelve al mapa sin registrar nada

---

## 🎯 Orden de Minijuegos (índices 0–4)

| Índice | Nombre               | Estado |
|--------|----------------------|--------|
| 0      | Necesidad vs Deseo   | ✅ Implementado |
| 1      | ¿Cuánto cuesta?      | ✅ Implementado |
| 2      | Ahorro con Objetivo  | ✅ Implementado |
| 3      | Comparar Ofertas     | 🔲 Pendiente |
| 4      | El Cambio            | 🔲 Pendiente |

---

## 🧩 Minijuegos

### 0. 🛒 Necesidad vs Deseo — ✅ IMPLEMENTADO
**Archivo:** `src/components/NecesidadDeseo.tsx` / `.css`  
**Fondo:** `FondoMinijuego1.png` + overlay permanente `rgba(0,0,0,0.65)` sobre toda la pantalla.

#### Fases del componente (`GamePhase`):
1. `'intro'` — Huchín con bocadillo. **Dos slides** navegables:
   - Slide 1: bienvenida, explica qué son necesidades y deseos. Botón "Continuar →".
   - Slide 2: instrucciones del juego. Botón "¡Entendido! ¡Jugar!".
   - El bocadillo tiene `key={introSlide}` para reanimar el `ndPopIn` al cambiar de slide.
2. `'playing'` — Gameplay activo (8 rondas).
3. `'result'` — Pantalla de resultado centrada, Huchín con bocadillo pass/fail, puntuación grande, botones.

#### Pantalla de resultado:
- Si **aprueba** (≥ 70 pts): botón verde "Ver respuestas" + botón naranja "¡Continuar!". Sin botón "Volver al mapa".
- Si **suspende**: solo botón naranja "¡Intentar de nuevo!". Sin botón "Volver al mapa".
- "Ver respuestas" abre `showAnswers = true` → pantalla absoluta z-index 20 con dos columnas (necesidades / deseos).

#### Mecánica de juego (estilo whack-a-mole):
- 8 rondas con varios objetos a la vez en pantalla
- El jugador **toca** los que sean NECESIDAD; ignora los DESEOS
- Sin botones de categoría — interacción directa sobre las tarjetas
- Rondas cada vez más cortas y con más deseos que necesidades

#### Configuración de rondas (`ROUND_CONFIGS`):
| Ronda | n (necesidades) | d (deseos) | Duración |
|-------|-----------------|------------|----------|
| 1 | 3 | 1 | 9 s |
| 2 | 3 | 2 | 8 s |
| 3 | 2 | 3 | 7 s |
| 4 | 2 | 3 | 6 s |
| 5 | 2 | 3 | 5 s |
| 6 | 2 | 4 | 4 s |
| 7 | 2 | 4 | 3 s |
| 8 | 2 | 4 | 2.5 s |

Total necesidades: 18. `PTS_CORRECT = 6` → 18 × 6 = 108 → cap 100.

#### Puntuación:
- `PTS_CORRECT = 6` por tocar necesidad (cap global en 100)
- `PTS_WRONG = 5` por tocar deseo (mín. 0)
- **Aprueba con ≥ 70 pts**

#### Detalles técnicos:
- Timer con `requestAnimationFrame`; círculo de cuenta atrás verde → amarillo → rojo
- Clase `--urgent` cuando `progress < 0.25`: fondo rojizo + pulso `ndTimerPulse`
- Pools sin repetición: `needPool` / `wantPool` como `useRef<Item[]>`, se reponen al agotarse
- Indicador flotante de puntos: `pointPops: PointPop[]` + `popCounter` ref, `position: fixed`, animación 900ms
- Estados de ítem: `active` → `correct` | `wrong` | `missed` | `ignored`
- **Bug crítico resuelto:** `setRoundPhase('active') + setRound(next)` en el mismo `setTimeout` para que React 18 los batchee y el efecto no se re-ejecute con `roundPhase='ended'` en el nuevo round

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

#### Clases CSS clave (prefijo `nd-`):
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
| `.nd-point-pop` | Indicador flotante puntos, position fixed |
| `.nd-btn--answers` | Botón verde "Ver respuestas" |
| `.nd-btn--continue` | Botón naranja continuar/jugar |
| `.nd-btn--retry` | Botón naranja reintentar |
| `.nd-btn--map` | Botón translúcido "← Volver" (solo en answers) |

---

### 1. 💸 ¿Cuánto cuesta? — ✅ IMPLEMENTADO
**Archivo:** `src/components/PrecioCosas.tsx` / `.css`  
**Fondo:** `FondoMinijuego1.png` + overlay permanente `rgba(0,0,0,0.65)` — mismo que minijuego 0.

#### Fases del componente (`GamePhase`):
1. `'intro'` — Huchín con bocadillo. **Dos slides** navegables (mismo patrón que NecesidadDeseo).
   - Slide 1: bienvenida al reto, pregunta si saben cuánto cuestan las cosas.
   - Slide 2: instrucciones del drag & drop y el botón validar.
2. `'playing'` — Gameplay activo (5 rondas).
3. `'result'` — Puntuación + mensaje pass/fail + botón continuar o reintentar.

#### Mecánica de juego (drag & drop):
- 5 rondas con **4 artículos** cada una, dispuestos en grid **2×2**
- Abajo: **4 etiquetas de precio azules** (banco), mezcladas al azar al inicio de cada ronda
- El alumno **arrastra** cada etiqueta hasta el artículo correcto
  - Arrastrar de tarjeta a tarjeta → intercambio (swap)
  - Arrastrar de tarjeta al banco → devuelve la etiqueta al banco
  - El banco también es zona de drop
- **Botón "¡Validar!"** solo se habilita cuando los 4 artículos tienen etiqueta asignada
- Al validar: badge **✓ verde** o **✗ rojo** en cada tarjeta → 2.5 s de feedback → siguiente ronda (o resultado)
- Los fallos **no restan** — solo no suman

#### Puntuación:
- `PTS_PER_CORRECT = 5` por artículo correcto
- 5 rondas × 4 artículos = 20 posibles × 5 = **100 pts máximo**
- **Aprueba con ≥ 70 pts** (equivale a acertar 14 de 20)

#### Rondas (precios realistas, diferenciados dentro de cada ronda para evitar ambigüedad):
| Ronda | Artículos y precios |
|-------|---------------------|
| 1 | Chucherías 0,50 € · Arroz 1,20 € · Cuadernos 3,50 € · Muñeca 22,00 € |
| 2 | Leche 0,90 € · Verduras 2,00 € · Filete 8,50 € · Coche teledirigido 35,00 € |
| 3 | Pasta 1,10 € · Fruta 2,80 € · Pescado 7,50 € · Mando de juego 60,00 € |
| 4 | Chucherías 0,50 € · Chocolate 4,00 € · Muñeca 22,00 € · Bicicleta 90,00 € |
| 5 | Leche 0,90 € · Donuts 2,20 € · Pescado 7,50 € · Coche teledirigido 35,00 € |

#### Implementación del drag & drop:
- HTML5 DnD API (`draggable`, `onDragStart`, `onDragOver`, `onDrop`)
- Info del drag almacenada en `dragInfo = useRef<{ price: string; from: 'bank' | number } | null>`
  - `from: 'bank'` → viene del banco
  - `from: number` → viene de la tarjeta con ese índice
- `dragOverCard: number | null` en estado para el highlight naranja visual al pasar encima
- **Nota:** HTML5 DnD no funciona en pantallas táctiles — mejora pendiente con pointer events

#### Estado del componente:
```typescript
const [gamePhase,      setGamePhase]      = useState<GamePhase>('intro')
const [introSlide,     setIntroSlide]     = useState<1 | 2>(1)
const [round,          setRound]          = useState(0)
const [roundPhase,     setRoundPhase]     = useState<RoundPhase>('placing')
const [placements,     setPlacements]     = useState<(string | null)[]>([null,null,null,null])
const [shuffledPrices, setShuffledPrices] = useState<string[]>([])
const [correctness,    setCorrectness]    = useState<(boolean | null)[]>([null,null,null,null])
const [dragOverCard,   setDragOverCard]   = useState<number | null>(null)
const [score,          setScore]          = useState(0)
const [leaving,        setLeaving]        = useState(false)

const dragInfo = useRef<{ price: string; from: 'bank' | number } | null>(null)
```

- `placements[i]` = precio colocado en la tarjeta `i` (o `null` si vacía)
- Labels del banco = `shuffledPrices.filter(p => !placements.includes(p))`
- El `useEffect([round, gamePhase])` mezcla precios y resetea `placements`, `correctness` y `roundPhase` al inicio de cada ronda

#### Clases CSS clave (prefijo `pc-`):
| Clase | Descripción |
|-------|-------------|
| `.pc-screen` | Raíz, mismo patrón que `nd-screen` |
| `.pc-cards-grid` | Grid 2×2 de tarjetas de artículo |
| `.pc-card` | Tarjeta individual con imagen, nombre y ranura |
| `.pc-card--correct` | Flash verde + leve escala al validar |
| `.pc-card--wrong` | Sacudida roja al validar |
| `.pc-card--dragover` | Resaltado naranja al pasar etiqueta encima |
| `.pc-card-slot--empty` | Ranura vacía con pulso naranja animado (`pcSlotPulse`) |
| `.pc-card-slot--filled` | Ranura con etiqueta colocada |
| `.pc-card-badge--ok/no` | Badge ✓/✗ en esquina superior derecha de la tarjeta |
| `.pc-price-chip--bank` | Etiqueta azul en el banco (arrastrable, gradiente `#1565c0`) |
| `.pc-price-chip--placed` | Etiqueta naranja colocada en tarjeta (gradiente `#e65100`) |
| `.pc-bank` | Zona de etiquetas sueltas + drop target para devolver |
| `.pc-btn--validate` | Botón verde "¡Validar!" (gradiente `#2e7d32`) |

---

### 2. 🐖 Ahorro con Objetivo — ✅ IMPLEMENTADO
**Archivo:** `src/components/AhorroObjetivo.tsx` / `.css`  
**Fondo:** `FondoMinijuego1.png` + overlay permanente `rgba(0,0,0,0.65)` — mismo que minijuegos 0 y 1.  
**Componente auxiliar:** `Calculator.tsx` / `.css` — calculadora funcional posicionada en esquina inferior derecha del área de juego.

#### Fases del componente (`GamePhase`):
1. `'intro'` — Huchín con bocadillo. **Tres pasos** (`IntroStep = 1 | 2 | 3`):
   - Paso 1: explica el concepto de ahorro por objetivo. Botón "Continuar".
   - Paso 2: explica la mecánica (`ahorro semanal × semanas`). Botón "Continuar".
   - Paso 3 (no es slide, es pantalla aparte): **selección de objetivo** — layout izquierda/derecha como FichaSelect. Huchín izquierda con bocadillo; derecha: grid 2×2 de tarjetas seleccionables + botón "Empezar" (deshabilitado hasta elegir).
2. `'playing'` — Gameplay activo (3 rondas por objetivo).
3. `'result'` — Puntuación + mensaje pass/fail + botón Continuar o Reintentar.

> **Diferencia clave respecto al patrón estándar:** la intro tiene 3 pasos en lugar de 2 slides; el paso 3 es la selección de objetivo, no un slide más de Huchín.

#### Objetivos disponibles (`GOALS`):
| ID | Nombre | Precio |
|----|--------|--------|
| `play5` | Play5 | 500 € |
| `viaje` | Viaje | 240 € |
| `bicicleta` | Bicicleta | 90 € |
| `movil` | Movil | 180 € |

> **Nota:** actualmente todos los objetivos usan `/Articulos/Bicicleta.png` como imagen placeholder. Pendiente asignar imágenes propias a cada objetivo.

#### Rondas por objetivo (`ROUNDS_BY_GOAL`):
Cada objetivo tiene 3 rondas. El jugador ve el objetivo, el ahorro semanal y el número de semanas; debe responder **Sí / No** a si el total acumulado (`weekly × weeks`) cubre el precio del objetivo. **El resultado no se muestra** — el alumno debe calcularlo con la calculadora.

Los números son deliberadamente no triviales (ningún múltiplo redondo de ×10) y los resultados quedan cerca del precio objetivo para generar duda real.

| Objetivo | R1 | R2 | R3 |
|----------|----|----|-----|
| Play5 (500 €) | 35×14=490 ❌ | 45×12=540 ✅ | 28×18=504 ✅ |
| Viaje (240 €) | 32×7=224 ❌ | 24×11=264 ✅ | 16×15=240 ✅ (justo) |
| Bicicleta (90 €) | 12×8=96 ✅ | 13×6=78 ❌ | 15×7=105 ✅ |
| Movil (180 €) | 22×9=198 ✅ | 18×9=162 ❌ | 14×13=182 ✅ (por poco) |

#### Puntuación:
- `ROUND_POINTS = [33, 33, 34]` — los tres suman 100
- Solo se suman puntos si la respuesta es correcta; los fallos no restan
- **Aprueba con ≥ 50 pts** (no 70 como los demás minijuegos)
- El umbral 50 se gestiona en `App.tsx`: `const passScore = currentGame === 2 ? 50 : 70`

#### Feedback visual por ronda:
- `roundPhase: 'answering' | 'feedback'`
- Al responder: el panel `.ao-challenge` recibe clase `--correct` (verde) o `--wrong` (rojo)
- Animación: `aoCorrectFlash` (escala) o `aoWrongShake` (sacudida horizontal)
- Texto de feedback aparece con `aoPopIn`; después de 1 200 ms → siguiente ronda o resultado

#### Calculadora (`Calculator`):
- Componente independiente (`src/components/Calculator.tsx`)
- Calculadora de 4 operaciones (+, -, ×, ÷) con tecla `⌫` y `C`
- Acepta prop `className?: string` para posicionarla desde el padre
- En `AhorroObjetivo`: posición absoluta en la esquina inferior derecha (`.ao-calculator`)
- En móvil (≤ 960 px): se centra en la parte inferior y el área de juego tiene `overflow-y: auto`
- CSS prefix: `calc-`

#### Estado del componente:
```typescript
const [gamePhase,          setGamePhase]          = useState<GamePhase>('intro')
const [introStep,          setIntroStep]          = useState<IntroStep>(1)
const [selectedGoal,       setSelectedGoal]       = useState<Goal | null>(null)
const [round,              setRound]              = useState(0)
const [roundPhase,         setRoundPhase]         = useState<RoundPhase>('answering')
const [score,              setScore]              = useState(0)
const [lastAnswerCorrect,  setLastAnswerCorrect]  = useState<boolean | null>(null)
const [leaving,            setLeaving]            = useState(false)
```

#### Lógica de `handleAnswer`:
- Calcula `correctAnswer = savedAmount >= selectedGoal.price` (booleano)
- Compara con la respuesta del usuario (Sí = `true`, No = `false`)
- `setRoundPhase('feedback')` → `setTimeout(1200)` → batch `setRoundPhase('answering') + setRound(next)` (mismo patrón de React 18 batch que los otros minijuegos)
- Al llegar a la última ronda: `setGamePhase('result')`

#### Pantalla de resultado:
- Si **aprueba** (≥ 50 pts): bocadillo verde + puntuación en verde claro (`#b9f6ca`) + botón "Continuar"
- Si **suspende**: bocadillo rojo + puntuación en naranja claro (`#ffccbc`) + botón "Intentar de nuevo"
- Sin botón "Volver al mapa" ni "Ver respuestas"

#### Clases CSS clave (prefijo `ao-`):
| Clase | Descripción |
|-------|-------------|
| `.ao-screen` | Raíz, flex column, 100vh |
| `.ao-bg` | Fondo absoluto z-index 0 |
| `.ao-overlay` | Overlay negro 0.65 permanente z-index 1 |
| `.ao-intro` | Slides 1 y 2, absoluto z-index 10 |
| `.ao-intro-bubble` | Bocadillo con `key={introStep}` para reanimar `aoPopIn` |
| `.ao-goal-select` | Pantalla de selección de objetivo (paso 3), absoluta z-index 10 |
| `.ao-goal-card` | Tarjeta seleccionable de objetivo |
| `.ao-goal-card--selected` | Borde dorado + glow al seleccionar |
| `.ao-header` | Header gameplay z-index 2 |
| `.ao-play-area` | Área de juego, flex, position relative |
| `.ao-challenge` | Panel blanco central con el reto |
| `.ao-challenge--correct` | Flash verde + `aoCorrectFlash` |
| `.ao-challenge--wrong` | Sacudida roja + `aoWrongShake` |
| `.ao-answer-btn--yes` | Botón verde "Sí" |
| `.ao-answer-btn--no` | Botón rojo "No" |
| `.ao-feedback` | Texto feedback correcto/incorrecto |
| `.ao-calculator` | Calculadora anclada esquina inferior derecha |
| `.ao-result` | Resultado absoluto z-index 10 |
| `.ao-score-badge` | Contador naranja/dorado en el header |

---

### 3. 🏷️ Comparar Ofertas — 🔲 PENDIENTE
- Varias opciones de un producto → elegir la mejor (precio/unidad)
- Explicación del resultado

### 4. 💰 El Cambio — 🔲 PENDIENTE
- Modelo: producto + precio, billete de pago, cálculo de cambio
- Vista comprador: acepta o reclama el cambio
- Vista cajero: selecciona monedas/billetes para dar cambio

---

## 🎨 Decisiones de Diseño Establecidas

- **Fondo intro/selección:** `Paisaje.png` con `background-size: cover; background-position: bottom center`
- **Fondo mapa:** `Mapa.png` con `background-size: cover; background-position: center center`
- **Fondo minijuegos (0, 1 y 2):** `FondoMinijuego1.png` + overlay permanente `rgba(0,0,0,0.65)` siempre visible
- **Paleta:** naranja/amarillo para botones (`#ff6f00` → `#ffa000`), sombra `#bf360c`; dorado `#ffcc02` para bordes de bocadillos
- **Bocadillos:** fondo blanco, borde `#ffcc02`, triángulo CSS, sombra
- **Botones principales:** `border-radius: 60px`, gradiente naranja, sombra 3D, hover = `translateY(-4px)`
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
- En minijuegos: bocadillo con dos slides navegables en la fase `intro`

---

## 🛠️ Sistema de Debug

`App.tsx` incluye un bloque `DEBUG` en el nivel de módulo (fuera del componente) que permite saltar directamente a cualquier estado de la app sin pasar por el flujo normal.

```typescript
// Líneas ~19-52 de App.tsx
const DEBUG = {
  enabled: false,          // ← cambiar a true para activar

  screen:         'map'    as Screen,
  currentGame:    null     as number | null,
  completedGames: []       as number[],
  points:         0,
  player: {
    name:      'Tester',
    character: 'boy'   as const,
    ficha:     'perro' as const,
  },
}

const D = DEBUG.enabled ? DEBUG : null   // null cuando está desactivado

// Los useState reciben los valores de DEBUG o los por defecto con ??
const [screen, setScreen] = useState<Screen>(D?.screen ?? 'home')
// ... etc.
```

### Presets de uso habitual:

| Qué testear | `screen` | `currentGame` | `completedGames` |
|---|---|---|---|
| Mapa vacío | `'map'` | `null` | `[]` |
| Mapa con 3 completos | `'map'` | `null` | `[0, 1, 2]` |
| Minijuego 0 directo | `'minigame'` | `0` | `[]` |
| Minijuego 1 directo | `'minigame'` | `1` | `[]` |
| Minijuego 2 directo | `'minigame'` | `2` | `[]` |

### Notas técnicas:
- El objeto `DEBUG` se evalúa **una sola vez** al cargar el módulo — sin coste en renders.
- Cuando `enabled: false`, `D` es `null` y los `useState` usan sus valores por defecto normales.
- Al entrar en `screen: 'minigame'`, `player` ya viene relleno desde `DEBUG.player`, por lo que la guardia `player && currentGame !== null` de `App.tsx` no falla.

---

## 🧠 Instrucciones para Claude

- Prioriza **componentes reutilizables en React**
- Mantén **lógica separada de UI**
- Usa **estado claro (`useState` / `useReducer` si necesario)**
- Diseña pensando en **niños (simplicidad extrema)**
- Incluye **feedback visual inmediato**
- Evita complejidad innecesaria
- Usa **TypeScript** (`.tsx`), no JavaScript puro
- Usa **vanilla CSS**, no Tailwind ni librerías de UI
- Las imágenes del `/public/` se referencian desde la raíz: `/Cerdito.png` etc.
- Los botones deshabilitados usan `disabled` + `opacity: 0.4`, **nunca se ocultan**
- Las transiciones entre pantallas duran 550ms con clase CSS `--leaving`
- Al implementar un minijuego real, añade un `if (currentGame === N)` dentro del bloque `if (screen === 'minigame')` en `App.tsx`; el componente recibe `onComplete(score: number)` y `onBack()`

### Patrón estándar de minijuego (ver NecesidadDeseo y PrecioCosas como referencia):
- Fases: `'intro' → 'playing' → 'result'`
- Intro: 2 slides con Huchín, bocadillo con `key={introSlide}` para reanimar
- Fondo: `FondoMinijuego1.png` + `<div className="XX-overlay" />` (z-index 1) siempre visible
- Resultado: `position: absolute; inset: 0; z-index: 10` apilado sobre el gameplay
- Función `exit(withScore)`: `setLeaving(true)` → 550ms → `onComplete(score)` o `onBack()`
- Prefijo CSS único por componente (`nd-` para NecesidadDeseo, `pc-` para PrecioCosas, etc.)

### Patrones técnicos importantes:
- **Avance entre rondas con efecto de roundPhase:** hacer batch de `setRoundPhase('active') + setRound(next)` en el mismo `setTimeout` para que React 18 los batchee y el efecto no se re-ejecute con el estado antiguo de roundPhase en el nuevo round
- **Drag & drop:** almacenar info del drag en `useRef` (no en estado) para evitar stale closures en los handlers de `onDrop`
- **Timer con RAF:** `requestAnimationFrame` para suavidad, cancelar en el cleanup del `useEffect`
- **Pools sin repetición:** `useRef<Item[]>` inicializado al empezar, repuesto cuando se agota
