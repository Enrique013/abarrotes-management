import { PrismaClient } from "@prisma/client";
import { PrismaPg } from '@prisma/adapter-pg';
import pg from 'pg';

// Singleton pattern con configuraciones optimizadas
const globalForPrisma = globalThis as unknown as {
    prisma: PrismaClient | undefined;
};

// Crear pool de conexiones de PostgreSQL
const pool = new pg.Pool({
    connectionString: process.env.DATABASE_URL,
});

// Crear adapter de Prisma para PostgreSQL
const adapter = new PrismaPg(pool);

export const prisma = globalForPrisma.prisma ?? new PrismaClient({
    adapter,
    log: process.env.NODE_ENV === 'development' ? ['query', 'error', 'warn'] : ['error']
});

// Prevenir múltiples instancias en desarrollo
if (process.env.NODE_ENV !== 'production') {
    globalForPrisma.prisma = prisma;
}

// Graceful shutdown
process.on('beforeExit', async () => {
    await prisma.$disconnect();
    await pool.end();
});