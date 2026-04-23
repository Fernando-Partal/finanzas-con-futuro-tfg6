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
    └── MapScreen.tsx / .css         ← Mapa de aventuras (5 nodos + ficha animada)

public/
├── Cerdito.png       ← Mascota principal (Huchín)
├── Niña.png          ← Personaje femenino
├── Niño.png          ← Personaje masculino
├── Paisaje.png       ← Fondo pantallas intro/selección
├── Mapa.png          ← Fondo del mapa de aventuras
├── FichaCoche.png    ← Ficha seleccionable: coche
├── FichaPerro.png    ← Ficha seleccionable: perro
├── FichaPato.png     ← Ficha seleccionable: pato
└── favicon.svg
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

### Pantalla 6 — `minigame` (placeholder)
- Placeholder genérico con nombre del juego
- Botón "Completar (prueba)" → añade al `completedGames`, suma 100 pts, vuelve al mapa
- Botón "Volver al mapa" → vuelve sin completar
- **Pendiente: implementar cada minijuego real**

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

## 🧩 Minijuegos Pendientes de Implementar

### 0. 🛒 Necesidad vs Deseo
- Mostrar producto → elegir NECESIDAD o DESEO
- Validación inmediata, feedback, puntuación

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
- Al implementar un minijuego real, sustituye el bloque `if (screen === 'minigame')` en `App.tsx` por el componente correspondiente; debe recibir `player` y llamar a `onComplete(score: number)` al terminar
