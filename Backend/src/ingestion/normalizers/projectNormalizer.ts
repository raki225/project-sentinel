import crypto from "crypto";
import type { IProject } from "../../models/Project";

/**
 * Maps this dataset's own column names onto Sentinel's canonical Project
 * schema. Each canonical field accepts one or more candidate source column
 * names (tried in order, case/whitespace-insensitive) since every
 * government dataset names its columns differently — this is what makes the
 * normalizer reusable across datasets instead of hardcoded to one schema.
 */
export interface ProjectFieldMap {
  project: string | string[];
  recordId?: string | string[]; // the raw dataset's own row identifier, for dedup
  department?: string | string[];
  state?: string | string[];
  district?: string | string[];
  latitude?: string | string[];
  longitude?: string | string[];
  budget?: string | string[];
  progress?: string | string[];
  startDate?: string | string[];
  expectedCompletion?: string | string[];
  contractor?: string | string[];
  fundingSource?: string | string[];
}

export type NormalizedProjectInput = Pick<
  IProject,
  | "project"
  | "department"
  | "state"
  | "district"
  | "budget"
  | "progress"
  | "status"
  | "contractor"
> &
  Partial<Pick<IProject, "latitude" | "longitude" | "startDate" | "expectedCompletion" | "fundingSource">> & {
    sourceRecordId?: string;
    rawRecordHash: string;
  };

function candidates(v?: string | string[]): string[] {
  if (!v) return [];
  return Array.isArray(v) ? v : [v];
}

function normalizeKey(k: string): string {
  return k.trim().toLowerCase().replace(/[\s_-]+/g, "");
}

function getField(raw: Record<string, unknown>, names: string[]): unknown {
  const wanted = names.map(normalizeKey);
  for (const [key, value] of Object.entries(raw)) {
    if (wanted.includes(normalizeKey(key))) return value;
  }
  return undefined;
}

function toText(v: unknown): string {
  if (v === null || v === undefined) return "";
  return String(v).trim();
}

function toNumber(v: unknown): number | undefined {
  if (v === null || v === undefined || v === "") return undefined;
  const cleaned = String(v).replace(/[,₹\s]/g, "");
  const n = Number(cleaned);
  return Number.isFinite(n) ? n : undefined;
}

function toDate(v: unknown): Date | undefined {
  if (v === null || v === undefined || v === "") return undefined;
  const d = new Date(String(v));
  return Number.isNaN(d.getTime()) ? undefined : d;
}

/**
 * Normalizes one raw dataset row. Returns null to reject rows with no usable
 * project name — everything else degrades to a safe default rather than
 * rejecting, since partial government data is still worth ingesting.
 */
export function normalizeProjectRecord(
  raw: Record<string, unknown>,
  fieldMap: ProjectFieldMap
): NormalizedProjectInput | null {
  const project = toText(getField(raw, candidates(fieldMap.project)));
  if (!project) return null;

  const rawRecordHash = crypto.createHash("sha256").update(JSON.stringify(raw)).digest("hex");

  const recordIdRaw = getField(raw, candidates(fieldMap.recordId));
  const sourceRecordId = recordIdRaw !== undefined ? toText(recordIdRaw) : undefined;

  return {
    project,
    department: toText(getField(raw, candidates(fieldMap.department))),
    state: toText(getField(raw, candidates(fieldMap.state))),
    district: toText(getField(raw, candidates(fieldMap.district))),
    latitude: toNumber(getField(raw, candidates(fieldMap.latitude))),
    longitude: toNumber(getField(raw, candidates(fieldMap.longitude))),
    budget: toNumber(getField(raw, candidates(fieldMap.budget))) ?? 0,
    progress: clampPercent(toNumber(getField(raw, candidates(fieldMap.progress)))),
    // Sentinel's own AI-verification status, distinct from any raw "status" text
    // the source dataset might carry — freshly ingested records have no
    // evidence yet, so they start "pending" until documents are uploaded and
    // verified against them (see docs/architecture §4.1).
    status: "pending",
    startDate: toDate(getField(raw, candidates(fieldMap.startDate))),
    expectedCompletion: toDate(getField(raw, candidates(fieldMap.expectedCompletion))),
    contractor: toText(getField(raw, candidates(fieldMap.contractor))) || undefined,
    fundingSource: toText(getField(raw, candidates(fieldMap.fundingSource))) || undefined,
    sourceRecordId,
    rawRecordHash,
  };
}

function clampPercent(n: number | undefined): number {
  if (n === undefined) return 0;
  return Math.min(100, Math.max(0, n));
}
