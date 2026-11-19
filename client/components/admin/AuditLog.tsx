"use client";

import { useEffect, useState } from "react";
import { ChevronLeft, ChevronRight } from "lucide-react";
import { ApiError, resourceApi, type ApiRecord, type PaginationMeta } from "@/lib/admin/api";
import { FormMessage } from "@/components/forms";
import { Card, Eyebrow, IconButton, Spinner } from "./ui";

const PAGE = 20;
const text = (value: unknown) => (typeof value === "string" ? value : "");
const when = (value: unknown) => {
  const date = new Date(text(value));
  return Number.isNaN(date.getTime()) ? "" : date.toLocaleString("en-GB", { day: "2-digit", month: "short", hour: "2-digit", minute: "2-digit", second: "2-digit" });
};

/** Read-only trail of what happened on the API: who changed what, when, and whether it worked. */
export function AuditLog() {
  const [page, setPage] = useState(1);
  const [items, setItems] = useState<ApiRecord[] | null>(null);
  const [meta, setMeta] = useState<PaginationMeta | null>(null);
  const [error, setError] = useState("");
  const [onlyErrors, setOnlyErrors] = useState(false);

  useEffect(() => {
    let active = true;
    resourceApi
      .page("/audit-logs", page, PAGE)
      .then(({ data, meta: nextMeta }) => {
        if (!active) return;
        setItems(data);
        setMeta(nextMeta ?? null);
      })
      .catch((failure: unknown) => {
        if (active) setError(failure instanceof ApiError ? failure.readable : "Could not load the activity log.");
      });
    return () => {
      active = false;
    };
  }, [page]);

  const visible = (items ?? []).filter((item) => !onlyErrors || item.outcome === "error");

  return (
    <div className="grid gap-5 lg:gap-6">
      <header className="flex flex-wrap items-end justify-between gap-4">
        <div>
          <Eyebrow>Inbox &amp; activity</Eyebrow>
          <h1 className="m-0 mt-2 font-sans text-[clamp(28px,3.4vw,40px)] font-extrabold leading-[1.08] tracking-[-0.04em] text-[#0f2422]">Activity log</h1>
          <p className="m-0 mt-2 max-w-[620px] font-sans text-[14.5px] leading-[1.65] text-[#526563]">Requests the API handled, newest first.</p>
        </div>
        <button
          type="button"
          aria-pressed={onlyErrors}
          onClick={() => setOnlyErrors((current) => !current)}
          className={`h-11 rounded-full border-0 px-5 font-sans text-[14px] font-semibold cursor-pointer transition-colors duration-150 ${onlyErrors ? "bg-[#fbeeee] text-[#a32a2a]" : "bg-white text-[#102927] shadow-[0_6px_18px_rgba(16,41,39,0.07)] hover:bg-[#e5efed]"}`}
        >
          {onlyErrors ? "Showing errors only" : "Show errors only"}
        </button>
      </header>

      {error && <FormMessage tone="error">{error}</FormMessage>}
      {items === null && !error && <Spinner label="Loading activity" />}

      {items !== null && (
        <Card className="overflow-hidden p-0! sm:p-0!">
          {visible.length === 0 ? (
            <p className="m-0 px-6 py-12 text-center font-sans text-[14.5px] text-[#526563]">{onlyErrors ? "No errors on this page." : "No activity recorded yet."}</p>
          ) : (
            <ul className="m-0 list-none p-0">
              {visible.map((item) => {
                const failed = item.outcome === "error";
                return (
                  <li key={String(item.id)} className="grid gap-1 border-b border-[#eef3f1] px-5 py-4 last:border-b-0 sm:grid-cols-[150px_minmax(0,1fr)_auto] sm:items-center sm:gap-5 sm:px-7">
                    <time className="font-mono text-[12px] font-bold text-[#6b7f7d]" dateTime={text(item.createdAt)}>{when(item.createdAt)}</time>
                    <div className="min-w-0">
                      <p className="m-0 truncate font-sans text-[14.5px] font-bold text-[#0f2422]">{text(item.action) || `${text(item.method)} ${text(item.path)}`}</p>
                      <p className="m-0 truncate font-mono text-[12px] text-[#6b7f7d]">{text(item.method)} {text(item.path)}{text(item.actor) ? ` · ${text(item.actor)}` : ""}</p>
                    </div>
                    <p className={`m-0 font-mono text-[12px] font-bold ${failed ? "text-[#a32a2a]" : "text-teal"}`}>
                      {String(item.statusCode ?? "")} · {String(item.durationMs ?? 0)} ms{failed && text(item.errorCode) ? ` · ${text(item.errorCode)}` : ""}
                    </p>
                  </li>
                );
              })}
            </ul>
          )}
        </Card>
      )}

      {meta && meta.totalPages > 1 && (
        <div className="flex items-center justify-center gap-4">
          <IconButton label="Newer entries" disabled={!meta.hasPreviousPage} onClick={() => setPage((current) => current - 1)}><ChevronLeft size={18} /></IconButton>
          <span className="font-mono text-[12px] font-bold text-[#6b7f7d]">{meta.page} / {meta.totalPages}</span>
          <IconButton label="Older entries" disabled={!meta.hasNextPage} onClick={() => setPage((current) => current + 1)}><ChevronRight size={18} /></IconButton>
        </div>
      )}
    </div>
  );
}
