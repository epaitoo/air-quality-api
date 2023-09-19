import * as dotenv from "dotenv";
import * as path from "path";
import { PrismaClient } from '@prisma/client';

const envTestPath = path.join(__dirname, "..", "..", ".env.test");
dotenv.config({ path: envTestPath });

const prismaTestClient = new PrismaClient();

export default prismaTestClient;

