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

function toBoolean(value: unknown): boolean {
  return value === true;
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
        contractor: String(ai.contractor ?? ""),

        allocatedBudget: String(ai.allocatedBudget ?? ""),
        spentAmount: String(ai.spentAmount ?? ""),
        remainingBudget: String(ai.remainingBudget ?? ""),

        projectTimeline: String(ai.projectTimeline ?? ""),
        completionPercentage: String(ai.completionPercentage ?? ""),

        transparencyScore: toNumber(ai.transparencyScore),
        riskScore: toNumber(ai.riskScore),

        budgetHealth: toNumber(ai.budgetHealth),
        timelineHealth: toNumber(ai.timelineHealth),
        documentationHealth: toNumber(ai.documentationHealth),
        executionHealth: toNumber(ai.executionHealth),

        riskLevel: String(ai.riskLevel ?? ""),

        invoiceMismatch: toBoolean(ai.invoiceMismatch),
        duplicateInvoice: toBoolean(ai.duplicateInvoice),
        budgetOverrun: toBoolean(ai.budgetOverrun),
        timelineDelay: toBoolean(ai.timelineDelay),

        missingEvidence: toStringArray(ai.missingEvidence),
        anomalies: toStringArray(ai.anomalies),
        recommendations: toStringArray(ai.recommendations),
        paymentRecommendation: String(ai.paymentRecommendation ?? ""),

        confidence: toNumber(ai.confidence),
        executiveSummary: String(ai.executiveSummary ?? ""),
        evidence: toStringArray(ai.evidence),

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
