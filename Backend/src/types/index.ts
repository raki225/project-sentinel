import { Request } from "express";

export type DocumentType = "pdf" | "docx" | "png" | "jpg" | "jpeg";

export type DocumentStatus = "uploaded" | "processing" | "analyzed" | "failed";

export interface AuthPayload {
  userId: string;
  email: string;
  role: "admin" | "analyst";
}

export interface AuthenticatedRequest extends Request {
  user?: AuthPayload;
}

export interface GeoLocation {
  lat: number;
  lng: number;
  formattedAddress: string;
}

export type RiskLevel = "Low" | "Medium" | "High" | "Critical";

export interface ExtractedProjectData {
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
}

export interface ApiSuccess<T> {
  success: true;
  data?: T;
  [key: string]: unknown;
}

export interface ApiError {
  success: false;
  message: string;
}
