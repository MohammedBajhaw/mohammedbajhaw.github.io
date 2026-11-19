"use client";

import { useEffect, useState } from "react";
import { ArrowLeft, ChevronLeft, ChevronRight, Mail, Reply, Trash2 } from "lucide-react";
import { ApiError, resourceApi, type ApiRecord, type PaginationMeta } from "@/lib/admin/api";
import { FormButton, FormMessage, SegmentedControl } from "@/components/forms";
import { Card, ConfirmDialog, Eyebrow, IconButton, Spinner } from "./ui";

const STATUSES = ["new", "read", "replied", "archived"] as const;
type Status = (typeof STATUSES)[number];
const PAGE = 15;

const text = (value: unknown) => (typeof value === "string" ? value : "");
const when = (value: unknown) => {
  const date = new Date(text(value));
  return Number.isNaN(date.getTime()) ? "" : date.toLocaleString("en-GB", { day: "2-digit", month: "short", year: "numeric", hour: "2-digit", minute: "2-digit" });
};
const TONE: Record<Status, string> = { new: "text-[#b0651d]", read: "text-[#6b7f7d]", replied: "text-teal", archived: "text-[#8aa19d]" };

/** Messages sent through the public contact form. Opening one marks it read; the owner can mark it replied or archive it. */
export function MessagesInbox({ onUnreadChange }: { onUnreadChange?: (count: number) => void }) {
  const [page, setPage] = useState(1);
  const [items, setItems] = useState<ApiRecord[] | null>(null);
  const [meta, setMeta] = useState<PaginationMeta | null>(null);
  const [error, setError] = useState("");
  const [selected, setSelected] = useState<ApiRecord | null>(null);
  const [confirmDelete, setConfirmDelete] = useState(false);
  const [busy, setBusy] = useState(false);

  useEffect(() => {
    let active = true;
    resourceApi
      .page("/profile/contact", page, PAGE)
      .then(({ data, meta: nextMeta }) => {
        if (!active) return;
        setItems(data);
        setMeta(nextMeta ?? null);
        onUnreadChange?.(data.filter((item) => item.status === "new").length);
      })
      .catch((failure: unknown) => {
        if (active) setError(failure instanceof ApiError ? failure.readable : "Could not load the messages.");
      });
    return () => {
      active = false;
    };
  }, [page, onUnreadChange]);

  async function setStatus(message: ApiRecord, status: Status) {
    setBusy(true);
    setError("");
    try {
      const updated = await resourceApi.update(`/profile/contact/${message.id}`, { status });
      const merged = { ...message, ...updated };
      setItems((current) => (current ?? []).map((item) => (item.id === message.id ? merged : item)));
      setSelected((current) => (current?.id === message.id ? merged : current));
    } catch (failure) {
      setError(failure instanceof ApiError ? failure.readable : "Could not update the message.");
    } finally {
      setBusy(false);
    }
  }

  function openMessage(message: ApiRecord) {
    setSelected(message);
    if (message.status === "new") void setStatus(message, "read");
  }

  async function remove() {
    if (!selected) return;
    setBusy(true);
    try {
      await resourceApi.remove(`/profile/contact/${selected.id}`);
      setItems((current) => (current ?? []).filter((item) => item.id !== selected.id));
      setSelected(null);
    } catch (failure) {
      setError(failure instanceof ApiError ? failure.readable : "Could not delete the message.");
    } finally {
      setBusy(false);
      setConfirmDelete(false);
    }
  }

  return (
    <div className="grid gap-5 lg:gap-6">
      <header>
        <Eyebrow>Inbox</Eyebrow>
        <h1 className="m-0 mt-2 font-sans text-[clamp(28px,3.4vw,40px)] font-extrabold leading-[1.08] tracking-[-0.04em] text-[#0f2422]">Messages</h1>
        <p className="m-0 mt-2 max-w-[620px] font-sans text-[14.5px] leading-[1.65] text-[#526563]">What visitors send through the contact form.</p>
      </header>

      {error && <FormMessage tone="error">{error}</FormMessage>}
      {items === null && !error && <Spinner label="Loading messages" />}

      {items !== null && (
        <div className="grid gap-5 lg:grid-cols-[380px_minmax(0,1fr)] lg:gap-6">
          <Card className={`${selected ? "hidden lg:block" : ""} h-fit`}>
            {items.length === 0 ? (
              <div className="grid justify-items-center gap-3 px-3 py-10 text-center">
                <Mail size={22} className="text-teal" aria-hidden="true" />
                <p className="m-0 font-sans text-[14.5px] text-[#526563]">No messages yet.</p>
              </div>
            ) : (
              <ul className="m-0 grid list-none gap-1 p-0">
                {items.map((message) => {
                  const status = (STATUSES.find((value) => value === message.status) ?? "read") as Status;
                  const active = selected?.id === message.id;
                  return (
                    <li key={String(message.id)}>
                      <button
                        type="button"
                        onClick={() => openMessage(message)}
                        aria-current={active}
                        className={`flex w-full flex-col gap-1 rounded-[18px] border-0 px-4 py-3 text-start cursor-pointer transition-colors duration-150 focus-visible:outline-2 focus-visible:outline-teal ${active ? "bg-[#e5efed]" : "bg-transparent hover:bg-[#f4f8f7]"}`}
                      >
                        <span className="flex items-baseline justify-between gap-3">
                          <strong className={`truncate font-sans text-[14.5px] ${status === "new" ? "font-extrabold text-[#0f2422]" : "font-semibold text-[#41605b]"}`}>{text(message.name)}</strong>
                          <small className={`shrink-0 font-mono text-[11px] font-bold uppercase tracking-[0.08em] ${TONE[status]}`}>{status}</small>
                        </span>
                        <span className="truncate font-sans text-[13.5px] text-[#526563]">{text(message.subject) || text(message.message)}</span>
                        <small className="font-sans text-[12px] text-[#8aa19d]">{when(message.createdAt)}</small>
                      </button>
                    </li>
                  );
                })}
              </ul>
            )}
            {meta && meta.totalPages > 1 && (
              <div className="mt-4 flex items-center justify-between gap-3">
                <IconButton label="Newer messages" disabled={!meta.hasPreviousPage} onClick={() => setPage((current) => current - 1)}><ChevronLeft size={18} /></IconButton>
                <span className="font-mono text-[12px] font-bold text-[#6b7f7d]">{meta.page} / {meta.totalPages}</span>
                <IconButton label="Older messages" disabled={!meta.hasNextPage} onClick={() => setPage((current) => current + 1)}><ChevronRight size={18} /></IconButton>
              </div>
            )}
          </Card>

          <div className={selected ? "" : "hidden lg:block"}>
            {selected ? (
              <Card className="grid gap-5">
                <button type="button" onClick={() => setSelected(null)} className="inline-flex w-fit items-center gap-1.5 border-0 bg-transparent p-0 font-sans text-[13px] font-bold text-teal cursor-pointer lg:hidden">
                  <ArrowLeft size={15} aria-hidden="true" /> All messages
                </button>
                <div>
                  <Eyebrow>{when(selected.createdAt)}</Eyebrow>
                  <h2 className="m-0 mt-2 break-words font-sans text-[22px] font-bold leading-[1.25] tracking-[-0.02em] text-[#0f2422]">{text(selected.subject) || `Message from ${text(selected.name)}`}</h2>
                  <p className="m-0 mt-2 font-sans text-[14.5px] text-[#526563]">
                    {text(selected.name)} · <a className="font-bold text-teal underline underline-offset-4" href={`mailto:${text(selected.email)}`}>{text(selected.email)}</a>
                    {text(selected.service) && <> · {text(selected.service)}</>}
                  </p>
                </div>
                <p className="m-0 whitespace-pre-wrap break-words rounded-[22px] bg-[#f4f8f7] px-5 py-4 font-sans text-[15.5px] leading-[1.75] text-ink" dir="auto">{text(selected.message)}</p>

                <div className="grid gap-2">
                  <p className="m-0 font-sans text-[13px] font-bold text-[#41605b]">Status</p>
                  <SegmentedControl
                    label="Message status"
                    value={(STATUSES.find((value) => value === selected.status) ?? "read") as Status}
                    onChange={(status) => void setStatus(selected, status)}
                    options={STATUSES.map((status) => ({ value: status, label: status[0]!.toUpperCase() + status.slice(1), disabled: busy }))}
                  />
                </div>

                <div className="flex flex-wrap gap-3">
                  <a
                    href={`mailto:${text(selected.email)}?subject=${encodeURIComponent(`Re: ${text(selected.subject) || "your message"}`)}`}
                    onClick={() => void setStatus(selected, "replied")}
                    className="group inline-flex h-11 items-center gap-2 rounded-full bg-linear-45 from-[#0c4545] via-[#176b69] to-[#268c89] px-6 font-sans text-[14px] font-semibold text-white no-underline shadow-[0_10px_22px_rgba(12,69,69,0.26)]"
                  >
                    <Reply size={16} aria-hidden="true" /> Reply by email
                  </a>
                  <FormButton variant="danger" icon={<Trash2 size={16} aria-hidden="true" />} onClick={() => setConfirmDelete(true)}>
                    Delete
                  </FormButton>
                </div>
              </Card>
            ) : (
              <Card className="grid place-items-center gap-3 py-16 text-center">
                <Mail size={26} className="text-teal" aria-hidden="true" />
                <h2 className="m-0 font-sans text-[22px] font-bold tracking-[-0.02em] text-[#0f2422]">Select a message</h2>
              </Card>
            )}
          </div>
        </div>
      )}

      {confirmDelete && (
        <ConfirmDialog title="Delete this message?" body="It is removed permanently and cannot be recovered." confirmLabel="Delete message" busy={busy} onConfirm={() => void remove()} onCancel={() => setConfirmDelete(false)} />
      )}
    </div>
  );
}
