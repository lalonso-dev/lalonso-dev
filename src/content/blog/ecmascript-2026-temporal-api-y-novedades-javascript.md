---
title: "ECMAScript 2026: Temporal API, using keyword y todo lo que cambia en JavaScript"
description: "ES2026 es la actualización más importante de JavaScript en años. Temporal reemplaza definitivamente el objeto Date, la keyword using elimina el boilerplate de try/finally, y llegan Math.sumPrecise, Error.isError y más. Todo con ejemplos reales."
date: 2026-06-10
cover: "/images/blog/ecmascript-2026.webp"
categories: ["JavaScript", "Frontend", "Noticias"]
readingTime: 11
featured: true
draft: false
tags:
  [
    "javascript",
    "ecmascript",
    "es2026",
    "temporal",
    "frontend",
    "web",
    "typescript",
  ]
---

## El año en que JavaScript arregló sus problemas históricos

Cada año el comité TC39 publica una nueva versión del estándar ECMAScript. La mayoría son actualizaciones incrementales: una feature aquí, un método nuevo allá. ECMAScript 2026 es diferente.

Este año llegan dos cambios que los developers llevan pidiendo desde hace más de una década: un reemplazo serio para el objeto `Date` y una forma nativa de gestionar recursos sin escribir `try/finally` a mano. Junto a ellos, un puñado de utilidades que resuelven fricciones concretas del día a día.

El estándar se aprueba formalmente en junio — y Chrome 144 (enero 2026) y Firefox ya tienen soporte completo para Temporal. Es el momento de entender qué cambia y cómo afecta a tu código.

---

## 1. Temporal API: adiós al objeto Date

### El problema con Date

El objeto `Date` de JavaScript tiene más de 30 años y carga con decisiones de diseño que hoy consideraríamos errores graves:

```js
// ¿Cuánto vale esto?
new Date(2026, 0, 1) // Enero es 0, no 1. Clásico.

// Date es mutable — esto modifica el original
const fecha = new Date()
fecha.setMonth(5) // sorpresa para quien use `fecha` después

// Sin soporte nativo de zonas horarias
// Dependíamos de Intl.DateTimeFormat o librerías externas (moment, date-fns, luxon)
```

`Temporal` resuelve todo esto de raíz.

### Qué es Temporal

`Temporal` es un nuevo namespace global con tipos especializados para cada caso de uso. Los objetos son **inmutables** — cada operación devuelve una nueva instancia — y tienen soporte nativo de zonas horarias y calendarios.

### Los tipos principales

#### `Temporal.PlainDate` — una fecha sin hora ni zona horaria

```js
// Crear una fecha
const hoy = Temporal.Now.plainDateISO()
const evento = Temporal.PlainDate.from('2026-12-25')
const cumple = Temporal.PlainDate.from({ year: 1990, month: 3, day: 15 })

// Aritmética de fechas — limpia y predecible
const manana = hoy.add({ days: 1 })
const enUnMes = hoy.add({ months: 1 })
const semanaAntes = evento.subtract({ weeks: 1 })

// Comparar fechas
Temporal.PlainDate.compare(hoy, evento) // -1, 0, 1
hoy.equals(evento) // false

// Diferencia entre fechas
const diff = hoy.until(evento)
console.log(diff.days) // días hasta Navidad
```

#### `Temporal.ZonedDateTime` — fecha + hora + zona horaria

Este es el tipo que debes usar para cualquier evento que ocurra en un momento concreto del tiempo real:

```js
// Crear un evento con zona horaria
const reunion = Temporal.ZonedDateTime.from({
  timeZone: 'Europe/Madrid',
  year: 2026,
  month: 6,
  day: 15,
  hour: 10,
  minute: 30,
})

// Convertir a otra zona horaria — sin librerías externas
const reunionNY = reunion.withTimeZone('America/New_York')
console.log(reunionNY.hour) // 4 (hora en Nueva York)

// El horario de verano se maneja automáticamente
const invierno = reunion.withTimeZone('Europe/Madrid').add({ months: 6 })
// Temporal ajusta el DST solo
```

#### `Temporal.Instant` — un momento exacto en el tiempo

```js
// El instante actual
const ahora = Temporal.Now.instant()

// Desde un timestamp Unix
const desde = Temporal.Instant.fromEpochMilliseconds(Date.now())

// Diferencia precisa entre dos instantes
const elapsed = ahora.since(desde)
console.log(elapsed.milliseconds)
```

#### `Temporal.PlainTime` — solo hora, sin fecha

```js
const apertura = Temporal.PlainTime.from('09:00:00')
const cierre = Temporal.PlainTime.from('18:00:00')
const horasAbierto = apertura.until(cierre)
console.log(horasAbierto.hours) // 9
```

### Temporal.Now — el punto de entrada

```js
Temporal.Now.instant()          // Instante actual
Temporal.Now.plainDateISO()     // Fecha actual en ISO calendar
Temporal.Now.plainDateTimeISO() // Fecha y hora actual sin zona
Temporal.Now.zonedDateTimeISO() // Fecha, hora y zona horaria actual
```

### Soporte actual

| Navegador | Soporte |
|-----------|---------|
| Chrome 144+ | ✅ Completo |
| Firefox | ✅ Completo |
| Edge | ✅ Completo |
| Safari | 🔜 Próximamente |
| Node.js | 🔜 Próximamente |

Para proyectos en producción hoy, usa el polyfill oficial: `@js-temporal/polyfill`.

---

## 2. `using` y `await using`: fin del try/finally boilerplate

### El problema

Cada vez que trabajas con recursos que hay que liberar — conexiones de base de datos, file handles, locks, streams — el código se convierte en esto:

```js
// Antes de ES2026
async function processData() {
  const db = await openDatabase()
  try {
    const file = await openFile('data.csv')
    try {
      const lock = acquireLock()
      try {
        // lógica real aquí
        await db.query('...')
      } finally {
        lock.release()
      }
    } finally {
      await file.close()
    }
  } finally {
    await db.close()
  }
}
```

Infierno de anidamiento. Y si olvidas el `finally`, tienes un memory leak o una conexión colgada.

### La solución: `using` para recursos síncronos

Cualquier objeto que implemente `[Symbol.dispose]()` se puede usar con `using`. Cuando la variable sale de scope, el método se llama automáticamente:

```js
class DatabaseConnection {
  constructor(url) {
    this.conn = connect(url)
    console.log('Conexión abierta')
  }

  query(sql) {
    return this.conn.execute(sql)
  }

  [Symbol.dispose]() {
    this.conn.close()
    console.log('Conexión cerrada automáticamente')
  }
}

function getUser(id) {
  using db = new DatabaseConnection('postgres://...')
  // db se cierra automáticamente al salir de esta función
  return db.query(`SELECT * FROM users WHERE id = ${id}`)
}
```

### `await using` para recursos asíncronos

```js
class FileHandle {
  constructor(path) {
    this.handle = fs.openSync(path, 'r')
  }

  async [Symbol.asyncDispose]() {
    await this.handle.close()
    console.log('Archivo cerrado')
  }
}

async function readConfig() {
  await using file = new FileHandle('./config.json')
  const data = await file.read()
  return JSON.parse(data)
  // file se cierra async automáticamente aquí
}
```

### El código de antes, reescrito con `using`

```js
// Con ES2026
async function processData() {
  await using db = await openDatabase()
  await using file = await openFile('data.csv')
  using lock = acquireLock()

  // lógica real aquí
  await db.query('...')

  // Los recursos se liberan en orden inverso al salir del scope
}
```

De 20 líneas a 7. Y sin posibilidad de olvidar liberar un recurso.

### `DisposableStack` para gestionar varios recursos

Cuando necesitas agrupar recursos dinámicamente:

```js
function processMultipleFiles(paths) {
  using stack = new DisposableStack()

  const handles = paths.map(path => {
    const handle = openFile(path)
    stack.use(handle) // se cierra automáticamente con el stack
    return handle
  })

  // trabajar con los handles...
  // al salir del scope, todos se cierran en orden inverso
}
```

---

## 3. `Math.sumPrecise()`: adiós a los errores de punto flotante

Cualquier developer JavaScript ha tropezado con esto:

```js
0.1 + 0.2 === 0.3 // false
[0.1, 0.2, 0.3].reduce((a, b) => a + b, 0) // 0.6000000000000001
```

ES2026 añade `Math.sumPrecise()` que usa un algoritmo más preciso (aunque más lento) para sumar arrays de números:

```js
// Antes
const suma = [0.1, 0.2, 0.3].reduce((a, b) => a + b, 0)
console.log(suma) // 0.6000000000000001

// Con ES2026
const sumaExacta = Math.sumPrecise([0.1, 0.2, 0.3])
console.log(sumaExacta) // 0.6
```

Especialmente útil para cálculos financieros, estadísticas o cualquier contexto donde la acumulación de errores de punto flotante importa. No reemplaza librerías como `decimal.js` para casos extremos, pero cubre la mayoría de los casos del día a día sin dependencias.

---

## 4. `Error.isError()`: detección fiable de errores

Detectar si algo es un `Error` parece trivial pero tiene casos edge problemáticos:

```js
// Antes — poco fiable en contextos multi-realm (iframes, workers)
error instanceof Error // falla si el error viene de otro realm

// También fallaba con objetos que parecen errores pero no lo son
const fakeError = { message: 'error', stack: '...' }
fakeError instanceof Error // false — correcto
// pero en algunos patrones de código esto creaba ambigüedad
```

ES2026 añade un método estático confiable:

```js
Error.isError(new Error('algo'))         // true
Error.isError(new TypeError('tipo'))     // true
Error.isError({ message: 'no soy error' }) // false
Error.isError(null)                      // false
Error.isError('string')                  // false

// Funciona correctamente entre realms (iframes, workers)
Error.isError(errorDesdoIframe)          // true — siempre fiable
```

---

## 5. Métodos Base64/Hex en `Uint8Array`

Hasta ahora, codificar y decodificar Base64 en el navegador era un ejercicio de creatividad:

```js
// El hack clásico con btoa — solo ASCII, sin soporte de Buffer en browser
const encoded = btoa(String.fromCharCode(...new Uint8Array(data)))
```

ES2026 añade métodos nativos directamente en `Uint8Array`:

```js
// Codificar a Base64
const bytes = new Uint8Array([72, 101, 108, 108, 111])
const base64 = bytes.toBase64()
console.log(base64) // "SGVsbG8="

// Decodificar desde Base64
const decoded = Uint8Array.fromBase64('SGVsbG8=')

// También para hex
const hex = bytes.toHex()           // "48656c6c6f"
const fromHex = Uint8Array.fromHex('48656c6c6f')
```

Especialmente útil para trabajar con APIs que devuelven datos binarios, criptografía en el navegador con Web Crypto API, o cualquier transferencia de datos binarios.

---

## Resumen: qué adoptar y cuándo

| Feature | Soporte actual | Adoptar en producción |
|---------|---------------|----------------------|
| Temporal API | Chrome, Firefox, Edge ✅ | Con polyfill ya |
| `using` / `await using` | Chrome, Firefox ✅ | Sí, con TypeScript 5.2+ |
| `Math.sumPrecise` | Todos los navegadores ✅ | Sí, ya disponible |
| `Error.isError` | Todos los navegadores ✅ | Sí, ya disponible |
| Uint8Array Base64/Hex | Todos los navegadores ✅ | Sí, ya disponible |

TypeScript tiene soporte completo para todas estas features desde la versión 5.2 (`using`) y 5.5+ (Temporal types). Si usas TypeScript en tu proyecto — y deberías — tienes todo disponible ya.

---

## Conclusión

ES2026 no es una actualización incremental. Es el año en que JavaScript arregló dos de sus problemas más persistentes.

El objeto `Date` llevaba décadas siendo una fuente constante de bugs sutiles, dependencias externas obligatorias y comportamiento inesperado. `Temporal` lo reemplaza con una API pensada desde cero para el mundo real: inmutable, con zonas horarias nativas y tipos diferenciados para cada caso de uso.

El patrón `try/finally` para gestión de recursos era boilerplate puro que no aportaba valor y tenía demasiados puntos de fallo. `using` lo convierte en una declaración de una línea con cleanup garantizado.

El resto de features — `Math.sumPrecise`, `Error.isError`, los métodos Base64 — son pequeñas victorias sobre fricciones cotidianas que se acumulan y hacen el trabajo diario más fluido.

El ecosistema JavaScript lleva años madurando. ES2026 es otra evidencia de que el proceso de estandarización está funcionando bien.

---

## Fuentes

- <a href="https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Temporal" target="_blank" rel="noopener noreferrer">Temporal — MDN Web Docs</a>
- <a href="https://tc39.es/proposal-temporal/" target="_blank" rel="noopener noreferrer">Temporal proposal — TC39</a>
- <a href="https://thenewstack.io/es2026-solves-javascript-headaches-with-dates-math-and-modules/" target="_blank" rel="noopener noreferrer">ES2026 Solves JavaScript Headaches With Dates, Math and Modules</a> — The New Stack
- <a href="https://v8.dev/features/explicit-resource-management" target="_blank" rel="noopener noreferrer">JavaScript's New Superpower: Explicit Resource Management</a> — V8 Blog
- <a href="https://socket.dev/blog/tc39-advances-temporal-to-stage-4" target="_blank" rel="noopener noreferrer">TC39 Advances Temporal to Stage 4</a> — Socket.dev
- <a href="https://bryntum.com/blog/javascript-temporal-is-it-finally-here/" target="_blank" rel="noopener noreferrer">JavaScript Temporal in 2026 — is it finally here?</a> — Bryntum
- <a href="https://www.alexcloudstar.com/blog/es2026-javascript-features-guide/" target="_blank" rel="noopener noreferrer">ES2026 JavaScript Features: Complete Developer Guide</a>
