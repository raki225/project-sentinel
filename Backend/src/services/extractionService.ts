import { DocumentType } from "../types";
import { extractTextFromPdf } from "./pdfService";
import { extractTextFromImage } from "./ocrService";
import { extractTextFromDocx } from "./docxService";
import { AppError } from "../utils/AppError";
import { logger } from "../utils/logger";

export interface ExtractionResult {
  text: string;
  method: "pdf-parse" | "ocr" | "docx-parse";
  warning?: string;
}

/**
 * Routes a file through the right extraction path based on its detected type.
 * Digital PDFs use pdf-parse; images use Tesseract OCR; DOCX uses mammoth.
 *
 * Scanned (image-only) PDFs are detected but not rasterized-and-OCR'd in this
 * build — that requires a PDF-to-image renderer (e.g. poppler/pdftoppm),
 * which is an external binary dependency left out to keep setup dependency-free.
 * To support scanned PDFs, re-export the pages as PNG/JPG and upload those,
 * or wire a renderer into this function and call extractTextFromImage per page.
 */
export async function extractText(filePath: string, type: DocumentType): Promise<ExtractionResult> {
  const start = Date.now();

  if (type === "pdf") {
    const { text, isLikelyScanned } = await extractTextFromPdf(filePath);
    logger.info("PDF text extraction complete", { filePath, durationMs: Date.now() - start });

    if (isLikelyScanned && text.length === 0) {
      return {
        text: "",
        method: "pdf-parse",
        warning:
          "This PDF appears to be scanned (image-only) with no extractable text layer. " +
          "Automatic OCR of scanned PDF pages isn't wired up in this build; upload page images (PNG/JPG) instead.",
      };
    }

    return { text, method: "pdf-parse" };
  }

  if (type === "docx") {
    const text = await extractTextFromDocx(filePath);
    logger.info("DOCX text extraction complete", { filePath, durationMs: Date.now() - start });
    return { text, method: "docx-parse" };
  }

  if (type === "png" || type === "jpg" || type === "jpeg") {
    const text = await extractTextFromImage(filePath);
    logger.info("Image OCR complete", { filePath, durationMs: Date.now() - start });
    return { text, method: "ocr" };
  }

  throw new AppError(`Unsupported document type for extraction: ${type}`, 400);
}
