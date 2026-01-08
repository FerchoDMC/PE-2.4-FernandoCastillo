import avanceService from '../services/avance.service.js';
import { crearAvanceSchema, calificarAvanceSchema } from '../schemas/avance.schema.js';

/**
 * Rutas de avances
 */
export default async function avanceRoutes(fastify, options) {
    /**
     * POST /api/avances
     * Crear avance semanal
     */
    fastify.post('/', {
        onRequest: [fastify.authenticate]
    }, async (request, reply) => {
        try {
            const validatedData = crearAvanceSchema.parse(request.body);
            const avance = await avanceService.crearAvance(validatedData);

            return reply.status(201).send({
                message: 'Avance creado exitosamente',
                avance
            });
        } catch (error) {
            throw error;
        }
    });

    /**
     * GET /api/avances/:id
     * Obtener avance por ID
     */
    fastify.get('/:id', {
        onRequest: [fastify.authenticate]
    }, async (request, reply) => {
        try {
            const id = parseInt(request.params.id);
            const avance = await avanceService.obtenerAvance(id);
            return reply.send({ avance });
        } catch (error) {
            throw error;
        }
    });

    /**
     * GET /api/avances/propuesta/:propuestaId
     * Listar avances de una propuesta
     */
    fastify.get('/propuesta/:propuestaId', {
        onRequest: [fastify.authenticate]
    }, async (request, reply) => {
        try {
            const propuestaId = parseInt(request.params.propuestaId);
            const avances = await avanceService.listarAvances(propuestaId);
            return reply.send({ avances });
        } catch (error) {
            throw error;
        }
    });

    /**
     * PATCH /api/avances/:id/entregar
     * Entregar avance (Estudiante)
     */
    fastify.patch('/:id/entregar', {
        onRequest: [fastify.authenticate]
    }, async (request, reply) => {
        try {
            const id = parseInt(request.params.id);
            const { contenido, fechaEntregaReal } = request.body;

            if (!contenido) {
                return reply.status(400).send({ error: 'El contenido es requerido' });
            }

            const avance = await avanceService.entregarAvance(id, contenido, fechaEntregaReal);

            return reply.send({
                message: 'Avance entregado exitosamente',
                avance
            });
        } catch (error) {
            throw error;
        }
    });

    /**
     * PATCH /api/avances/:id/calificar
     * Calificar avance (Tutor/Director)
     */
    fastify.patch('/:id/calificar', {
        onRequest: [fastify.authenticate, fastify.requireRole(['tutor', 'director'])]
    }, async (request, reply) => {
        try {
            const id = parseInt(request.params.id);
            const validatedData = calificarAvanceSchema.parse(request.body);

            const avance = await avanceService.calificarAvance(
                id,
                validatedData.calificacion,
                validatedData.verificacionRevision
            );

            return reply.send({
                message: 'Avance calificado exitosamente',
                avance
            });
        } catch (error) {
            throw error;
        }
    });

    /**
     * GET /api/avances/propuesta/:propuestaId/atrasados
     * Verificar avances atrasados
     */
    fastify.get('/propuesta/:propuestaId/atrasados', {
        onRequest: [fastify.authenticate]
    }, async (request, reply) => {
        try {
            const propuestaId = parseInt(request.params.propuestaId);
            const avancesAtrasados = await avanceService.verificarAvancesAtrasados(propuestaId);

            return reply.send({
                count: avancesAtrasados.length,
                avances: avancesAtrasados
            });
        } catch (error) {
            throw error;
        }
    });

    /**
     * GET /api/avances/propuesta/:propuestaId/progreso
     * Calcular progreso general
     */
    fastify.get('/propuesta/:propuestaId/progreso', {
        onRequest: [fastify.authenticate]
    }, async (request, reply) => {
        try {
            const propuestaId = parseInt(request.params.propuestaId);
            const progreso = await avanceService.calcularProgreso(propuestaId);

            return reply.send(progreso);
        } catch (error) {
            throw error;
        }
    });
}
