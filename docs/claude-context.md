# 🐷 Proyecto: Videojuego Educativo sobre el Dinero

## 📌 Contexto General

Este proyecto consiste en el desarrollo de una **aplicación web en React** para un programa de **cooperación social de la Universidad de Sevilla**.

El objetivo es enseñar a niños de **3º a 6º de Primaria** (aprox. 8–12 años), especialmente de **barriadas desfavorecidas de Sevilla**, el **valor del dinero** mediante un enfoque lúdico.

La aplicación será un **videojuego educativo interactivo**, donde el alumno avanza a través de un **mapa/camino**, completando minijuegos.

---

## ⚙️ Stack Tecnológico Real

- **Framework:** React 19 + TypeScript (`.tsx`)
- **Build tool:** Vite 8
- **Estilos:** Vanilla CSS con CSS Variables y CSS Nesting — **sin Tailwind**
- **Linting:** ESLint 9 + TypeScript ESLint
- **Gestión de estado:** `useState` / `useReducer` (sin librerías externas)
- **SPA:** Sin router — navegación por estado en `App.tsx`

---

## 📁 Estructura de Archivos Actual

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
    └── MapScreen.tsx / .css         ← Mapa de aventuras (5 nodos)

public/
├── Cerdito.png     ← Mascota principal (Huchín)
├── Niña.png        ← Personaje femenino
├── Niño.png        ← Personaje masculino
├── Paisaje.png     ← Fondo pantallas intro/selección
├── Mapa.png        ← Fondo del mapa de aventuras
└── favicon.svg

docs/
└── claude-context.md
```

> ⚠️ Las imágenes están en `/public/` con mayúsculas y tildes exactas.
> Vite las sirve en la raíz: `src="/Cerdito.png"`, `src="/Niña.png"`, `src="/Niño.png"`, `src="/Paisaje.png"`.

---

## 🎮 Flujo de Pantallas Implementado

`App.tsx` gestiona el flujo con un estado `screen: 'home' | 'intro' | 'character-select' | 'map' | 'minigame'`, guarda `player: { name: string, character: 'girl' | 'boy' }`, `completedGames: number[]` y `currentGame: number | null`.

### Pantalla 1 — `HomeScreen`
- Fondo: `Paisaje.png`
- Título: "¡La Aventura del Ahorro!"
- Cerdito (Huchín) centrado, **clickable**
- Antes de hacer clic: el cerdito tiene animación `idlePulse` (escala suave) para invitar al click
- Al hacer clic: aparece bocadillo "¡Hola! Soy Huchín y voy a ser tu guía en esta aventura ¿Estás preparado?"
- Botón "¡Empezar!" **deshabilitado** hasta que el niño haya hablado con Huchín (`met === true`)
- Transición de salida: fade-out + scale con clase `home-screen--leaving`

### Pantalla 2 — `IntroScreen`
- Fondo: `Paisaje.png`
- Huchín con bocadillo de **efecto typewriter** (38ms/carácter)
- Truco de layout: el texto completo se renderiza invisible (`.intro-bubble-ghost`) para fijar el tamaño del bocadillo desde el primer frame; el texto visible se superpone en `position: absolute`
- Clic en el bocadillo → salta al final instantáneamente
- Botón "Continuar →" siempre visible pero **deshabilitado** hasta que el texto termina
- Transición de salida: fade-out

### Pantalla 3 — `CharacterSelect`
- Fondo: `Paisaje.png` con overlay oscuro `rgba(8, 4, 24, 0.7)`
- Layout horizontal: Huchín a la izquierda con bocadillo fijo, panel de selección a la derecha
- Dos tarjetas seleccionables (Niña / Niño) con borde dorado y glow al seleccionar
- Input de nombre (máx. 20 chars, Enter confirma)
- Botón "¡Vamos!" deshabilitado hasta que hay personaje seleccionado Y nombre introducido
- En mobile (< 960px): layout vertical, Huchín debajo

### Pantalla 4 — `MapScreen` (mapa interactivo)
- Fondo: `Mapa.png` con `background-size: cover`
- 5 nodos circulares posicionados en `%` sobre los círculos del fondo (ajustables en `GAME_NODES` dentro de `MapScreen.tsx`)
- **Estado de nodos:** `--next` (naranja pulsante, desbloqueado), `--done` (verde con ✓), `--locked` (gris con 🔒)
- Solo el primer nodo se desbloquea al entrar; los siguientes se desbloquean al completar el anterior
- Personaje (`Niña.png` / `Niño.png`) posicionado en el camino con `CHAR_POSITIONS[]`, avanza suavemente con transición CSS al completar juegos
- Huchín arriba a la derecha con bocadillo que cambia según el progreso
- El nodo activo tiene animación `nodePulse` para invitar al clic
- Etiqueta con nombre del juego bajo cada nodo (fondo semitransparente para legibilidad)
- Al pulsar un nodo → `screen = 'minigame'`, `currentGame = gameIndex`
- Al completar o salir de minijuego → vuelve a `'map'`

### Pantalla 5 — `minigame` (placeholder)
- Placeholder genérico que muestra el nombre del minijuego
- Botón "Completar (prueba)" añade el índice a `completedGames` y vuelve al mapa
- Botón "Volver al mapa" vuelve sin completar
- **Sustituir por cada minijuego real cuando se implemente**

---

## 🎨 Decisiones de Diseño Establecidas

- **Fondo universal:** `Paisaje.png` con `background-size: cover; background-position: bottom center`
- **Paleta:** naranja/amarillo para botones (`#ff6f00` → `#ffa000`), sombra `#bf360c`; dorado `#ffcc02` para bordes de bocadillos
- **Bocadillos:** fondo blanco, borde `#ffcc02`, triángulo CSS apuntando al cerdito, sombra
- **Botones principales:** `border-radius: 60px`, gradiente naranja, sombra 3D desplazada hacia abajo, hover = translateY(-4px)
- **Botones deshabilitados:** `opacity: 0.4`, `cursor: not-allowed`
- **Transiciones de pantalla:** `opacity + scale`, 550ms, clase `--leaving` en el componente raíz
- **Sin animación bounce** en ninguna pantalla (eliminada por decisión del usuario)
- **Sin Tailwind** — todo vanilla CSS con `clamp()` para responsive

---

## 🐷 Mascota: Huchín

- Nombre: **Huchín**
- Imagen: `/Cerdito.png`
- Rol: guía narrativo, aparece en todas las pantallas con bocadillos
- **No tiene animación de bounce** (eliminada)
- En HomeScreen: clickable para presentarse; en las demás pantallas: estático con bocadillo

---

## 🧠 Minijuegos Pendientes de Implementar

### 1. 💰 El Cambio
- Modelo: producto + precio, billete de pago, cálculo de cambio
- Vista comprador: acepta o reclama el cambio
- Vista cajero: selecciona monedas/billetes para dar cambio

### 2. 🛒 Necesidad vs Deseo
- Mostrar producto → elegir NECESIDAD o DESEO
- Validación inmediata, feedback, puntuación

### 3. 💸 ¿Cuánto cuesta?
- Mostrar producto → elegir rango de precio (<1€, 1-5€, 5-20€, >20€)
- Validación + feedback

### 4. 🐖 Ahorro con Objetivo
- Objetivo con coste → elegir ahorro semanal → calcular semanas
- Barra de progreso visual

### 5. 🏷️ Comparar Ofertas
- Varias opciones de un producto → elegir la mejor (precio/unidad)
- Explicación del resultado

---

## 🎯 Objetivos Pedagógicos

- Comprender el valor del dinero
- Aprender a dar y recibir cambio
- Diferenciar necesidades vs deseos
- Estimar precios
- Entender el ahorro
- Comparar ofertas inteligentemente

---

## 🧩 Requisitos UX

- Interfaz simple e intuitiva para niños de 8–12 años
- Elementos visuales **grandes** (tablet-first)
- Feedback inmediato y visual
- Interacción táctil
- Sin bounce en imágenes (decisión del usuario)
- Botones siempre visibles aunque deshabilitados (no ocultar)

---

## 🧠 Instrucciones para Claude

Cuando generes código o propuestas:

- Prioriza **componentes reutilizables en React**
- Mantén **lógica separada de UI**
- Usa **estado claro (useState / useReducer si necesario)**
- Diseña pensando en **niños (simplicidad extrema)**
- Incluye **feedback visual inmediato**
- Evita complejidad innecesaria
- Propón **arquitectura escalable por minijuegos**
- Usa **TypeScript** (`.tsx`), no JavaScript puro
- Usa **vanilla CSS**, no Tailwind ni librerías de UI
- Las imágenes del `/public/` se referencian desde la raíz: `/Cerdito.png` etc.
- Los botones deshabilitados usan `disabled` + `opacity: 0.4`, **nunca se ocultan**
- Las transiciones entre pantallas duran 550ms con clase CSS `--leaving`
