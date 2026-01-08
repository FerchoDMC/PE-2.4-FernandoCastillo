import Fastify from 'fastify';
import cors from '@fastify/cors';
import jwt from '@fastify/jwt';
import swagger from '@fastify/swagger';
import swaggerUi from '@fastify/swagger-ui';
import { config } from 'dotenv';
import { errorHandler, UnauthorizedError, ForbiddenError } from './utils/errors.js';

// Importar rutas
import authRoutes from './routes/auth.routes.js';
import prerequisitoRoutes from './routes/prerequisito.routes.js';
import propuestaRoutes from './routes/propuesta.routes.js';
import avanceRoutes from './routes/avance.routes.js';

// Cargar variables de entorno
config();

/**
 * Crear y configurar la aplicación Fastify
 */
export async function buildApp(opts = {}) {
    const app = Fastify({
        logger: process.env.NODE_ENV === 'development',
        ...opts
    });

    // Registrar plugins
    await app.register(cors, {
        origin: true, // En producción, especificar dominios permitidos
        credentials: true
    });

    await app.register(jwt, {
        secret: process.env.JWT_SECRET || 'tu_clave_secreta_super_segura',
        sign: {
            expiresIn: process.env.JWT_EXPIRES_IN || '7d'
        }
    });

    // Configurar Swagger/OpenAPI
    await app.register(swagger, {
        openapi: {
            info: {
                title: 'API Sistema de Gestión de Titulación',
                description: 'API REST para gestionar trabajos de titulación académicos de la Universidad Internacional del Ecuador',
                version: '1.0.0'
            },
            servers: [
                {
                    url: 'http://localhost:3000',
                    description: 'Servidor de desarrollo'
                }
            ],
            components: {
                securitySchemes: {
                    bearerAuth: {
                        type: 'http',
                        scheme: 'bearer',
                        bearerFormat: 'JWT',
                        description: 'Ingrese el token JWT obtenido del endpoint /api/auth/login'
                    }
                }
            },
            tags: [
                { name: 'Autenticación', description: 'Endpoints de registro y login' },
                { name: 'Prerrequisitos', description: 'Gestión de prerrequisitos y semáforo de validación' },
                { name: 'Propuestas', description: 'Gestión de propuestas y observaciones del comité' },
                { name: 'Avances', description: 'Seguimiento de avances semanales' }
            ]
        }
    });

    // Configurar Swagger UI
    await app.register(swaggerUi, {
        routePrefix: '/docs',
        uiConfig: {
            docExpansion: 'list',
            deepLinking: true
        },
        staticCSP: true,
        transformStaticCSP: (header) => header
    });

    // Decorador de autenticación
    app.decorate('authenticate', async function (request, reply) {
        try {
            await request.jwtVerify();
        } catch (err) {
            throw new UnauthorizedError('Token inválido o expirado');
        }
    });

    // Decorador para verificar roles
    app.decorate('requireRole', (rolesPermitidos) => {
        return async function (request, reply) {
            if (!request.user || !request.user.roles) {
                throw new UnauthorizedError('Usuario no autenticado');
            }

            const tieneRol = rolesPermitidos.some(rol =>
                request.user.roles.includes(rol)
            );

            if (!tieneRol) {
                throw new ForbiddenError('No tienes permisos para realizar esta acción');
            }
        };
    });

    // Registrar manejador de errores global
    app.setErrorHandler(errorHandler);

    // Ruta de health check
    app.get('/health', {
        schema: {
            description: 'Verificar estado del servidor',
            tags: ['Sistema'],
            response: {
                200: {
                    description: 'Servidor funcionando correctamente',
                    type: 'object',
                    properties: {
                        status: { type: 'string', example: 'ok' },
                        timestamp: { type: 'string', format: 'date-time' }
                    }
                }
            }
        }
    }, async (request, reply) => {
        return { status: 'ok', timestamp: new Date().toISOString() };
    });

    // Registrar rutas de la API
    await app.register(authRoutes, { prefix: '/api/auth' });
    await app.register(prerequisitoRoutes, { prefix: '/api/prerequisitos' });
    await app.register(propuestaRoutes, { prefix: '/api/propuestas' });
    await app.register(avanceRoutes, { prefix: '/api/avances' });

    return app;
}

export default buildApp;
