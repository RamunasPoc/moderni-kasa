import { PrismaClient } from '@prisma/client';
import { PrismaPg } from '@prisma/adapter-pg';
import pg from 'pg';

const connectionString = process.env.DATABASE_URL;

// Neon bazei reikalingas SSL nustatymas
const pool = new pg.Pool({ 
  connectionString,
  ssl: { rejectUnauthorized: false } // Leidžia saugiai jungtis prie Neon iš lokalios aplinkos
});

const adapter = new PrismaPg(pool);

const globalForPrisma = global as unknown as { prisma: PrismaClient };

export const prisma =
  globalForPrisma.prisma ||
  new PrismaClient({
    adapter,
  });

if (process.env.NODE_ENV !== 'production') globalForPrisma.prisma = prisma;