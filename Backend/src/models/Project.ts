import { Schema, model, Document as MongooseDocument } from "mongoose";

export type ProjectStatus = "verified" | "pending" | "flagged";

export interface ProjectAnomaly {
  type: "budget_outlier" | "timeline_delay" | "duplicate_location" | "suspicious_spending";
  detail: string;
  severity: "low" | "medium" | "high";
}

export interface IProject extends MongooseDocument {
  // Identity / provenance — how this record got here, and how re-syncs find it again.
  externalId: string; // `${sourceProvider}:${sourceDatasetId}:${sourceRecordId}`, unique upsert key
  sourceProvider: string; // "data.gov.in" | "ndap" | "manual" | "demo"
  sourceDatasetId?: string; // resource id or dataset URL the record came from
  sourceRecordId?: string; // raw record's own identifier, if the dataset has one
  rawRecordHash: string; // sha256 of the raw record, to skip untouched rows on resync
  isDemo: boolean;

  // Canonical normalized fields (requirement #5)
  project: string; // project name
  department: string;
  state: string;
  district: string;
  latitude?: number;
  longitude?: number;
  budget: number; // sanctioned budget, INR crore
  progress: number; // 0-100
  status: ProjectStatus;
  startDate?: Date;
  expectedCompletion?: Date;
  contractor?: string;
  fundingSource?: string;

  // AI enrichment
  riskScore: number; // 0-100
  anomalies: ProjectAnomaly[];
  enrichedAt?: Date;

  createdAt: Date;
  updatedAt: Date;
}

const anomalySchema = new Schema<ProjectAnomaly>(
  {
    type: {
      type: String,
      enum: ["budget_outlier", "timeline_delay", "duplicate_location", "suspicious_spending"],
      required: true,
    },
    detail: { type: String, required: true },
    severity: { type: String, enum: ["low", "medium", "high"], required: true },
  },
  { _id: false }
);

const projectSchema = new Schema<IProject>(
  {
    externalId: { type: String, required: true, unique: true },
    sourceProvider: { type: String, required: true, index: true },
    sourceDatasetId: { type: String },
    sourceRecordId: { type: String },
    rawRecordHash: { type: String, required: true },
    isDemo: { type: Boolean, default: false, index: true },

    project: { type: String, required: true },
    department: { type: String, default: "" },
    state: { type: String, default: "", index: true },
    district: { type: String, default: "" },
    latitude: { type: Number },
    longitude: { type: Number },
    budget: { type: Number, default: 0 },
    progress: { type: Number, default: 0, min: 0, max: 100 },
    status: { type: String, enum: ["verified", "pending", "flagged"], default: "pending", index: true },
    startDate: { type: Date },
    expectedCompletion: { type: Date },
    contractor: { type: String },
    fundingSource: { type: String },

    riskScore: { type: Number, default: 0, min: 0, max: 100 },
    anomalies: { type: [anomalySchema], default: [] },
    enrichedAt: { type: Date },
  },
  { timestamps: true }
);

projectSchema.index({ latitude: 1, longitude: 1 });
projectSchema.index({ department: 1, state: 1, district: 1 });

export const Project = model<IProject>("Project", projectSchema);
