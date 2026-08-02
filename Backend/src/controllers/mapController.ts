import { Response } from "express";
import { Report } from "../models/Report";
import { IDocument } from "../models/Document";
import { Project, IProject } from "../models/Project";
import { asyncHandler } from "../middleware/errorHandler";
import { AuthenticatedRequest } from "../types";

type RiskTier = "low" | "medium" | "high";

function riskTier(riskScore: number): RiskTier {
  if (riskScore >= 70) return "high";
  if (riskScore >= 40) return "medium";
  return "low";
}

// Shape matches the frontend's ProjectMapPoint (frontend/lib/api.ts) exactly —
// this endpoint's response contract is unchanged; only where the points come
// from has grown to include gov-data-sourced Project records, not just
// documents that happen to have been uploaded and AI-analyzed.
type MapPoint = {
  id: string;
  lat: number;
  lng: number;
  name: string;
  department: string;
  district: string;
  budget: string;
  progress: string;
  confidence: number;
  riskScore: number;
  risk: RiskTier;
  health: number;
  formattedAddress: string;
};

async function pointsFromAnalyzedReports(): Promise<MapPoint[]> {
  const reports = await Report.find({ "location.lat": { $exists: true } }).populate<{ documentId: IDocument }>(
    "documentId",
    "originalName status"
  );

  return reports
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
}

function pointFromProject(p: IProject): MapPoint {
  return {
    id: p.id,
    lat: p.latitude as number,
    lng: p.longitude as number,
    name: p.project,
    department: p.department,
    district: p.district,
    budget: `₹${p.budget} Cr`,
    progress: `${p.progress}%`,
    confidence: p.enrichedAt ? Math.max(0, 100 - p.riskScore) : 0,
    riskScore: p.riskScore,
    risk: riskTier(p.riskScore),
    health: Math.max(0, 100 - p.riskScore),
    formattedAddress: [p.district, p.state].filter(Boolean).join(", "),
  };
}

export const getProjectsMap = asyncHandler(async (_req: AuthenticatedRequest, res: Response) => {
  const geoFilter = { latitude: { $exists: true, $ne: null }, longitude: { $exists: true, $ne: null } };

  const [reportPoints, realProjects] = await Promise.all([
    pointsFromAnalyzedReports(),
    Project.find({ ...geoFilter, isDemo: false }),
  ]);

  const realPoints = [...reportPoints, ...realProjects.map(pointFromProject)];

  if (realPoints.length > 0) {
    res.status(200).json({ success: true, isDemo: false, points: realPoints });
    return;
  }

  // Nothing real yet (no analyzed documents, no synced government data) —
  // fall back to the clearly-labeled demo Project records so the map isn't
  // silently empty. The frontend already renders its own "Demo mode" banner
  // whenever `points` is empty, so returning [] here (rather than demo
  // points) is also a valid choice; we surface demo points instead so the
  // map has something concrete to show even before that fallback triggers.
  const demoProjects = await Project.find({ ...geoFilter, isDemo: true });
  res.status(200).json({ success: true, isDemo: true, points: demoProjects.map(pointFromProject) });
});
