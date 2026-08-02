import crypto from "crypto";
import { Project } from "../models/Project";
import { logger } from "../utils/logger";

/**
 * A small, explicitly-labeled (`isDemo: true`, `sourceProvider: "demo"`)
 * fallback dataset — used only when no real government data source is
 * configured (see govDataSyncService §"skipped_not_configured") or the
 * database is otherwise empty, so `/api/projects` and `/api/projects/map`
 * always have something to render instead of a silent empty state. Every
 * record here is fictional; none of it is presented as sourced from a real
 * government dataset.
 */
const DEMO_PROJECTS = [
  {
    project: "Demo — Coastal Ring Road Widening",
    department: "Public Works Department",
    state: "Maharashtra",
    district: "Raigad",
    latitude: 18.5, longitude: 73.18,
    budget: 1840, progress: 62, contractor: "Demo Contractor Pvt. Ltd.",
  },
  {
    project: "Demo — District Water Treatment Network",
    department: "Jal Shakti Department",
    state: "Rajasthan",
    district: "Jodhpur",
    latitude: 26.29, longitude: 73.02,
    budget: 640, progress: 48, contractor: "Demo Water Works Consortium",
  },
  {
    project: "Demo — Rural Health Sub-Centre Upgrade",
    department: "Department of Health & Family Welfare",
    state: "Bihar",
    district: "Gaya",
    latitude: 24.79, longitude: 85.0,
    budget: 210, progress: 31, contractor: "Demo Buildcon",
  },
  {
    project: "Demo — Solar Micro-Grid Electrification",
    department: "Ministry of New & Renewable Energy",
    state: "Gujarat",
    district: "Kutch",
    latitude: 23.73, longitude: 69.86,
    budget: 1120, progress: 78, contractor: "Demo Power Systems",
  },
];

export async function seedDemoProjectsIfEmpty(): Promise<void> {
  const count = await Project.countDocuments();
  if (count > 0) return;

  for (const p of DEMO_PROJECTS) {
    const externalId = `demo:seed:${p.project}`;
    const rawRecordHash = crypto.createHash("sha256").update(JSON.stringify(p)).digest("hex");
    await Project.findOneAndUpdate(
      { externalId },
      {
        externalId,
        sourceProvider: "demo",
        rawRecordHash,
        isDemo: true,
        status: "pending",
        ...p,
      },
      { upsert: true }
    );
  }

  logger.info("Seeded demo Project records (no real government data source configured)", {
    count: DEMO_PROJECTS.length,
  });
}
