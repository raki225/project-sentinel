import { XMLParser } from "fast-xml-parser";

const parser = new XMLParser({ ignoreAttributes: false, attributeNamePrefix: "@_" });

/**
 * Government XML exports are almost always `<Root><Row>...</Row><Row>...</Row></Root>`
 * (or similarly named repeated elements). Rather than requiring a hardcoded
 * element name per dataset, walk the parsed tree and take the first array of
 * record-shaped objects found — this covers every "repeated element" XML
 * shape without per-dataset configuration.
 */
export function parseXml(buffer: Buffer): Record<string, unknown>[] {
  const parsed: unknown = parser.parse(buffer.toString("utf-8"));

  const arrayFound = findFirstRecordArray(parsed);
  if (arrayFound) return arrayFound;

  // fast-xml-parser only produces an array for a tag repeated 2+ times —
  // a lone repeated element (e.g. exactly one <Row>) parses as a plain
  // object instead. Fall back to the deepest leaf-record object found so a
  // single-record response still parses instead of failing outright.
  const singleFound = findDeepestRecordObject(parsed);
  if (singleFound) return [singleFound];

  throw new Error("Unrecognized XML dataset shape: no record element found");
}

function findFirstRecordArray(node: unknown): Record<string, unknown>[] | null {
  if (Array.isArray(node)) {
    if (node.length > 0 && node.every((item) => typeof item === "object" && item !== null)) {
      return node as Record<string, unknown>[];
    }
    return null;
  }
  if (node && typeof node === "object") {
    for (const value of Object.values(node)) {
      const result = findFirstRecordArray(value);
      if (result) return result;
    }
  }
  return null;
}

/** A "record" object is one whose values are all scalars (leaf fields), not further nested objects. */
function findDeepestRecordObject(node: unknown): Record<string, unknown> | null {
  if (!node || typeof node !== "object" || Array.isArray(node)) return null;

  const obj = node as Record<string, unknown>;
  const isRecordShaped = Object.values(obj).every((v) => typeof v !== "object" || v === null);
  if (isRecordShaped) return obj;

  for (const value of Object.values(obj)) {
    const result = findDeepestRecordObject(value);
    if (result) return result;
  }
  return null;
}
