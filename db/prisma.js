import "dotenv/config";
import { PrismaPg } from "@prisma/adapter-pg";
import { PrismaClient } from '../generated/prisma/client.js';

const connectionString = `${process.env.PROD_DB_INTERNAL_URL ?? process.env.USE_PROD_DB === "True" ? process.env.PROD_DB_URL : env("DATABASE_URL")}`;

const adapter = new PrismaPg({ connectionString });
const prisma = new PrismaClient({ adapter });

export { prisma };