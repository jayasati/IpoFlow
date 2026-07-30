import { PrismaMariaDb } from "@prisma/adapter-mariadb";
import { PrismaClient } from "../generated/prisma/client";
import { env } from "./env";

function buildAdapterConfig(): ConstructorParameters<typeof PrismaMariaDb>[0] {
  if (!env.databaseCaCert) {
    return env.databaseUrl;
  }

  const url = new URL(env.databaseUrl);
  return {
    host: url.hostname,
    port: Number(url.port),
    user: decodeURIComponent(url.username),
    password: decodeURIComponent(url.password),
    database: url.pathname.replace(/^\//, ""),
    ssl: { ca: env.databaseCaCert, rejectUnauthorized: true },
  };
}

const adapter = new PrismaMariaDb(buildAdapterConfig());

export const prisma = new PrismaClient({ adapter });
