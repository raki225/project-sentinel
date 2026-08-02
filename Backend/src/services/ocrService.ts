import { createWorker } from "tesseract.js";
import sharp from "sharp";
import { logger } from "../utils/logger";

/**
 * Runs Tesseract OCR against a raster image. Images are normalized with
 * sharp first (grayscale + resize floor) since that measurably improves
 * OCR accuracy on low-res scans/photos of documents.
 */
export async function extractTextFromImage(filePath: string): Promise<string> {
  const preprocessed = await sharp(filePath)
    .grayscale()
    .resize({ width: 2000, withoutEnlargement: false })
    .normalize()
    .toBuffer();

  const worker = await createWorker("eng");
  try {
    const start = Date.now();
    const {
      data: { text },
    } = await worker.recognize(preprocessed);
    logger.info("OCR complete", { filePath, durationMs: Date.now() - start });
    return text.trim();
  } finally {
    await worker.terminate();
  }
}
