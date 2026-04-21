# 🐷 Proyecto: Videojuego Educativo sobre el Dinero

## 📌 Contexto General

Este proyecto consiste en el desarrollo de una **aplicación web en React** para un programa de **cooperación social de la Universidad de Sevilla**.

El objetivo es enseñar a niños de **3º a 6º de Primaria** (aprox. 8–12 años), especialmente de **barriadas desfavorecidas de Sevilla**, el **valor del dinero** mediante un enfoque lúdico.

La aplicación será un **videojuego educativo interactivo**, donde el alumno avanza a través de un **mapa/camino**, completando minijuegos.

---

## 🎮 Estructura del Juego

- El juego sigue un **camino interactivo**
- El jugador progresa superando **minijuegos educativos**
- Hay un **hilo conductor narrativo**
- Una **mascota (cerdito hucha 🐷)** guía al niño:
  - Da instrucciones
  - Motiva
  - Explica conceptos
  - Refuerza el aprendizaje

---

## 🧠 Minijuegos

### 1. 💰 Minijuego: El Cambio

#### Modelo de Dominio
- Dinero: denominaciones (monedas/billetes), valor en céntimos
- Producto: nombre, precio
- Compra: producto + pago + cambio
- Pago: cantidad entregada
- Cambio: cantidad a devolver
- Intento: respuesta + resultado + errores

#### Features

**A. Preparación**
- Lista de productos con precio
- Selección de billete válido (> precio)
- Cálculo del cambio correcto

**B. Vista del Niño (Comprador)**
- Mostrar precio y pago
- Mostrar cambio recibido
- Opción de aceptar o reclamar
- Registro de aciertos/errores

**C. Vista Cajero**
- Mostrar cambio esperado
- Selección de monedas/billetes
- Cálculo total seleccionado
- Validación ("te falta / te sobra")

---

### 2. 🛒 Minijuego: Necesidad vs Deseo

#### Modelo de Dominio
- Producto: nombre, imagen, categoría real
- Clasificación: Necesidad | Deseo
- Ronda / Intento / Sesión

#### Features

**A. Preparación**
- Lista de productos clasificados
- Generación aleatoria de rondas

**B. Vista del Niño**
- Mostrar producto (imagen + nombre)
- Opciones: NECESIDAD / DESEO
- Selección única
- Validación inmediata
- Feedback (correcto/incorrecto)
- Registro de resultados

**C. Puntuación**
- Puntos acumulados
- Contador de errores
- Resumen final

**D. Interacción**
- Botones o drag & drop
- Animaciones de feedback

---

### 3. 💸 Minijuego: ¿Cuánto cuesta?

#### Modelo de Dominio
- Producto: nombre, imagen, precio aproximado
- Rangos: <1€, 1–5€, 5–20€, >20€

#### Features

**A. Preparación**
- Lista de productos con rangos
- Selección aleatoria

**B. Vista del Niño**
- Mostrar producto
- Elegir rango
- Validación inmediata
- Feedback + respuesta correcta
- Registro de resultados

**C. Puntuación**
- Sistema simple de puntos

---

### 4. 🐖 Minijuego: Ahorro con Objetivo

#### Modelo de Dominio
- Objetivo: producto + coste
- Plan de ahorro: cantidad por semana
- Progreso acumulado

#### Features

**A. Preparación**
- Lista de objetivos
- Generación de planes de ahorro

**B. Vista del Niño**
- Mostrar objetivo y coste
- Mostrar o elegir ahorro semanal
- Calcular semanas necesarias
- Validación con feedback visual (barra de progreso)
- Registro de resultados

**C. Puntuación**
- Puntos por acierto
- Progreso global

---

### 5. 🏷️ Minijuego: Comparar Ofertas

#### Modelo de Dominio
- Producto: nombre, cantidad, precio
- Oferta: varias opciones comparables

#### Features

**A. Preparación**
- Generación de ofertas comparables
- Determinar mejor opción (precio por unidad)

**B. Vista del Niño**
- Mostrar opciones claramente
- Seleccionar mejor oferta
- Validación
- Feedback con explicación

**C. Puntuación**
- Sistema de puntos simple

---

## 🐷 Mascota: Cerdito Hucha

### Funciones
- Guía narrativa del juego
- Introduce minijuegos
- Da feedback educativo
- Refuerza conceptos financieros
- Mantiene motivación

### Características
- Lenguaje simple y amigable
- Mensajes cortos y claros
- Refuerzo positivo constante

---

## 🎯 Objetivos Pedagógicos

- Comprender el valor del dinero
- Aprender a dar y recibir cambio
- Diferenciar necesidades vs deseos
- Estimar precios
- Entender el ahorro
- Comparar ofertas inteligentemente

---

## ⚙️ Stack Tecnológico

- Frontend: React
- Enfoque: SPA (Single Page Application)
- UI: Interactiva, visual, accesible para niños

---

## 🧩 Requisitos UX

- Interfaz simple e intuitiva
- Elementos visuales grandes
- Uso de colores y animaciones
- Feedback inmediato
- Interacción táctil (pensado para tablets)

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