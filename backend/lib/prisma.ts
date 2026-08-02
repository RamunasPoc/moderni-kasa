import { PrismaClient } from '@prisma/client';
import { PrismaPg } from '@prisma/adapter-pg';
import pg from 'pg';

const connectionString = process.env.DATABASE_URL;

const globalForPrisma = global as unknown as { prisma: PrismaClient };

// Funkcija, kuri sukuria pool'ą ir klientą tik tada, kai to tikrai reikia
const createPrismaClient = () => {
  const pool = new pg.Pool({ 
    connectionString,
    ssl: { rejectUnauthorized: false } // Leidžia saugiai jungtis prie Neon
  });
  
  const adapter = new PrismaPg(pool);
  
  return new PrismaClient({ adapter });
};

// Paimame iš globalaus objekto (jei yra) arba sukuriame naują
export const prisma = globalForPrisma.prisma ?? createPrismaClient();

// Išsaugome globaliame objekte (kad išvengtume connection leaks Next.js Dev aplinkoje)
if (process.env.NODE_ENV !== 'production') {
  globalForPrisma.prisma = prisma;
}