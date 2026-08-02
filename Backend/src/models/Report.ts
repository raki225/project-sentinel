import { Schema, model, Document as MongooseDocument, Types } from "mongoose";
import { FinancialFindings, GeoLocation } from "../types";

export interface IReport extends MongooseDocument {
  documentId: Types.ObjectId;
  projectName: string;
  department: string;
  district: string;
  budget: string;
  contractor: string;
  timeline: string;
  progress: string;
  financial: FinancialFindings;
  risks: string[];
  missingInformation: string[];
  confidence: number;
  riskScore: number;
  executiveSummary: string;
  aiRecommendation: string;
  rawAiResponse?: string;
  location?: GeoLocation;
  createdAt: Date;
  updatedAt: Date;
}

const reportSchema = new Schema<IReport>(
  {
    documentId: { type: Schema.Types.ObjectId, ref: "Document", required: true, unique: true },
    projectName: { type: String, default: "" },
    department: { type: String, default: "" },
    district: { type: String, default: "" },
    budget: { type: String, default: "" },
    contractor: { type: String, default: "" },
    timeline: { type: String, default: "" },
    progress: { type: String, default: "" },
    financial: { type: Schema.Types.Mixed, default: {} },
    risks: { type: [String], default: [] },
    missingInformation: { type: [String], default: [] },
    confidence: { type: Number, default: 0, min: 0, max: 100 },
    riskScore: { type: Number, default: 0, min: 0, max: 100 },
    executiveSummary: { type: String, default: "" },
    aiRecommendation: { type: String, default: "" },
    rawAiResponse: { type: String },
    location: {
      lat: { type: Number },
      lng: { type: Number },
      formattedAddress: { type: String },
    },
  },
  { timestamps: true }
);

export const Report = model<IReport>("Report", reportSchema);
