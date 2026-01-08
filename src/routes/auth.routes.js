import authService from '../services/auth.service.js';
import { loginSchema, registroUsuarioSchema } from '../schemas/usuario.schema.js';

/**
 * Rutas de autenticación
 */
export default async function authRoutes(fastify, options) {
    /**
     * POST /api/auth/register
     * Registrar nuevo usuario
     */
    fastify.post('/register', async (request, reply) => {
        try {
            const validatedData = registroUsuarioSchema.parse(request.body);
            const usuario = await authService.registrarUsuario(validatedData);

            // Generar JWT
            const token = fastify.jwt.sign({
                id: usuario.id,
                correo: usuario.correoInstitucional,
                roles: usuario.roles.map(r => r.rol.nombre)
            });

            return reply.status(201).send({
                message: 'Usuario registrado exitosamente',
                usuario,
                token
            });
        } catch (error) {
            throw error;
        }
    });

    /**
     * POST /api/auth/login
     * Autenticar usuario
     */
    fastify.post('/login', async (request, reply) => {
        try {
            const validatedData = loginSchema.parse(request.body);
            const usuario = await authService.autenticar(
                validatedData.correoInstitucional,
                validatedData.clave
            );

            // Generar JWT
            const token = fastify.jwt.sign({
                id: usuario.id,
                correo: usuario.correoInstitucional,
                roles: usuario.roles.map(r => r.rol.nombre)
            });

            return reply.send({
                message: 'Autenticación exitosa',
                usuario,
                token
            });
        } catch (error) {
            throw error;
        }
    });

    /**
     * GET /api/auth/me
     * Obtener usuario autenticado
     */
    fastify.get('/me', {
        onRequest: [fastify.authenticate]
    }, async (request, reply) => {
        try {
            const usuario = await authService.obtenerUsuarioPorId(request.user.id);
            return reply.send({ usuario });
        } catch (error) {
            throw error;
        }
    });
}
