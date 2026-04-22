---
title: "Bolsillo"
description: "App de finanzas personales 100% local para Android. Sin cuenta, sin servidor, sin tracking. Controla gastos, ingresos, deudas, ahorros y más — todo desde tu celular."
category: "Mobile App"
status: "development"
featured: true
date: 2026-04-22
cover: "/images/projects/bolsillo.webp"
gallery:
  [
    "/images/projects/bolsillo/img-bolsillo1.webp",
    "/images/projects/bolsillo/img-bolsillo2.webp",
    "/images/projects/bolsillo/img-bolsillo3.webp",
    "/images/projects/bolsillo/img-bolsillo4.webp",
    "/images/projects/bolsillo/img-bolsillo5.webp",
    "/images/projects/bolsillo/img-bolsillo6.webp",
  ]
technologies:
  ["React Native", "Expo", "expo-router", "SQLite", "RevenueCat", "JavaScript"]
liveUrl: "https://bolsillo.site"
githubUrl: "https://bolsillo.site"
client: "lalonso"
externalProject: false
---

## Acerca del proyecto

Bolsillo es una app de finanzas personales diseñada con una premisa simple: **tus datos son tuyos**. No hay cuenta que crear, no hay servidor que dependa de una conexión estable, no hay tracking ni anuncios. Todo vive en el dispositivo del usuario, en una base de datos SQLite local, y solo el usuario decide qué hacer con esa información.

El proyecto nace de observar que la mayoría de las apps de finanzas personales en español están pensadas para mercados con acceso bancario formal, infraestructura digital robusta y hábitos financieros muy distintos a los del usuario mexicano promedio. Bolsillo apunta exactamente a ese usuario: alguien que quiere llevar el control de sus gastos, sus deudas del mes, su tanda del trabajo y su presupuesto del súper — sin necesidad de conectar cuentas bancarias ni pagar desde el primer día.

La app cubre el ciclo financiero completo en módulos bien definidos: **Gastos** para pagos recurrentes y únicos con un calendario visual, **Finanzas** como centro de mando donde convergen ingresos, deudas, apartados de ahorro y tandas, **Mercado** para controlar el gasto en tiempo real mientras se hace el mandado, y **Reportes** con exportación en PDF para quien necesita una visión mensual de sus números.

La monetización se resuelve con un modelo freemium honesto: el plan gratuito permite usar todas las funcionalidades con límites razonables (3 gastos recurrentes, 1 deuda activa, 2 apartados), mientras que Premium desbloquea todo de forma ilimitada mediante una suscripción mensual o anual gestionada por RevenueCat.

## Ejecución del proyecto

Bolsillo está construido sobre **Expo SDK 54 con React Native 0.81**, usando **expo-router** para la navegación. La elección de Expo sobre React Native puro respondió a una razón práctica: iterar rápido, actualizar Over-the-Air sin pasar por revisión de tienda, y mantener una sola base de código para Android e iOS desde el principio.

La base de datos es **SQLite local** a través de `expo-sqlite`. Cada módulo tiene su propia capa de acceso a datos — funciones aisladas por entidad que la UI consume directamente, sin estado global ni librerías de gestión de estado. La simplicidad fue una decisión consciente: sin Redux, sin Zustand, sin Context innecesario. Solo hooks de React y funciones async sobre SQLite.

La arquitectura de navegación usa una combinación de un Stack raíz y un Tab navigator. Las pantallas de detalle (deudas individuales, sesiones de mercado, apartados con historial) viven como Stack screens en el root, lo que permite navegación correcta con botón de regreso sin romper el estado del tab activo. Este patrón evitó varios bugs de navegación que aparecen cuando se intenta manejar rutas profundas dentro del Tab navigator de expo-router.

El diseño sigue un sistema propio inspirado en **Material 3**: tipografía Inter, verde `#006e2f` como color protagonista, cards con sombras sutiles, sin líneas divisorias, sin bordes agresivos. Todo el sistema de colores y espaciado está definido de forma consistente a través de los StyleSheets de React Native, sin librerías de UI de terceros.

Algunos módulos que valieron la pena destacar por su complejidad técnica:

**Calendario de gastos** — Implementado desde cero sin librerías de calendario. Calcula semana a semana los pagos que caen en cada día considerando frecuencias diarias, semanales, quincenales y mensuales. Soporta swipe horizontal entre semanas con un gestor de pan gesture propio.

**Salud financiera** — Un algoritmo que combina el total proyectado de ingresos del mes con el total comprometido en gastos recurrentes para generar un índice de salud (holgada, ajustada, crítica) con consejo contextual. Los datos vienen 100% de la base de datos local, sin configuración manual del usuario.

**Ingresos con períodos** — El módulo de ingresos maneja dos tipos: únicos (un cobro específico) y recurrentes (nómina, freelance, etc.). La lógica de "pendiente por recibir" requirió calcular la última ocurrencia ≤ hoy para cada frecuencia y comparar contra el historial de recepciones, evitando que el botón de marcar recibido aparezca duplicado en el mismo período o deje de aparecer en el siguiente.

**Mercado** — Sesión de compra con lista de productos en tiempo real. El usuario establece un presupuesto al inicio y conforme agrega productos ve cuánto lleva y cuánto le queda. El historial queda guardado por sesión para consultas posteriores.

Para las suscripciones, **RevenueCat** maneja la integración con Play Store y App Store.

## Estado actual y próximos pasos

Bolsillo se encuentra en **beta abierta para Android**, disponible para descarga directa desde `bolsillo.site`. La app está feature-complete en sus módulos principales y en uso activo, aunque se sigue iterando sobre bugs de UX y refinando la experiencia en diferentes tamaños de pantalla.

El objetivo inmediato es preparar la **publicación en Google Play Store**: cumplir con las políticas de privacidad, pasar la revisión inicial de Google, configurar los productos de suscripción en RevenueCat y tener el listing de la tienda listo. La versión iOS seguirá poco después, aprovechando que la base de código es 100% compartida entre plataformas.

A mediano plazo, se contemplan mejoras como alertas inteligentes de pagos próximos (ya existe el módulo base), un módulo de presupuesto mensual por categoría, y posiblemente sincronización opcional cifrada entre dispositivos para usuarios Premium que lo requieran — aunque esta última funcionalidad entra en tensión con la filosofía local-first del proyecto, por lo que se evaluará con cuidado.

Bolsillo es un proyecto personal con un producto real. La meta no es crecer a escala, sino construir algo genuinamente útil para el usuario mexicano que quiere orden financiero sin sacrificar privacidad.
