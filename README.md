# Sistema de Gestión de Titulación - API REST

API REST completa para gestionar el proceso de trabajos de titulación académicos, construida con **Fastify**, **Prisma ORM**, **Zod**, **Node.js**, y **MySQL 8.0**, siguiendo las especificaciones de **ECMAScript 2025**.

## 🚀 Características

- ✅ Autenticación JWT con roles (Estudiante, Tutor, Director, Coordinador)
- ✅ Gestión de prerrequisitos con "semáforo de validación"
- ✅ Registro de propuestas (3 ideas iniciales)
- ✅ Sistema de feedback múltiple (observaciones del comité)
- ✅ Seguimiento de avances semanales (16 semanas)
- ✅ Validación de datos con Zod
- ✅ ORM type-safe con Prisma
- ✅ Arquitectura modular y escalable

## 📋 Prerrequisitos

- **Node.js** 22+ (con soporte ES2025)
- **MySQL** 8.0+
- **npm** o **pnpm**

## 🛠️ Instalación

### 1. Clonar e instalar dependencias

```bash
# Instalar dependencias
npm install
```

### 2. Configurar variables de entorno

Crea un archivo `.env` basado en `.env.example`:

```bash
cp .env.example .env
```

Edita `.env` con tus credenciales de MySQL:

```env
DATABASE_URL="mysql://usuario:password@localhost:3306/sistema_titulacion"
PORT=3000
JWT_SECRET=tu_clave_secreta_cambiala
```

### 3. Configurar base de datos

```bash
# Generar cliente Prisma
npm run prisma:generate

# Ejecutar migraciones
npm run prisma:migrate

# (Opcional) Abrir Prisma Studio para ver datos
npm run prisma:studio
```

### 4. Iniciar servidor

```bash
# Modo desarrollo (con auto-reload)
npm run dev

# Modo producción
npm start
```

El servidor estará disponible en `http://localhost:3000`.

## 📚 Documentación de API

### Autenticación

#### Registrar usuario
```http
POST /api/auth/register
Content-Type: application/json

{
  "nombres": "Gabriel",
  "apellidos": "Serrango",
  "correoInstitucional": "gabriel@uide.edu.ec",
  "clave": "password123",
  "roles": ["estudiante"]
}
```

#### Login
```http
POST /api/auth/login
Content-Type: application/json

{
  "correoInstitucional": "gabriel@uide.edu.ec",
  "clave": "password123"
}
```

**Respuesta:**
```json
{
  "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
  "usuario": { ... }
}
```

### Prerrequisitos (Semáforo de Validación)

#### Marcar prerequisito completado
```http
POST /api/prerequisitos/marcar
Authorization: Bearer {token}
Content-Type: application/json

{
  "estudianteId": 1,
  "prerequisitoId": 1
}
```

#### Validar prerequisito (Director)
```http
POST /api/prerequisitos/validar
Authorization: Bearer {token}
Content-Type: application/json

{
  "estudianteId": 1,
  "prerequisitoId": 1
}
```

#### Ver estado del semáforo
```http
GET /api/prerequisitos/estado/:estudianteId
Authorization: Bearer {token}
```

**Respuesta:**
```json
{
  "prerequisitos": [...],
  "semaforoVerde": true,
  "puedeIniciarTitulacion": true
}
```

### Propuestas

#### Crear propuesta (3 ideas)
```http
POST /api/propuestas
Authorization: Bearer {token}
Content-Type: application/json

{
  "estudianteId": 1,
  "tipo": "idea",
  "numeroIdea": 1,
  "tema": "Sistema de gestión académica con IA",
  "objetivos": "Desarrollar un sistema que...",
  "problematica": "Actualmente existe...",
  "alcance": "El proyecto abarcará..."
}
```

#### Agregar observación (Comité)
```http
POST /api/propuestas/:id/observaciones
Authorization: Bearer {token}
Content-Type: application/json

{
  "comentario": "Sugerencia: mejorar el alcance usando..."
}
```

#### Ver observaciones consolidadas
```http
GET /api/propuestas/:id/observaciones
Authorization: Bearer {token}
```

### Avances

#### Crear avance semanal
```http
POST /api/avances
Authorization: Bearer {token}
Content-Type: application/json

{
  "propuestaId": 1,
  "semana": 1,
  "contenido": "Completé el diseño de la base de datos...",
  "porcentajeAvance": 10,
  "fechaInicio": "2026-01-07T00:00:00Z",
  "fechaEntrega": "2026-01-14T00:00:00Z"
}
```

#### Calificar avance (Tutor/Director)
```http
PATCH /api/avances/:id/calificar
Authorization: Bearer {token}
Content-Type: application/json

{
  "calificacion": 85,
  "verificacionRevision": true
}
```

#### Ver progreso general
```http
GET /api/avances/propuesta/:propuestaId/progreso
Authorization: Bearer {token}
```

## 🏗️ Estructura del Proyecto

```
proyecto/
├── prisma/
│   └── schema.prisma        # Esquema de base de datos
├── src/
│   ├── routes/              # Rutas de la API
│   │   ├── auth.routes.js
│   │   ├── prerequisito.routes.js
│   │   ├── propuesta.routes.js
│   │   └── avance.routes.js
│   ├── schemas/             # Esquemas de validación Zod
│   │   ├── usuario.schema.js
│   │   ├── propuesta.schema.js
│   │   ├── avance.schema.js
│   │   └── prerequisito.schema.js
│   ├── services/            # Lógica de negocio
│   │   ├── auth.service.js
│   │   ├── prerequisito.service.js
│   │   ├── propuesta.service.js
│   │   └── avance.service.js
│   ├── utils/               # Utilidades
│   │   ├── prisma.js
│   │   └── errors.js
│   ├── app.js               # Configuración Fastify
│   └── server.js            # Punto de entrada
├── package.json
└── .env
```

## 🧪 Testing

```bash
# Ejecutar tests
npm test
```

## 🔒 Seguridad

- Contraseñas encriptadas con bcrypt
- Autenticación JWT con expiración
- Validación de datos con Zod
- Control de acceso basado en roles

## 📝 Licencia

MIT

## 📝Capturas de pantalla

![Servidor corriendo con Swagger](capturas/serve2.png)

![Servidor corriendo con Swagger](capturas/serve1.png)


