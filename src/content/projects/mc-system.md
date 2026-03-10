---
title: "McSystem"
description: "Sistema de consulta médica local-first para escritorio, actualmente en desarrollo activo. Diseñado para flujos clínicos rápidos y escalables, con una versión beta en camino para mostrar el producto cuanto antes."
category: "Desktop App"
status: "development"
featured: true
date: 2026-02-26
cover: "/images/projects/McSystem.webp"
gallery: []
technologies:
  ["Tauri", "React", "TypeScript", "TailwindCSS", "NestJS", "Prisma", "SQLite"]
liveUrl: "https://youtu.be/-YFiyk4XutM?si=YOjGcRnXaU1NgarT"
githubUrl: "https://github.com/lalonso-dev/McSystem"
client: "lalonso"
externalProject: false
---

## Acerca del proyecto

McSystem es un sistema de consulta médica **local-first** diseñado para funcionar como aplicación de escritorio, orientado a optimizar los flujos clínicos de médicos y consultorios. El proyecto nace de la necesidad de contar con una herramienta ágil, confiable y sin dependencia de internet para gestionar pacientes, consultas y recetas desde un entorno controlado y seguro.

La plataforma integra un motor de formularios dinámicos por especialidad, lo que permite adaptar las vistas clínicas según el perfil del médico sin necesidad de reescribir lógica. Además, incluye un sistema de branding personalizable por doctor, plantillas de receta configurables y un registro de auditoría que garantiza la trazabilidad de cada acción realizada en el sistema.

El proyecto se encuentra actualmente en **desarrollo activo**. Varios módulos aún presentan inestabilidades que estamos trabajando de forma continua, pero la meta es clara: lanzar una versión beta funcional lo antes posible para poner el producto frente a los primeros usuarios y recoger retroalimentación real.

## Ejecución del proyecto

McSystem se está desarrollando con una arquitectura modular y API-first, separando claramente el backend del frontend para facilitar el mantenimiento y la escalabilidad futura.

El backend está construido con **NestJS** como framework principal, utilizando **Prisma** como ORM y **SQLite** como base de datos local. Esta combinación permite un desarrollo robusto con la posibilidad de migrar a PostgreSQL en la nube sin necesidad de modificar el frontend, lo que convierte a McSystem en un sistema preparado para crecer más allá del escritorio.

En el frontend se utiliza **React con TypeScript** y **TailwindCSS** para construir una interfaz limpia, responsiva y coherente visualmente. La aplicación se empaqueta como app de escritorio mediante **Tauri**, lo que garantiza una experiencia nativa en el sistema operativo del usuario con un peso reducido en comparación con soluciones basadas en Electron.

Una de las decisiones técnicas más relevantes fue el diseño del motor de formularios dinámicos: en lugar de hardcodear los campos clínicos por especialidad, se definieron plantillas configurables almacenadas en base de datos, lo que permite agregar nuevas especialidades sin modificar el código fuente. De igual forma, las plantillas de receta (layouts A, B y C) son completamente configurables junto con los datos de branding del doctor.

## Estado actual y próximos pasos

McSystem está en una etapa de desarrollo donde las funcionalidades core ya toman forma, pero aún existen puntos inestables que se están resolviendo de manera iterativa. El enfoque actual está puesto en consolidar los flujos principales — registro de pacientes, generación de consultas y emisión de recetas — para tener una base estable sobre la cual construir.

El objetivo inmediato es alcanzar una **versión beta publicable** que permita mostrar el producto en funcionamiento, validar los flujos clínicos con usuarios reales y sentar las bases para las siguientes iteraciones. A partir de ahí, se contempla incorporar autenticación robusta con roles, mejoras en la experiencia de usuario y, a futuro, la opción de sincronización en la nube para consultorios que así lo requieran.

Es un proyecto en movimiento, con mucho por construir, pero con una dirección técnica clara y un propósito concreto: hacer que la tecnología sirva al médico, no al revés.
