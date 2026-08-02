import { Response } from "express";
import mongoose from "mongoose";
import { DocumentModel } from "../models/Document";
import { Report } from "../models/Report";
import { AuditLog } from "../models/AuditLog";
import { AppError } from "../utils/AppError";
import { asyncHandler } from "../middleware/errorHandler";
import { AuthenticatedRequest } from "../types";
import { isDbConnected } from "../config/database";

export const getTimeline = asyncHandler(async (req: AuthenticatedRequest, res: Response) => {
  const { id } = req.params;

  if (!isDbConnected()) {
    res.status(200).json({
      success: true,
      isDemo: true,
      documentId: id || "demo-doc-1",
      fileName: "coastal_ring_road_audit.pdf",
      status: "analyzed",
      projectTimeline: "2024 - 2026",
      progress: "62%",
      events: [
        {
          action: "document.upload",
          timestamp: new Date("2026-01-01T08:00:00.000Z"),
          meta: { originalName: "coastal_ring_road_audit.pdf" },
        },
        {
          action: "document.analyze",
          timestamp: new Date("2026-01-01T08:05:00.000Z"),
          meta: { confidence: 88, riskScore: 25 },
        },
      ],
    });
    return;
  }

  if (!mongoose.isValidObjectId(id)) {
    throw new AppError("Invalid document id", 400);
  }

  const [doc, report, auditLogs] = await Promise.all([
    DocumentModel.findById(id),
    Report.findOne({ documentId: id }),
    AuditLog.find({ documentId: id }).sort({ createdAt: 1 }),
  ]);

  if (!doc) {
    throw new AppError("Document not found", 404);
  }

  res.status(200).json({
    success: true,
    documentId: doc.id,
    fileName: doc.originalName,
    status: doc.status,
    projectTimeline: report?.projectTimeline ?? null,
    progress: report?.completionPercentage ?? null,
    events: auditLogs.map((log) => ({
      action: log.action,
      timestamp: log.createdAt,
      meta: log.meta,
    })),
  });
});
