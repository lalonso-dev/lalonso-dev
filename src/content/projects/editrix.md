---
title: "Editrix"
description: "Plugin de buscar y reemplazar contenido para Craft CMS: previsualiza los cambios, los aplica en cola y permite revertirlos valor por valor. Desarrollado por The Brand Industry y publicado en el Plugin Store de Craft."
category: "Plugin"
status: "live"
featured: false
date: 2026-11-04
cover: "/images/projects/editrix.webp"
gallery: []
technologies: ["Craft CMS", "PHP", "Yii", "Composer"]
liveUrl: "https://editrix.thebrandindustry.com/"
githubUrl: "https://github.com/Brand-Industry/craft-editrix"
client: "The Brand Industry"
externalProject: false
---

## Acerca del proyecto

**Editrix** es un plugin para Craft CMS que resuelve una tarea que todo el que ha mantenido un sitio conoce bien: cambiar un texto que aparece en cientos de lugares. Un nombre de empresa que cambió, un teléfono, un enlace roto, un término que ya no se usa.

Con Editrix buscas el texto, ves cómo quedaría cada cambio antes de guardarlo, aplicas el reemplazo y, si algo no sale como esperabas, **lo revierte valor por valor**.

Es un producto de **The Brand Industry**, la agencia con la que tuve la oportunidad de colaborar, y fue publicado en el [Plugin Store de Craft CMS](https://plugins.craftcms.com/editrix?craft5) en noviembre de 2026.

---

## Qué hace

- **Busca en todo el contenido:** entradas, globales, bloques de Matrix y Neo, categorías y campos de texto enriquecido (CKEditor y Redactor). También encuentra y reemplaza direcciones de enlaces y de imágenes dentro del texto enriquecido.
- **Previsualiza antes de guardar:** muestra el texto original y el propuesto lado a lado, con modo de prueba (_dry run_) que no guarda nada y la opción de excluir coincidencias concretas.
- **Revierte con seguridad:** registra cada valor antes de guardar la entrada, así que un reemplazo cancelado o interrumpido todavía se puede deshacer. Nunca sobrescribe ediciones hechas después de la búsqueda.
- **Respeta los permisos de Craft:** cada usuario solo encuentra y cambia lo que ya puede editar.
- **Escala en sitios grandes:** trabaja sobre la cola de Craft, con barra de progreso y botón de cancelar, para no chocar con los límites de tiempo de una petición.
- **Admite expresiones regulares,** coincidencia de mayúsculas y minúsculas y de palabra completa.

---

## Ediciones y requisitos

Editrix tiene dos ediciones, con prueba gratuita en entornos de desarrollo y pruebas:

| Edición | Precio (único) | Qué incluye                                                                                         |
| ------- | -------------- | --------------------------------------------------------------------------------------------------- |
| Lite    | USD 19         | Buscar, reemplazar, previsualizar, modo de prueba, historial y reversión                            |
| Pro     | USD 99         | Matrix y Neo, categorías, multisitio, alcance por sección o campo, exportación CSV y JSON, y línea de comandos |

Requiere **Craft CMS 5 y PHP 8.2** para la versión 2.0 (hay compatibilidad con Craft 4 en su versión anterior). Se instala con Composer:

```bash
composer require brand-industry/craft-editrix
php craft plugin/install editrix
```

---

## Una colaboración que agradezco

Editrix es un producto de **The Brand Industry**: la marca, la propiedad y el crédito son de la agencia. Pero la idea fue tomando forma entre todos: **se fue construyendo en conjunto**, entre conversaciones, pruebas y decisiones tomadas codo a codo con su equipo, desde el problema que queríamos resolver hasta la herramienta que hoy está en el Plugin Store.

Eso es lo que más valoro de este proyecto. No fue recibir un encargo y entregarlo: fue **pensar el producto junto a ellos**, discutir cómo debía comportarse y ver cómo una necesidad real de quien mantiene sitios en Craft se convertía en un plugin con ediciones, documentación y soporte, listo para que cualquier desarrollador lo use en sus sitios.

Gracias a **The Brand Industry** por la confianza de hacerme parte de ese proceso, por escuchar y por un equipo con el que se aprende cada día. Verlo publicado cierra un ciclo del que me siento orgulloso de haber formado parte.

---

## Enlaces

- [Plugin en el Plugin Store de Craft CMS](https://plugins.craftcms.com/editrix?craft5)
- [Sitio y documentación de Editrix](https://editrix.thebrandindustry.com/)
- [Repositorio en GitHub (Brand-Industry/craft-editrix)](https://github.com/Brand-Industry/craft-editrix)
