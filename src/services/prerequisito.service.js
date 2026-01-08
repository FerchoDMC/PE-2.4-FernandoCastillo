import prisma from '../utils/prisma.js';
import { NotFoundError, ForbiddenError } from '../utils/errors.js';

/**
 * Servicio para gestión de prerrequisitos (Semáforo de validación)
 */
class PrerrequisitoService {
    /**
     * Marcar prerrequisito como completado (Estudiante)
     */
    async marcarCompletado(estudianteId, prerequisitoId) {
        // Verificar que el estudiante existe
        const estudiante = await prisma.estudiante.findUnique({
            where: { id: estudianteId }
        });

        if (!estudiante) {
            throw new NotFoundError('Estudiante no encontrado');
        }

        // Verificar que el prerequisito existe
        const prerequisito = await prisma.prerequisito.findUnique({
            where: { id: prerequisitoId }
        });

        if (!prerequisito) {
            throw new NotFoundError('Prerequisito no encontrado');
        }

        // Actualizar o crear la relación
        const estudiantePrerequisito = await prisma.estudiantePrerequisito.upsert({
            where: {
                estudianteId_prerequisitoId: {
                    estudianteId,
                    prerequisitoId
                }
            },
            update: {
                estadoValidacion: 'completado',
                fechaMarcado: new Date()
            },
            create: {
                estudianteId,
                prerequisitoId,
                estadoValidacion: 'completado',
                fechaMarcado: new Date()
            }
        });

        return estudiantePrerequisito;
    }

    /**
     * Validar prerrequisito (Director)
     */
    async validarPrerequisito(estudianteId, prerequisitoId) {
        const estudiantePrerequisito = await prisma.estudiantePrerequisito.findUnique({
            where: {
                estudianteId_prerequisitoId: {
                    estudianteId,
                    prerequisitoId
                }
            }
        });

        if (!estudiantePrerequisito) {
            throw new NotFoundError('El estudiante no ha marcado este prerequisito');
        }

        if (estudiantePrerequisito.estadoValidacion !== 'completado') {
            throw new ForbiddenError('El prerequisito debe estar marcado como completado');
        }

        // Actualizar a validado (Semáforo en verde)
        const prerequisitoValidado = await prisma.estudiantePrerequisito.update({
            where: {
                estudianteId_prerequisitoId: {
                    estudianteId,
                    prerequisitoId
                }
            },
            data: {
                estadoValidacion: 'validado',
                fechaValidacion: new Date()
            }
        });

        return prerequisitoValidado;
    }

    /**
     * Obtener estado de prerrequisitos de un estudiante (Semáforo)
     */
    async obtenerEstadoPrerequisitos(estudianteId) {
        const prerequisitos = await prisma.estudiantePrerequisito.findMany({
            where: { estudianteId },
            include: {
                prerequisito: true
            }
        });

        // Verificar si todos están validados (Semáforo en verde)
        const todosValidados = prerequisitos.every(
            p => p.estadoValidacion === 'validado'
        );

        return {
            prerequisitos,
            semaforoVerde: todosValidados,
            puedeIniciarTitulacion: todosValidados
        };
    }

    /**
     * Listar todos los prerrequisitos disponibles
     */
    async listarPrerequisitos() {
        return await prisma.prerequisito.findMany();
    }

    /**
     * Crear prerequisito (Admin)
     */
    async crearPrerequisito(nombre, descripcion) {
        return await prisma.prerequisito.create({
            data: { nombre, descripcion }
        });
    }
}

export default new PrerrequisitoService();
