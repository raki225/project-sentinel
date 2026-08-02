import * as XLSX from "xlsx";

/**
 * Reads the first non-empty worksheet. Government datasets published as a
 * single-table XLSX (the common case) only ever have one sheet that matters;
 * multi-sheet workbooks would need a per-dataset sheet name, which belongs in
 * ingestion config, not guessed here.
 */
export function parseXlsx(buffer: Buffer): Record<string, unknown>[] {
  const workbook = XLSX.read(buffer, { type: "buffer" });

  for (const sheetName of workbook.SheetNames) {
    const sheet = workbook.Sheets[sheetName];
    const rows = XLSX.utils.sheet_to_json<Record<string, unknown>>(sheet, { defval: null });
    if (rows.length > 0) return rows;
  }
  return [];
}
