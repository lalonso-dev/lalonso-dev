---
title: "RunSQL: Testea y comparte queries SQL sin instalar nada"
description: "Descubre RunSQL, el playground SQL en la nube que te permite crear esquemas con DBML, poblar datos y compartir entornos completos con un solo link. Sin instalaciones, sin configuraciones."
date: 2026-02-25
cover: "/images/blog/runsql-playground.webp"
categories: ["Tutoriales", "Herramientas"]
readingTime: 9
featured: false
draft: false
tags: ["sql", "postgresql", "mysql", "dbml", "herramientas", "base-de-datos"]
---

## ¿Cuántas veces has perdido tiempo solo para testear una query?

El escenario es conocido: tienes una consulta SQL que quieres validar, o necesitas mostrarle algo a un compañero, y antes de escribir una sola línea de lógica ya llevas 20 minutos instalando PostgreSQL, creando tablas, insertando datos de prueba... y lo peor: tu compañero tiene que repetir todo el proceso en su máquina.

**RunSQL** nació exactamente para eliminar ese problema.

---

## ¿Qué es RunSQL?

[RunSQL](https://runsql.com) es un playground SQL en la nube, gratuito, creado por el equipo de [Holistics](https://holistics.io) — los mismos detrás de **dbdiagram.io** y **DBML**. Salió de un hackathon interno en enero de 2025 y desde entonces se ha convertido en una herramienta muy útil para equipos de datos, developers y personas que hacen entrevistas técnicas.

La propuesta es simple:

- Define tu esquema con **DBML** (sin escribir `CREATE TABLE`)
- Añade datos de prueba vía **CSV o interfaz tipo spreadsheet** (sin `INSERT INTO`)
- Ejecuta tus queries en la nube contra **PostgreSQL, MySQL o SQL Server**
- Comparte el entorno completo — esquema + datos + queries — con **un solo link**

---

## Paso 1: Definir el esquema con DBML

En lugar de escribir SQL DDL manualmente, RunSQL usa **DBML (Database Markup Language)**, un lenguaje simple y legible diseñado para definir estructuras de base de datos.

Supongamos que queremos modelar un sistema de e-commerce básico con usuarios, productos y órdenes:

```dbml
Project ecommerce {
  database_type: 'PostgreSQL'
  Note: 'Sistema de e-commerce básico'
}

Table users {
  id integer [pk, increment]
  name varchar [not null]
  email varchar [unique, not null]
  created_at timestamp [default: `now()`]
}

Table products {
  id integer [pk, increment]
  name varchar [not null]
  price decimal [not null]
  stock integer [default: 0]
  created_at timestamp [default: `now()`]
}

Table orders {
  id integer [pk, increment]
  user_id integer [not null, ref: > users.id]
  total decimal [not null]
  status varchar [default: 'pending']
  created_at timestamp [default: `now()`]
}

Table order_items {
  id integer [pk, increment]
  order_id integer [not null, ref: > orders.id]
  product_id integer [not null, ref: > products.id]
  quantity integer [not null]
  unit_price decimal [not null]
}
```

Con `ref: > users.id` defines las relaciones entre tablas de forma clara. RunSQL convierte esto automáticamente en las tablas reales de la base de datos.

---

## Paso 2: Poblar datos de prueba

Una vez creado el esquema, puedes añadir datos de dos formas:

**Opción A — Interfaz tipo spreadsheet:** RunSQL muestra cada tabla como una hoja de cálculo editable. Haces clic en una celda y escribes directamente, como si fuera Excel o Google Sheets.

**Opción B — Subir un CSV:** Si ya tienes datos exportados de algún otro sistema, puedes subirlos directamente. RunSQL mapea las columnas automáticamente.

Para este ejemplo, así quedarían los datos de prueba:

**Tabla `users`:**

| id  | name         | email            | created_at |
| --- | ------------ | ---------------- | ---------- |
| 1   | Ana García   | ana@email.com    | 2026-01-10 |
| 2   | Carlos López | carlos@email.com | 2026-01-12 |
| 3   | María Torres | maria@email.com  | 2026-01-15 |

**Tabla `products`:**

| id  | name              | price   | stock |
| --- | ----------------- | ------- | ----- |
| 1   | Laptop Pro 14     | 1299.99 | 15    |
| 2   | Mouse Inalámbrico | 29.99   | 200   |
| 3   | Teclado Mecánico  | 89.99   | 75    |
| 4   | Monitor 27"       | 399.99  | 30    |

**Tabla `orders`:**

| id  | user_id | total   | status    |
| --- | ------- | ------- | --------- |
| 1   | 1       | 1329.98 | completed |
| 2   | 2       | 89.99   | pending   |
| 3   | 1       | 429.98  | completed |
| 4   | 3       | 29.99   | shipped   |

---

## Paso 3: Ejecutar queries reales

Aquí es donde RunSQL brilla. Con el esquema y los datos listos, puedes probar cualquier consulta de forma inmediata.

### Query básica: usuarios con sus órdenes

```sql
SELECT
  u.name AS usuario,
  COUNT(o.id) AS total_ordenes,
  SUM(o.total) AS gasto_total
FROM users u
LEFT JOIN orders o ON o.user_id = u.id
GROUP BY u.id, u.name
ORDER BY gasto_total DESC;
```

**Resultado esperado:**

| usuario      | total_ordenes | gasto_total |
| ------------ | ------------- | ----------- |
| Ana García   | 2             | 1759.96     |
| María Torres | 1             | 29.99       |
| Carlos López | 1             | 89.99       |

---

### Query intermedia: productos más vendidos

```sql
SELECT
  p.name AS producto,
  SUM(oi.quantity) AS unidades_vendidas,
  SUM(oi.quantity * oi.unit_price) AS ingresos
FROM products p
JOIN order_items oi ON oi.product_id = p.id
JOIN orders o ON o.id = oi.order_id
WHERE o.status = 'completed'
GROUP BY p.id, p.name
ORDER BY unidades_vendidas DESC;
```

---

### Query avanzada: ranking con window functions

```sql
SELECT
  u.name AS usuario,
  o.id AS orden,
  o.total,
  o.created_at,
  SUM(o.total) OVER (
    PARTITION BY u.id
    ORDER BY o.created_at
  ) AS gasto_acumulado,
  RANK() OVER (
    PARTITION BY u.id
    ORDER BY o.total DESC
  ) AS ranking_orden
FROM users u
JOIN orders o ON o.user_id = u.id
ORDER BY u.name, o.created_at;
```

Esta query usa **window functions** (`SUM OVER`, `RANK OVER`) para calcular el gasto acumulado por usuario y rankear las órdenes por monto. Es exactamente el tipo de consulta que sería difícil de probar sin un entorno configurado — con RunSQL la tienes funcionando en segundos.

---

## Casos de uso reales

### 1. Code review de queries SQL

En lugar de mandar un screenshot o pegar código en Slack, compartes el link de RunSQL. Tu compañero abre el entorno completo, ejecuta la query, la modifica si es necesario y te devuelve el link con sus cambios. **Sin setup, sin fricción.**

### 2. Entrevistas técnicas de SQL

Creas el entorno con el esquema y datos del ejercicio, compartes el link con el candidato y ambos trabajan sobre el mismo entorno en tiempo real. No hay ventaja ni desventaja por configuraciones locales.

### 3. Aprendizaje y práctica

Si estás aprendiendo SQL o practicando conceptos como `JOIN`, `GROUP BY`, subqueries o window functions, RunSQL es ideal: creas tu propio dataset de práctica y experimentas sin miedo a romper nada.

### 4. Debugging sin tocar producción

Replicas el subconjunto de datos problemático en RunSQL, aislas el bug y validas el fix antes de tocarlo en el entorno real.

---

## RunSQL vs. las alternativas

| Feature             | RunSQL                                | SQL Fiddle      | DB Fiddle                 |
| ------------------- | ------------------------------------- | --------------- | ------------------------- |
| Creación de esquema | DBML visual                           | SQL manual      | SQL manual                |
| Carga de datos      | CSV + spreadsheet                     | INSERT manual   | INSERT manual             |
| Bases de datos      | PostgreSQL, MySQL, SQL Server         | Múltiples       | MySQL, PostgreSQL, SQLite |
| Colaboración        | Link completo (schema + data + query) | Solo query      | Solo query                |
| Velocidad           | Rápido (cloud)                        | Puede ser lento | Aceptable                 |
| Precio              | Gratuito                              | Gratuito        | Gratuito                  |

La ventaja clave de RunSQL está en que al compartir un link, **el receptor obtiene el entorno completo**: esquema, datos y query. En las alternativas normalmente solo se comparte el código SQL.

---

## Lo que viene próximamente

Según su roadmap público, RunSQL tiene en desarrollo:

- **AI-generated sample data**: generar datos de prueba realistas con IA sin tener que ingresarlos manualmente.
- **Más dialectos SQL**: soporte para SQLite y otros motores.
- **Workspaces de equipo**: entornos persistentes compartidos entre miembros de un mismo equipo.

---

## Conclusión

Si trabajas con SQL de forma regular — ya sea como data engineer, backend developer, analista o simplemente alguien que aprende — RunSQL elimina una fricción real y cotidiana. No necesitas instalar nada, no necesitas configurar nada y puedes compartir un entorno completo con un solo link.

Pruébalo en [runsql.com](https://runsql.com) — es gratis y no requiere registro para empezar.
