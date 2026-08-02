import { Response } from "express";
import mongoose from "mongoose";
import { Report } from "../models/Report";
import { DocumentModel } from "../models/Document";
import { AppError } from "../utils/AppError";
import { asyncHandler } from "../middleware/errorHandler";
import { AuthenticatedRequest } from "../types";

export const getReport = asyncHandler(async (req: AuthenticatedRequest, res: Response) => {
  const { id } = req.params;

  if (!mongoose.isValidObjectId(id)) {
    throw new AppError("Invalid document id", 400);
  }

  const [doc, report] = await Promise.all([
    DocumentModel.findById(id),
    Report.findOne({ documentId: id }),
  ]);

  if (!doc) {
    throw new AppError("Document not found", 404);
  }
  if (!report) {
    throw new AppError("No report found for this document. Run POST /api/analyze/:id first.", 404);
  }

  res.status(200).json({
    success: true,
    documentId: doc.id,
    fileName: doc.originalName,
    status: doc.status,
    report: {
      executiveSummary: report.executiveSummary,
      riskScore: report.riskScore,
      confidence: report.confidence,
      timeline: report.timeline,
      financial: report.financial,
      aiRecommendation: report.aiRecommendation,
      projectName: report.projectName,
      department: report.department,
      district: report.district,
      budget: report.budget,
      contractor: report.contractor,
      progress: report.progress,
      risks: report.risks,
      missingInformation: report.missingInformation,
      location: report.location,
      createdAt: report.createdAt,
      updatedAt: report.updatedAt,
    },
  });
});
