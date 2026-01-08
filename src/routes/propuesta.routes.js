import { propuestaService, observacionService } from '../services/propuesta.service.js';
import { crearPropuestaSchema, aprobarPropuestaSchema, crearObservacionSchema } from '../schemas/propuesta.schema.js';

/**
 * Rutas de propuestas
 */
export default async function propuestaRoutes(fastify, options) {
    /**
     * POST /api/propuestas
     * Crear propuesta (Estudiante registra ideas)
     */
    fastify.post('/', {
        onRequest: [fastify.authenticate]
    }, async (request, reply) => {
        try {
            const validatedData = crearPropuestaSchema.parse(request.body);
            const propuesta = await propuestaService.crearPropuesta(validatedData);

            return reply.status(201).send({
                message: 'Propuesta creada exitosamente',
                propuesta
            });
        } catch (error) {
            throw error;
        }
    });

    /**
     * GET /api/propuestas
     * Listar todas las propuestas (Director/Comité)
     */
    fastify.get('/', {
        onRequest: [fastify.authenticate, fastify.requireRole(['director', 'coordinador', 'tutor'])]
    }, async (request, reply) => {
        try {
            const filtros = {};

            // Filtrar por estado si se proporciona
            if (request.query.estado) {
                filtros.estado = request.query.estado;
            }

            // Filtrar por tipo si se proporciona
            if (request.query.tipo) {
                filtros.tipo = request.query.tipo;
            }

            const propuestas = await propuestaService.listarTodasPropuestas(filtros);
            return reply.send({ propuestas });
        } catch (error) {
            throw error;
        }
    });

    /**
     * GET /api/propuestas/:id
     * Obtener propuesta por ID
     */
    fastify.get('/:id', {
        onRequest: [fastify.authenticate]
    }, async (request, reply) => {
        try {
            const id = parseInt(request.params.id);
            const propuesta = await propuestaService.obtenerPropuesta(id);
            return reply.send({ propuesta });
        } catch (error) {
            throw error;
        }
    });

    /**
     * GET /api/propuestas/estudiante/:estudianteId
     * Listar propuestas de un estudiante
     */
    fastify.get('/estudiante/:estudianteId', {
        onRequest: [fastify.authenticate]
    }, async (request, reply) => {
        try {
            const estudianteId = parseInt(request.params.estudianteId);
            const propuestas = await propuestaService.listarPropuestasEstudiante(estudianteId);
            return reply.send({ propuestas });
        } catch (error) {
            throw error;
        }
    });

    /**
     * PATCH /api/propuestas/:id/estado
     * Cambiar estado de propuesta (aprobar/rechazar)
     */
    fastify.patch('/:id/estado', {
        onRequest: [fastify.authenticate, fastify.requireRole(['director'])]
    }, async (request, reply) => {
        try {
            const id = parseInt(request.params.id);
            const validatedData = aprobarPropuestaSchema.parse(request.body);

            const propuesta = await propuestaService.cambiarEstadoPropuesta(id, validatedData.estado);

            // Si hay comentario, crear observación
            if (validatedData.comentario) {
                await observacionService.crearObservacion(
                    id,
                    request.user.id,
                    validatedData.comentario
                );
            }

            return reply.send({
                message: `Propuesta ${validatedData.estado}`,
                propuesta
            });
        } catch (error) {
            throw error;
        }
    });

    /**
     * POST /api/propuestas/:id/observaciones
     * Agregar observación (Comité)
     */
    fastify.post('/:id/observaciones', {
        onRequest: [fastify.authenticate]
    }, async (request, reply) => {
        try {
            const propuestaId = parseInt(request.params.id);
            const { comentario } = request.body;

            if (!comentario) {
                return reply.status(400).send({ error: 'El comentario es requerido' });
            }

            const observacion = await observacionService.crearObservacion(
                propuestaId,
                request.user.id,
                comentario
            );

            return reply.status(201).send({
                message: 'Observación agregada exitosamente',
                observacion
            });
        } catch (error) {
            throw error;
        }
    });

    /**
     * GET /api/propuestas/:id/observaciones
     * Obtener observaciones de una propuesta (Consolidado)
     */
    fastify.get('/:id/observaciones', {
        onRequest: [fastify.authenticate]
    }, async (request, reply) => {
        try {
            const propuestaId = parseInt(request.params.id);
            const observaciones = await observacionService.obtenerObservaciones(propuestaId);

            return reply.send({ observaciones });
        } catch (error) {
            throw error;
        }
    });
}
