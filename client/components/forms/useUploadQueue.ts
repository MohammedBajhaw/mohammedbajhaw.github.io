"use client";

import { useCallback, useEffect, useReducer, useRef } from "react";

/**
 * The logic of uploading, kept apart from how it looks. It validates files, runs the uploads, tracks progress, and lets the
 * caller cancel or retry. It does not know about any server: the caller passes an `upload` function, which makes the
 * same components usable for any backend (or none, in tests).
 */

export type UploadResult = { url: string; name?: string };
export type UploadControls = { onProgress: (percent: number) => void; signal: AbortSignal };
/** Sends one file and resolves with where it ended up. Report progress through `onProgress` and stop when `signal` aborts. */
export type UploadFn = (file: File, controls: UploadControls) => Promise<UploadResult>;

export type QueueStatus = "uploading" | "done" | "error";
export type QueueItem = { id: string; file: File; status: QueueStatus; progress: number; error?: string; previewUrl?: string };

export type UploadMessages = {
  tooBig: (name: string, maxMB: number) => string;
  wrongType: (name: string) => string;
  failed: string;
};

export const DEFAULT_UPLOAD_MESSAGES: UploadMessages = {
  tooBig: (name, maxMB) => `${name} is larger than ${maxMB} MB.`,
  wrongType: (name) => `${name} is not an allowed file type.`,
  failed: "The upload failed.",
};

/** Ready-made lists for the `accept` option. */
export const ACCEPT = {
  image: ["image/jpeg", "image/png", "image/webp", "image/gif"],
  document: ["application/pdf", ".doc", ".docx"],
  video: ["video/mp4", "video/webm", "video/quicktime"],
} as const;

type Action =
  | { type: "add"; items: QueueItem[] }
  | { type: "progress"; id: string; progress: number }
  | { type: "done"; id: string }
  | { type: "fail"; id: string; error: string }
  | { type: "restart"; id: string }
  | { type: "remove"; id: string };

function reducer(state: QueueItem[], action: Action): QueueItem[] {
  switch (action.type) {
    case "add":
      return [...state, ...action.items];
    case "progress":
      return state.map((item) => (item.id === action.id ? { ...item, progress: action.progress } : item));
    case "done":
      return state.map((item) => (item.id === action.id ? { ...item, status: "done", progress: 100 } : item));
    case "fail":
      return state.map((item) => (item.id === action.id ? { ...item, status: "error", error: action.error } : item));
    case "restart":
      return state.map((item) => (item.id === action.id ? { ...item, status: "uploading", progress: 0, error: undefined } : item));
    case "remove":
      return state.filter((item) => item.id !== action.id);
  }
}

/** Does the file match one entry of an `accept` list: "image/*", "application/pdf" or ".pdf"? */
export function matchesAccept(file: File, accept?: readonly string[]) {
  if (!accept || accept.length === 0) return true;
  const name = file.name.toLowerCase();
  return accept.some((rule) => {
    const pattern = rule.toLowerCase();
    if (pattern.startsWith(".")) return name.endsWith(pattern);
    if (pattern.endsWith("/*")) return file.type.toLowerCase().startsWith(pattern.slice(0, -1));
    return file.type.toLowerCase() === pattern;
  });
}

export type UploadQueueOptions = {
  upload: UploadFn;
  onUploaded: (result: UploadResult, file: File) => void;
  onError?: (message: string) => void;
  accept?: readonly string[];
  maxSizeMB?: number;
  /** Finished rows disappear after this many milliseconds (0 keeps them). */
  autoClearMs?: number;
  messages?: Partial<UploadMessages>;
};

let counter = 0;
const nextId = () => `upload-${Date.now().toString(36)}-${counter++}`;

export function useUploadQueue(options: UploadQueueOptions) {
  const [items, dispatch] = useReducer(reducer, [] as QueueItem[]);
  const latest = useRef(options);
  const controllers = useRef(new Map<string, AbortController>());
  const timers = useRef(new Set<number>());
  const previews = useRef(new Map<string, string>());
  const filesById = useRef(new Map<string, File>());

  useEffect(() => {
    latest.current = options;
  });

  // On unmount: stop what is still running and free the preview URLs.
  useEffect(() => {
    const running = controllers.current;
    const pending = timers.current;
    const urls = previews.current;
    return () => {
      running.forEach((controller) => controller.abort());
      pending.forEach((timer) => window.clearTimeout(timer));
      urls.forEach((url) => URL.revokeObjectURL(url));
    };
  }, []);

  const release = useCallback((id: string) => {
    const url = previews.current.get(id);
    if (url) URL.revokeObjectURL(url);
    previews.current.delete(id);
    controllers.current.delete(id);
    filesById.current.delete(id);
  }, []);

  const run = useCallback(
    async (id: string, file: File) => {
      const controller = new AbortController();
      controllers.current.set(id, controller);
      try {
        const result = await latest.current.upload(file, { onProgress: (progress) => dispatch({ type: "progress", id, progress }), signal: controller.signal });
        dispatch({ type: "done", id });
        latest.current.onUploaded(result, file);
        const wait = latest.current.autoClearMs ?? 2500;
        if (wait > 0) {
          const timer = window.setTimeout(() => {
            timers.current.delete(timer);
            release(id);
            dispatch({ type: "remove", id });
          }, wait);
          timers.current.add(timer);
        }
      } catch (failure) {
        if (controller.signal.aborted) {
          release(id);
          dispatch({ type: "remove", id });
          return;
        }
        const messages = { ...DEFAULT_UPLOAD_MESSAGES, ...latest.current.messages };
        // Errors may carry a fuller `readable` sentence (the studio's ApiError does); otherwise use the plain message.
        const readable = (failure as { readable?: unknown } | null)?.readable;
        const message = typeof readable === "string" && readable ? readable : failure instanceof Error && failure.message ? failure.message : messages.failed;
        dispatch({ type: "fail", id, error: message });
        latest.current.onError?.(message);
      }
    },
    [release],
  );

  /** Validates and starts uploading the given files. Rejected files are reported through `onError`. */
  const add = useCallback(
    (files: FileList | File[]) => {
      const messages = { ...DEFAULT_UPLOAD_MESSAGES, ...latest.current.messages };
      const accepted: QueueItem[] = [];
      for (const file of Array.from(files)) {
        if (!matchesAccept(file, latest.current.accept)) {
          latest.current.onError?.(messages.wrongType(file.name));
          continue;
        }
        const max = latest.current.maxSizeMB;
        if (max && file.size > max * 1024 * 1024) {
          latest.current.onError?.(messages.tooBig(file.name, max));
          continue;
        }
        const id = nextId();
        filesById.current.set(id, file);
        const previewUrl = file.type.startsWith("image/") ? URL.createObjectURL(file) : undefined;
        if (previewUrl) previews.current.set(id, previewUrl);
        accepted.push({ id, file, status: "uploading", progress: 0, previewUrl });
      }
      if (!accepted.length) return;
      dispatch({ type: "add", items: accepted });
      for (const item of accepted) void run(item.id, item.file);
    },
    [run],
  );

  const cancel = useCallback((id: string) => controllers.current.get(id)?.abort(), []);
  const remove = useCallback(
    (id: string) => {
      controllers.current.get(id)?.abort();
      release(id);
      dispatch({ type: "remove", id });
    },
    [release],
  );
  const retry = useCallback(
    (id: string) => {
      const file = filesById.current.get(id);
      if (!file) return;
      dispatch({ type: "restart", id });
      void run(id, file);
    },
    [run],
  );

  const active = items.filter((item) => item.status === "uploading");
  const overall = active.length ? Math.round(active.reduce((sum, item) => sum + item.progress, 0) / active.length) : 0;
  return { items, add, cancel, remove, retry, busy: active.length > 0, overall };
}
