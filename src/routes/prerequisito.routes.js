import prerequisitoService from '../services/prerequisito.service.js';
import { marcarPrerequisitoSchema, validarPrerequisitoSchema } from '../schemas/prerequisito.schema.js';

/**
 * Rutas de prerrequisitos
 */
export default async function prerequisitoRoutes(fastify, options) {
    /**
     * GET /api/prerequisitos
     * Listar todos los prerrequisitos
     */
    fastify.get('/', async (request, reply) => {
        try {
            const prerequisitos = await prerequisitoService.listarPrerequisitos();
            return reply.send({ prerequisitos });
        } catch (error) {
            throw error;
        }
    });

    /**
     * POST /api/prerequisitos/marcar
     * Marcar prerequisito como completado (Estudiante)
     */
    fastify.post('/marcar', {
        onRequest: [fastify.authenticate]
    }, async (request, reply) => {
        try {
            const validatedData = marcarPrerequisitoSchema.parse(request.body);
            const resultado = await prerequisitoService.marcarCompletado(
                validatedData.estudianteId,
                validatedData.prerequisitoId
            );

            return reply.send({
                message: 'Prerequisito marcado como completado',
                prerequisito: resultado
            });
        } catch (error) {
            throw error;
        }
    });

    /**
     * POST /api/prerequisitos/validar
     * Validar prerequisito (Director) - Semáforo verde
     */
    fastify.post('/validar', {
        onRequest: [fastify.authenticate, fastify.requireRole(['director'])]
    }, async (request, reply) => {
        try {
            const validatedData = validarPrerequisitoSchema.parse(request.body);
            const resultado = await prerequisitoService.validarPrerequisito(
                validatedData.estudianteId,
                validatedData.prerequisitoId
            );

            return reply.send({
                message: 'Prerequisito validado exitosamente',
                prerequisito: resultado
            });
        } catch (error) {
            throw error;
        }
    });

    /**
     * GET /api/prerequisitos/estado/:estudianteId
     * Obtener estado de prerrequisitos (Semáforo)
     */
    fastify.get('/estado/:estudianteId', {
        onRequest: [fastify.authenticate]
    }, async (request, reply) => {
        try {
            const estudianteId = parseInt(request.params.estudianteId);
            const estado = await prerequisitoService.obtenerEstadoPrerequisitos(estudianteId);

            return reply.send(estado);
        } catch (error) {
            throw error;
        }
    });
}
