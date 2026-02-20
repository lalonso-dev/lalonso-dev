---
title: "Cómo crear funciones personalizadas para Twig en Craft CMS 4"
description: "Aprende a extender Twig en Craft CMS 4 usando el archivo Module por defecto. Con ejemplos prácticos paso a paso."
date: 2026-01-11
cover: "/images/blog/twig-craft.webp"
categories: ["Tutoriales"]
readingTime: 7
featured: false
draft: false
tags: ["craft-cms", "twig", "php", "backend"]
---

# Cómo crear funciones personalizadas para Twig en Craft CMS 4

Una de las características más poderosas de Craft CMS es su capacidad de extender Twig con funciones, filtros y variables propias. Esto te permite mantener la lógica de negocio organizada en PHP mientras tus templates se ven limpios y expresivos.

En este artículo veremos cómo registrar una función personalizada en Twig usando el **Module por defecto** que incluye Craft CMS 4, partiendo de un ejemplo concreto: una función que formatea precios con símbolo de moneda y separadores de miles.

---

## El punto de partida: el Module por defecto

Cuando creas un proyecto con Craft CMS 4, la estructura incluye un módulo base listo para ser personalizado. Lo encontrarás en:

```
modules/
└── Module.php
```

Y la configuración en `config/app.php` ya lo registra automáticamente:

```php
// config/app.php
<?php

use craft\helpers\App;

return [
    'modules' => [
        'my-module' => \modules\Module::class,
    ],
    'bootstrap' => ['my-module'],
];
```

El archivo `modules/Module.php` luce así por defecto:

```php
<?php

namespace modules;

use Craft;

/**
 * Custom module class.
 *
 * This class will be available throughout the system via:
 * `Craft::$app->getModule('my-module')`.
 *
 * @method static Module getInstance()
 */
class Module extends \yii\base\Module
{
    public function init(): void
    {
        // Set the controllerNamespace based on whether this is a console or web request
        if (Craft::$app->getRequest()->getIsConsoleRequest()) {
            $this->controllerNamespace = 'modules\\console\\controllers';
        } else {
            $this->controllerNamespace = 'modules\\controllers';
        }

        parent::init();

        // Custom initialization code goes here...
    }
}
```

Este es nuestro punto de partida. A partir de aquí, vamos a agregar soporte para funciones Twig personalizadas.

---

## El ejemplo: función `formatPrice()`

Imaginemos que en varios templates necesitas mostrar precios con formato, por ejemplo:

```twig
{{ product.price | formatPrice('MXN') }}
{# Resultado: MXN $1,250.00 #}
```

En lugar de repetir la lógica en cada template o usar filtros encadenados, crearemos una función/filtro Twig que encapsule ese comportamiento.

---

## Paso 1: Crear la clase de extensión Twig

Primero, crea el archivo `modules/twigextensions/MyTwigExtension.php`:

```php
<?php

namespace modules\twigextensions;

use Twig\Extension\AbstractExtension;
use Twig\TwigFilter;
use Twig\TwigFunction;

class MyTwigExtension extends AbstractExtension
{
    /**
     * Registrar filtros personalizados
     */
    public function getFilters(): array
    {
        return [
            new TwigFilter('formatPrice', [$this, 'formatPrice']),
        ];
    }

    /**
     * Registrar funciones personalizadas
     */
    public function getFunctions(): array
    {
        return [
            new TwigFunction('formatPrice', [$this, 'formatPrice']),
        ];
    }

    /**
     * Formatea un número como precio con símbolo de moneda
     *
     * @param float|int|null $value    El valor numérico
     * @param string         $currency Código de moneda (MXN, USD, EUR)
     * @param int            $decimals Número de decimales (por defecto 2)
     */
    public function formatPrice(
        float|int|null $value,
        string $currency = 'MXN',
        int $decimals = 2
    ): string {
        if ($value === null) {
            return '—';
        }

        $symbols = [
            'MXN' => 'MXN $',
            'USD' => 'USD $',
            'EUR' => '€',
        ];

        $symbol = $symbols[$currency] ?? $currency . ' ';
        $formatted = number_format((float) $value, $decimals, '.', ',');

        return $symbol . $formatted;
    }
}
```

---

## Paso 2: Registrar la extensión en el Module

Ahora modificamos `modules/Module.php` para cargar nuestra extensión Twig. Solo necesitamos escuchar el evento `EVENT_REGISTER_TWIG_EXTENSIONS`:

```php
<?php

namespace modules;

use Craft;
use craft\events\RegisterComponentTypesEvent;
use craft\web\twig\Environment;
use modules\twigextensions\MyTwigExtension;
use yii\base\Event;

/**
 * Custom module class.
 *
 * This class will be available throughout the system via:
 * `Craft::$app->getModule('my-module')`.
 *
 * @method static Module getInstance()
 */
class Module extends \yii\base\Module
{
    public function init(): void
    {
        // Set the controllerNamespace based on whether this is a console or web request
        if (Craft::$app->getRequest()->getIsConsoleRequest()) {
            $this->controllerNamespace = 'modules\\console\\controllers';
        } else {
            $this->controllerNamespace = 'modules\\controllers';
        }

        parent::init();

        // Registrar extensiones Twig solo en requests web
        if (Craft::$app->getRequest()->getIsSiteRequest() || Craft::$app->getRequest()->getIsCpRequest()) {
            $this->registerTwigExtensions();
        }
    }

    /**
     * Registra las extensiones Twig personalizadas
     */
    private function registerTwigExtensions(): void
    {
        Event::on(
            Environment::class,
            Environment::EVENT_REGISTER_TWIG_EXTENSIONS,
            function (RegisterComponentTypesEvent $event) {
                $event->types[] = MyTwigExtension::class;
            }
        );
    }
}
```

---

## Paso 3: Usar la función en los templates Twig

Con la extensión registrada, ya puedes usar `formatPrice` tanto como filtro como función en cualquier template:

**Como filtro:**

```twig
{# Precio simple con moneda por defecto (MXN) #}
<p>{{ product.price | formatPrice }}</p>
{# Resultado: MXN $1,250.00 #}

{# Con moneda específica #}
<p>{{ product.price | formatPrice('USD') }}</p>
{# Resultado: USD $1,250.00 #}

{# Sin decimales #}
<p>{{ product.price | formatPrice('MXN', 0) }}</p>
{# Resultado: MXN $1,250 #}
```

**Como función:**

```twig
<p>{{ formatPrice(product.price, 'EUR') }}</p>
{# Resultado: €1,250.00 #}
```

**En un contexto real con un loop de entries:**

```twig
{% set products = craft.entries()
    .section('products')
    .all() %}

<ul class="product-list">
    {% for product in products %}
        <li class="product-item">
            <h2>{{ product.title }}</h2>
            <span class="price">{{ product.price | formatPrice(product.currency ?? 'MXN') }}</span>
        </li>
    {% endfor %}
</ul>
```

---

## Extendiendo el ejemplo: agregar más funciones

Una vez que tienes la arquitectura lista, agregar nuevas funciones es sencillo. Solo amplía tu clase `MyTwigExtension`. Por ejemplo, añadamos un filtro `truncateWords` y una función `getYear`:

```php
public function getFilters(): array
{
    return [
        new TwigFilter('formatPrice', [$this, 'formatPrice']),
        new TwigFilter('truncateWords', [$this, 'truncateWords']),
    ];
}

public function getFunctions(): array
{
    return [
        new TwigFunction('formatPrice', [$this, 'formatPrice']),
        new TwigFunction('getYear', [$this, 'getYear']),
    ];
}

/**
 * Trunca un texto al número de palabras indicado
 */
public function truncateWords(string $text, int $limit = 20, string $suffix = '...'): string
{
    $words = explode(' ', strip_tags($text));

    if (count($words) <= $limit) {
        return $text;
    }

    return implode(' ', array_slice($words, 0, $limit)) . $suffix;
}

/**
 * Devuelve el año actual o el de una fecha dada
 */
public function getYear(\DateTime|string|null $date = null): int
{
    if ($date === null) {
        return (int) date('Y');
    }

    if (is_string($date)) {
        $date = new \DateTime($date);
    }

    return (int) $date->format('Y');
}
```

Uso en templates:

```twig
{# Truncar descripción a 15 palabras #}
<p>{{ entry.description | truncateWords(15) }}</p>

{# Año actual en el footer #}
<footer>© {{ getYear() }} Mi Empresa</footer>

{# Año de publicación de un post #}
<time>{{ getYear(entry.postDate) }}</time>
```

---

## Estructura final del proyecto

Al terminar, tu carpeta `modules/` lucirá así:

```
modules/
├── Module.php
├── controllers/
├── console/
│   └── controllers/
└── twigextensions/
    └── MyTwigExtension.php
```

---

## Conclusión

Usar el Module por defecto de Craft CMS 4 para extender Twig es una práctica limpia y escalable. Resumiendo el proceso:

1. Crea tu clase que extiende `AbstractExtension` de Twig en `modules/twigextensions/`.
2. Define tus funciones y filtros con `getFunctions()` y `getFilters()`.
3. Registra la extensión en `Module.php` escuchando el evento `EVENT_REGISTER_TWIG_EXTENSIONS`.
4. Úsala directamente en tus templates.

Esta arquitectura te permite mantener la lógica de presentación en PHP organizada y reutilizable, sin ensuciar tus templates con lógica compleja. Conforme tu proyecto crezca, puedes dividir las extensiones en múltiples archivos por dominio (precios, fechas, textos, etc.) y registrarlas todas desde el mismo `Module.php`.
