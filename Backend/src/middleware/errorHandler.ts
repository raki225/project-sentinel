import { NextFunction, Request, Response } from "express";
import { AppError } from "../utils/AppError";
import { logger } from "../utils/logger";
import { ApiError } from "../types";

export function notFoundHandler(req: Request, res: Response): void {
  res.status(404).json({ success: false, message: `Route not found: ${req.originalUrl}` } satisfies ApiError);
}

export function errorHandler(
  err: unknown,
  req: Request,
  res: Response,
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  next: NextFunction
): void {
  const isAppError = err instanceof AppError;
  const statusCode = isAppError ? err.statusCode : 500;
  const message = err instanceof Error ? err.message : "Internal server error";

  if (statusCode >= 500) {
    logger.error(message, { path: req.originalUrl, method: req.method, stack: (err as Error).stack });
  } else {
    logger.warn(message, { path: req.originalUrl, method: req.method });
  }

  res.status(statusCode).json({
    success: false,
    message: isAppError || statusCode < 500 ? message : "Internal server error",
  } satisfies ApiError);
}

export function asyncHandler<T extends (req: Request, res: Response, next: NextFunction) => Promise<unknown>>(
  fn: T
) {
  return (req: Request, res: Response, next: NextFunction): void => {
    fn(req, res, next).catch(next);
  };
}
