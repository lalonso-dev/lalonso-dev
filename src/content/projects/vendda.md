---
title: "Vendda"
description: "Sistema SaaS multi-tenant de punto de venta para negocios de retail en México. POS, inventario, pedidos y catálogo online en un solo lugar, sin instalar nada. En producción con registro por invitación."
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
    "Reverb",
    "Cloudflare R2",
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

Vendda es un sistema SaaS de punto de venta diseñado para el negocio de retail mexicano: la tienda de abarrotes, la papelería, la farmacia de barrio, el negocio familiar que lleva el inventario en cuaderno o en hojas de Excel. La idea lleva más de un año dando vueltas: había un problema claro, una solución clara, pero no el tiempo para construirla. Hasta ahora.

El problema concreto: las opciones disponibles para negocios pequeños en México son o demasiado caras (ERPs como Bind o Aspel empiezan en $300 a $600 al mes y están pensados para empresas con contador), o demasiado limitadas (apps de POS que no tienen inventario, o inventario sin tienda online, o todo por separado con integraciones frágiles). El dueño del negocio termina pagando tres herramientas distintas que no se hablan entre sí, o sigue con el cuaderno.

Vendda resuelve eso con un sistema único que cubre el ciclo completo: **POS** para registrar ventas desde cualquier dispositivo sin instalar nada, **Inventario** con alertas de faltantes y control por sucursal, **Pedidos** que se convierten en venta al entregarse, y **Catálogo online** con subdominio propio, perfil de tienda y seguimiento del pedido para el cliente. Un negocio puede estar operando en minutos desde que se registra.

El modelo de negocio sigue tres planes: **Free** permanente con funciones básicas (1 negocio, 1 sucursal, 1 caja, 2 empleados), **Standard** a $199/mes para negocios en crecimiento (3 sucursales, 5 cajas, 10 empleados, reportes PDF, notificaciones Telegram, precios de mayoreo, cupones y cotizaciones ampliados) y **Pro** a $399/mes para operaciones más grandes (todo ilimitado y respuesta prioritaria por WhatsApp). Los límites son blandos: lo ya creado nunca se borra, solo se bloquea crear más, y al vencer una licencia hay tres días de gracia. El cobro es manual: el pago se confirma desde el panel superadmin, que activa la licencia solo después de verificar la referencia.

La arquitectura es **multi-tenant**: cada negocio tiene su propio subdominio (`tunegocio.vendda.site`), su propia base de datos aislada y su propio panel de administración. Un wildcard DNS en Cloudflare cubre todos los subdominios sin tocar configuración por cada negocio nuevo que se registra.

## Ejecución del proyecto

El stack es **TALL**: Tailwind + Alpine.js + Livewire + Laravel 13, sobre PostgreSQL y Redis. **Filament v4** maneja los paneles de administración, **Reverb** entrega eventos en tiempo real, los archivos viven en Cloudflare R2 y los correos transaccionales salen por Brevo. El entorno de desarrollo corre en DDEV y producción en un VPS con Nginx, PHP-FPM y Supervisor, con despliegue automático vía GitHub Actions: push a `staging` despliega en staging, push a `main` despliega en producción. Sentry y Healthchecks vigilan errores y tareas programadas.

La decisión más importante del proyecto fue la arquitectura **modular**: en lugar de una app Laravel monolítica, el sistema está dividido en módulos independientes usando `nWidart/laravel-modules`. Cada módulo (Account, Billing, Catalog, Inventory, Reports, Sales, Storefront, Tenancy) tiene sus propias rutas, modelos, servicios, migraciones y vistas. El núcleo de la app solo hace bootstrapping. Esto permite trabajar en Sales sin tocar Catalog, agregar Billing sin romper Account, y mantener una separación de responsabilidades real en lugar de carpetas de convención sin semántica.

El **multi-tenancy** está implementado con `stancl/tenancy` en modo subdominio. Cada request identifica el tenant por el subdominio, inicializa su contexto (conexión de base de datos, storage, cache) y ejecuta el resto del request dentro de él. El panel super admin corre en el dominio central y nunca entra al contexto de ningún tenant, lo que requirió separar explícitamente las rutas centrales de las de tenant. Esa frontera es también la más delicada en seguridad: el proyecto pasó por auditorías enfocadas en aislamiento entre negocios, y cada cambio que toca multi-negocio, dinero, inventario o archivos ajenos se revisa con ese criterio antes de salir.

Hay **dos paneles Filament completamente separados**: el del tenant (`{slug}.vendda.site/admin`), donde el dueño gestiona su negocio, empleados, inventario y ventas, y el superadmin (`app.vendda.site/sa`), donde el equipo gestiona tenants, licencias, solicitudes de registro y códigos de acceso. El superadmin distingue entre administradores y un rol de soporte que crea y edita, pero no elimina ni confirma pagos. Las doce listas del panel de negocio se rediseñaron como tarjetas en móvil y tabla en escritorio con vistas Blade propias, porque el CSS sobre las tablas de Filament no alcanzaba para una experiencia móvil real.

El **POS** corre en Livewire y prioriza velocidad: búsqueda por nombre, SKU o código de barras escaneado desde la cámara del navegador (`html5-qrcode`, sin app nativa), carrito con tabs por cliente, atajos de teclado y pago en efectivo con cambio automático, terminal con referencia o transferencia. Además soporta precios de mayoreo por cantidad, cupones escaneables, cotizaciones en PDF, y recargas y pagos de servicios con comisión configurable. Los tickets se personalizan por negocio (tres diseños, papel de 58 mm u 80 mm), se envían por correo o se descargan en PDF, y los cortes de caja muestran totales por método de pago con un PDF formal al cerrar. Las ventas se pueden cancelar con PIN de autorización, y cada cancelación revierte el stock.

La **jerarquía de entidades** sigue la estructura real del negocio: Owner → Negocio → Sucursal → Caja → Empleado. Un mismo usuario puede ser dueño en un negocio y vendedor en otro. Los empleados tienen permisos por rol, PIN opcional, bloqueo de login tras intentos fallidos y límite de sesiones simultáneas. El Business Switcher permite al dueño elegir con qué negocio trabaja antes de entrar al panel.

Algunos aspectos técnicos que valió la pena resolver:

**Storefront con identidad propia.** El catálogo online de cada tenant es una aplicación Livewire pública con branding dinámico: colores y logo inyectados como CSS variables desde la configuración del tenant. Cada tienda tiene portada con recorte, descripción, redes sociales, botón de WhatsApp, vista de lista o cuadrícula y panel para compartir, todo sobre la misma base de código.

**Pedidos que se vuelven ventas.** Un pedido reserva stock al confirmarse (si no alcanza, se cancela) y al entregarse genera la venta, el ticket y el movimiento de caja. El cliente sigue su pedido con un enlace y un código de acceso atado a su dispositivo, con bloqueo por intentos y caducidad, y recibe avisos por correo o WhatsApp. El dueño recibe notificaciones in-app y push en el teléfono.

**Registro por invitación.** El acceso se controla con códigos de un solo uso y un tope de cuentas. Quien no tiene código solicita acceso desde un formulario, y el superadmin aprueba la solicitud y envía el código por correo o WhatsApp.

## Estado actual y próximos pasos

Vendda está en **producción con lanzamiento controlado**. El sistema funciona en `vendda.site` con POS, inventario, pedidos, catálogo online, reportes, límites por plan y panel superadmin operativos. Los registros se abren por invitación y con cupo limitado mientras se prueba el sistema con negocios reales.

Lo que viene: un **POS que siga vendiendo sin internet**, con cola de ventas que se sincroniza al volver la conexión; una **app Android** en React Native que consuma una API propia; respaldos automáticos y endurecimiento de infraestructura; pruebas automáticas; y automatizar el cobro, que hoy es manual. A mediano plazo, integración con terminales de pago y facturación electrónica.

Vendda es un proyecto de uno. La motivación no es escalar rápido sino resolver un problema real para negocios reales en México.
