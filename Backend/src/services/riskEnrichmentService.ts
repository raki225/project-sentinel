import { Project, IProject, ProjectAnomaly } from "../models/Project";
import { AuditLog } from "../models/AuditLog";
import { logger } from "../utils/logger";

const DUPLICATE_LOCATION_TOLERANCE_DEG = 0.005; // ~500m
const HIGH_SEVERITY_RISK_THRESHOLD = 70;

/**
 * Deterministic, explainable risk scoring — not an LLM call per record.
 * Government open datasets can run into the thousands of rows per sync;
 * running every row through an LLM would be slow, costly, and non-
 * reproducible. Anomaly *narratives* could later be handed to aiService for
 * a human-readable summary, but the detection itself is rule-based so the
 * same input always produces the same score.
 *
 * Only Budget + Progress are available from most public sanctioned-project
 * datasets (no separate "released"/"utilized" tranche figures), so
 * "suspicious spending" is approximated as a large budget with
 * disproportionately little physical progress — the honest signal available
 * from this data shape.
 */
export async function enrichProject(project: IProject): Promise<void> {
  const anomalies: ProjectAnomaly[] = [];

  const timelineAnomaly = detectTimelineDelay(project);
  if (timelineAnomaly) anomalies.push(timelineAnomaly);

  const budgetAnomaly = await detectBudgetOutlier(project);
  if (budgetAnomaly) anomalies.push(budgetAnomaly);

  if (budgetAnomaly && project.progress < 20) {
    anomalies.push({
      type: "suspicious_spending",
      detail: `Budget is a departmental outlier while physical progress is only ${project.progress}%.`,
      severity: "high",
    });
  }

  const duplicateAnomaly = await detectDuplicateLocation(project);
  if (duplicateAnomaly) anomalies.push(duplicateAnomaly);

  const riskScore = computeRiskScore(anomalies);
  const hasHighSeverity = anomalies.some((a) => a.severity === "high");

  project.anomalies = anomalies;
  project.riskScore = riskScore;
  project.enrichedAt = new Date();
  if (hasHighSeverity || riskScore >= HIGH_SEVERITY_RISK_THRESHOLD) {
    project.status = "flagged";
  }
  await project.save();

  for (const anomaly of anomalies) {
    await AuditLog.create({
      action: "project.anomaly_detected",
      projectId: project.id,
      meta: { projectName: project.project, type: anomaly.type, severity: anomaly.severity, detail: anomaly.detail },
    });
  }

  logger.info("Project enrichment complete", {
    projectId: project.id,
    riskScore,
    anomalyCount: anomalies.length,
  });
}

function detectTimelineDelay(project: IProject): ProjectAnomaly | null {
  if (!project.expectedCompletion || project.progress >= 100) return null;
  const now = new Date();
  if (project.expectedCompletion >= now) return null;

  const overdueDays = Math.round((now.getTime() - project.expectedCompletion.getTime()) / 86_400_000);
  const severity: ProjectAnomaly["severity"] = overdueDays > 365 ? "high" : overdueDays > 90 ? "medium" : "low";

  return {
    type: "timeline_delay",
    detail: `Expected completion was ${overdueDays} day(s) ago; still ${project.progress}% complete.`,
    severity,
  };
}

async function detectBudgetOutlier(project: IProject): Promise<ProjectAnomaly | null> {
  if (!project.department || project.budget <= 0) return null;

  const peers = await Project.find({
    department: project.department,
    _id: { $ne: project._id },
    budget: { $gt: 0 },
  })
    .select("budget")
    .limit(500);

  if (peers.length < 4) return null; // not enough peers for a meaningful comparison

  const budgets = peers.map((p) => p.budget).sort((a, b) => a - b);
  const median = budgets[Math.floor(budgets.length / 2)];
  if (median <= 0) return null;

  const ratio = project.budget / median;
  if (ratio < 3) return null; // more than 3x the departmental median budget

  return {
    type: "budget_outlier",
    detail: `Budget (₹${project.budget} Cr) is ${ratio.toFixed(1)}x the ${project.department} departmental median (₹${median} Cr).`,
    severity: ratio > 6 ? "high" : "medium",
  };
}

async function detectDuplicateLocation(project: IProject): Promise<ProjectAnomaly | null> {
  if (project.latitude === undefined || project.longitude === undefined) return null;

  const nearby = await Project.findOne({
    _id: { $ne: project._id },
    latitude: {
      $gte: project.latitude - DUPLICATE_LOCATION_TOLERANCE_DEG,
      $lte: project.latitude + DUPLICATE_LOCATION_TOLERANCE_DEG,
    },
    longitude: {
      $gte: project.longitude - DUPLICATE_LOCATION_TOLERANCE_DEG,
      $lte: project.longitude + DUPLICATE_LOCATION_TOLERANCE_DEG,
    },
  }).select("project");

  if (!nearby) return null;

  return {
    type: "duplicate_location",
    detail: `Coordinates overlap with another project on file: "${nearby.project}".`,
    severity: "medium",
  };
}

function computeRiskScore(anomalies: ProjectAnomaly[]): number {
  const weights: Record<ProjectAnomaly["type"], number> = {
    timeline_delay: 30,
    suspicious_spending: 25,
    budget_outlier: 20,
    duplicate_location: 15,
  };
  const severityMultiplier: Record<ProjectAnomaly["severity"], number> = { low: 0.4, medium: 0.7, high: 1 };

  const score = anomalies.reduce((sum, a) => sum + weights[a.type] * severityMultiplier[a.severity], 0);
  return Math.min(100, Math.round(score));
}
