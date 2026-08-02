import { Response } from "express";
import { Report } from "../models/Report";
import { IDocument } from "../models/Document";
import { asyncHandler } from "../middleware/errorHandler";
import { AuthenticatedRequest } from "../types";

type RiskTier = "low" | "medium" | "high";

function riskTier(riskScore: number): RiskTier {
  if (riskScore >= 70) return "high";
  if (riskScore >= 40) return "medium";
  return "low";
}

export const getProjectsMap = asyncHandler(async (_req: AuthenticatedRequest, res: Response) => {
  const reports = await Report.find({ "location.lat": { $exists: true } }).populate<{ documentId: IDocument }>(
    "documentId",
    "originalName status"
  );

  const points = reports
    .filter((report) => report.documentId && report.location)
    .map((report) => {
      const doc = report.documentId;
      return {
        id: doc.id,
        lat: report.location!.lat,
        lng: report.location!.lng,
        name: report.projectName || doc.originalName,
        department: report.department,
        district: report.district,
        budget: report.budget,
        progress: report.progress,
        confidence: report.confidence,
        riskScore: report.riskScore,
        risk: riskTier(report.riskScore),
        health: Math.max(0, 100 - report.riskScore),
        formattedAddress: report.location!.formattedAddress,
      };
    });

  res.status(200).json({ success: true, points });
});
