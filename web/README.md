# YaLoTengo — Web

Cliente web en React + Vite + Zustand, **mobile-first**. Consume la API de
`../backend`.

## Requisitos

- **Node.js 22.13 o superior.** Con Node 20.12 el build falla: npm 10.5.2 tiene
  un bug con dependencias opcionales (`npm/cli#4828`) y no instala el binario
  nativo de rolldown que usa Vite 8.

## Puesta en marcha

```bash
npm install
cp .env.example .env   # ajusta VITE_API_URL
npm run dev
```

Vite arranca con `host: true`, así que imprime también una URL de red
(`http://192.168.x.x:5173`) para abrir la app **desde el celular** en la misma
Wi-Fi. Para que funcione:

- `VITE_API_URL` debe apuntar a la IP de tu PC, no a `localhost`.
- El `CORS_ORIGIN` del backend debe permitir ese origen.

## Mobile-first

No es sólo que "se adapte": el diseño parte del celular y crece hacia el escritorio.

- **Navegación**: barra inferior fija al alcance del pulgar; desde `md` (768px)
  se convierte en sidebar. Ambas se generan de la misma lista `NAV_ITEMS`, así
  que no pueden desincronizarse.
- **Diálogos**: `Modal` es un *bottom sheet* en celular y un diálogo centrado
  desde `sm`. Un solo componente, dos formas.
- **Inputs a 16px**: por debajo de eso iOS hace zoom al enfocar un campo.
- **Áreas táctiles**: controles de 44–48px de alto.
- **Safe areas**: `pb-safe` / `pt-safe` respetan el notch, y el `<meta viewport>`
  usa `viewport-fit=cover`.
- **FAB** para la acción principal, flotando sobre la barra inferior.

## Lenguaje de diseño

Todo sale de los tokens en [`src/index.css`](src/index.css), dentro de `@theme`.
Los componentes **nunca** usan colores en crudo: consumen alias semánticos
(`surface`, `line`, `content`, `content-muted`, `canvas`), así que cambiar un
token restila el sitio entero de forma coherente.

- **Forma**: tres radios (`control`, `card`, `sheet`) y nada más.
- **Elevación**: tres sombras (`card`, `raised`, `overlay`), deliberadamente pocas.
- **Color**: escalas `brand` e `ink` (grises cálidos, para que el verde no se vea frío).
- **Primitivas** en `src/components/ui/`: `Button`, `Input`, `Card`, `Badge`,
  `Modal`, `ConfirmDialog`, `Toaster`, `Fab`, estados de carga/error/vacío.
  Las variantes de botón comparten alto, radio y tipografía; sólo cambia el color.

Los iconos son todos de `lucide-react`, por consistencia de trazo.

## Estructura

```
src/
  api/          Cliente axios, endpoints y mappers snake_case → camelCase
  components/
    ui/         Primitivas del sistema de diseño
    layout/     AppLayout (nav responsive) y PageHeader
  pages/        Una página por ruta
  store/        Zustand: auth, categories, products, toasts
  lib/          env, cn, subida de fotos
  types/        Contrato de la API
```

### Decisiones técnicas

- **Zustand sin librería de caché**: los stores guardan datos, estado de carga y
  errores, y exponen acciones async. `hasLoaded` distingue "nunca cargado" de
  "cargado y vacío", y evita refetches al navegar entre pestañas. La contrapartida
  es que no hay revalidación automática en foco: tras una mutación, el store
  actualiza su propia lista en memoria.
- **Sin ciclo de imports**: `authStore` no importa los stores de datos; éstos se
  registran con `registerStoreReset()` para limpiarse al cerrar sesión.
- **Mappers**: la API devuelve filas en snake_case; se normalizan en un solo sitio
  para que los componentes no dependan del formato de la base de datos.
- **Guards de ruta**: `RequireAuth` y `RequireGuest` esperan a que termine
  `restore()`, así una sesión válida nunca parpadea la pantalla de login.
- **Token en localStorage**: el backend lo devuelve en el body, no como cookie
  httpOnly. Es legible por cualquier script de la página; el trade-off se acepta
  a conciencia y está aislado en `src/api/client.ts`, que sería lo único a cambiar
  si el backend pasara a cookies.

## Fotos

La API guarda sólo una URL en `photo_url` y no expone endpoint de subida, así que
la app sube la imagen a **Cloudinary** con un *unsigned upload preset*. Se usa
`fetch` y no el cliente axios, para que el JWT nunca salga hacia un tercero.

```
VITE_CLOUDINARY_CLOUD_NAME=
VITE_CLOUDINARY_UPLOAD_PRESET=
```

Sin ellas la app funciona igual, pero los productos se guardan sin imagen.

## Pendientes que dependen del backend

- **Búsqueda**: no existe parámetro de búsqueda en `GET /products`, así que el
  filtro opera sólo sobre las páginas ya cargadas. Un `?search=` lo resolvería
  de raíz, y es central para el objetivo de "no comprar repetido".
- **Conteo de productos por categoría**: `GET /categories` no lo devuelve, por eso
  el listado de categorías no lo muestra.

## Comandos

```bash
npm run dev        # servidor de desarrollo (accesible desde la LAN)
npm run build      # typecheck + build de producción
npm run preview    # sirve el build
```
