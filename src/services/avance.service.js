import prisma from '../utils/prisma.js';
import { NotFoundError, ForbiddenError } from '../utils/errors.js';

/**
 * Servicio para gestión de avances semanales
 */
class AvanceService {
    /**
     * Crear avance semanal
     */
    async crearAvance(data) {
        const { propuestaId, semana, ...restoData } = data;

        // Verificar que la propuesta existe
        const propuesta = await prisma.propuesta.findUnique({
            where: { id: propuestaId }
        });

        if (!propuesta) {
            throw new NotFoundError('Propuesta no encontrada');
        }

        // Verificar que no existe ya un avance para esa semana
        const avanceExistente = await prisma.avance.findFirst({
            where: {
                propuestaId,
                semana
            }
        });

        if (avanceExistente) {
            throw new ForbiddenError(`Ya existe un avance para la semana ${semana}`);
        }

        return await prisma.avance.create({
            data: {
                propuestaId,
                semana,
                ...restoData,
                estado: 'pendiente'
            }
        });
    }

    /**
     * Obtener avance por ID
     */
    async obtenerAvance(id) {
        const avance = await prisma.avance.findUnique({
            where: { id },
            include: {
                propuesta: {
                    include: {
                        estudiante: {
                            include: {
                                usuario: {
                                    select: {
                                        nombres: true,
                                        apellidos: true
                                    }
                                }
                            }
                        }
                    }
                },
                tutor: {
                    include: {
                        usuario: {
                            select: {
                                nombres: true,
                                apellidos: true
                            }
                        }
                    }
                }
            }
        });

        if (!avance) {
            throw new NotFoundError('Avance no encontrado');
        }

        return avance;
    }

    /**
     * Listar avances de una propuesta
     */
    async listarAvances(propuestaId) {
        return await prisma.avance.findMany({
            where: { propuestaId },
            orderBy: {
                semana: 'asc'
            }
        });
    }

    /**
     * Actualizar avance (Estudiante entrega)
     */
    async entregarAvance(id, contenido, fechaEntregaReal) {
        const avance = await this.obtenerAvance(id);

        return await prisma.avance.update({
            where: { id },
            data: {
                contenido,
                fechaEntregaReal: fechaEntregaReal || new Date(),
                estado: 'entregado'
            }
        });
    }

    /**
     * Calificar avance (Tutor/Director)
     */
    async calificarAvance(id, calificacion, verificacionRevision = true) {
        const avance = await this.obtenerAvance(id);

        if (avance.estado !== 'entregado') {
            throw new ForbiddenError('El avance debe estar entregado para ser calificado');
        }

        return await prisma.avance.update({
            where: { id },
            data: {
                calificacion,
                verificacionRevision,
                estado: 'revisado'
            }
        });
    }

    /**
     * Verificar avances con atraso
     */
    async verificarAvancesAtrasados(propuestaId) {
        const ahora = new Date();

        const avancesAtrasados = await prisma.avance.findMany({
            where: {
                propuestaId,
                fechaEntrega: {
                    lt: ahora
                },
                estado: 'pendiente'
            }
        });

        return avancesAtrasados;
    }

    /**
     * Calcular progreso general de la propuesta
     */
    async calcularProgreso(propuestaId) {
        const avances = await prisma.avance.findMany({
            where: { propuestaId }
        });

        if (avances.length === 0) {
            return { progreso: 0, avancesEntregados: 0, totalAvances: 0 };
        }

        const avancesEntregados = avances.filter(
            a => a.estado === 'entregado' || a.estado === 'revisado'
        ).length;

        const progreso = (avancesEntregados / avances.length) * 100;

        return {
            progreso: Math.round(progreso),
            avancesEntregados,
            totalAvances: avances.length
        };
    }
}

export default new AvanceService();
