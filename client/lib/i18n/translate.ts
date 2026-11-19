import type en from "@/messages/en";

/** The English dictionary is the source of truth for the shape (and the keys) of every other locale. */
export type Messages = typeof en;
export type DeepPartial<T> = T extends readonly unknown[] ? T : T extends object ? { [K in keyof T]?: DeepPartial<T[K]> } : T;

type Paths<T, P extends string = ""> = {
  [K in keyof T & string]: T[K] extends string | readonly string[] ? `${P}${K}` : Paths<T[K], `${P}${K}.`>;
}[keyof T & string];
export type MessageKey = Paths<Messages>;

export type Translator = {
  /** Look up a string and fill `{placeholders}`. Falls back to the key itself so a gap is visible, never a crash. */
  t: (key: MessageKey, vars?: Record<string, string | number>) => string;
  /** Look up a list of strings (paragraphs, bullet points). */
  list: (key: MessageKey) => string[];
};

function lookup(messages: unknown, key: string): unknown {
  return key
    .split(".")
    .reduce<unknown>((node, part) => (node && typeof node === "object" ? (node as Record<string, unknown>)[part] : undefined), messages);
}

export function createTranslator(messages: Messages): Translator {
  return {
    t(key, vars) {
      const value = lookup(messages, key);
      const text = typeof value === "string" ? value : key;
      return vars ? text.replace(/\{(\w+)\}/g, (_, name: string) => (name in vars ? String(vars[name]) : `{${name}}`)) : text;
    },
    list(key) {
      const value = lookup(messages, key);
      return Array.isArray(value) ? (value as string[]) : [];
    },
  };
}

/** Overlay a (possibly partial) locale dictionary on the English one so a missing key never renders empty. */
export function mergeMessages<T>(base: T, override: DeepPartial<T> | undefined): T {
  if (!override) return base;
  if (Array.isArray(base)) return (Array.isArray(override) && override.length ? override : base) as T;
  if (base && typeof base === "object") {
    const out: Record<string, unknown> = { ...(base as Record<string, unknown>) };
    for (const [key, value] of Object.entries(override as Record<string, unknown>)) {
      if (value === undefined || value === null || value === "") continue;
      out[key] = key in out ? mergeMessages(out[key], value as never) : value;
    }
    return out as T;
  }
  return (override ?? base) as T;
}
