import { Schema, model, Document as MongooseDocument, Types } from "mongoose";

export interface IAuditLog extends MongooseDocument {
  action: string;
  userId?: Types.ObjectId;
  documentId?: Types.ObjectId;
  projectId?: Types.ObjectId;
  meta?: Record<string, unknown>;
  durationMs?: number;
  createdAt: Date;
  updatedAt: Date;
}

const auditLogSchema = new Schema<IAuditLog>(
  {
    action: { type: String, required: true },
    userId: { type: Schema.Types.ObjectId, ref: "User" },
    documentId: { type: Schema.Types.ObjectId, ref: "Document" },
    projectId: { type: Schema.Types.ObjectId, ref: "Project" },
    meta: { type: Schema.Types.Mixed },
    durationMs: { type: Number },
  },
  { timestamps: true }
);

export const AuditLog = model<IAuditLog>("AuditLog", auditLogSchema);
