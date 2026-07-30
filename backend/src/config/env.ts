import "dotenv/config";

function requireEnv(name: string): string {
  const value = process.env[name];
  if (!value) {
    throw new Error(`Missing required environment variable: ${name}`);
  }
  return value;
}

export const env = {
  nodeEnv: process.env.NODE_ENV ?? "development",
  port: Number(process.env.PORT ?? 4000),
  databaseUrl: requireEnv("DATABASE_URL"),
  /** PEM CA certificate for validating the database's TLS certificate (e.g. Aiven's
   * per-service CA). Omitted for local MySQL, which doesn't require TLS. */
  databaseCaCert: process.env.DATABASE_CA_CERT,
  frontendUrl: process.env.FRONTEND_URL ?? "http://localhost:5173",
  jwtSecret: requireEnv("JWT_SECRET"),
  adminUsername: requireEnv("ADMIN_USERNAME"),
  adminPasswordHash: requireEnv("ADMIN_PASSWORD_HASH"),
};
