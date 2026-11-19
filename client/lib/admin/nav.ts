import { CloudUpload, Gauge, History, Languages, Mail, SlidersHorizontal, type LucideIcon } from "lucide-react";
import { RESOURCES, type ResourceKey } from "./resources";

export type ViewKey = "dashboard" | ResourceKey | "messages" | "activity" | "settings" | "translation" | "backup";

export type NavItem = { key: ViewKey; label: string; icon: LucideIcon };
export type NavGroup = { group: string; items: NavItem[] };

const fromResources = (group: string): NavItem[] => RESOURCES.filter((resource) => resource.group === group).map(({ key, label, icon }) => ({ key, label, icon }));

/** Sidebar structure: the groups of the original studio, plus the overview and the inbox/activity screens. */
/** The top bar: single links and drop-down menus for the groups that hold several sections. */
export type BarEntry = { type: "link"; item: NavItem } | { type: "menu"; label: string; items: NavItem[] };

export const NAV: NavGroup[] = [
  { group: "Overview", items: [{ key: "dashboard", label: "Dashboard", icon: Gauge }] },
  { group: "Portfolio foundation", items: fromResources("Portfolio foundation") },
  { group: "Work", items: fromResources("Work") },
  {
    group: "Platform",
    items: [
      { key: "settings", label: "Platform settings", icon: SlidersHorizontal },
      { key: "translation", label: "Translation", icon: Languages },
      { key: "backup", label: "Backups", icon: CloudUpload },
    ],
  },
  {
    group: "Inbox & activity",
    items: [
      { key: "messages", label: "Messages", icon: Mail },
      { key: "activity", label: "Activity log", icon: History },
    ],
  },
];

const items = (group: string) => NAV.find((entry) => entry.group === group)!.items;
export const NAV_BAR: BarEntry[] = [
  { type: "link", item: items("Overview")[0]! },
  { type: "menu", label: "Portfolio", items: items("Portfolio foundation") },
  { type: "menu", label: "Work", items: items("Work") },
  { type: "menu", label: "Platform", items: items("Platform") },
  ...items("Inbox & activity").map((item): BarEntry => ({ type: "link", item })),
];
