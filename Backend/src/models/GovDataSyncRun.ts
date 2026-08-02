import { Schema, model, Document as MongooseDocument } from "mongoose";

export type SyncRunStatus = "running" | "success" | "failed" | "skipped_not_configured";

export interface IGovDataSyncRun extends MongooseDocument {
  provider: string;
  sourceDescriptor: string; // resource id or dataset URL that was synced
  status: SyncRunStatus;
  recordsFetched: number;
  recordsCreated: number;
  recordsUpdated: number;
  recordsSkipped: number; // unchanged since last sync (same rawRecordHash)
  recordsRejected: number; // failed normalization/validation
  errorMessage?: string;
  startedAt: Date;
  finishedAt?: Date;
}

const govDataSyncRunSchema = new Schema<IGovDataSyncRun>({
  provider: { type: String, required: true, index: true },
  sourceDescriptor: { type: String, required: true },
  status: {
    type: String,
    enum: ["running", "success", "failed", "skipped_not_configured"],
    default: "running",
  },
  recordsFetched: { type: Number, default: 0 },
  recordsCreated: { type: Number, default: 0 },
  recordsUpdated: { type: Number, default: 0 },
  recordsSkipped: { type: Number, default: 0 },
  recordsRejected: { type: Number, default: 0 },
  errorMessage: { type: String },
  startedAt: { type: Date, required: true, default: Date.now },
  finishedAt: { type: Date },
});

export const GovDataSyncRun = model<IGovDataSyncRun>("GovDataSyncRun", govDataSyncRunSchema);
