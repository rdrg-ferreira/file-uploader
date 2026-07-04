require("dotenv/config");
const { PrismaPg } = require("@prisma/adapter-pg");
const { PrismaClient } = require('../generated/prisma/client.js');

const connectionString = process.env.PROD_DB_INTERNAL_URL
	?? (process.env.USE_PROD_DB === "True"
		? process.env.PROD_DB_URL
		: process.env.DATABASE_URL);

const adapter = new PrismaPg({ connectionString });
const prisma = new PrismaClient({ adapter });

module.exports = prisma;