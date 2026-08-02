import mongoose from "mongoose";
import { env } from "./env";
import { logger } from "../utils/logger";

function redactCredentials(uri: string): string {
  return uri.replace(/\/\/([^:/@]+):([^@/]+)@/, "//$1:***@");
}

export async function connectDatabase(): Promise<void> {
  mongoose.set("strictQuery", true);

  try {
    await mongoose.connect(env.mongodbUri);
    logger.info(`MongoDB connected: ${redactCredentials(env.mongodbUri)}`);
  } catch (error) {
    logger.error("MongoDB connection failed", { error: (error as Error).message });
    throw error;
  }

  mongoose.connection.on("error", (error) => {
    logger.error("MongoDB runtime error", { error: error.message });
  });

  mongoose.connection.on("disconnected", () => {
    logger.warn("MongoDB disconnected");
  });
}
