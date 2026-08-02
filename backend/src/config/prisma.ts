import { PrismaMariaDb } from "@prisma/adapter-mariadb";
import { PrismaClient } from "../generated/prisma/client";
import { env } from "./env";

function buildAdapterConfig(): ConstructorParameters<typeof PrismaMariaDb>[0] {
  const url = new URL(env.databaseUrl);
  const isLocalHost = url.hostname === "localhost" || url.hostname === "127.0.0.1";
  if (isLocalHost && !env.databaseCaCert) {
    return env.databaseUrl;
  }

  return {
    host: url.hostname,
    port: Number(url.port),
    user: decodeURIComponent(url.username),
    password: decodeURIComponent(url.password),
    database: url.pathname.replace(/^\//, ""),
    /** DATABASE_CA_CERT is only needed for providers (e.g. Aiven) that sign with
     * their own CA. Providers with a publicly-trusted cert (e.g. TiDB Cloud) just
     * need TLS turned on -- Node's default trust store handles verification. */
    ssl: env.databaseCaCert ? { ca: env.databaseCaCert, rejectUnauthorized: true } : { rejectUnauthorized: true },
    /** The driver's 1s default is too tight for a cross-region TLS handshake
     * (e.g. Render US/EU -> a managed DB in another region), where it can fail
     * every attempt before the pool's own acquire timeout gives up. */
    connectTimeout: 20000,
  };
}

const adapter = new PrismaMariaDb(buildAdapterConfig());

export const prisma = new PrismaClient({ adapter });
