// data.gov.in's resource API wraps rows as { records: [...] }; some datasets
// use { data: [...] } or { result: { records: [...] } }; plain arrays are
// also common for bulk JSON exports. Try the known shapes before giving up.
const KNOWN_WRAPPER_PATHS = [
  ["records"],
  ["data"],
  ["result", "records"],
  ["results"],
];

export function parseJson(buffer: Buffer): Record<string, unknown>[] {
  const parsed: unknown = JSON.parse(buffer.toString("utf-8"));

  if (Array.isArray(parsed)) return parsed as Record<string, unknown>[];

  if (parsed && typeof parsed === "object") {
    for (const path of KNOWN_WRAPPER_PATHS) {
      let node: unknown = parsed;
      for (const key of path) {
        if (node && typeof node === "object" && key in node) {
          node = (node as Record<string, unknown>)[key];
        } else {
          node = undefined;
          break;
        }
      }
      if (Array.isArray(node)) return node as Record<string, unknown>[];
    }
  }

  throw new Error(
    "Unrecognized JSON dataset shape: expected a top-level array, or one of records/data/results/result.records"
  );
}
