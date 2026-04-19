import { PrismaClient } from '@prisma/client'
import { PrismaPg } from '@prisma/adapter-pg'
import { Pool } from 'pg'

const connectionString = "postgresql://postgres.yeybokhxwsqpckjgnrkg:cK9r%2E6bh6%2BrxeUZ@aws-1-ap-south-1.pooler.supabase.com:6543/postgres?pgbouncer=true"

const pool = new Pool({ connectionString })
const adapter = new PrismaPg(pool)

const globalForPrisma = global as unknown as { prisma: PrismaClient }

export const prisma =
  globalForPrisma.prisma ||
  new PrismaClient({ adapter }) // هنا بنمرر الـ Adapter بدل الرابط المباشر

if (process.env.NODE_ENV !== 'production') globalForPrisma.prisma = prisma