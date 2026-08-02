import { Schema, model, Document as MongooseDocument, Types } from "mongoose";
import { DocumentStatus, DocumentType } from "../types";

export interface IDocument extends MongooseDocument {
  fileName: string;
  originalName: string;
  filePath: string;
  mimeType: string;
  type: DocumentType;
  sizeBytes: number;
  status: DocumentStatus;
  extractedText?: string;
  extractionMethod?: "pdf-parse" | "ocr" | "docx-parse";
  uploadedBy?: Types.ObjectId;
  errorMessage?: string;
  createdAt: Date;
  updatedAt: Date;
}

const documentSchema = new Schema<IDocument>(
  {
    fileName: { type: String, required: true },
    originalName: { type: String, required: true },
    filePath: { type: String, required: true },
    mimeType: { type: String, required: true },
    type: { type: String, enum: ["pdf", "docx", "png", "jpg", "jpeg"], required: true },
    sizeBytes: { type: Number, required: true },
    status: {
      type: String,
      enum: ["uploaded", "processing", "analyzed", "failed"],
      default: "uploaded",
    },
    extractedText: { type: String },
    extractionMethod: { type: String, enum: ["pdf-parse", "ocr", "docx-parse"] },
    uploadedBy: { type: Schema.Types.ObjectId, ref: "User" },
    errorMessage: { type: String },
  },
  { timestamps: true }
);

export const DocumentModel = model<IDocument>("Document", documentSchema);
