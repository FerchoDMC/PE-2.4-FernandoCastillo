import { z } from 'zod';

// Schema para crear propuesta (ideas iniciales)
export const crearPropuestaSchema = z.object({
    estudianteId: z.number().int().positive(),
    tipo: z.enum(['idea', 'anteproyecto']).default('idea'),
    numeroIdea: z.number().int().min(1).max(3).optional(),
    tema: z.string().min(10, 'El tema debe tener al menos 10 caracteres').max(255),
    objetivos: z.string().min(20, 'Los objetivos deben ser más descriptivos'),
    problematica: z.string().min(20, 'La problemática debe ser más descriptiva'),
    areaInvestigacion: z.string().max(100).optional(),
    alcance: z.string().min(20, 'El alcance debe ser más descriptivo'),
    archivo: z.string().max(255).optional(),
    fechaLimite: z.string().datetime().optional()
});

// Schema para actualizar propuesta
export const actualizarPropuestaSchema = z.object({
    tema: z.string().min(10).max(255).optional(),
    objetivos: z.string().min(20).optional(),
    problematica: z.string().min(20).optional(),
    areaInvestigacion: z.string().max(100).optional(),
    alcance: z.string().min(20).optional(),
    archivo: z.string().max(255).optional(),
    estado: z.enum(['pendiente', 'aprobada', 'rechazada']).optional()
});

// Schema para aprobar/rechazar propuesta
export const aprobarPropuestaSchema = z.object({
    estado: z.enum(['aprobada', 'rechazada']),
    comentario: z.string().optional()
});

// Schema para crear observación
export const crearObservacionSchema = z.object({
    propuestaId: z.number().int().positive(),
    usuarioId: z.number().int().positive(),
    comentario: z.string().min(10, 'El comentario debe tener al menos 10 caracteres')
});

// Tipos disponibles vía schemas para validación
// Para TypeScript: use z.infer<typeof crearPropuestaSchema>
