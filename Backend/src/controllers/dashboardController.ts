import { Response } from "express";
import { DocumentModel } from "../models/Document";
import { Report } from "../models/Report";
import { ProjectStatus } from "../models/Project";
import { asyncHandler } from "../middleware/errorHandler";
import { AuthenticatedRequest, DocumentStatus, DocumentType } from "../types";
import { findProjectsPreferReal } from "../services/projectService";

const HIGH_RISK_THRESHOLD = 70;

async function buildProjectStats() {
  const { projects, isDemo } = await findProjectsPreferReal();

  const statusCounts: Record<ProjectStatus, number> = { verified: 0, pending: 0, flagged: 0 };
  const byState: Record<string, number> = {};
  const byDepartment: Record<string, number> = {};
  let riskScoreSum = 0;

  for (const p of projects) {
    statusCounts[p.status] += 1;
    if (p.state) byState[p.state] = (byState[p.state] ?? 0) + 1;
    if (p.department) byDepartment[p.department] = (byDepartment[p.department] ?? 0) + 1;
    riskScoreSum += p.riskScore;
  }

  const recentProjects = [...projects]
    .sort((a, b) => b.createdAt.getTime() - a.createdAt.getTime())
    .slice(0, 5)
    .map((p) => ({
      projectId: p.id,
      name: p.project,
      state: p.state,
      department: p.department,
      status: p.status,
      riskScore: p.riskScore,
    }));

  return {
    isDemo,
    total: projects.length,
    statusCounts,
    averageRiskScore: projects.length ? Math.round(riskScoreSum / projects.length) : 0,
    byState,
    byDepartment,
    recentProjects,
  };
}

export const getDashboardStats = asyncHandler(async (_req: AuthenticatedRequest, res: Response) => {
  const projectStats = await buildProjectStats();

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
    projects: projectStats,
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
