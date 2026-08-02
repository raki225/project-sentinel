import fs from "fs/promises";
import path from "path";
import { logger } from "../utils/logger";

const STANDARD_FONT_DATA_URL =
  path.join(path.dirname(require.resolve("pdfjs-dist/package.json")), "standard_fonts") + path.sep;

const MIN_TEXT_LENGTH_FOR_DIGITAL_PDF = 50;

export interface PdfExtractionResult {
  text: string;
  pageCount: number;
  isLikelyScanned: boolean;
}

// pdfjs-dist ships ESM-only from v4 onward. TypeScript rewrites `import()` to
// `require()` when targeting CommonJS, which breaks on a pure-ESM package —
// so the dynamic import is constructed via `new Function` to keep it a real
// native import() call that Node's CJS/ESM interop can execute.
const importPdfjs = new Function("return import('pdfjs-dist/legacy/build/pdf.mjs')") as () => Promise<
  typeof import("pdfjs-dist/legacy/build/pdf.mjs")
>;

export async function extractTextFromPdf(filePath: string): Promise<PdfExtractionResult> {
  const pdfjsLib = await importPdfjs();
  const data = new Uint8Array(await fs.readFile(filePath));

  const loadingTask = pdfjsLib.getDocument({
    data,
    isEvalSupported: false,
    standardFontDataUrl: STANDARD_FONT_DATA_URL,
  });
  const pdfDocument = await loadingTask.promise;

  let text = "";
  for (let pageNum = 1; pageNum <= pdfDocument.numPages; pageNum += 1) {
    const page = await pdfDocument.getPage(pageNum);
    const content = await page.getTextContent();
    const pageText = content.items.map((item) => ("str" in item ? item.str : "")).join(" ");
    text += `${pageText}\n`;
  }
  text = text.trim();

  const isLikelyScanned = text.length < MIN_TEXT_LENGTH_FOR_DIGITAL_PDF;

  if (isLikelyScanned) {
    logger.warn("PDF appears to be scanned (little/no extractable text)", {
      filePath,
      textLength: text.length,
    });
  }

  return {
    text,
    pageCount: pdfDocument.numPages,
    isLikelyScanned,
  };
}
