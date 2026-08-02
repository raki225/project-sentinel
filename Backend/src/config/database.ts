import mongoose from "mongoose";
import { env } from "./env";
import { logger } from "../utils/logger";

function redactCredentials(uri: string): string {
  return uri.replace(/\/\/([^:/@]+):([^@/]+)@/, "//$1:***@");
}

export function isDbConnected(): boolean {
  return mongoose.connection.readyState === 1;
}

export async function connectDatabase(): Promise<void> {
  mongoose.set("strictQuery", true);
  mongoose.set("bufferCommands", false);

  try {
    await mongoose.connect(env.mongodbUri, { serverSelectionTimeoutMS: 3000 });
    logger.info(`MongoDB connected: ${redactCredentials(env.mongodbUri)}`);
  } catch (error) {
    logger.error("MongoDB connection failed", { error: (error as Error).message });
    
    // If SRV / Atlas DNS lookup failed or ECONNREFUSED, attempt local MongoDB fallback
    const fallbackUri = "mongodb://127.0.0.1:27017/project_sentinel";
    if (env.mongodbUri !== fallbackUri) {
      try {
        logger.warn(`Attempting fallback local MongoDB connection: ${fallbackUri}`);
        await mongoose.connect(fallbackUri, { serverSelectionTimeoutMS: 3000 });
        logger.info(`MongoDB connected via fallback: ${fallbackUri}`);
        return;
      } catch {
        logger.warn("Local MongoDB fallback unavailable. Operating with in-memory / mock data fallback.");
      }
    }
  }

  mongoose.connection.on("error", (error) => {
    logger.error("MongoDB runtime error", { error: error.message });
  });

  mongoose.connection.on("disconnected", () => {
    logger.warn("MongoDB disconnected");
  });
}
