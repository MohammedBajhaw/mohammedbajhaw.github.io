const FORBIDDEN_KEYS = new Set(["__proto__", "constructor", "prototype"]);
const MAX_DEPTH = 12;

/** Fields in the dashboard that intentionally carry formatted HTML (still stripped of scripts/handlers). */
const RICH_HTML_KEYS = new Set(["rich_content", "details"]);

const DANGEROUS_HTML_PATTERNS: RegExp[] = [
  /<\s*script\b/i,
  /<\s*\/\s*script\s*>/i,
  /<\s*iframe\b/i,
  /<\s*object\b/i,
  /<\s*embed\b/i,
  /javascript\s*:/i,
  /vbscript\s*:/i,
  /data\s*:\s*text\/html/i,
  /\bon[a-z]+\s*=/i,
];

const URL_FIELD_KEYS = new Set([
  "url",
  "linkedin_url",
  "repository_url",
  "publication_url",
  "logoUrl",
  "faviconUrl",
  "ogImageUrl",
  "apiBaseUrl",
  "photo_path",
  "storage_path",
]);

export class ClientInputValidationError extends Error {
  constructor(message: string) {
    super(message);
    this.name = "ClientInputValidationError";
  }
}

function stripControlChars(input: string): string {
  let result = "";
  for (let i = 0; i < input.length; i += 1) {
    const code = input.charCodeAt(i);
    const isForbiddenControl =
      (code >= 0x01 && code <= 0x08) ||
      code === 0x0b ||
      code === 0x0c ||
      (code >= 0x0e && code <= 0x1f) ||
      code === 0x7f;
    if (!isForbiddenControl) {
      result += input[i];
    }
  }
  return result;
}

function isPlainObject(value: unknown): value is Record<string, unknown> {
  if (typeof value !== "object" || value === null || Array.isArray(value)) {
    return false;
  }
  const proto = Object.getPrototypeOf(value) as object | null;
  return proto === Object.prototype || proto === null;
}

export function isSafeHttpOrRelativeUrl(raw: string): boolean {
  const trimmed = raw.trim();
  if (!trimmed) return true;
  if (trimmed.startsWith("/") && !trimmed.startsWith("//")) return true;
  try {
    const parsed = new URL(trimmed);
    return parsed.protocol === "https:" || parsed.protocol === "http:";
  } catch {
    return false;
  }
}

function sanitizeStringField(value: string, keyName: string, location: string): string {
  if (value.includes("\u0000")) {
    throw new ClientInputValidationError(`Null bytes are not allowed in ${location}.`);
  }

  const cleaned = stripControlChars(value).normalize("NFC");

  for (const pattern of DANGEROUS_HTML_PATTERNS) {
    if (pattern.test(cleaned)) {
      throw new ClientInputValidationError(
        `Potentially unsafe script or HTML pattern detected in "${keyName || location}".`,
      );
    }
  }

  if (!RICH_HTML_KEYS.has(keyName) && /<\s*[a-z][^>]*>/i.test(cleaned)) {
    throw new ClientInputValidationError(
      `HTML tags are not allowed in "${keyName || location}".`,
    );
  }

  if (URL_FIELD_KEYS.has(keyName) && cleaned.trim().length > 0 && !isSafeHttpOrRelativeUrl(cleaned)) {
    throw new ClientInputValidationError(
      `Invalid or unsafe URL scheme in "${keyName}". Only http(s) or relative paths are allowed.`,
    );
  }

  return cleaned;
}

function sanitizeRecursive(
  value: unknown,
  keyName: string,
  location: string,
  depth: number,
): unknown {
  if (depth > MAX_DEPTH) {
    throw new ClientInputValidationError(`Input nesting exceeds safe depth at ${location}.`);
  }

  if (typeof value === "string") {
    return sanitizeStringField(value, keyName, location);
  }

  if (Array.isArray(value)) {
    return value.map((item, idx) =>
      sanitizeRecursive(item, keyName, `${location}[${idx}]`, depth + 1),
    );
  }

  if (isPlainObject(value)) {
    const output: Record<string, unknown> = {};
    for (const [k, v] of Object.entries(value)) {
      if (FORBIDDEN_KEYS.has(k) || k.startsWith("$") || k.includes(".")) {
        throw new ClientInputValidationError(`Disallowed field key "${k}" detected.`);
      }
      if (k.includes("\u0000")) {
        throw new ClientInputValidationError("Null byte detected in field key.");
      }
      output[k] = sanitizeRecursive(v, k, `${location}.${k}`, depth + 1);
    }
    return output;
  }

  return value;
}

/**
 * First-line client-side defense before any form payload leaves the browser:
 * rejects NoSQL operator keys, prototype-pollution keys, null bytes, unsafe URL schemes,
 * and script/HTML injection patterns, while normalizing strings.
 */
export function sanitizeAndValidatePayload<T>(payload: T): T {
  return sanitizeRecursive(payload, "", "payload", 0) as T;
}

const MAX_CLIENT_UPLOAD_BYTES = 50 * 1024 * 1024;
const ALLOWED_UPLOAD_EXTENSIONS = new Set([
  ".jpg",
  ".jpeg",
  ".png",
  ".webp",
  ".gif",
  ".mp4",
  ".webm",
  ".mov",
  ".pdf",
  ".doc",
  ".docx",
]);

export function validateUploadFileBeforeSend(file: File): void {
  if (file.size <= 0) {
    throw new ClientInputValidationError("Selected file is empty.");
  }
  if (file.size > MAX_CLIENT_UPLOAD_BYTES) {
    throw new ClientInputValidationError("Selected file exceeds the 50 MB upload limit.");
  }
  const dotIdx = file.name.lastIndexOf(".");
  const ext = dotIdx >= 0 ? file.name.slice(dotIdx).toLowerCase() : "";
  if (!ALLOWED_UPLOAD_EXTENSIONS.has(ext)) {
    throw new ClientInputValidationError(
      `Unsupported file extension "${ext || "unknown"}". Allowed: jpg, png, webp, gif, mp4, webm, mov, pdf, doc, docx.`,
    );
  }
}
