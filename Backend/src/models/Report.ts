import { Schema, model, Document as MongooseDocument, Types } from "mongoose";
import { GeoLocation } from "../types";

export interface IReport extends MongooseDocument {
  documentId: Types.ObjectId;
  projectName: string;
  department: string;
  district: string;
  contractor: string;

  allocatedBudget: string;
  spentAmount: string;
  remainingBudget: string;

  projectTimeline: string;
  completionPercentage: string;

  transparencyScore: number;
  riskScore: number;

  budgetHealth: number;
  timelineHealth: number;
  documentationHealth: number;
  executionHealth: number;

  riskLevel: string;

  invoiceMismatch: boolean;
  duplicateInvoice: boolean;
  budgetOverrun: boolean;
  timelineDelay: boolean;

  missingEvidence: string[];
  anomalies: string[];
  recommendations: string[];
  paymentRecommendation: string;

  confidence: number;
  executiveSummary: string;
  evidence: string[];

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
    contractor: { type: String, default: "" },

    allocatedBudget: { type: String, default: "" },
    spentAmount: { type: String, default: "" },
    remainingBudget: { type: String, default: "" },

    projectTimeline: { type: String, default: "" },
    completionPercentage: { type: String, default: "" },

    transparencyScore: { type: Number, default: 0, min: 0, max: 100 },
    riskScore: { type: Number, default: 0, min: 0, max: 100 },

    budgetHealth: { type: Number, default: 0, min: 0, max: 100 },
    timelineHealth: { type: Number, default: 0, min: 0, max: 100 },
    documentationHealth: { type: Number, default: 0, min: 0, max: 100 },
    executionHealth: { type: Number, default: 0, min: 0, max: 100 },

    riskLevel: { type: String, default: "" },

    invoiceMismatch: { type: Boolean, default: false },
    duplicateInvoice: { type: Boolean, default: false },
    budgetOverrun: { type: Boolean, default: false },
    timelineDelay: { type: Boolean, default: false },

    missingEvidence: { type: [String], default: [] },
    anomalies: { type: [String], default: [] },
    recommendations: { type: [String], default: [] },
    paymentRecommendation: { type: String, default: "" },

    confidence: { type: Number, default: 0, min: 0, max: 100 },
    executiveSummary: { type: String, default: "" },
    evidence: { type: [String], default: [] },

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
