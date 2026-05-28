---
title: "Craft CMS 6 y Laravel: todo lo que necesitas saber sobre el cambio más grande de su historia"
description: "Craft CMS 6 abandona Yii 2 y se reconstruye sobre Laravel. Ya está en alpha desde mayo de 2026 con GA previsto para Q4. Qué cambia, qué no, cómo migrar desde Craft 5 y por qué esta decisión importa."
date: 2026-05-28
cover: "/images/blog/craft-cms-6-laravel.webp"
categories: ["Noticias", "Craft CMS", "Desarrollo Web"]
readingTime: 10
featured: true
draft: false
tags:
  [
    "craft-cms",
    "laravel",
    "php",
    "cms",
    "migracion",
    "craft-6",
    "backend",
    "desarrollo-web",
  ]
---

## El cambio más grande en la historia de Craft CMS

Craft CMS lleva más de una década siendo una de las opciones más sólidas para proyectos web complejos. Flexibilidad real, control total sobre el contenido, y un sistema de plugins maduro. Pero siempre corrió sobre Yii 2 — un framework PHP robusto pero cada vez más alejado de lo que el ecosistema PHP moderno ofrece.

Con Craft 6, eso cambia por completo.

**Craft CMS se migra a Laravel.** No es una actualización incremental ni un cambio de versión menor. Es la reescritura del núcleo del CMS sobre el framework PHP más popular del mundo. Y la primera alpha ya está disponible desde el 6 de mayo de 2026.

---

## Por qué Laravel y por qué ahora

La decisión no fue impulsiva. El equipo de Pixel & Tonic lleva más de un año trabajando en este port. La razón principal es pragmática: el ecosistema de Yii 2 lleva años sin evolucionar al ritmo del resto del mundo PHP, mientras que Laravel tiene un ecosistema enorme, documentación excelente, una comunidad activa y una cadencia de releases muy predecible.

Para los developers, esto significa:

- **Menor curva de entrada.** Un developer con experiencia en Laravel puede trabajar en un proyecto Craft 6 con mucho menos fricción que antes.
- **Acceso al ecosistema Laravel.** Eloquent, Artisan, Queues, Broadcasting — todo el tooling de Laravel queda disponible para plugins y módulos personalizados.
- **Craft como Laravel package.** Una de las decisiones más interesantes: Craft 6 se puede instalar como paquete dentro de una aplicación Laravel existente. Esto abre casos de uso completamente nuevos donde Craft gestiona el contenido y Laravel maneja el resto de la lógica de negocio.

---

## Estado actual: alpha desde mayo 2026

El timeline oficial es este:

| Fase | Fecha estimada |
|------|---------------|
| Alpha 1 | Mayo 2026 ✅ |
| Beta | Q3 2026 |
| GA (General Availability) | Q4 2026 |

La alpha está disponible pero con advertencias claras del equipo: hay bugs, el control panel está en proceso de reconstrucción como una app Vue/Inertia, y algunos plugins pueden no funcionar todavía. **No es para producción.** Es para developers que quieren explorar, testear compatibilidad de plugins y dar feedback.

Craft 5 pasa a ser una release **LTS (Long-Term Support)** con soporte garantizado de 5 años tras el lanzamiento de Craft 6. Si tu proyecto está en Craft 5 en producción, no hay ninguna urgencia de migrar ahora mismo.

---

## Qué cambia y qué no

Esta es la parte que más preocupa a los developers: ¿cuánto tengo que reescribir?

### Lo que NO cambia

La arquitectura de Craft permanece intacta. El equipo fue muy explícito en esto: no querían reinventar el CMS, sino cambiar los cimientos sobre los que está construido.

- **Elements, Fields, Sections, Matrix** — todo igual
- **El sistema de plugins** — compatible con la misma API
- **Twig como motor de plantillas** — se queda
- **La filosofía de Craft** — contenido estructurado, control total, sin opiniones sobre el frontend

### Lo que SÍ cambia

- **El framework subyacente**: de Yii 2 a Laravel
- **El control panel**: se está reconstruyendo con Vue + Inertia.js
- **UI nueva**: modo oscuro nativo, experiencia móvil de primera clase
- **Namespaces de clases**: actualizados para reflejar la nueva arquitectura Laravel
- **Categories, Global Sets y Tags**: deprecados — pueden "entrificarse" durante la migración

---

## Nuevas funcionalidades que llegan con Craft 6

Además de la migración a Laravel, Craft 6 incorpora un set de features orientadas a equipos de contenido:

### Content Releases
Publicar múltiples entradas o borradores a la vez, de forma manual o en un momento programado. Ideal para lanzamientos coordinados de contenido donde varios editors trabajan en paralelo.

### Scheduled Drafts
Programar un borrador individual para que se publique en una fecha y hora específica. Esto existía de forma limitada antes; en Craft 6 es una funcionalidad de primera clase.

### Content Approval Workflows
Flujos de aprobación de contenido: control sobre quién puede publicar qué y bajo qué condiciones. Una funcionalidad muy pedida por equipos medianos y grandes.

### Activity Log y cambios
Ver el historial de cambios de una entrada directamente en la pantalla de edición. Útil para auditorías y para entender quién modificó qué y cuándo.

### Importador nativo
Una herramienta de importación de contenido integrada en el control panel, sin necesidad de plugins de terceros para casos de uso básicos.

---

## Compatibilidad de plugins: la sorpresa positiva

Uno de los mayores miedos ante una migración de framework es la compatibilidad de plugins. La respuesta del equipo de Pixel & Tonic es un **adaptador de Yii 2** que actúa como capa de compatibilidad.

En la práctica, esto significa que la mayoría de plugins construidos para Craft 5 funcionarán en Craft 6 **sin ningún cambio de código**. No es una promesa de eternidad — los plugins eventualmente deberán migrar a APIs nativas de Laravel — pero elimina el blockers más grande de la adopción inicial.

---

## Cómo migrar de Craft 5 a Craft 6

La migración oficial sigue tres fases. Aún no es el momento de hacerlo en producción (la alpha tiene bugs), pero vale la pena entender el proceso:

### Fase 1: Preparación (en tu Craft 5 actual)

```bash
# Actualizar a la última versión de Craft 5
composer update craftcms/cms

# Actualizar todos los plugins a sus últimas versiones compatibles
```

Antes de migrar, el equipo recomienda:
- Estar en la **última versión de Craft 5.x**
- Aplanar los archivos de config multi-entorno usando variables de entorno
- "Entrificar" Categories, Global Sets y Tags si quieres controlar cómo se migran

### Fase 2: Upgrade local

```bash
# Cambiar el constraint de versión en composer.json
composer require craftcms/cms:"^6.0.0"

# Si hay plugins incompatibles, deshabilitarlos temporalmente
CRAFT_DISABLED_PLUGINS="*"  # en .env

# Ejecutar las migraciones
php craft migrate/all
```

Las migraciones son lightweight — no tocan el contenido ni escalan con el número de elementos. Principalmente actualizan namespaces de clases.

### Fase 3: Triage y ajustes

Revisar plugins uno a uno, actualizar cualquier código personalizado que use clases internas de Craft con nombres de namespace antiguos, y testear el control panel con la nueva UI Vue/Inertia.

---

## Lo que esto significa para el ecosistema

La migración a Laravel tiene implicaciones más allá del código:

**Para agencies y freelancers**: la curva de entrada para nuevos developers en proyectos Craft baja considerablemente. Un developer Laravel puede ser productivo en Craft 6 mucho antes que uno sin experiencia en Yii.

**Para proyectos híbridos**: poder instalar Craft como paquete Laravel abre la puerta a arquitecturas donde Craft maneja solo el contenido y Laravel gestiona la lógica de negocio, APIs, autenticación, colas, etc. Antes esto requería separar completamente los sistemas.

**Para el futuro de plugins**: el ecosistema de Laravel packages puede adaptarse más fácilmente como base para plugins de Craft. Esto podría acelerar la aparición de nuevas integraciones.

---

## ¿Cuándo deberías migrar?

La respuesta corta:

- **Hoy**: No migres proyectos en producción. La alpha tiene bugs conocidos y el control panel está en construcción activa.
- **Q3 2026 (beta)**: Buen momento para testear en staging, preparar tus plugins custom y familiarizarte con la nueva UI.
- **Q4 2026 (GA)**: El momento correcto para planificar migraciones de proyectos en producción.
- **Si estás en Craft 5**: No hay urgencia — tienes 5 años de LTS.

Lo que sí puedes hacer ahora: instalar la alpha en un entorno local, explorar el nuevo control panel, y testear tus plugins custom para identificar qué necesita trabajo.

---

## Conclusión

Craft CMS 6 es el cambio estructural más grande del CMS desde su lanzamiento. Cambiar Yii 2 por Laravel no es solo un detalle de implementación — es una apuesta por la sostenibilidad a largo plazo del proyecto, por facilitar la entrada de nuevos developers, y por integrarse con el ecosistema PHP más activo del momento.

Lo más importante: la arquitectura que hace a Craft diferente permanece intacta. Los Elements, los Fields, el sistema de plugins, Twig — nada de eso desaparece. Solo mejora la base sobre la que todo eso corre.

Si llevas tiempo trabajando con Craft, este es el momento de prepararse con calma. Si nunca lo has probado, Craft 6 puede ser el mejor punto de entrada que ha tenido el CMS en años.

---

## Fuentes

- <a href="https://craftcms.com/blog/laravel" target="_blank" rel="noopener noreferrer">Craft's Going Laravel</a> — craftcms.com
- <a href="https://craftcms.com/blog/craft-6-alpha-released" target="_blank" rel="noopener noreferrer">Craft 6 Alpha Released</a> — craftcms.com
- <a href="https://craftcms.com/laravel" target="_blank" rel="noopener noreferrer">Craft 6, built on Laravel</a> — craftcms.com
- <a href="https://craftcms.com/docs/6.x/upgrade" target="_blank" rel="noopener noreferrer">Upgrading to Craft 6.x</a> — craftcms.com/docs
- <a href="https://www.viget.com/articles/craft-6-and-laravel-what-you-need-to-know" target="_blank" rel="noopener noreferrer">Craft 6 and Laravel: What You Need To Know</a> — Viget
- <a href="https://craft-kit.dev/blog/craft-cms-6-laravel" target="_blank" rel="noopener noreferrer">Craft CMS 6 and Laravel — What Craft Developers Need to Know</a> — Craft Kit
- <a href="https://laravel-news.com/craft-cms-is-moving-to-laravel" target="_blank" rel="noopener noreferrer">Craft CMS is moving to Laravel</a> — Laravel News
