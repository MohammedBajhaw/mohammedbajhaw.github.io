"use client";

import { useEffect, useState } from "react";
import { ArrowUpRight, Mail } from "lucide-react";
import { ApiError, resourceApi, settingsApi, type ApiRecord } from "@/lib/admin/api";
import type { ViewKey } from "@/lib/admin/nav";
import { FormButton, FormMessage } from "@/components/forms";
import { Card, Eyebrow, Spinner } from "./ui";

type Summary = {
  profile: boolean;
  counts: Partial<Record<ViewKey, number>>;
  unread: number;
  recent: ApiRecord[];
  maintenance: boolean;
  failed: string[];
};

const TILES: { key: ViewKey; label: string }[] = [
  { key: "projects", label: "Projects" },
  { key: "publications", label: "Publications" },
  { key: "services", label: "Service areas" },
  { key: "skills", label: "Skills" },
  { key: "experiences", label: "Experience" },
  { key: "education", label: "Education" },
];

const text = (value: unknown) => (typeof value === "string" ? value : "");
const ago = (value: unknown) => {
  const seconds = Math.max(0, (Date.now() - new Date(text(value)).getTime()) / 1000);
  if (!Number.isFinite(seconds)) return "";
  if (seconds < 90) return "just now";
  if (seconds < 3600) return `${Math.round(seconds / 60)} min ago`;
  if (seconds < 86400) return `${Math.round(seconds / 3600)} h ago`;
  return `${Math.round(seconds / 86400)} d ago`;
};

/** First screen: how much content is live, what needs attention, and what the API did last. */
export function Dashboard({ onNavigate }: { onNavigate: (view: ViewKey) => void }) {
  const [summary, setSummary] = useState<Summary | null>(null);
  const [error, setError] = useState("");

  useEffect(() => {
    let active = true;
    const total = (path: string) => resourceApi.page(path, 1, 1).then((reply) => reply.meta?.total ?? reply.data.length);
    const length = (path: string) => resourceApi.list(path).then((items) => items.length);

    Promise.allSettled([
      total("/projects"),
      total("/publications"),
      total("/services"),
      length("/profile/skills"),
      length("/profile/experiences"),
      length("/profile/education"),
      resourceApi.get("/profile").then(() => true).catch((failure: unknown) => (failure instanceof ApiError && failure.status === 404 ? false : Promise.reject(failure))),
      resourceApi.page("/profile/contact", 1, 100),
      resourceApi.page("/audit-logs", 1, 6),
      settingsApi.maintenance(),
    ])
      .then((results) => {
        if (!active) return;
        const [projects, publications, services, skills, experiences, education, profile, messages, audit, maintenance] = results;
        const failed: string[] = [];
        const value = <T,>(result: PromiseSettledResult<T>, label: string): T | undefined => {
          if (result.status === "fulfilled") return result.value;
          failed.push(label);
          return undefined;
        };
        const messageReply = value(messages, "messages");
        const unread = messageReply?.data.filter((item) => item.status === "new").length ?? 0;
        setSummary({
          profile: value(profile, "profile") ?? false,
          counts: {
            projects: value(projects, "projects"),
            publications: value(publications, "publications"),
            services: value(services, "services"),
            skills: value(skills, "skills"),
            experiences: value(experiences, "experience"),
            education: value(education, "education"),
          },
          unread,
          recent: value(audit, "activity")?.data ?? [],
          maintenance: value(maintenance, "maintenance")?.enabled ?? false,
          failed,
        });
        if (failed.length === results.length) setError("The dashboard could not reach the API. Check that the server is running.");
      })
      .catch(() => {
        if (active) setError("The dashboard could not load.");
      });
    return () => {
      active = false;
    };
  }, []);

  return (
    <div className="grid gap-5 lg:gap-6">
      <header>
        <Eyebrow>Overview</Eyebrow>
        <h1 className="m-0 mt-2 font-sans text-[clamp(28px,3.4vw,40px)] font-extrabold leading-[1.08] tracking-[-0.04em] text-[#0f2422]">Welcome back</h1>
        <p className="m-0 mt-2 max-w-[620px] font-sans text-[14.5px] leading-[1.65] text-[#526563]">Manage everything the public site shows, in English, Arabic and Turkish.</p>
      </header>

      {error && <FormMessage tone="error">{error}</FormMessage>}
      {!summary && !error && <Spinner label="Loading your overview" />}

      {summary && (
        <>
          {!summary.profile && (
            <Card className="flex flex-wrap items-center justify-between gap-4 bg-[#fff8ec]!">
              <div>
                <Eyebrow>First step</Eyebrow>
                <p className="m-0 mt-2 font-sans text-[16px] font-bold text-[#0f2422]">Your profile is not set up yet.</p>
                <p className="m-0 mt-1 font-sans text-[14px] text-[#526563]">The home and About pages read from it.</p>
              </div>
              <FormButton onClick={() => onNavigate("profile")}>Set up profile</FormButton>
            </Card>
          )}

          {summary.maintenance && (
            <Card className="flex flex-wrap items-center justify-between gap-4 bg-[#fff6e6]!">
              <div>
                <Eyebrow>Maintenance mode</Eyebrow>
                <p className="m-0 mt-2 font-sans text-[16px] font-bold text-[#0f2422]">Visitors currently see the maintenance screen.</p>
              </div>
              <FormButton onClick={() => onNavigate("settings")}>Open settings</FormButton>
            </Card>
          )}

          {summary.unread > 0 && (
            <Card className="flex flex-wrap items-center justify-between gap-4 bg-[#0b2220]! text-white">
              <div className="flex items-center gap-4">
                <span className="grid size-12 place-items-center rounded-full bg-[#17332f] text-[#86dcd2]"><Mail size={22} aria-hidden="true" /></span>
                <div>
                  <p className="m-0 font-sans text-[18px] font-bold text-white">{summary.unread} new {summary.unread === 1 ? "message" : "messages"}</p>
                  <p className="m-0 mt-0.5 font-sans text-[14px] text-[#aab3b2]">Visitors are waiting for a reply.</p>
                </div>
              </div>
              <FormButton variant="ghost" onClick={() => onNavigate("messages")}>Open inbox</FormButton>
            </Card>
          )}

          <div className="grid grid-cols-2 gap-4 py-2 sm:grid-cols-3 sm:gap-6">
            {TILES.map((tile) => (
              <button
                key={tile.key}
                type="button"
                onClick={() => onNavigate(tile.key)}
                className="group flex flex-col items-start gap-1 border-0 bg-transparent px-2 py-2 text-start shadow-none cursor-pointer focus-visible:outline-2 focus-visible:outline-teal"
              >
                <strong className="font-sans text-[clamp(34px,4vw,48px)] font-extrabold leading-none tracking-[-0.04em] bg-linear-to-r from-[#102927] via-[#176b69] to-[#2b8a87] bg-clip-text pb-[0.1em] text-transparent">
                  {summary.counts[tile.key] ?? "–"}
                </strong>
                <span className="inline-flex items-center gap-1.5 font-sans text-[14px] font-bold text-[#41605b] transition-transform duration-180 ease-out-expo group-hover:scale-105 group-hover:text-[#0c4545]">
                  <span>{tile.label}</span>
                  <ArrowUpRight size={14} className="text-teal" aria-hidden="true" />
                </span>
              </button>
            ))}
          </div>

          <section className="py-2">
            <div className="mb-3 flex items-center justify-between gap-3">
              <Eyebrow>Recent activity</Eyebrow>
              <button type="button" onClick={() => onNavigate("activity")} className="border-0 bg-transparent p-0 font-sans text-[13px] font-bold text-teal cursor-pointer">See all</button>
            </div>
            {summary.recent.length === 0 ? (
              <p className="m-0 font-sans text-[14.5px] text-[#526563]">Nothing recorded yet.</p>
            ) : (
              <ul className="m-0 grid list-none gap-0 p-0">
                {summary.recent.map((item) => (
                  <li key={String(item.id)} className="flex items-center justify-between gap-4 border-b border-[#dde7e4] py-3 last:border-b-0">
                    <span className="min-w-0 truncate font-sans text-[14px] font-semibold text-[#0f2422]">{text(item.action) || `${text(item.method)} ${text(item.path)}`}</span>
                    <span className={`shrink-0 font-mono text-[12px] font-bold ${item.outcome === "error" ? "text-[#a32a2a]" : "text-[#6b7f7d]"}`}>{ago(item.createdAt)}</span>
                  </li>
                ))}
              </ul>
            )}
          </section>

          {summary.failed.length > 0 && summary.failed.length < 10 && <FormMessage tone="error">Some figures could not load: {summary.failed.join(", ")}.</FormMessage>}
        </>
      )}
    </div>
  );
}
