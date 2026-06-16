---
title: "Vendda"
description: "Sistema SaaS multi-tenant de punto de venta para negocios de retail en México. POS, inventario y catálogo online en un solo lugar, sin instalar nada."
category: "SaaS / Web App"
status: "development"
featured: true
date: 2026-06-16
cover: "/images/projects/vendda.webp"
technologies:
  [
    "Laravel",
    "Filament",
    "Livewire",
    "Tailwind",
    "PostgreSQL",
    "Redis",
    "Tenancy",
    "GitHub Actions",
  ]
gallery:
  [
    "/images/projects/vendda/vendda1.webp",
    "/images/projects/vendda/vendda2.webp",
    "/images/projects/vendda/vendda3.webp",
    "/images/projects/vendda/vendda4.webp",
    "/images/projects/vendda/vendda5.webp",
    "/images/projects/vendda/vendda6.webp",
  ]
liveUrl: "https://vendda.site"
githubUrl: "https://github.com/lalonso-dev/vendda/tree/staging"
client: "lalonso"
externalProject: false
---

## Acerca del proyecto

Vendda es un sistema SaaS de punto de venta diseñado para el negocio de retail mexicano: la tienda de abarrotes, la papelería, la farmacia de barrio, el negocio familiar que lleva el inventario en cuaderno o en hojas de Excel. La idea lleva más de un año dando vueltas — había un problema claro, una solución clara, pero no el tiempo para construirla. Hasta ahora.

El problema concreto: las opciones disponibles para negocios pequeños en México son o demasiado caras (ERPs como Bind o Aspel empiezan en $300–$600 al mes y están pensados para empresas con contador), o demasiado limitadas (apps de POS que no tienen inventario, o inventario sin tienda online, o todo por separado con integraciones frágiles). El dueño del negocio termina pagando tres herramientas distintas que no se hablan entre sí, o sigue con el cuaderno.

Vendda apunta a resolver eso con un sistema único que cubre el ciclo completo: **POS** para registrar ventas desde cualquier dispositivo sin instalar nada, **Inventario** con alertas de faltantes y control por sucursal, y **Catálogo online** con subdominio propio y pagos con MercadoPago incluidos. Un negocio puede estar operando en menos de tres minutos desde que se registra.

El modelo de negocio sigue tres planes: **Free** permanente con funciones básicas (1 sucursal, 1 caja), **Standard** a $199/mes para negocios en crecimiento (3 sucursales, 5 cajas, reportes PDF, notificaciones Telegram), y **Pro** a $399/mes para operaciones más grandes (todo ilimitado, dominio propio). Durante la beta todos los planes están disponibles sin costo mientras se valida el sistema en condiciones reales.

La arquitectura es **multi-tenant**: cada negocio tiene su propio subdominio (`tunegocio.vendda.site`), su propia base de datos aislada y su propio panel de administración. Un wildcard DNS en Cloudflare cubre todos los subdominios sin tocar configuración por cada negocio nuevo que se registra. El plan Pro agrega soporte para dominio propio (`tutienda.com` apuntando al servidor), gestionado vía `stancl/tenancy` con certificados individuales por Certbot.

## Ejecución del proyecto

El stack es **TALL**: Tailwind + Alpine.js + Livewire + Laravel, sobre PostgreSQL 16 y Redis. Filament v3 maneja los paneles de administración. El entorno de desarrollo corre en DDEV y producción en un VPS en Hetzner con Nginx, PHP-FPM y despliegue automático vía GitHub Actions — push a `staging` despliega en staging, push a `main` despliega en producción.

La decisión más importante del proyecto fue la arquitectura **modular**: en lugar de una app Laravel monolítica, el sistema está dividido en módulos independientes usando `nWidart/laravel-modules`. Cada módulo (Tenancy, Auth, Catalog, Inventory, Sales, Reports, Billing, Storefront) tiene sus propias rutas, modelos, servicios, migraciones y vistas. El núcleo de la app solo hace bootstrapping. Esto permite trabajar en Sales sin tocar Catalog, agregar Billing sin romper Auth, y mantener una separación de responsabilidades real en lugar de carpetas de convención sin semántica.

El **multi-tenancy** está implementado con `stancl/tenancy` en modo subdominio. Cada request al sistema identifica el tenant por el subdominio, inicializa el contexto del tenant (conexión de base de datos, storage, cache) y ejecuta el resto del request ya dentro de ese contexto. El panel super admin (`app.vendda.site`) corre en el dominio central y nunca entra al contexto de ningún tenant — lo que requirió separar explícitamente las rutas centrales de las rutas de tenant y configurar middlewares de redirección para evitar colisiones.

Hay **dos paneles Filament completamente separados**: el panel del tenant (accesible en `{slug}.vendda.site/admin`) donde el dueño gestiona su negocio, empleados, inventario y ventas; y el panel superadmin (`app.vendda.site/sa`) donde el equipo de Vendda gestiona todos los tenants, asigna licencias, genera códigos beta y tiene visibilidad global del sistema. Separar estos dos paneles implicó resolver varios conflictos de rutas entre Filament y el módulo de Auth — el path del superadmin terminó en `/sa` después de descartar `/superadmin` (demasiado largo) y `/` (colisionaba con las rutas del módulo Auth).

El **POS** corre en Livewire. El diseño del punto de venta prioriza velocidad: búsqueda de producto por nombre, SKU o código de barras escaneado desde la cámara del navegador (usando `html5-qrcode`, sin app nativa), carrito con múltiples tabs por cliente, atajos de teclado, y soporte para tres métodos de pago (efectivo con cambio automático, tarjeta con número de referencia, transferencia). Los cortes de caja al final del turno muestran totales separados por método de pago.

La **jerarquía de entidades** dentro de cada tenant sigue la estructura real del negocio: Owner → Negocio → Sucursal → Caja → Empleado. Un mismo usuario puede ser dueño en un negocio y vendedor en otro. Los empleados tienen PIN opcional para operaciones sensibles. El Business Switcher en el login permite al dueño seleccionar con qué negocio está trabajando antes de entrar al panel, con PIN por negocio si está habilitado.

Algunos aspectos técnicos que valió la pena resolver:

**Storefront como Livewire público** — El catálogo online de cada tenant es una aplicación Livewire pública con branding dinámico: colores primario, secundario y de acento inyectados como CSS variables desde la configuración del tenant, logo desde `tenant->logo_url`. El resultado es que cada negocio tiene su tienda con identidad propia sobre la misma base de código.

## Estado actual y próximos pasos

Vendda está en **beta abierta**. El sistema está en producción en `vendda.site` con POS, inventario, catálogo online y panel superadmin operativos. El registro de nuevos negocios está abierto mediante código beta.

Lo que está funcionando hoy: registro de tenants con subdominio automático, panel de administración por tenant, punto de venta con múltiples métodos de pago y cortes de caja, gestión de inventario con alertas de faltantes, catálogo público Livewire con carrito, panel superadmin con gestión de tenants y licencias, y CI/CD completo con staging y producción.

Lo que viene inmediato: **cancelación de ventas** con PIN de autorización del admin (para revertir stock sin depender del dueño en persona), **importación masiva de productos** vía CSV con soporte para `image_url` pública, y **notificaciones in-app** (campanita en Filament) para ventas completadas y cierres de caja. A mediano plazo: recuperación de contraseña y verificación de correo (bloqueados por la configuración del servicio de email en staging), reportes PDF funcionales, y automatización del proceso de billing que hoy es manual.

Vendda es un proyecto de uno. La motivación no es escalar rápido sino resolver un problema real para negocios reales en México.
