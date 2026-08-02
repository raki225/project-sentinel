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

export interface FinancialFindings {
  allocatedBudget?: string;
  spentToDate?: string;
  variance?: string;
  currency?: string;
  [key: string]: unknown;
}

export interface ExtractedProjectData {
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
