import prisma from '../utils/prisma.js';
import { NotFoundError, ForbiddenError } from '../utils/errors.js';

/**
 * Servicio para gestión de propuestas
 */
class PropuestaService {
    /**
     * Crear propuesta (Estudiante registra 3 ideas)
     */
    async crearPropuesta(data) {
        const { estudianteId, tipo, numeroIdea, ...restoData } = data;

        // Verificar que el estudiante existe
        const estudiante = await prisma.estudiante.findUnique({
            where: { id: estudianteId }
        });

        if (!estudiante) {
            throw new NotFoundError('Estudiante no encontrado');
        }

        // Si es una idea, verificar que no tenga más de 3
        if (tipo === 'idea') {
            const ideasExistentes = await prisma.propuesta.count({
                where: {
                    estudianteId,
                    tipo: 'idea'
                }
            });

            if (ideasExistentes >= 3) {
                throw new ForbiddenError('Ya has registrado 3 ideas de propuesta');
            }
        }

        return await prisma.propuesta.create({
            data: {
                estudianteId,
                tipo,
                numeroIdea,
                ...restoData
            }
        });
    }

    /**
     * Obtener propuesta por ID
     */
    async obtenerPropuesta(id) {
        const propuesta = await prisma.propuesta.findUnique({
            where: { id },
            include: {
                estudiante: {
                    include: {
                        usuario: {
                            select: {
                                nombres: true,
                                apellidos: true,
                                correoInstitucional: true
                            }
                        }
                    }
                },
                observaciones: {
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

        if (!propuesta) {
            throw new NotFoundError('Propuesta no encontrada');
        }

        return propuesta;
    }

    /**
     * Listar propuestas de un estudiante
     */
    async listarPropuestasEstudiante(estudianteId) {
        return await prisma.propuesta.findMany({
            where: { estudianteId },
            include: {
                observaciones: true
            },
            orderBy: {
                fechaCreacion: 'desc'
            }
        });
    }

    /**
     * Aprobar o rechazar propuesta (Director)
     */
    async cambiarEstadoPropuesta(id, estado) {
        const propuesta = await prisma.propuesta.findUnique({
            where: { id }
        });

        if (!propuesta) {
            throw new NotFoundError('Propuesta no encontrada');
        }

        return await prisma.propuesta.update({
            where: { id },
            data: { estado }
        });
    }

    /**
     * Listar todas las propuestas (Director/Comité)
     */
    async listarTodasPropuestas(filtros = {}) {
        return await prisma.propuesta.findMany({
            where: filtros,
            include: {
                estudiante: {
                    include: {
                        usuario: {
                            select: {
                                nombres: true,
                                apellidos: true,
                                correoInstitucional: true
                            }
                        }
                    }
                },
                observaciones: true
            },
            orderBy: {
                fechaCreacion: 'desc'
            }
        });
    }
}

/**
 * Servicio para gestión de observaciones (Feedback múltiple del comité)
 */
class ObservacionService {
    /**
     * Crear observación (Miembro del comité)
     */
    async crearObservacion(propuestaId, usuarioId, comentario) {
        // Verificar que la propuesta existe
        const propuesta = await prisma.propuesta.findUnique({
            where: { id: propuestaId }
        });

        if (!propuesta) {
            throw new NotFoundError('Propuesta no encontrada');
        }

        return await prisma.observacion.create({
            data: {
                propuestaId,
                usuarioId,
                comentario
            },
            include: {
                usuario: {
                    select: {
                        nombres: true,
                        apellidos: true
                    }
                }
            }
        });
    }

    /**
     * Obtener todas las observaciones de una propuesta
     */
    async obtenerObservaciones(propuestaId) {
        return await prisma.observacion.findMany({
            where: { propuestaId },
            include: {
                usuario: {
                    select: {
                        nombres: true,
                        apellidos: true
                    }
                }
            },
            orderBy: {
                fechaCreacion: 'asc'
            }
        });
    }

    /**
     * Eliminar observación
     */
    async eliminarObservacion(id, usuarioId) {
        const observacion = await prisma.observacion.findUnique({
            where: { id }
        });

        if (!observacion) {
            throw new NotFoundError('Observación no encontrada');
        }

        // Solo el autor puede eliminar su observación
        if (observacion.usuarioId !== usuarioId) {
            throw new ForbiddenError('No puedes eliminar observaciones de otros usuarios');
        }

        return await prisma.observacion.delete({
            where: { id }
        });
    }
}

export const propuestaService = new PropuestaService();
export const observacionService = new ObservacionService();
