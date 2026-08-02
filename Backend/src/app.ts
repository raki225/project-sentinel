import express, { Application } from "express";
import cors, { CorsOptions } from "cors";
import helmet from "helmet";
import swaggerUi from "swagger-ui-express";
import { env } from "./config/env";
import routes from "./routes";
import { errorHandler, notFoundHandler } from "./middleware/errorHandler";
import { apiRateLimiter } from "./middleware/rateLimiter";
import { swaggerSpec } from "./config/swagger";

// Any localhost port (dev) and any *.vercel.app deployment (previews + production)
// are always allowed; CORS_ORIGIN (comma-separated) adds explicit extras, e.g. a custom domain.
const LOCALHOST_ORIGIN = /^http:\/\/localhost:\d+$/;
const VERCEL_ORIGIN = /^https:\/\/([a-z0-9-]+\.)*vercel\.app$/;

function isOriginAllowed(origin: string): boolean {
  return LOCALHOST_ORIGIN.test(origin) || VERCEL_ORIGIN.test(origin) || env.corsOrigins.includes(origin);
}

const corsOptions: CorsOptions = {
  origin(origin, callback) {
    // No Origin header (curl, server-to-server, same-origin) — allow.
    if (!origin || isOriginAllowed(origin)) {
      callback(null, true);
    } else {
      callback(new Error(`Not allowed by CORS: ${origin}`));
    }
  },
  credentials: true,
  methods: ["GET", "POST", "PUT", "PATCH", "DELETE", "OPTIONS"],
  allowedHeaders: ["Content-Type", "Authorization"],
};

export function createApp(): Application {
  const app = express();

  app.use(helmet());
  app.use(cors(corsOptions));
  app.options("*", cors(corsOptions));
  app.use(express.json({ limit: "10mb" }));
  app.use(express.urlencoded({ extended: true }));
  app.use(apiRateLimiter);

  app.get("/health", (_req, res) => {
    res.status(200).json({ success: true, message: "Project Sentinel API is running" });
  });

  app.use("/api-docs", swaggerUi.serve, swaggerUi.setup(swaggerSpec));

  app.use("/api", routes);

  app.use(notFoundHandler);
  app.use(errorHandler);

  return app;
}
