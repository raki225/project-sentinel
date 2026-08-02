import { Response } from "express";
import { AuditLog, IAuditLog } from "../models/AuditLog";
import { asyncHandler } from "../middleware/errorHandler";
import { AuthenticatedRequest } from "../types";

type Severity = "low" | "medium" | "high";

function describeActivity(log: IAuditLog): { title: string; severity: Severity } {
  const meta = log.meta ?? {};

  switch (log.action) {
    case "document.upload":
      return { title: `Document uploaded — ${meta.originalName ?? "file"}`, severity: "low" };
    case "document.analyze": {
      const riskScore = Number(meta.riskScore ?? 0);
      const severity: Severity = riskScore >= 70 ? "high" : riskScore >= 40 ? "medium" : "low";
      return { title: `AI analysis complete — risk score ${riskScore}`, severity };
    }
    case "document.delete":
      return { title: `Document deleted — ${meta.originalName ?? "file"}`, severity: "low" };
    case "project.anomaly_detected": {
      const severity = (meta.severity as Severity) ?? "low";
      return { title: `AI flagged ${meta.type ?? "an anomaly"} — ${meta.projectName ?? "project"}`, severity };
    }
    case "govdata.sync": {
      const created = Number(meta.created ?? 0);
      return {
        title: `Government data synced — ${created} new project(s) from ${meta.provider ?? "source"}`,
        severity: "low",
      };
    }
    default:
      return { title: log.action, severity: "low" };
  }
}

export const getLiveActivity = asyncHandler(async (req: AuthenticatedRequest, res: Response) => {
  const limit = Math.min(50, Math.max(1, Number(req.query.limit) || 20));

  const logs = await AuditLog.find().sort({ createdAt: -1 }).limit(limit);

  res.status(200).json({
    success: true,
    activity: logs.map((log) => {
      const { title, severity } = describeActivity(log);
      return {
        id: log.id,
        action: log.action,
        title,
        severity,
        timestamp: log.createdAt,
      };
    }),
  });
});
