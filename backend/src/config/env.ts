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
  frontendUrl: process.env.FRONTEND_URL ?? "http://localhost:5173",
  jwtSecret: requireEnv("JWT_SECRET"),
  adminUsername: requireEnv("ADMIN_USERNAME"),
  adminPasswordHash: requireEnv("ADMIN_PASSWORD_HASH"),
};
