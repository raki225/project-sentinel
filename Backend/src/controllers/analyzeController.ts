import { Response } from "express";
import mongoose from "mongoose";
import { DocumentModel } from "../models/Document";
import { Report } from "../models/Report";
import { AuditLog } from "../models/AuditLog";
import { AppError } from "../utils/AppError";
import { asyncHandler } from "../middleware/errorHandler";
import { extractText } from "../services/extractionService";
import { analyzeDocumentText } from "../services/aiService";
import { geocodeLocation } from "../services/geocodingService";
import { AuthenticatedRequest } from "../types";
import { logger } from "../utils/logger";

function toStringArray(value: unknown): string[] {
  if (Array.isArray(value)) return value.filter((v): v is string => typeof v === "string");
  return [];
}

function toNumber(value: unknown, fallback = 0): number {
  const n = Number(value);
  return Number.isFinite(n) ? Math.min(100, Math.max(0, n)) : fallback;
}

export const analyzeDocument = asyncHandler(async (req: AuthenticatedRequest, res: Response) => {
  const { id } = req.params;

  if (!mongoose.isValidObjectId(id)) {
    throw new AppError("Invalid document id", 400);
  }

  const doc = await DocumentModel.findById(id);
  if (!doc) {
    throw new AppError("Document not found", 404);
  }

  doc.status = "processing";
  await doc.save();

  try {
    const extractionStart = Date.now();
    const extraction = await extractText(doc.filePath, doc.type);
    logger.info("Extraction finished", {
      documentId: doc.id,
      method: extraction.method,
      durationMs: Date.now() - extractionStart,
      textLength: extraction.text.length,
    });

    doc.extractedText = extraction.text;
    doc.extractionMethod = extraction.method;

    if (extraction.warning && extraction.text.length === 0) {
      doc.status = "failed";
      doc.errorMessage = extraction.warning;
      await doc.save();
      throw new AppError(extraction.warning, 422);
    }

    const aiStart = Date.now();
    const ai = await analyzeDocumentText(extraction.text);
    logger.info("AI analysis finished", { documentId: doc.id, durationMs: Date.now() - aiStart });

    const financial =
      typeof ai.financial === "object" && ai.financial !== null ? (ai.financial as Record<string, unknown>) : {};

    const district = String(ai.district ?? "");
    const department = String(ai.department ?? "");
    const geoStart = Date.now();
    const location = await geocodeLocation([district, department].filter(Boolean).join(", "));
    logger.info("Geocoding finished", { documentId: doc.id, durationMs: Date.now() - geoStart, matched: Boolean(location) });

    const report = await Report.findOneAndUpdate(
      { documentId: doc.id },
      {
        documentId: doc.id,
        projectName: String(ai.projectName ?? ""),
        department,
        district,
        budget: String(ai.budget ?? ""),
        contractor: String(ai.contractor ?? ""),
        timeline: String(ai.timeline ?? ""),
        progress: String(ai.progress ?? ""),
        financial,
        risks: toStringArray(ai.risks),
        missingInformation: toStringArray(ai.missingInformation),
        confidence: toNumber(ai.confidence),
        riskScore: toNumber(ai.riskScore),
        executiveSummary: String(ai.executiveSummary ?? ""),
        aiRecommendation: String(ai.aiRecommendation ?? ""),
        rawAiResponse: typeof ai.rawAiResponse === "string" ? ai.rawAiResponse : JSON.stringify(ai),
        location: location ?? undefined,
      },
      { upsert: true, new: true }
    );

    doc.status = "analyzed";
    doc.errorMessage = undefined;
    await doc.save();

    await AuditLog.create({
      action: "document.analyze",
      userId: req.user?.userId,
      documentId: doc.id,
      meta: { extractionMethod: extraction.method, confidence: report.confidence, riskScore: report.riskScore },
    });

    res.status(200).json({ success: true, documentId: doc.id, report });
  } catch (error) {
    doc.status = "failed";
    doc.errorMessage = error instanceof Error ? error.message : "Analysis failed";
    await doc.save();
    throw error;
  }
});
