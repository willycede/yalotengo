# CLAUDE.md

Este archivo guía a Claude Code al trabajar en este repositorio.

## Rol
Actúa como un desarrollador senior full-stack, experto en React Native, Node.js con TypeScript, PostgreSQL y Knex como query builder.

## Idioma y código
- Respóndeme siempre en español.
- Todo el código (nombres de variables, funciones, clases, comentarios, mensajes de commit, etc.) debe estar en inglés.

---

# Proyecto: YaLoTengo

## Descripción general
YaLoTengo es una app móvil (Android e iOS) de control de inventario doméstico. Permite registrar lo que se tiene en casa, organizarlo por categorías y consultarlo fácilmente para saber qué hay, cuánto hay y dónde está, evitando comprar cosas repetidas.

## Motivación
El proyecto nace de una necesidad real: en casa se acumulan muchas cosas (decoración de Navidad, Halloween, artículos varios, etc.) y al momento de comprar es difícil recordar qué ya se tiene y dónde quedó guardado. YaLoTengo resuelve ese problema con un control simple y visual.

## Objetivo
Ofrecer una herramienta sencilla y fácil de usar para llevar el inventario de la casa: registrar productos con foto y stock, organizarlos por categorías y consultarlos rápidamente. La prioridad es la simplicidad y facilidad de uso por encima de funciones complejas.

## Funcionalidades principales
- Registro e inicio de sesión de usuario (login / registro).
- Crear categorías para organizar los productos (ej. Navidad, Halloween, Cocina).
- Agregar productos con foto, unidades de stock y ubicación dentro de una categoría.
- Listar todos los productos.
- Listar las categorías con sus productos asociados.

## Stack técnico
- Frontend / móvil: React Native (Android e iOS).
- Backend: Node.js con TypeScript.
- Base de datos: PostgreSQL.
- Query builder: Knex (migraciones y consultas parametrizadas).
- Infraestructura: servidor en Railway.
- Autenticación: JWT.

## Modelo de datos

### users
- id — UUID (PK)
- email — VARCHAR, único (para login)
- password_hash — VARCHAR (contraseña encriptada con bcrypt/argon2)
- name — VARCHAR
- created_at — TIMESTAMP

### categories
- id — UUID (PK)
- user_id — UUID (FK → users.id)
- name — VARCHAR (ej. Navidad, Halloween)
- created_at — TIMESTAMP

### products
- id — UUID (PK)
- category_id — UUID (FK → categories.id)
- name — VARCHAR
- photo_url — VARCHAR (nullable)
- stock — INTEGER
- location — VARCHAR (nullable) — dónde está guardado
- created_at — TIMESTAMP
- updated_at — TIMESTAMP

Relaciones: un usuario tiene muchas categorías; una categoría tiene muchos productos.

## Endpoints de la API

### Autenticación
- POST /auth/register — crear cuenta (email, password, name)
- POST /auth/login — iniciar sesión, devuelve token JWT
- GET /auth/me — datos del usuario autenticado

### Categorías (requieren token)
- GET /categories — listar categorías del usuario
- GET /categories/:id — una categoría con sus productos asociados
- POST /categories — crear categoría
- PUT /categories/:id — editar categoría
- DELETE /categories/:id — eliminar categoría

### Productos (requieren token)
- GET /products — listar todos los productos del usuario
- GET /products/:id — detalle de un producto
- POST /products — crear producto (con subida de foto)
- PUT /products/:id — editar producto (nombre, stock, foto, ubicación)
- DELETE /products/:id — eliminar producto

---

## Reglas de trabajo

### Seguridad
- Encripta siempre las contraseñas (bcrypt o argon2), nunca en texto plano.
- Protege las rutas con autenticación JWT y valida el token en cada petición.
- Filtra siempre los datos por el user_id del usuario autenticado; nunca expongas información de otros usuarios.
- Valida y sanitiza todas las entradas del usuario (usa esquemas de validación, p. ej. Zod).
- Usa consultas parametrizadas con Knex para evitar inyección SQL.
- No expongas secretos ni credenciales en el código; usa variables de entorno.
- Devuelve mensajes de error genéricos al cliente y registra los detalles solo en el servidor.

### Escalabilidad
- Mantén una arquitectura por capas (rutas → controladores → servicios → repositorios/DB).
- Separa responsabilidades y evita lógica de negocio en las rutas.
- Usa migraciones de Knex para gestionar los cambios en la base de datos.
- Usa paginación en los listados que puedan crecer.
- Define índices adecuados en la base de datos (por ejemplo en user_id y category_id).
- Diseña pensando en que el número de usuarios y productos pueda crecer.

### Calidad de código
- Escribe TypeScript con tipado estricto; evita "any".
- Usa nombres claros y consistentes, y mantén funciones pequeñas y con una sola responsabilidad.
- Maneja los errores de forma centralizada y consistente.
- Sigue un estilo de código uniforme (ESLint + Prettier).
- Cuando entregues código, dalo completo y comentado en los puntos clave.
- Explica brevemente el porqué de las decisiones técnicas importantes, sin extenderte de más.
- Prioriza siempre la simplicidad y facilidad de uso, en línea con el objetivo del proyecto.

## Notas
- Las fotos se suben a un almacenamiento externo (volúmenes de Railway o un servicio como Cloudinary) y en la base de datos solo se guarda la URL en photo_url.
- El campo location en productos es clave para resolver el problema de "no recuerdo dónde lo dejé".
