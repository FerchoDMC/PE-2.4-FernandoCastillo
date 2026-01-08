import buildApp from './app.js';
import prisma from './utils/prisma.js';

const PORT = process.env.PORT || 3000;
const HOST = process.env.HOST || '0.0.0.0';

/**
 * Iniciar servidor
 */
async function start() {
    let app;

    try {
        // Construir aplicación
        app = await buildApp();

        // Iniciar servidor
        await app.listen({ port: PORT, host: HOST });

        console.log(`✅ Servidor corriendo en http://${HOST}:${PORT}`);
        console.log(`📊  Health check: http://${HOST}:${PORT}/health`);
        console.log(`🔐 Entorno: ${process.env.NODE_ENV || 'development'}`);

    } catch (error) {
        console.error('❌ Error al iniciar servidor:', error);
        process.exit(1);
    }
}

/**
 * Manejo de señales de cierre graceful
 */
async function gracefulShutdown(signal) {
    console.log(`\n⚠️  Señal ${signal} recibida. Cerrando servidor...`);

    try {
        // Desconectar Prisma
        await prisma.$disconnect();
        console.log('✅ Prisma desconectado');

        process.exit(0);
    } catch (error) {
        console.error('❌ Error durante el cierre:', error);
        process.exit(1);
    }
}

// Escuchar señales de terminación
process.on('SIGTERM', () => gracefulShutdown('SIGTERM'));
process.on('SIGINT', () => gracefulShutdown('SIGINT'));

// Iniciar aplicación
start();
