import "dotenv/config";

function required(name: string): string {
  const value = process.env[name];
  if (!value && process.env.NODE_ENV === "production") {
    throw new Error(`Missing required environment variable: ${name}`);
  }
  return value ?? "";
}

export const env = {
  appSecret: required("APP_SECRET"),
  databaseUrl: required("DATABASE_URL"),
  adminEmail: required("ADMIN_EMAIL"),
  adminPassword: required("ADMIN_PASSWORD"),
  isProduction: process.env.NODE_ENV === "production",
};
