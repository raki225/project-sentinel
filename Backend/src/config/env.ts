import dotenv from "dotenv";
import path from "path";

dotenv.config({ path: path.resolve(__dirname, "../../.env") });

function required(name: string, fallback?: string): string {
  const value = process.env[name] ?? fallback;
  if (value === undefined) {
    throw new Error(`Missing required environment variable: ${name}`);
  }
  return value;
}

export const env = {
  nodeEnv: process.env.NODE_ENV ?? "development",
  port: Number(process.env.PORT ?? 5000),

  mongodbUri: required("MONGODB_URI", "mongodb://127.0.0.1:27017/project_sentinel"),

  jwtSecret: required("JWT_SECRET"),
  jwtExpiresIn: process.env.JWT_EXPIRES_IN ?? "7d",

  ai: {
    apiKey: process.env.AI_API_KEY ?? "",
    apiUrl: process.env.AI_API_URL ?? "",
    model: process.env.AI_MODEL ?? "",
  },

  googleMapsApiKey: process.env.GOOGLE_MAPS_API_KEY ?? "",

  corsOrigin: process.env.CORS_ORIGIN ?? "http://localhost:3000",

  uploadDir: path.resolve(__dirname, "../../", process.env.UPLOAD_DIR ?? "uploads"),
  reportsDir: path.resolve(__dirname, "../../reports"),
  maxFileSizeMb: Number(process.env.MAX_FILE_SIZE_MB ?? 25),

  rateLimit: {
    windowMs: Number(process.env.RATE_LIMIT_WINDOW_MS ?? 900000),
    max: Number(process.env.RATE_LIMIT_MAX ?? 100),
  },
};

export function isAiConfigured(): boolean {
  return Boolean(env.ai.apiKey && env.ai.apiUrl && env.ai.model);
}

export function isGeocodingConfigured(): boolean {
  return Boolean(env.googleMapsApiKey);
}
