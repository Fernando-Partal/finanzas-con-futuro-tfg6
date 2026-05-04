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
    ├── CompararOfertas.tsx / .css   ← Minijuego 3 — IMPLEMENTADO ✅
    ├── ElCambio.tsx / .css          ← Minijuego 4 — IMPLEMENTADO ✅
    └── Calculator.tsx / .css        ← Calculadora reutilizable (usada en Minijuegos 2, 3 y 4)

public/
├── Cerdito.png          ← Mascota principal (Huchín)
├── Niña.png             ← Personaje femenino
├── Niño.png             ← Personaje masculino
├── Paisaje.png          ← Fondo pantallas intro/selección
├── Mapa.png             ← Fondo del mapa de aventuras
├── FichaCoche.png       ← Ficha seleccionable: coche
├── FichaPerro.png       ← Ficha seleccionable: perro
├── FichaPato.png        ← Ficha seleccionable: pato
├── FondoMinijuego1.png  ← Fondo compartido por todos los minijuegos
├── Articulos/           ← Imágenes de productos
│   ├── Arroz.png, Cuadernos.png, Filete.png, Fruta.png,
│   │   Leche.png, Pasta.png, Pescado.png, Verduras.png      ← NECESIDADES (8)
│   ├── Bicicleta.png, Chocolate.png, Chucherias.png,
│   │   CocheTeledirigido.png, Donuts.png, MandoPlay.png,
│   │   Muñeca.png, Refresco.png                             ← DESEOS (8)
│   ├── CajaRegistradora.png                                 ← Icono caja registradora (MJ4)
│   ├── Movil.png, Play5.png, Viaje.png                      ← Objetivos de ahorro (MJ2)
└── Dinero/              ← Imágenes de monedas y billetes (MJ4)
    ├── 1centimo.png, 2centimos.png, 5centimos.png
    ├── 10centimos.png, 20centimos.png, 50centimos.png
    ├── 1euro.png, 2 euros.png, 5euros.png
    └── 10euros.png, 20euros.png
```

> Las imágenes están en `/public/` y se referencian desde la raíz: `/Cerdito.png`, etc.
> El archivo `2 euros.png` tiene un espacio — referenciarlo como `/Dinero/2%20euros.png` en el código.

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
- Para `currentGame === 3`: renderiza `<CompararOfertas>` ✅
- Para `currentGame === 4`: renderiza `<ElCambio>` ✅
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
| 3      | Comparar Ofertas     | ✅ Implementado |
| 4      | El Cajero            | ✅ Implementado |

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

#### Puntuación:
- `PTS_CORRECT = 6` por tocar necesidad (cap global en 100)
- `PTS_WRONG = 5` por tocar deseo (mín. 0)
- **Aprueba con ≥ 70 pts**

#### Clases CSS clave (prefijo `nd-`):
| Clase | Descripción |
|-------|-------------|
| `.nd-screen` | Raíz, flex column, 100vh |
| `.nd-bg` | Fondo absoluto z-index 0 |
| `.nd-overlay` | Overlay negro 0.65 permanente z-index 1 |
| `.nd-intro` | Pantalla intro absoluta z-index 10 |
| `.nd-header` | Header gameplay z-index 2 |
| `.nd-play-area` | Área de juego, flex, position relative |
| `.nd-result` | Resultado absoluto z-index 10, centrado |
| `.nd-answers` | Pantalla respuestas absoluta z-index 20, opaca |
| `.nd-point-pop` | Indicador flotante puntos, position fixed |

---

### 1. 💸 ¿Cuánto cuesta? — ✅ IMPLEMENTADO
**Archivo:** `src/components/PrecioCosas.tsx` / `.css`
**Fondo:** `FondoMinijuego1.png` + overlay permanente `rgba(0,0,0,0.65)`.

#### Fases del componente (`GamePhase`):
1. `'intro'` — Huchín con bocadillo. **Dos slides** navegables.
2. `'playing'` — Gameplay activo (5 rondas).
3. `'result'` — Puntuación + mensaje pass/fail + botón continuar o reintentar.

#### Mecánica de juego (drag & drop):
- 5 rondas con **4 artículos** cada una, dispuestos en grid **2×2**
- Abajo: **4 etiquetas de precio azules** (banco), mezcladas al azar
- El alumno **arrastra** cada etiqueta hasta el artículo correcto
- **Botón "¡Validar!"** solo se habilita cuando los 4 artículos tienen etiqueta
- Al validar: badge **✓ verde** o **✗ rojo** en cada tarjeta → 2.5 s de feedback → siguiente ronda

#### Puntuación:
- `PTS_PER_CORRECT = 5` por artículo correcto
- 5 rondas × 4 artículos = 20 posibles × 5 = **100 pts máximo**
- **Aprueba con ≥ 70 pts**

#### Clases CSS clave (prefijo `pc-`):
| Clase | Descripción |
|-------|-------------|
| `.pc-screen` | Raíz, mismo patrón que `nd-screen` |
| `.pc-cards-grid` | Grid 2×2 de tarjetas de artículo |
| `.pc-bank` | Zona de etiquetas sueltas + drop target para devolver |
| `.pc-btn--validate` | Botón verde "¡Validar!" |

---

### 2. 🐖 Ahorro con Objetivo — ✅ IMPLEMENTADO
**Archivo:** `src/components/AhorroObjetivo.tsx` / `.css`
**Fondo:** `FondoMinijuego1.png` + overlay permanente `rgba(0,0,0,0.65)`.
**Componente auxiliar:** `Calculator.tsx` / `.css`

#### Fases del componente (`GamePhase`):
1. `'intro'` — Huchín con bocadillo. **Tres pasos** (`IntroStep = 1 | 2 | 3`):
   - Paso 1: explica el concepto de ahorro por objetivo.
   - Paso 2: explica la mecánica (`ahorro semanal × semanas`).
   - Paso 3: **selección de objetivo** — layout izquierda/derecha como FichaSelect.
2. `'playing'` — Gameplay activo (3 rondas por objetivo).
3. `'result'` — Puntuación + mensaje pass/fail.

#### Objetivos disponibles (`GOALS`):
| ID | Nombre | Precio |
|----|--------|--------|
| `play5` | Play5 | 500 € |
| `viaje` | Viaje | 240 € |
| `bicicleta` | Bicicleta | 90 € |
| `movil` | Móvil | 180 € |

#### Puntuación:
- `ROUND_POINTS = [33, 33, 34]` — los tres suman 100
- **Aprueba con ≥ 50 pts** (umbral especial gestionado en `App.tsx`)

#### Clases CSS clave (prefijo `ao-`):
| Clase | Descripción |
|-------|-------------|
| `.ao-screen` | Raíz |
| `.ao-goal-select` | Pantalla de selección de objetivo (paso 3) |
| `.ao-challenge` | Panel blanco central con el reto |
| `.ao-calculator` | Calculadora anclada esquina inferior derecha |

---

### 3. 🏷️ Comparar Ofertas — ✅ IMPLEMENTADO
**Archivo:** `src/components/CompararOfertas.tsx` / `.css`
**Fondo:** `FondoMinijuego1.png` + overlay permanente `rgba(0,0,0,0.65)`.
**Componente auxiliar:** `Calculator.tsx`

#### Fases del componente (`GamePhase`):
1. `'intro'` — Huchín con bocadillo. **Dos slides** navegables.
2. `'playing'` — Gameplay activo (6 rondas).
3. `'result'` — Puntuación + mensaje pass/fail.

#### Mecánica de juego:
- 6 rondas: 2 fáciles, 2 medias, 2 difíciles
- En cada ronda: mismo producto en **2 opciones** (fácil/medio) o **3 opciones** (difícil)
- El alumno elige la opción con **mejor precio por unidad o por kilo**
- Tras elegir: feedback 1 800 ms mostrando el precio por unidad de todas las opciones

#### Puntuación:
- Fáciles: 15 pts × 2 = 30 pts | Medias: 20 pts × 2 = 40 pts | Difíciles: 15 pts × 2 = 30 pts
- Total máximo: **100 pts** | **Aprueba con ≥ 70 pts**

#### Clases CSS clave (prefijo `co-`):
| Clase | Descripción |
|-------|-------------|
| `.co-screen` | Raíz |
| `.co-options` | Flex row de tarjetas de opción |
| `.co-option-card--correct/wrong/dim` | Estados de feedback |
| `.co-calculator` | Calculadora anclada esquina inferior derecha |

---

### 4. 💰 El Cajero — ✅ IMPLEMENTADO
**Archivo:** `src/components/ElCambio.tsx` / `.css`
**Fondo:** `FondoMinijuego1.png` + overlay permanente `rgba(0,0,0,0.65)`.
**Componente auxiliar:** `Calculator.tsx`

#### Fases del componente (`GamePhase`):
1. `'intro'` — Huchín con bocadillo. **Dos slides** navegables:
   - Slide 1: bienvenida, explica el rol de cajero.
   - Slide 2: instrucciones de la caja registradora y la calculadora.
2. `'playing'` — Gameplay activo (5 rondas) en **una única pantalla integrada**.
   - Columna izquierda: calculadora de ayuda (`Calculator`).
   - Panel central: producto, pago del cliente, vista previa de monedas seleccionadas, total y validación.
   - Panel derecho: caja registradora integrada con monedas/billetes.
3. `'result'` — Puntuación + mensaje pass/fail + botón continuar o reintentar.

#### Mecánica de juego:
El alumno toma el rol de **cajero**. En cada ronda ve un producto con su precio y la moneda/billete con la que paga el cliente. Debe calcular el cambio con la calculadora y seleccionar directamente en la caja registradora las monedas y billetes exactos.

**Flujo dentro de una ronda (pantalla integrada):**
1. La **calculadora** queda siempre visible en el panel izquierdo para operaciones de apoyo.
2. El **panel central** muestra:
   - Tarjeta del producto (imagen, nombre, precio en tag naranja).
   - Tarjeta de pago ("El cliente paga" + imagen moneda/billete + cantidad).
   - Área de **vista previa de monedas seleccionadas**: muestra imagen + ×N de cada denominación elegida, o texto de ayuda si no hay ninguna.
   - Footer con **total seleccionado** y botón verde **"Validar"**.
   - Tras validar: feedback en el footer (verde/rojo, 2,2 s) y avance a la siguiente ronda o resultado.
3. El **panel derecho** integra la caja registradora:
   - Topbar con icono de `CajaRegistradora.png`, título corto "Caja" y total seleccionado.
   - Cuadrícula compacta de las 11 denominaciones.
   - Cada tarjeta: imagen de moneda/billete, botones **−** (rojo) y **+** (verde), contador numérico (dorado cuando > 0).
   - Tarjetas con count > 0 resaltan con borde naranja + glow.

#### Denominaciones disponibles (`DENOMINATIONS`):
| Valor | Imagen |
|-------|--------|
| 1 c | `/Dinero/1centimo.png` |
| 2 c | `/Dinero/2centimos.png` |
| 5 c | `/Dinero/5centimos.png` |
| 10 c | `/Dinero/10centimos.png` |
| 20 c | `/Dinero/20centimos.png` |
| 50 c | `/Dinero/50centimos.png` |
| 1 € | `/Dinero/1euro.png` |
| 2 € | `/Dinero/2%20euros.png` (ojo: espacio en filename) |
| 5 € | `/Dinero/5euros.png` |
| 10 € | `/Dinero/10euros.png` |
| 20 € | `/Dinero/20euros.png` |

#### Rondas (`ROUNDS`) — precios en céntimos enteros para evitar errores float:
| Ronda | Producto | Precio | Pago | Cambio | Puntos |
|-------|----------|--------|------|--------|--------|
| 1 | Chucherías | 0,50 € | 1 € | **0,50 €** | 20 |
| 2 | Arroz | 1,20 € | 2 € | **0,80 €** | 20 |
| 3 | Cuadernos | 3,50 € | 5 € | **1,50 €** | 20 |
| 4 | Chocolate | 4,00 € | 10 € | **6,00 €** | 20 |
| 5 | Muñeca | 12,00 € | 20 € | **8,00 €** | 20 |

La validación compara `totalSelected === changeCents` (enteros en céntimos). Cualquier combinación de monedas que sume exactamente el cambio es válida.

#### Puntuación:
- 5 rondas × 20 pts = **100 pts máximo**
- **Aprueba con ≥ 70 pts**
- Los fallos no restan

#### Estado del componente:
```typescript
const [gamePhase,   setGamePhase]   = useState<GamePhase>('intro')
const [introSlide,  setIntroSlide]  = useState<1 | 2>(1)
const [round,       setRound]       = useState(0)
const [counts,      setCounts]      = useState<number[]>(DENOMINATIONS.map(() => 0))
const [roundPhase,  setRoundPhase]  = useState<RoundPhase>('waiting')
const [lastCorrect, setLastCorrect] = useState<boolean | null>(null)
const [score,       setScore]       = useState(0)
const [leaving,     setLeaving]     = useState(false)

// Derivados:
const changeCents   = currentRound.paymentCents - currentRound.priceCents
const totalSelected = counts.reduce((sum, count, i) => sum + count * DENOMINATIONS[i].valueCents, 0)
```

#### Clases CSS clave (prefijo `ch-`):
| Clase | Descripción |
|-------|-------------|
| `.ch-screen` | Raíz, flex column, 100vh |
| `.ch-bg` / `.ch-overlay` | Fondo + overlay negro 0.65 |
| `.ch-intro` | Intro absoluta z-index 10 |
| `.ch-header` | Header gameplay z-index 2 |
| `.ch-score-badge` | Contador naranja/dorado |
| `.ch-play-area` | Área de gameplay integrada en grid: calculadora izquierda, reto centro, caja derecha |
| `.ch-tool-panel` / `.ch-tool-panel--calculator` | Panel lateral para la calculadora |
| `.ch-main-panel` | Contenedor central del reto y validación |
| `.ch-challenge` | Panel blanco central con `key={round}` |
| `.ch-challenge-cards` | Flex row: tarjeta producto + flecha + tarjeta pago |
| `.ch-info-card` | Tarjeta blanca (producto o pago) |
| `.ch-info-card--payment` | Variante azul claro para el pago |
| `.ch-price-tag` | Etiqueta naranja con el precio del producto |
| `.ch-payment-img` | Imagen de la moneda/billete de pago |
| `.ch-payment-img--bill` | Variante landscape para billetes |
| `.ch-selection-area` | Contenedor de preview de selección |
| `.ch-selected-coins` | Flex wrap con monedas elegidas (borde naranja discontinuo) |
| `.ch-selected-item` | Tarjeta mini: imagen + ×N |
| `.ch-selection-hint` | Texto de ayuda cuando no hay selección |
| `.ch-round-footer` | Footer del panel: total + validar o feedback |
| `.ch-round-footer--pass/fail` | Estados verde/rojo tras validar |
| `.ch-feedback-msg--pass/fail` | Texto feedback correcto/incorrecto (colores oscuros — fondo blanco) |
| `.ch-calculator` | Calculadora renderizada dentro del panel izquierdo |
| `.ch-register-wrap` | Panel derecho integrado de caja registradora, flex column, fondo verde oscuro |
| `.ch-register-topbar` | Barra superior de la caja |
| `.ch-register-title-row` | Icono + título "Caja" |
| `.ch-register-total` | Total seleccionado mostrado en la topbar de la caja |
| `.ch-coins-grid` | Grid compacto de denominaciones en el panel derecho |
| `.ch-coin-card` | Tarjeta de denominación |
| `.ch-coin-card--active` | Borde naranja + glow cuando count > 0 |
| `.ch-coin-img` | Imagen uniforme compacta para monedas y billetes |
| `.ch-coin-controls` | Fila −, contador, + |
| `.ch-coin-count--active` | Contador dorado con animación chPopIn |
| `.ch-register-footer` | Footer de la caja con total seleccionado |
| `.ch-result` | Resultado absoluto z-index 10 |

---

## 🎨 Decisiones de Diseño Establecidas

- **Fondo intro/selección:** `Paisaje.png` con `background-size: cover; background-position: bottom center`
- **Fondo mapa:** `Mapa.png` con `background-size: cover; background-position: center center`
- **Fondo minijuegos (todos):** `FondoMinijuego1.png` + overlay permanente `rgba(0,0,0,0.65)` siempre visible
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

const D = DEBUG.enabled ? DEBUG : null
```

### Presets de uso habitual:

| Qué testear | `screen` | `currentGame` | `completedGames` |
|---|---|---|---|
| Mapa vacío | `'map'` | `null` | `[]` |
| Mapa con 4 completos | `'map'` | `null` | `[0, 1, 2, 3]` |
| Minijuego 0 directo | `'minigame'` | `0` | `[]` |
| Minijuego 1 directo | `'minigame'` | `1` | `[]` |
| Minijuego 2 directo | `'minigame'` | `2` | `[]` |
| Minijuego 3 directo | `'minigame'` | `3` | `[]` |
| Minijuego 4 directo | `'minigame'` | `4` | `[]` |

> **⚠️ Importante:** acordarse de poner `enabled: false` antes de hacer build/deploy.

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

### Patrón estándar de minijuego (ver CompararOfertas como referencia canónica):
- Fases: `'intro' → 'playing' → 'result'`
- Intro: 2 slides con Huchín, bocadillo con `key={introSlide}` para reanimar
- Fondo: `FondoMinijuego1.png` + `<div className="XX-overlay" />` (z-index 1) siempre visible
- Resultado: `position: absolute; inset: 0; z-index: 10` apilado sobre el gameplay
- Función `exit(withScore)`: `setLeaving(true)` → 550ms → `onComplete(score)` o `onBack()`
- Prefijo CSS único por componente (`nd-`, `pc-`, `ao-`, `co-`, `ch-`…)

### Patrones técnicos importantes:
- **Avance entre rondas con efecto de roundPhase:** hacer batch de `setRoundPhase('active') + setRound(next)` en el mismo `setTimeout` para que React 18 los batchee y el efecto no se re-ejecute con el estado antiguo de roundPhase en el nuevo round
- **Drag & drop:** almacenar info del drag en `useRef` (no en estado) para evitar stale closures en los handlers de `onDrop`
- **Timer con RAF:** `requestAnimationFrame` para suavidad, cancelar en el cleanup del `useEffect`
- **Pools sin repetición:** `useRef<Item[]>` inicializado al empezar, repuesto cuando se agota
- **Aritmética monetaria:** operar siempre en **céntimos enteros** para evitar errores de punto flotante. Formatear a euros solo en UI con `(cents / 100).toFixed(2).replace('.', ',') + ' €'`
- **Nombres de archivo con espacios:** codificar como `%20` en los src de imágenes (ej: `/Dinero/2%20euros.png`)
