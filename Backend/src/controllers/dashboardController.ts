import { Response } from "express";
import { DocumentModel } from "../models/Document";
import { Report } from "../models/Report";
import { asyncHandler } from "../middleware/errorHandler";
import { AuthenticatedRequest, DocumentStatus, DocumentType } from "../types";

const HIGH_RISK_THRESHOLD = 70;

export const getDashboardStats = asyncHandler(async (_req: AuthenticatedRequest, res: Response) => {
  const [totalDocuments, statusAgg, typeAgg, riskAgg, recentDocuments, highRiskCount] = await Promise.all([
    DocumentModel.countDocuments(),
    DocumentModel.aggregate<{ _id: DocumentStatus; count: number }>([
      { $group: { _id: "$status", count: { $sum: 1 } } },
    ]),
    DocumentModel.aggregate<{ _id: DocumentType; count: number }>([
      { $group: { _id: "$type", count: { $sum: 1 } } },
    ]),
    Report.aggregate<{ avgRiskScore: number; avgConfidence: number; totalReports: number }>([
      {
        $group: {
          _id: null,
          avgRiskScore: { $avg: "$riskScore" },
          avgConfidence: { $avg: "$confidence" },
          totalReports: { $sum: 1 },
        },
      },
    ]),
    DocumentModel.find().sort({ createdAt: -1 }).limit(5),
    Report.countDocuments({ riskScore: { $gte: HIGH_RISK_THRESHOLD } }),
  ]);

  const statusCounts = Object.fromEntries(statusAgg.map((s) => [s._id, s.count]));
  const typeCounts = Object.fromEntries(typeAgg.map((t) => [t._id, t.count]));
  const riskSummary = riskAgg[0] ?? { avgRiskScore: 0, avgConfidence: 0, totalReports: 0 };

  res.status(200).json({
    success: true,
    stats: {
      totalDocuments,
      totalReports: riskSummary.totalReports,
      statusCounts,
      typeCounts,
      averageRiskScore: Math.round(riskSummary.avgRiskScore || 0),
      averageConfidence: Math.round(riskSummary.avgConfidence || 0),
      highRiskCount,
    },
    recentDocuments: recentDocuments.map((doc) => ({
      documentId: doc.id,
      fileName: doc.originalName,
      type: doc.type,
      status: doc.status,
      createdAt: doc.createdAt,
    })),
  });
});
