import { Response } from "express";
import { DocumentModel } from "../models/Document";
import { AuditLog } from "../models/AuditLog";
import { AppError } from "../utils/AppError";
import { asyncHandler } from "../middleware/errorHandler";
import { mimeToDocType } from "../middleware/upload";
import { AuthenticatedRequest } from "../types";
import { logger } from "../utils/logger";
import { isDbConnected } from "../config/database";

export const uploadDocument = asyncHandler(async (req: AuthenticatedRequest, res: Response) => {
  if (!req.file) {
    throw new AppError("No file uploaded. Attach a file under field name 'file'.", 400);
  }

  const type = mimeToDocType(req.file.mimetype);
  if (!type) {
    throw new AppError(`Unsupported file type: ${req.file.mimetype}`, 400);
  }

  if (!isDbConnected()) {
    const mockId = `demo-doc-${Date.now()}`;
    logger.info("Document uploaded (demo mode)", { documentId: mockId, type });
    res.status(201).json({
      success: true,
      isDemo: true,
      documentId: mockId,
      fileName: req.file.originalname,
      type,
    });
    return;
  }

  const doc = await DocumentModel.create({
    fileName: req.file.filename,
    originalName: req.file.originalname,
    filePath: req.file.path,
    mimeType: req.file.mimetype,
    type,
    sizeBytes: req.file.size,
    status: "uploaded",
    uploadedBy: req.user?.userId,
  });

  await AuditLog.create({
    action: "document.upload",
    userId: req.user?.userId,
    documentId: doc.id,
    meta: { originalName: doc.originalName, sizeBytes: doc.sizeBytes, type: doc.type },
  });

  logger.info("Document uploaded", { documentId: doc.id, type: doc.type });

  res.status(201).json({
    success: true,
    documentId: doc.id,
    fileName: doc.originalName,
    type: doc.type,
  });
});
