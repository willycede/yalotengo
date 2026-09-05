# YaLoTengo

App de inventario doméstico. Registra lo que tienes en casa, organízalo por
categorías y consúltalo rápido para saber **qué hay, cuánto hay y dónde está** —
para dejar de comprar cosas repetidas.

Nace de un problema real: en casa se acumulan cosas (decoración de Navidad,
Halloween, artículos varios) y al momento de comprar es difícil recordar qué ya
se tiene y dónde quedó guardado.

## Estructura

```
backend/   API REST — Node.js + TypeScript + Express + PostgreSQL (Knex)
web/       Cliente web — React + Vite + Zustand + Tailwind, mobile-first
```

Cada carpeta tiene su propio README con instrucciones detalladas.

## Puesta en marcha

Requiere **Node.js 22.13+** y **PostgreSQL**.

```bash
# 1. Base de datos
psql -U postgres -c "CREATE DATABASE yalotengo;"

# 2. Backend
cd backend
npm install
cp .env.example .env      # ajusta DATABASE_URL y JWT_SECRET
npm run migrate:latest
npm run dev               # http://localhost:3000

# 3. Web (en otra terminal)
cd web
npm install
cp .env.example .env      # ajusta VITE_API_URL
npm run dev               # http://localhost:5173
```

El servidor de Vite arranca con `host: true`, así que también imprime una URL de
red para abrir la app **desde el celular** en la misma Wi-Fi.

## Modelo de datos

```
users ──< categories ──< products
```

- **users** — id, email, password_hash, name
- **categories** — id, user_id, name
- **products** — id, category_id, name, photo_url, stock, location, unit_price

Un usuario tiene muchas categorías; una categoría tiene muchos productos.
Todas las consultas se filtran por el `user_id` autenticado.

## API

| Método | Ruta | Descripción |
| --- | --- | --- |
| POST | `/auth/register` | Crear cuenta |
| POST | `/auth/login` | Iniciar sesión (devuelve JWT) |
| GET | `/auth/me` | Usuario autenticado |
| GET/POST | `/categories` | Listar / crear categorías |
| GET/PUT/DELETE | `/categories/:id` | Detalle (con productos) / editar / eliminar |
| GET/POST | `/products` | Listar (paginado) / crear |
| GET/PUT/DELETE | `/products/:id` | Detalle / editar / eliminar |

Todas las rutas salvo `/auth/register` y `/auth/login` requieren
`Authorization: Bearer <token>`.

Crear y editar productos aceptan `application/json` o `multipart/form-data`
(con la imagen en el campo `photo`).

## Decisiones técnicas

- **Arquitectura por capas** en el backend: rutas → controladores → servicios →
  repositorios. La lógica de negocio no vive en las rutas.
- **Validación con Zod** en el borde y consultas parametrizadas con Knex.
- **Fotos en un bucket S3-compatible** (Railway Buckets). El bucket es privado:
  la base guarda la *clave* del objeto y la URL se firma en cada lectura, así el
  navegador descarga directo del bucket sin costo de egress.
- **Optimización de imágenes** con `sharp` antes de subir: máx. 1200px y WebP,
  lo que convierte una foto de 4 MB en unos 100 KB.
- **Mobile-first** en la web: navegación inferior al alcance del pulgar que se
  vuelve sidebar en escritorio, modo oscuro automático y ajuste de stock en
  línea desde el listado.

## Seguridad

- Contraseñas con bcrypt, nunca en texto plano.
- Rutas protegidas con JWT, validado en cada petición.
- Todo filtrado por el `user_id` autenticado; nunca se exponen datos de otros.
- Errores genéricos al cliente, detalle solo en el log del servidor.
- Los `.env` están fuera del repositorio; usa `.env.example` como plantilla.
