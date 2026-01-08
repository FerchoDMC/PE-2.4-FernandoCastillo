import { z } from 'zod';

// Schema para registro de usuario
export const registroUsuarioSchema = z.object({
  nombres: z.string().min(2, 'Nombres debe tener al menos 2 caracteres').max(100),
  apellidos: z.string().min(2, 'Apellidos debe tener al menos 2 caracteres').max(100),
  correoInstitucional: z.string().email('Correo inválido').max(100),
  clave: z.string().min(6, 'La clave debe tener al menos 6 caracteres').max(100),
  roles: z.array(z.string()).min(1, 'Debe asignar al menos un rol')
});

// Schema para login
export const loginSchema = z.object({
  correoInstitucional: z.string().email('Correo inválido'),
  clave: z.string().min(1, 'La clave es requerida')
});

// Schema para actualización de usuario
export const actualizarUsuarioSchema = z.object({
  nombres: z.string().min(2).max(100).optional(),
  apellidos: z.string().min(2).max(100).optional(),
  correoInstitucional: z.string().email().max(100).optional(),
  clave: z.string().min(6).max(100).optional()
});

// Tipos disponibles vía schemas para validación
// Para TypeScript: use z.infer<typeof registroUsuarioSchema>
