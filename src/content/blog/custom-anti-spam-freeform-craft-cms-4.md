---
title: "Custom Anti-spam en Freeform con Craft CMS 4"
description: "Aprende a crear una capa de anti-spam robusta en Freeform usando el Module por defecto de Craft CMS 4, lista negra de dominios gratuitos, rate limiting por IP y la API gratuita de StopForumSpam."
date: 2026-01-18
cover: "/images/blog/spam.webp"
categories: ["Tutoriales"]
readingTime: 7
featured: false
draft: false
tags: ["craft-cms", "freeform", "php", "spam", "seguridad"]
---

# Anti-spam personalizado en Freeform con Craft CMS 4

Si tienes un formulario de contacto en Craft CMS y estás recibiendo spam a pesar de tener reCAPTCHA o incluso servicios como CleanTalk activos, no estás solo. Los bots modernos son cada vez más sofisticados y pueden pasar muchos de esos filtros. La buena noticia es que Freeform (el plugin de Solspace) expone un sistema de eventos que te permite interceptar los envíos antes de que se procesen y aplicar tu propia lógica.

En este artículo construiremos una validación anti-spam progresiva y completamente gratuita usando el **Module por defecto** de Craft CMS 4, partiendo de un problema real: demasiado spam y correos de proveedores gratuitos que no corresponden a clientes legítimos.

---

## El problema y la estrategia

El caso de uso es este: un formulario de contacto B2B donde solo interesan correos empresariales. Gmail, Hotmail, Yahoo y similares no deben pasar. Tampoco correos temporales ni IPs con historial de spam.

La estrategia que aplicaremos tiene cinco capas, todas sin costo:

1. **Rate limiting por IP** — limitar a 3 envíos por hora por IP
2. **Verificación de IP contra StopForumSpam** — API pública y gratuita
3. **Lista negra de dominios gratuitos** — validación local, sin latencia
4. **Verificación de email contra StopForumSpam** — con caché de 24 horas
5. **Detección de patrones de bots** — en el campo nombre
6. **Tiempo mínimo de llenado** — rechazar envíos instantáneos

---

## Punto de partida: el Module por defecto

Craft CMS 4 incluye un módulo base en `modules/Module.php`. No necesitas instalar nada extra. El archivo por defecto luce así:

```php
<?php
namespace modules;

use Craft;

class Module extends \yii\base\Module
{
    public function init(): void
    {
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

Y en `config/app.php` debe estar registrado y en el bootstrap:

```php
<?php
return [
    'modules' => [
        'my-module' => \modules\Module::class,
    ],
    'bootstrap' => ['my-module'], // <- sin esto el módulo no se carga
];
```

Si modificaste el `composer.json` para agregar el namespace, recuerda correr:

```bash
composer dump-autoload
php craft clear-caches/all
```

---

## El evento correcto en Freeform 5

Uno de los problemas más comunes al empezar es usar el evento equivocado. En versiones anteriores de Freeform se usaba `FormsService::EVENT_BEFORE_SUBMIT`, pero en Freeform 5 el evento que debes escuchar es `Form::EVENT_BEFORE_VALIDATE`:

```php
use Solspace\Freeform\Form\Form;
use Solspace\Freeform\Events\Forms\ValidationEvent;

Event::on(
    Form::class,
    Form::EVENT_BEFORE_VALIDATE,
    function (ValidationEvent $event) {
        $form = $event->getForm();
        // tu lógica aquí
    }
);
```

Si el evento no se dispara, verifica tu versión con:

```bash
composer show solspace/craft-freeform | grep versions
```

---

## La validación completa: Module.php

Aquí está el módulo completo con todas las capas de protección:

```php
<?php
namespace modules;

use Craft;
use yii\base\Event;
use Solspace\Freeform\Form\Form;
use Solspace\Freeform\Events\Forms\ValidationEvent;

class Module extends \yii\base\Module
{
    private const MAX_SUBMISSIONS_PER_IP = 3;
    private const RATE_LIMIT_WINDOW = 3600; // 1 hora en segundos
    private const STOPFORUMSPAM_CACHE_DURATION = 86400; // 24 horas

    public function init(): void
    {
        Craft::setAlias('@modules', __DIR__);

        if (Craft::$app->getRequest()->getIsConsoleRequest()) {
            $this->controllerNamespace = 'modules\\console\\controllers';
        } else {
            $this->controllerNamespace = 'modules\\controllers';
        }

        parent::init();
        $this->registerFreeformEvents();
    }

    private function registerFreeformEvents(): void
    {
        Event::on(
            Form::class,
            Form::EVENT_BEFORE_VALIDATE,
            function (ValidationEvent $event) {
                $form = $event->getForm();
                $request = Craft::$app->getRequest();
                $ip = $request->getUserIP();

                // Capa 1: Rate limiting por IP
                if ($this->isRateLimited($ip)) {
                    $form->addError('Too many attempts. Please try again later.');
                    return;
                }

                // Capa 2: Verificar IP contra StopForumSpam
                if ($this->isSpamIP($ip)) {
                    $form->addError('Your IP address has been identified as a spam source.');
                    return;
                }

                // Capa 3 y 4: Validar email
                $emailField = $form->get('email');
                if ($emailField) {
                    $email = strtolower(trim($emailField->getValue()));

                    if (!empty($email)) {
                        if (!$this->isValidBusinessEmail($email)) {
                            $form->addError('Please use a valid business email. Free or temporary email providers are not accepted.');
                            return;
                        }

                        if ($this->isSpamEmail($email)) {
                            $form->addError('This email address has been identified as spam. Please use a different email.');
                            return;
                        }
                    }
                }

                // Capa 5: Detectar bots en nombre
                $nameField = $form->get('name') ?? $form->get('firstName') ?? null;
                if ($nameField) {
                    $name = trim($nameField->getValue());
                    if (!empty($name) && $this->looksLikeBot($name)) {
                        $form->addError('Please enter a valid name.');
                    }
                }

                // Capa 6: Tiempo mínimo de llenado
                $this->validateSubmissionTime($form);
            }
        );
    }

    // -------------------------------------------------------
    // CAPA 1: RATE LIMITING
    // -------------------------------------------------------
    private function isRateLimited(string $ip): bool
    {
        $cacheKey = 'freeform_spam_' . md5($ip);
        $cache = Craft::$app->getCache();

        $count = $cache->get($cacheKey) ?? 0;

        if ($count >= self::MAX_SUBMISSIONS_PER_IP) {
            return true;
        }

        $cache->set($cacheKey, $count + 1, self::RATE_LIMIT_WINDOW);
        return false;
    }

    // -------------------------------------------------------
    // CAPA 2 y 4: STOPFORUMSPAM
    // -------------------------------------------------------
    private function isSpamEmail(string $email): bool
    {
        $cacheKey = 'sfs_email_' . md5($email);
        $cache = Craft::$app->getCache();

        $cached = $cache->get($cacheKey);
        if ($cached !== false) {
            return $cached === 'spam';
        }

        try {
            $url = 'https://api.stopforumspam.org/api?email=' . urlencode($email) . '&json';
            $response = $this->makeHttpRequest($url);

            if (!$response) {
                return false;
            }

            $data = json_decode($response, true);
            $isSpam = isset($data['email']['appears']) && $data['email']['appears'] === 1;

            $cache->set($cacheKey, $isSpam ? 'spam' : 'clean', self::STOPFORUMSPAM_CACHE_DURATION);

            if ($isSpam) {
                Craft::warning('StopForumSpam blocked email: ' . $email, 'spam-filter');
            }

            return $isSpam;

        } catch (\Exception $e) {
            Craft::error('StopForumSpam email error: ' . $e->getMessage(), 'spam-filter');
            return false;
        }
    }

    private function isSpamIP(string $ip): bool
    {
        $cacheKey = 'sfs_ip_' . md5($ip);
        $cache = Craft::$app->getCache();

        $cached = $cache->get($cacheKey);
        if ($cached !== false) {
            return $cached === 'spam';
        }

        try {
            $url = 'https://api.stopforumspam.org/api?ip=' . urlencode($ip) . '&json';
            $response = $this->makeHttpRequest($url);

            if (!$response) {
                return false;
            }

            $data = json_decode($response, true);

            // Solo bloqueamos IPs con frecuencia alta (> 5) para evitar falsos positivos
            $isSpam = isset($data['ip']['appears'])
                && $data['ip']['appears'] === 1
                && isset($data['ip']['frequency'])
                && $data['ip']['frequency'] > 5;

            $cache->set($cacheKey, $isSpam ? 'spam' : 'clean', self::STOPFORUMSPAM_CACHE_DURATION);

            if ($isSpam) {
                Craft::warning('StopForumSpam blocked IP: ' . $ip, 'spam-filter');
            }

            return $isSpam;

        } catch (\Exception $e) {
            Craft::error('StopForumSpam IP error: ' . $e->getMessage(), 'spam-filter');
            return false;
        }
    }

    private function makeHttpRequest(string $url): ?string
    {
        $context = stream_context_create([
            'http' => [
                'timeout' => 3, // 3 segundos máximo para no frenar el form
                'method' => 'GET',
                'header' => 'User-Agent: CraftCMS SpamFilter/1.0',
            ]
        ]);

        $response = @file_get_contents($url, false, $context);
        return $response ?: null;
    }

    // -------------------------------------------------------
    // CAPA 3: LISTA NEGRA DE DOMINIOS
    // -------------------------------------------------------
    private function isValidBusinessEmail(string $email): bool
    {
        if (!filter_var($email, FILTER_VALIDATE_EMAIL)) {
            return false;
        }

        $domain = strtolower(substr(strrchr($email, '@'), 1));
        $username = strtolower(explode('@', $email)[0]);

        // Dominios gratuitos y de consumo bloqueados
        $blockedDomains = [
            // Grandes proveedores
            'gmail.com', 'googlemail.com',
            'yahoo.com', 'yahoo.co.uk', 'yahoo.es', 'yahoo.com.mx',
            'yahoo.com.ar', 'yahoo.com.br',
            'hotmail.com', 'hotmail.es', 'hotmail.com.mx',
            'hotmail.com.ar', 'hotmail.com.br',
            'outlook.com', 'outlook.es',
            'live.com', 'live.com.mx', 'live.com.ar',
            'msn.com', 'icloud.com', 'me.com', 'mac.com',
            'aol.com', 'protonmail.com', 'proton.me',
            'zoho.com', 'mail.com', 'gmx.com', 'gmx.net',
            'yandex.com', 'yandex.ru', 'mail.ru',
            // Temporales conocidos
            'mailinator.com', 'guerrillamail.com', 'maildrop.cc',
            'tempmail.com', '10minutemail.com', 'yopmail.com',
            'trashmail.com', 'sharklasers.com', 'getnada.com',
            'dispostable.com', 'fakeinbox.com', 'temp-mail.org',
            'temp-mail.io', 'throwam.com', 'spam4.me',
        ];

        if (in_array($domain, $blockedDomains)) {
            return false;
        }

        // Dominios TLD de solo consumo (puedes ampliar esta lista)
        $blockedTlds = ['tk', 'ml', 'ga', 'cf', 'gq'];
        $tld = substr(strrchr($domain, '.'), 1);
        if (in_array($tld, $blockedTlds)) {
            return false;
        }

        // Nombres de usuario sospechosos
        $suspiciousPatterns = [
            '/^test\d*$/i',
            '/^demo\d*$/i',
            '/^spam/i',
            '/^fake/i',
            '/^noreply/i',
            '/^no-reply/i',
            '/^\d+$/',             // Solo números
            '/^[a-z]$/',           // Una sola letra
            '/(.)\1{4,}/',         // Caracteres repetidos 5+ veces (aaaaa)
            '/^(asdf|qwer|zxcv)/i', // Patrones de teclado
        ];

        foreach ($suspiciousPatterns as $pattern) {
            if (preg_match($pattern, $username)) {
                return false;
            }
        }

        // Verificar que el dominio tiene registro MX (acepta correos)
        if (!$this->domainHasMxRecord($domain)) {
            return false;
        }

        return true;
    }

    private function domainHasMxRecord(string $domain): bool
    {
        $cacheKey = 'mx_check_' . md5($domain);
        $cached = Craft::$app->getCache()->get($cacheKey);

        if ($cached !== false) {
            return $cached === 'valid';
        }

        $hasMx = checkdnsrr($domain, 'MX');
        Craft::$app->getCache()->set($cacheKey, $hasMx ? 'valid' : 'invalid', 86400);

        return $hasMx;
    }

    // -------------------------------------------------------
    // CAPA 5: DETECCIÓN DE BOTS EN NOMBRE
    // -------------------------------------------------------
    private function looksLikeBot(string $name): bool
    {
        // Nombres que son solo números
        if (preg_match('/^\d+$/', $name)) {
            return true;
        }

        // Nombres con URLs o links
        if (preg_match('/(https?:\/\/|www\.)/i', $name)) {
            return true;
        }

        // Nombres con caracteres no alfabéticos excesivos
        $alphaRatio = mb_strlen(preg_replace('/[^a-záéíóúüñ\s]/i', '', $name)) / max(mb_strlen($name), 1);
        if ($alphaRatio < 0.6) {
            return true;
        }

        // Nombres extremadamente cortos o largos
        if (mb_strlen($name) < 2 || mb_strlen($name) > 60) {
            return true;
        }

        return false;
    }

    // -------------------------------------------------------
    // CAPA 6: TIEMPO MÍNIMO DE LLENADO
    // -------------------------------------------------------
    private function validateSubmissionTime(Form $form): void
    {
        $session = Craft::$app->getSession();
        $key = 'freeform_form_loaded_' . $form->getHandle();
        $loadedAt = $session->get($key);

        if ($loadedAt) {
            $elapsed = time() - (int) $loadedAt;
            if ($elapsed < 3) {
                $form->addError('The form was submitted too quickly. Please try again.');
            }
        }
    }
}
```

---

## Mostrar los errores en el template Twig

Para que los mensajes de error sean visibles en el frontend, asegúrate de incluir este bloque en tu template **antes** del `form.render()`:

```twig
{# Registrar el tiempo de carga del formulario #}
{% do craft.app.session.set('freeform_form_loaded_' ~ form.handle, now | date('U')) %}

{# Mostrar errores generales del formulario #}
{% if form.hasErrors() %}
    <div class="form-errors alert alert-danger">
        {% for error in form.getErrors() %}
            <p>{{ error }}</p>
        {% endfor %}
    </div>
{% endif %}

{{ form.render() }}
```

El `session.set` de la primera línea es lo que alimenta la validación de tiempo mínimo de llenado. Sin esto, esa capa siempre pasará sin verificar.

---

## Depuración: cómo verificar que funciona

Si quieres confirmar que StopForumSpam está respondiendo correctamente, agrega este log temporal en `isSpamEmail`:

```php
Craft::warning(
    'StopForumSpam result for ' . $email . ': ' . ($isSpam ? 'SPAM' : 'CLEAN'),
    'spam-filter'
);
```

Luego envía el formulario con un email de prueba y revisa el log:

```bash
tail -f storage/logs/web.log | grep spam-filter
```

Deberías ver algo como:

```
[spam-filter] StopForumSpam result for contacto@empresa.com: CLEAN
```

Si en cambio quieres ver todos los valores en pantalla durante desarrollo, puedes usar `Craft::dd()` temporalmente:

```php
if ($emailField) {
    $email = strtolower(trim($emailField->getValue()));

    Craft::dd([
        'email'           => $email,
        'isValidBusiness' => $this->isValidBusinessEmail($email),
        'isSpam'          => $this->isSpamEmail($email),
    ]);
}
```

Esto detiene la ejecución y muestra los resultados en pantalla al enviar el formulario. Recuerda eliminarlo en producción.

---

## Por qué StopForumSpam es una buena opción gratuita

StopForumSpam es una base de datos colaborativa de IPs y emails asociados a spam, mantenida por la comunidad desde 2007. Sus ventajas para este uso son:

- **Completamente gratuita** para uso razonable
- No requiere registro ni API key para consultas básicas
- Devuelve un JSON simple con el campo `appears` (0 o 1) y la `frequency`
- La frecuencia te permite ajustar la sensibilidad: en el código usamos `frequency > 5` para IPs, lo que reduce falsos positivos

La única consideración es que hay un timeout de 3 segundos en las peticiones (`makeHttpRequest`). Esto es intencional: si StopForumSpam tiene problemas, el formulario sigue funcionando para usuarios legítimos. El anti-spam no debe romper la experiencia de usuario.

---

## Consideraciones de rendimiento

El caché es clave para que esta validación no agregue latencia perceptible. El módulo usa la caché interna de Craft (`Craft::$app->getCache()`) para tres cosas:

- Resultados de StopForumSpam por email (24 horas)
- Resultados de StopForumSpam por IP (24 horas)
- Verificación MX por dominio (24 horas)

Esto significa que la primera validación de un email o IP hace la petición HTTP, pero las siguientes se resuelven desde caché en microsegundos.

---

## Conclusión

Con este módulo tienes una defensa por capas que cubre los vectores de spam más comunes sin depender de servicios de pago ni de integraciones complejas. El flujo de validación es:

1. ¿La IP ha enviado demasiados formularios? → Rechazar
2. ¿La IP está en la base de spam de StopForumSpam? → Rechazar
3. ¿El email usa un dominio gratuito o temporal? → Rechazar localmente (sin latencia)
4. ¿El email está en la base de spam de StopForumSpam? → Rechazar
5. ¿El nombre tiene patrones de bot? → Rechazar
6. ¿El formulario se envió en menos de 3 segundos? → Rechazar

Cada capa es independiente. Si StopForumSpam no está disponible, las capas locales siguen funcionando. Si el handle de tu campo email no es `email`, solo cambia la línea `$form->get('email')` por el handle real de tu campo en Freeform.
