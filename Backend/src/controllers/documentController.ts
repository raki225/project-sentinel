import { Response } from "express";
import fs from "fs/promises";
import mongoose from "mongoose";
import { DocumentModel } from "../models/Document";
import { Report } from "../models/Report";
import { AuditLog } from "../models/AuditLog";
import { AppError } from "../utils/AppError";
import { asyncHandler } from "../middleware/errorHandler";
import { AuthenticatedRequest } from "../types";
import { logger } from "../utils/logger";
import { isDbConnected } from "../config/database";
import { MOCK_DEMO_DOCUMENTS } from "../utils/demoData";

export const listDocuments = asyncHandler(async (req: AuthenticatedRequest, res: Response) => {
  if (!isDbConnected()) {
    res.status(200).json({
      success: true,
      isDemo: true,
      documents: MOCK_DEMO_DOCUMENTS,
      pagination: {
        page: 1,
        limit: 20,
        total: MOCK_DEMO_DOCUMENTS.length,
        pages: 1,
      },
    });
    return;
  }

  const page = Math.max(1, Number(req.query.page) || 1);
  const limit = Math.min(100, Math.max(1, Number(req.query.limit) || 20));
  const status = typeof req.query.status === "string" ? req.query.status : undefined;
  const type = typeof req.query.type === "string" ? req.query.type : undefined;

  const filter: Record<string, unknown> = {};
  if (status) filter.status = status;
  if (type) filter.type = type;

  const [documents, total] = await Promise.all([
    DocumentModel.find(filter)
      .sort({ createdAt: -1 })
      .skip((page - 1) * limit)
      .limit(limit),
    DocumentModel.countDocuments(filter),
  ]);

  res.status(200).json({
    success: true,
    documents: documents.map((doc) => ({
      documentId: doc.id,
      fileName: doc.originalName,
      type: doc.type,
      status: doc.status,
      sizeBytes: doc.sizeBytes,
      errorMessage: doc.errorMessage,
      createdAt: doc.createdAt,
      updatedAt: doc.updatedAt,
    })),
    pagination: {
      page,
      limit,
      total,
      pages: Math.ceil(total / limit) || 1,
    },
  });
});

export const deleteDocument = asyncHandler(async (req: AuthenticatedRequest, res: Response) => {
  const { id } = req.params;

  if (!isDbConnected()) {
    res.status(200).json({ success: true, isDemo: true, documentId: id });
    return;
  }

  if (!mongoose.isValidObjectId(id)) {
    throw new AppError("Invalid document id", 400);
  }

  const doc = await DocumentModel.findById(id);
  if (!doc) {
    throw new AppError("Document not found", 404);
  }

  await Promise.all([Report.deleteOne({ documentId: doc.id }), fs.unlink(doc.filePath).catch(() => undefined)]);
  await doc.deleteOne();

  await AuditLog.create({
    action: "document.delete",
    userId: req.user?.userId,
    documentId: doc.id,
    meta: { originalName: doc.originalName },
  });

  logger.info("Document deleted", { documentId: doc.id });

  res.status(200).json({ success: true, documentId: doc.id });
});
