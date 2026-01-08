// Clases de error personalizadas
export class AppError extends Error {
    constructor(message, statusCode = 500) {
        super(message);
        this.statusCode = statusCode;
        this.name = this.constructor.name;
        Error.captureStackTrace(this, this.constructor);
    }
}

export class NotFoundError extends AppError {
    constructor(message = 'Recurso no encontrado') {
        super(message, 404);
    }
}

export class ValidationError extends AppError {
    constructor(message = 'Error de validación', errors = []) {
        super(message, 400);
        this.errors = errors;
    }
}

export class UnauthorizedError extends AppError {
    constructor(message = 'No autorizado') {
        super(message, 401);
    }
}

export class ForbiddenError extends AppError {
    constructor(message = 'Acceso prohibido') {
        super(message, 403);
    }
}

// Handler de errores para Fastify
export const errorHandler = (error, request, reply) => {
    // Log del error
    request.log.error(error);

    // Si es un error de Zod
    if (error.name === 'ZodError') {
        return reply.status(400).send({
            error: 'Error de validación',
            details: error.errors.map(e => ({
                path: e.path.join('.'),
                message: e.message
            }))
        });
    }

    // Si es un error personalizado de la app
    if (error instanceof AppError) {
        return reply.status(error.statusCode).send({
            error: error.message,
            ...(error.errors && { details: error.errors })
        });
    }

    // Error genérico
    const statusCode = error.statusCode || 500;
    const message = statusCode === 500
        ? 'Error interno del servidor'
        : error.message;

    reply.status(statusCode).send({
        error: message
    });
};
