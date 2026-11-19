"use client";

import { useMemo, useState } from "react";
import {
  Bot,
  Braces,
  BrainCircuit,
  CircuitBoard,
  Gauge,
  LayoutGrid,
  Layers,
  Navigation,
  Radio,
  Spline,
  Wrench,
} from "lucide-react";
import type { ComponentType } from "react";
import { Reveal } from "@/components/ui/Reveal";
import { SkillTag, SkillTagSkeleton } from "@/components/ui/SkillTag";
import { RichText } from "@/components/ui/RichText";
import { Skeleton } from "@/components/ui/Skeleton";
import { useI18n } from "@/lib/i18n/client";
import type { Skill } from "@/lib/types";

type LayerKey = "autonomy" | "perception" | "middleware" | "control" | "embedded" | "software" | "electronics" | "mechanical" | "fabrication";

/** Layer text (name, tier, summary) lives in the dictionary under skills.<key>Name / Tier / Summary. */
type LayerMeta = {
  order: number;
  key: LayerKey | null;
  Icon: ComponentType<{ size?: number; className?: string; strokeWidth?: number }>;
};

const LAYER_META: Record<string, LayerMeta> = {
  "Autonomy & Navigation": {
    key: "autonomy",
    order: 1,
    Icon: Navigation,
  },
  "Perception & AI": {
    key: "perception",
    order: 2,
    Icon: BrainCircuit,
  },
  "Robotics Middleware": {
    key: "middleware",
    order: 3,
    Icon: Bot,
  },
  "Control & Simulation": {
    key: "control",
    order: 4,
    Icon: Gauge,
  },
  "Embedded & Edge AI": {
    key: "embedded",
    order: 5,
    Icon: CircuitBoard,
  },
  "Software & Data": {
    key: "software",
    order: 6,
    Icon: Braces,
  },
  "Electronics & PCB": {
    key: "electronics",
    order: 7,
    Icon: Radio,
  },
  "Mechanical Design & CAD": {
    key: "mechanical",
    order: 8,
    Icon: Spline,
  },
  "Fabrication & Testing": {
    key: "fabrication",
    order: 9,
    Icon: Wrench,
  },
};

function layerNumber(index: number) {
  return `L${String(index + 1).padStart(2, "0")}`;
}

export function HomeSkillsSection({ skills }: { skills: Skill[] }) {
  const { t } = useI18n();
  const layers = useMemo(() => {
    const grouped = skills.reduce<Record<string, Skill[]>>((acc, skill) => {
      const category = skill.category || "";
      acc[category] = [...(acc[category] ?? []), skill];
      return acc;
    }, {});

    return Object.entries(grouped)
      .map(([category, items]) => {
        const meta: LayerMeta = LAYER_META[category] ?? { order: 99, key: null, Icon: CircuitBoard };
        const k = meta.key;
        return {
          category,
          items,
          meta,
          name: k ? t(`skills.${k}Name`) : category || t("skills.fallbackCategory"),
          tier: k ? t(`skills.${k}Tier`) : t("skills.fallbackTier"),
          summary: k ? t(`skills.${k}Summary`) : t("skills.fallbackSummary"),
        };
      })
      .sort((a, b) => a.meta.order - b.meta.order);
  }, [skills, t]);

  const [activeIndex, setActiveIndex] = useState(0);
  const [viewMode, setViewMode] = useState<"stack" | "matrix">("stack");

  if (!layers.length) return null;

  const activeLayer = layers[activeIndex] ?? layers[0];

  return (
    <section
      id="skills"
      className="relative w-full pt-12 pb-16 sm:pt-16 sm:pb-24"
      aria-labelledby="skills-heading"
    >
      <div className="shell relative z-10">
        {/* Editorial Header with View Toggle */}
        <Reveal className="flex flex-col lg:flex-row lg:items-end justify-between gap-6 mb-10 sm:mb-12">
          <div>
            <p className="m-0 mb-2.5 font-sans text-[11px] font-bold tracking-[0.16em] uppercase text-teal rtl:text-[13.5px]">
              {t("skills.eyebrow")}
            </p>
            <h2
              id="skills-heading"
              className="m-0 font-sans font-extrabold text-[clamp(26px,3.3vw,42px)] leading-[1.08] tracking-[-0.04em] lg:whitespace-nowrap bg-linear-to-r rtl:bg-linear-to-l from-[#102927] via-[#176b69] to-[#2b8a87] pb-[0.14em] bg-clip-text text-transparent"
            >
              {t("skills.title")}
            </h2>
          </div>

          <div className="flex flex-wrap items-center justify-between lg:justify-end gap-5">
            <p className="m-0 font-sans text-[13px] font-semibold text-[#556d6a] rtl:text-[16px]">
              <RichText text={t("skills.counts", { tools: skills.length, layers: layers.length })} />
            </p>

            {/* Clean segmented switch: Interactive Stack vs Full Matrix */}
            <div
              className="hidden sm:inline-flex items-center rounded-full bg-white p-1 shadow-[0_6px_18px_rgba(16,41,39,0.06)] border-0"
              role="tablist"
              aria-label={t("skills.modeLabel")}
            >
              <button
                type="button"
                role="tab"
                aria-selected={viewMode === "stack"}
                onClick={() => setViewMode("stack")}
                aria-label={t("skills.stackMode")}
                title={t("skills.stackMode")}
                className={`inline-flex items-center justify-center rounded-full w-10 h-10 font-sans text-[12px] font-bold cursor-pointer border-0 transition-colors duration-200 ${
                  viewMode === "stack"
                    ? "bg-linear-45 from-[#0b2220] via-[#102927] to-[#176b69] text-white"
                    : "bg-transparent text-[#526966] hover:text-[#102927]"
                }`}
              >
                <Layers size={16} aria-hidden="true" />
              </button>
              <button
                type="button"
                role="tab"
                aria-selected={viewMode === "matrix"}
                onClick={() => setViewMode("matrix")}
                aria-label={t("skills.matrixMode")}
                title={t("skills.matrixMode")}
                className={`inline-flex items-center justify-center rounded-full w-10 h-10 font-sans text-[12px] font-bold cursor-pointer border-0 transition-colors duration-200 ${
                  viewMode === "matrix"
                    ? "bg-linear-45 from-[#0b2220] via-[#102927] to-[#176b69] text-white"
                    : "bg-transparent text-[#526966] hover:text-[#102927]"
                }`}
              >
                <LayoutGrid size={16} aria-hidden="true" />
              </button>
            </div>
          </div>
        </Reveal>

        {/* Mode 1: Interactive Robotics System Stack Explorer */}
        <Reveal delay={70}>
        {/* Phones always get the card grid below; the layer explorer and the view switch are for sm and up */}
        <div className={viewMode === "stack" ? "hidden sm:block" : "hidden"}>
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-5 lg:gap-0 items-stretch">
            {/* Left Column: 9-Layer Vertical Stack Selector */}
            <div
              className="lg:col-span-5 flex flex-col gap-2"
              role="tablist"
              aria-label={t("skills.layersLabel")}
            >
              {layers.map((layer, idx) => {
                const isActive = idx === activeIndex;
                const LayerIcon = layer.meta.Icon;

                return (
                  <button
                    key={layer.category}
                    type="button"
                    role="tab"
                    aria-selected={isActive}
                    onClick={() => setActiveIndex(idx)}
                    className={`group relative flex items-center justify-between gap-3 text-start w-full rounded-s-full rounded-e-none ps-6 pe-5 lg:pe-8 py-3.5 cursor-pointer border-0 transition-colors duration-200 focus-visible:outline-2 focus-visible:outline-teal focus-visible:outline-offset-2 ${
                      isActive
                        ? "z-20 bg-white text-[#0f2422] lg:after:content-[''] lg:after:absolute lg:after:inset-y-0 lg:after:-end-[2px] lg:after:w-[3px] lg:after:bg-white"
                        : "z-10 bg-transparent text-[#3c5653] hover:text-[#102927]"
                    }`}
                  >
                    {/* Pure-CSS outward concave white horns matching the exact rounded mask technique */}
                    {isActive && idx > 0 && (
                      <span
                        className="hidden lg:block pointer-events-none absolute -top-[20px] end-0 w-[20px] h-[20px] bg-white"
                        aria-hidden="true"
                      >
                        <span className="block w-full h-full bg-[#f2f6f5] rounded-ee-[20px]" />
                      </span>
                    )}
                    {isActive && idx < layers.length - 1 && (
                      <span
                        className="hidden lg:block pointer-events-none absolute -bottom-[20px] end-0 w-[20px] h-[20px] bg-white"
                        aria-hidden="true"
                      >
                        <span className="block w-full h-full bg-[#f2f6f5] rounded-se-[20px]" />
                      </span>
                    )}
                    <div className="flex items-center gap-3.5 min-w-0">
                      <span
                        className={`font-sans text-[11px] font-extrabold tracking-[0.1em] shrink-0 ${
                          isActive ? "text-teal" : "text-[#4e8e8c]"
                        }`}
                      >
                        {layerNumber(idx)}
                      </span>

                      <span
                        className={`inline-flex items-center justify-center shrink-0 transition-colors duration-200 ${
                          isActive ? "text-teal" : "text-[#4e8e8c] group-hover:text-teal"
                        }`}
                        aria-hidden="true"
                      >
                        <LayerIcon size={17} strokeWidth={1.85} />
                      </span>

                      <span className="font-sans text-[14px] sm:text-[14.5px] font-bold tracking-[-0.015em] truncate transition-transform duration-180 ease-out-expo origin-left rtl:origin-right group-hover:scale-[1.02] rtl:text-[17px] rtl:sm:text-[17.5px]">
                        {layer.name}
                      </span>
                    </div>

                    <span
                      className={`font-sans text-[12px] font-bold shrink-0 ${
                        isActive ? "text-teal" : "text-[#7a908d]"
                      }`}
                    >
                      {String(layer.items.length).padStart(2, "0")}
                    </span>
                  </button>
                );
              })}
            </div>

            {/* Right Column: Active Layer Architectural Dossier (seamlessly fused as one continuous white body) */}
            <div
              role="tabpanel"
              className={`lg:col-span-7 relative z-10 flex flex-col justify-between rounded-[32px] sm:rounded-[40px] ${
                activeIndex === 0 ? "lg:rounded-ss-none" : ""
              } ${
                activeIndex === layers.length - 1 ? "lg:rounded-es-none" : ""
              } bg-white border-0 p-7 sm:p-10 overflow-hidden`}
            >
              {/* Subtle ambient edge tint at top-right */}
              <span
                className="pointer-events-none absolute -top-24 -end-24 w-[320px] h-[320px] rounded-full bg-radial from-[#176b69]/10 via-[#86dcd2]/8 to-transparent blur-2xl"
                aria-hidden="true"
              />

              <div className="relative z-10">
                {/* Layer Header */}
                <div className="flex items-start justify-between gap-4 pb-6 border-b border-[#e8f0ef]">
                  <div>
                    <p className="m-0 mb-1 font-sans text-[11px] font-bold tracking-[0.14em] uppercase text-teal rtl:text-[13.5px]">
                      {layerNumber(activeIndex)} · {activeLayer.tier}
                    </p>
                    <h3 className="m-0 font-sans text-[22px] sm:text-[28px] font-extrabold leading-[1.12] tracking-[-0.03em] text-[#0f2422]">
                      {activeLayer.name}
                    </h3>
                  </div>

                  <span className="font-sans text-[12px] font-bold tracking-[0.06em] uppercase text-[#6e8481] shrink-0 pt-1 rtl:text-[14.5px]">
                    {t("skills.toolsCount", { count: activeLayer.items.length })}
                  </span>
                </div>

                {/* Engineering Layer Capability Summary */}
                <p className="m-0 mt-5 mb-7 font-sans text-[14.5px] sm:text-[15.5px] leading-[1.68] text-[#4c615f] rtl:text-[17.5px] rtl:sm:text-[19px]">
                  {activeLayer.summary}
                </p>

                {/* Clean backgroundless SkillTag grid (icon + text only) */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-x-6 gap-y-4">
                  {activeLayer.items.map((item) => (
                    <SkillTag
                      key={item.id}
                      label={item.label}
                      iconName={item.icon}
                      category={activeLayer.category}
                      size="md"
                    />
                  ))}
                </div>
              </div>
            </div>
          </div>
        </div>
        <div className={viewMode === "matrix" ? "" : "sm:hidden"}>
          {/* Mode 2: Full 3x3 All-Layers Architectural Matrix */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-5">
            {layers.map((layer, idx) => {
              const LayerIcon = layer.meta.Icon;
              return (
                <article
                  key={layer.category}
                  className="group relative flex flex-col justify-between rounded-[28px] bg-white p-6 sm:p-7 border-0 shadow-[0_12px_32px_rgba(12,45,44,0.05)] overflow-hidden"
                >
                  {/* Inner-edge brand-teal mist on hover (consistent with PublicationCard) */}
                  <span
                    className="pointer-events-none absolute inset-0 rounded-[inherit] shadow-[inset_0_0_24px_rgba(23,107,105,0.22),inset_0_0_44px_rgba(38,140,137,0.12)] opacity-0 transition-opacity duration-400 ease-out group-hover:opacity-100"
                    aria-hidden="true"
                  />

                  <div className="relative z-10">
                    <div className="flex items-center justify-between gap-3 mb-4">
                      <div className="flex items-center gap-3 min-w-0">
                        <span className="inline-flex items-center justify-center text-teal shrink-0" aria-hidden="true">
                          <LayerIcon size={21} strokeWidth={1.8} />
                        </span>
                        <div className="min-w-0">
                          <span className="block font-sans text-[10.5px] font-extrabold tracking-[0.12em] uppercase text-teal rtl:text-[13px]">
                            {layerNumber(idx)}
                          </span>
                          <h3 className="m-0 font-sans text-[17px] font-bold tracking-[-0.02em] text-[#0f2422] truncate origin-left rtl:origin-right transition-transform duration-180 ease-out-expo group-hover:scale-[1.03] rtl:text-[20.5px]">
                            {layer.name}
                          </h3>
                        </div>
                      </div>

                      <span className="font-sans text-[11px] font-bold text-[#758b88] shrink-0 rtl:text-[13.5px]">
                        {String(layer.items.length).padStart(2, "0")}
                      </span>
                    </div>

                    <div className="flex flex-wrap gap-x-4 gap-y-2.5 pt-4 border-t border-[#ebf2f1]">
                      {layer.items.map((item) => (
                        <SkillTag
                          key={item.id}
                          label={item.label}
                          iconName={item.icon}
                          category={layer.category}
                          size="sm"
                        />
                      ))}
                    </div>
                  </div>
                </article>
              );
            })}
          </div>
        </div>
        </Reveal>
      </div>
    </section>
  );
}

export function SkillsSectionSkeleton() {
  return (
    <section className="relative w-full pt-12 pb-16 sm:pt-16 sm:pb-24" aria-hidden="true">
      <div className="shell relative z-10">
        <div className="flex flex-col lg:flex-row lg:items-end justify-between gap-6 mb-10 sm:mb-12">
          <div className="grid gap-2.5">
            <Skeleton className="h-3.5 w-44 rounded-full" />
            <Skeleton className="h-10 w-80 sm:w-[460px] rounded-[12px]" />
          </div>
          <div className="flex items-center gap-5">
            <Skeleton className="h-4 w-40 rounded-full" />
            <Skeleton className="h-10 w-52 rounded-full" />
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-5 lg:gap-0 items-stretch">
          <div className="lg:col-span-5 flex flex-col gap-2">
            {Array.from({ length: 9 }).map((_, idx) => (
              <div
                key={idx}
                className={`relative flex items-center justify-between gap-3 w-full rounded-s-full rounded-e-none ps-6 pe-5 lg:pe-8 py-3.5 ${
                  idx === 0 ? "z-20 bg-white" : "z-10 bg-transparent"
                }`}
              >
                {idx === 0 && (
                  <span className="hidden lg:block pointer-events-none absolute -bottom-[20px] end-0 w-[20px] h-[20px] bg-white">
                    <span className="block w-full h-full bg-[#f2f6f5] rounded-se-[20px]" />
                  </span>
                )}
                <div className="flex items-center gap-3.5">
                  <Skeleton className="h-3 w-6 rounded-full" />
                  <Skeleton className="h-4 w-4 rounded-full" />
                  <Skeleton className="h-4 w-36 rounded-full" />
                </div>
                <Skeleton className="h-3 w-5 rounded-full" />
              </div>
            ))}
          </div>

          <div className="lg:col-span-7 relative z-10 rounded-[32px] sm:rounded-[40px] lg:rounded-ss-none bg-white border-0 p-7 sm:p-10">
            <div className="flex items-start justify-between gap-4 pb-6 border-b border-[#e8f0ef]">
              <div className="grid gap-2">
                <Skeleton className="h-3 w-44 rounded-full" />
                <Skeleton className="h-7 w-64 rounded-[8px]" />
              </div>
              <Skeleton className="h-3.5 w-16 rounded-full" />
            </div>

            <div className="mt-5 mb-7 grid gap-2">
              <Skeleton className="h-4 w-full rounded-full" />
              <Skeleton className="h-4 w-[82%] rounded-full" />
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-x-6 gap-y-4">
              {Array.from({ length: 6 }).map((_, i) => (
                <SkillTagSkeleton key={i} size="md" />
              ))}
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
