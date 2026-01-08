import { z } from 'zod';

// Schema para marcar prerequisito
export const marcarPrerequisitoSchema = z.object({
    estudianteId: z.number().int().positive(),
    prerequisitoId: z.number().int().positive(),
    estadoValidacion: z.enum(['pendiente', 'completado', 'validado']).default('completado')
});

// Schema para validar prerequisito (Director)
export const validarPrerequisitoSchema = z.object({
    estudianteId: z.number().int().positive(),
    prerequisitoId: z.number().int().positive()
});

// Tipos disponibles vía schemas para validación
// Para TypeScript: use z.infer<typeof marcarPrerequisitoSchema>
