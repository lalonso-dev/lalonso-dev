---
title: "Setup de Neovim con config personalizada"
description: "Guía paso a paso para montar un setup personalizado de Neovim con plugins, LSP, snippets y keymaps listos para trabajar."
date: 2026-01-22
cover: "/images/blog/nvim.webp"
categories: ["Tutoriales"]
readingTime: 8
featured: true
draft: false
tags: ["neovim", "vim", "terminal", "dev-tools", "lua"]
---

# Setup de Neovim con config personalizada

Una configuración de Neovim enfocada en productividad y desarrollo moderno. Usa **lazy.nvim** como gestor de plugins, **Mason** para instalar language servers automáticamente y la **API nativa de Neovim 0.11** para LSP. Una vez instalada tendrás un entorno completo listo para trabajar con TypeScript, PHP, Python, Go, Vue, y más.

El repositorio está en [github.com/lalonso-dev/nvim-config](https://github.com/lalonso-dev/nvim-config).

---

## Requisitos previos

Antes de clonar el repo asegúrate de tener instaladas estas dependencias. Todas son necesarias para que los plugins y language servers funcionen correctamente.

| Dependencia | Versión mínima | Para qué se usa         |
| ----------- | -------------- | ----------------------- |
| Neovim      | >= 0.11        | El editor               |
| Node.js     | >= 18          | LSP y prettier          |
| Git         | >= 2.0         | Plugin manager          |
| Go          | >= 1.22        | gopls (LSP de Go)       |
| Python 3    | >= 3.10        | pyright (LSP de Python) |
| ripgrep     | cualquiera     | Telescope live grep     |
| fd          | cualquiera     | Telescope file finder   |
| Nerd Font   | cualquiera     | Iconos en la UI         |

---

## Instalación por sistema operativo

### macOS

Con Homebrew en un solo comando:

```bash
brew install neovim node go python3 ripgrep fd git
```

### Ubuntu / Debian

Neovim necesita el PPA para tener una versión reciente, ya que los repos oficiales de Ubuntu suelen tener versiones muy antiguas:

```bash
# Neovim desde PPA
sudo add-apt-repository ppa:neovim-ppa/unstable
sudo apt update
sudo apt install neovim

# Resto de dependencias
sudo apt install nodejs npm golang-go python3 python3-pip ripgrep fd-find git

# En Ubuntu fd se llama fdfind, crear el alias
sudo ln -sf $(which fdfind) /usr/local/bin/fd
```

### Arch Linux

```bash
sudo pacman -S neovim nodejs npm go python ripgrep fd git
```

---

## Instalar la configuración

Tienes dos opciones: el script automático o hacerlo manualmente paso a paso.

### Opción A — Script automático (recomendado)

```bash
git clone https://github.com/lalonso-dev/nvim-config.git ~/nvim-config
cd ~/nvim-config
chmod +x install.sh && ./install.sh
```

El script hace todo por ti: crea los directorios, genera los symlinks y lanza Neovim para que lazy.nvim instale los plugins.

### Opción B — Manual

**1. Clonar el repositorio:**

```bash
git clone https://github.com/lalonso-dev/nvim-config.git ~/nvim-config
```

**2. Crear los symlinks a `~/.config/nvim`:**

```bash
mkdir -p ~/.config/nvim
ln -sf ~/nvim-config/init.lua ~/.config/nvim/init.lua
ln -sf ~/nvim-config/lua ~/.config/nvim/lua
ln -sf ~/nvim-config/snippets ~/.config/nvim/snippets
```

**3. Instalar paquetes globales de npm:**

Necesarios para el formateo de JS/TS, HTML, CSS y Twig:

```bash
npm install -g prettier @zackad/prettier-plugin-twig
```

**4. Abrir Neovim:**

```bash
nvim
```

En la primera apertura ocurren tres cosas automáticamente:

- **lazy.nvim** se instala y descarga todos los plugins
- **Mason** instala los language servers (pyright, ts_ls, gopls, intelephense, etc.)
- **Treesitter** instala los parsers de syntax highlighting

Espera a que termine todo antes de empezar a editar. Puedes ver el progreso con `:Lazy` y `:Mason`.

---

## Qué incluye la configuración

### Estructura de archivos

```
nvim-config/
├── init.lua                 # Entry point
├── install.sh               # Script de instalación
├── lua/
│   ├── config/
│   │   ├── options.lua      # Números, tabs, clipboard, etc.
│   │   ├── keymaps.lua      # Todos los keybindings
│   │   ├── autocmds.lua     # Autocommands
│   │   └── lazy.lua         # Bootstrap del plugin manager
│   └── plugins/
│       ├── colorscheme.lua  # One Dark Pro
│       ├── treesitter.lua   # Syntax highlighting
│       ├── lsp.lua          # Language servers
│       ├── cmp.lua          # Autocompletado
│       ├── conform.lua      # Formateo
│       ├── lint.lua         # Linting
│       ├── neo-tree.lua     # File explorer
│       ├── telescope.lua    # Fuzzy finder
│       ├── lualine.lua      # Status bar
│       ├── gitsigns.lua     # Git diff en el gutter
│       ├── git.lua          # vim-fugitive
│       ├── terminal.lua     # Terminal integrada
│       ├── which-key.lua    # Hints de keybindings
│       ├── trouble.lua      # Panel de diagnósticos
│       ├── flash.lua        # Quick motion
│       ├── editor.lua       # Comment, autopairs, surround, twig.vim
│       ├── ui.lua           # Noice, notify, devicons, colorizer
│       └── tmux.lua         # Integración con Tmux
└── snippets/
    ├── typescript.lua       # React, hooks, Redux
    ├── javascript.lua       # Console, arrow functions
    ├── python.lua           # Classes, functions, tests
    ├── django.lua           # Models, views, forms
    ├── htmldjango.lua       # Django template tags
    └── twig.lua             # Craft CMS / Twig templates
```

### Language servers incluidos

Mason los instala automáticamente al abrir Neovim por primera vez:

| Servidor     | Lenguaje                |
| ------------ | ----------------------- |
| pyright      | Python                  |
| ts_ls        | TypeScript / JavaScript |
| vue_ls       | Vue (Volar hybrid mode) |
| intelephense | PHP                     |
| gopls        | Go                      |
| cssls        | CSS                     |
| html         | HTML                    |
| jsonls       | JSON                    |
| emmet_ls     | Emmet                   |
| lua_ls       | Lua                     |

### Formateo y linting

| Lenguaje                   | Formateador                             |
| -------------------------- | --------------------------------------- |
| JS / TS / Vue / CSS / HTML | prettier                                |
| Twig                       | prettier + @zackad/prettier-plugin-twig |
| Python                     | autopep8                                |
| Go                         | gofmt                                   |
| Lua                        | stylua                                  |
| Django HTML                | djhtml                                  |

---

## Keybindings principales

La **leader key** es `Espacio`.

### Navegación y archivos

| Atajo             | Acción                 |
| ----------------- | ---------------------- |
| `<Space>e`        | Toggle file explorer   |
| `<Tab>`           | Siguiente buffer       |
| `<S-Tab>`         | Buffer anterior        |
| `<Space>x`        | Cerrar buffer actual   |
| `<C-h>` / `<C-l>` | Moverse entre ventanas |
| `vv`              | Split vertical         |
| `cc`              | Split horizontal       |

### Telescope (fuzzy finder)

| Atajo       | Acción                      |
| ----------- | --------------------------- |
| `<Space>f`  | Buscar archivos             |
| `<Space>ag` | Buscar texto en el proyecto |
| `<Space>ob` | Buffers abiertos            |
| `<Space>fr` | Archivos recientes          |
| `<Space>fg` | Git status                  |
| `<Space>fd` | Diagnósticos                |

### LSP

| Atajo       | Acción                           |
| ----------- | -------------------------------- |
| `gd`        | Ir a definición                  |
| `gr`        | Ver referencias                  |
| `K`         | Hover info                       |
| `<Space>rn` | Renombrar símbolo                |
| `<Space>ca` | Code actions                     |
| `[d` / `]d` | Diagnóstico anterior / siguiente |
| `<Space>d`  | Diagnóstico flotante             |

### Edición

| Atajo             | Acción                          |
| ----------------- | ------------------------------- |
| `<Space>p`        | Formatear archivo               |
| `<C-j>` / `<C-k>` | Mover línea arriba / abajo      |
| `iq`              | Escape desde insert mode        |
| `<C-t>`           | Toggle terminal                 |
| `<Space>xx`       | Panel de diagnósticos (Trouble) |
| `<Space>s`        | Flash jump                      |

---

## Tips opcionales

### Alias para abrir Neovim rápido

Agrega esto a tu `~/.zshrc` o `~/.bashrc` para abrir Neovim con `v` y que por defecto abra el directorio actual:

```bash
alias v=openNvim
function openNvim {
  if [ $# -eq 0 ]; then
    nvim ./
  else
    nvim $1
  fi
}
```

### Linters opcionales

```bash
npm install -g eslint_d           # JS/TS linting rápido
pip install pylint                # Python
npm install -g markdownlint-cli   # Markdown
```

### Formateadores opcionales

```bash
pip install autopep8 djhtml       # Python / Django HTML
brew install stylua               # Lua (o: npm install -g stylua)
```

### Cambiar el tema

El tema por defecto es **One Dark Pro** (el tema de Atom). Para cambiarlo edita `lua/plugins/colorscheme.lua`. Algunos temas probados y compatibles con esta config:

- `olimorris/onedarkpro.nvim` — actual
- `loctvl842/monokai-pro.nvim`
- `ellisonleao/gruvbox.nvim`

---

## Verificar que todo funciona

Una vez instalado abre un archivo de cualquier lenguaje soportado y verifica:

```bash
nvim mi-archivo.ts
```

Deberías ver syntax highlighting coloreado, autocompletado al escribir, y diagnósticos subrayados en rojo si hay errores. Puedes revisar el estado de los language servers con `:LspInfo` y los plugins instalados con `:Lazy`.

Si algo no carga, limpia la caché y vuelve a abrir:

```bash
rm -rf ~/.local/share/nvim
nvim
```

Esto fuerza a lazy.nvim y Mason a reinstalar todo desde cero.
