import { z } from 'zod';

// Schema para crear avance
export const crearAvanceSchema = z.object({
    propuestaId: z.number().int().positive(),
    tutorId: z.number().int().positive().optional(),
    directorId: z.number().int().positive().optional(),
    coordinadorId: z.number().int().positive().optional(),
    semana: z.number().int().min(1).max(16, 'La semana debe estar entre 1 y 16'),
    contenido: z.string().min(20, 'El contenido debe ser más descriptivo'),
    porcentajeAvance: z.number().min(0).max(100).optional(),
    fechaInicio: z.string().datetime(),
    fechaEntrega: z.string().datetime(),
    fechaEntregaReal: z.string().datetime().optional()
});

// Schema para actualizar avance
export const actualizarAvanceSchema = z.object({
    contenido: z.string().min(20).optional(),
    porcentajeAvance: z.number().min(0).max(100).optional(),
    fechaEntregaReal: z.string().datetime().optional(),
    estado: z.enum(['pendiente', 'entregado', 'revisado']).optional(),
    calificacion: z.number().min(0).max(100).optional(),
    verificacionRevision: z.boolean().optional()
});

// Schema para calificar avance
export const calificarAvanceSchema = z.object({
    calificacion: z.number().min(0).max(100),
    verificacionRevision: z.boolean().default(true)
});

// Tipos disponibles vía schemas para validación
// Para TypeScript: use z.infer<typeof crearAvanceSchema>
