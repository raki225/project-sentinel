import swaggerJsdoc from "swagger-jsdoc";
import path from "path";
import { env } from "./env";

const options: swaggerJsdoc.Options = {
  definition: {
    openapi: "3.0.0",
    info: {
      title: "Project Sentinel API",
      version: "1.0.0",
      description:
        "AI-powered Infrastructure Oversight & Decision Intelligence Platform - Backend API",
    },
    servers: [{ url: `http://localhost:${env.port}`, description: "Local" }],
    components: {
      securitySchemes: {
        bearerAuth: {
          type: "http",
          scheme: "bearer",
          bearerFormat: "JWT",
        },
      },
    },
  },
  apis: [path.resolve(__dirname, "../routes/*.ts"), path.resolve(__dirname, "../routes/*.js")],
};

export const swaggerSpec = swaggerJsdoc(options);
