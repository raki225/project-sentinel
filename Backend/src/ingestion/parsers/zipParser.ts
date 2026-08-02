import AdmZip from "adm-zip";

export interface ZipEntry {
  fileName: string;
  buffer: Buffer;
}

export function extractZip(buffer: Buffer): ZipEntry[] {
  const zip = new AdmZip(buffer);
  return zip
    .getEntries()
    .filter((entry) => !entry.isDirectory)
    .map((entry) => ({ fileName: entry.entryName, buffer: entry.getData() }));
}
