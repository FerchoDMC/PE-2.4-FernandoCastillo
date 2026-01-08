import bcrypt from 'bcrypt';
import prisma from '../utils/prisma.js';
import { UnauthorizedError, NotFoundError } from '../utils/errors.js';

const SALT_ROUNDS = 10;

/**
 * Servicio de autenticación
 */
class AuthService {
    /**
     * Registrar nuevo usuario
     */
    async registrarUsuario(data) {
        const { nombres, apellidos, correoInstitucional, clave, roles } = data;

        // Verificar si el usuario ya existe
        const usuarioExistente = await prisma.usuario.findUnique({
            where: { correoInstitucional }
        });

        if (usuarioExistente) {
            throw new Error('El correo institucional ya está registrado');
        }

        // Encriptar contraseña
        const claveEncriptada = await bcrypt.hash(clave, SALT_ROUNDS);

        // Crear usuario con roles
        const usuario = await prisma.usuario.create({
            data: {
                nombres,
                apellidos,
                correoInstitucional,
                clave: claveEncriptada,
                roles: {
                    create: await Promise.all(
                        roles.map(async (nombreRol) => {
                            const rol = await prisma.rol.findUnique({
                                where: { nombre: nombreRol }
                            });
                            if (!rol) {
                                throw new NotFoundError(`Rol "${nombreRol}" no encontrado`);
                            }
                            return { rolId: rol.id };
                        })
                    )
                }
            },
            include: {
                roles: {
                    include: {
                        rol: true
                    }
                }
            }
        });

        // Si el rol es estudiante, crear entrada en tabla estudiantes
        if (roles.includes('estudiante')) {
            await prisma.estudiante.create({
                data: {
                    usuarioId: usuario.id,
                    semestre: 7
                }
            });
        }

        // Si el rol es tutor, crear entrada en tabla tutores
        if (roles.includes('tutor')) {
            await prisma.tutor.create({
                data: {
                    usuarioId: usuario.id
                }
            });
        }

        // Si el rol es director, crear entrada en tabla directores
        if (roles.includes('director')) {
            await prisma.director.create({
                data: {
                    usuarioId: usuario.id
                }
            });
        }

        // Si el rol es coordinador, crear entrada en tabla coordinadores
        if (roles.includes('coordinador')) {
            await prisma.coordinador.create({
                data: {
                    usuarioId: usuario.id
                }
            });
        }

        // Retornar usuario sin la clave
        const { clave: _, ...usuarioSinClave } = usuario;
        return usuarioSinClave;
    }

    /**
     * Autenticar usuario
     */
    async autenticar(correoInstitucional, clave) {
        // Buscar usuario
        const usuario = await prisma.usuario.findUnique({
            where: { correoInstitucional },
            include: {
                roles: {
                    include: {
                        rol: true
                    }
                }
            }
        });

        if (!usuario) {
            throw new UnauthorizedError('Credenciales inválidas');
        }

        // Verificar contraseña
        const claveValida = await bcrypt.compare(clave, usuario.clave);

        if (!claveValida) {
            throw new UnauthorizedError('Credenciales inválidas');
        }

        // Retornar usuario sin la clave
        const { clave: _, ...usuarioSinClave } = usuario;
        return usuarioSinClave;
    }

    /**
     * Obtener usuario por ID
     */
    async obtenerUsuarioPorId(id) {
        const usuario = await prisma.usuario.findUnique({
            where: { id },
            include: {
                roles: {
                    include: {
                        rol: true
                    }
                }
            }
        });

        if (!usuario) {
            throw new NotFoundError('Usuario no encontrado');
        }

        const { clave: _, ...usuarioSinClave } = usuario;
        return usuarioSinClave;
    }
}

export default new AuthService();
