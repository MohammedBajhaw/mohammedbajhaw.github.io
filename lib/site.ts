/**
 * Central site identity for SEO. When the custom domain is live, set NEXT_PUBLIC_SITE_URL
 * (GitHub: Settings > Secrets and variables > Actions > Variables); it defaults to the production domain.
 */
export const SITE_URL = (process.env.NEXT_PUBLIC_SITE_URL || "https://bajhaw.com").replace(/\/+$/, "");
export const SITE_NAME = "Mohammed Bajhaw";
export const SITE_TITLE = "Mohammed Bajhaw | Robotics & Autonomous Systems Engineer";
export const SITE_DESCRIPTION = "Portfolio of Mohammed Bajhaw, a mechatronics engineer working on autonomous robots, LiDAR-inertial SLAM, UAV mapping, embedded systems and edge AI. Projects, publications and engineering services.";
export const SITE_KEYWORDS = [
  "Mohammed Bajhaw", "robotics engineer", "mechatronics engineer", "autonomous systems", "LiDAR SLAM", "RKO-LIO", "UAV mapping",
  "GPS-denied navigation", "ROS 2", "embedded systems", "edge AI", "search and rescue robots", "Fırat University",
];
export const SOCIAL_IMAGE = "/og-image.jpg";

export function absoluteUrl(path = "/") {
  return `${SITE_URL}${path.startsWith("/") ? path : `/${path}`}`;
}

export function truncate(text: string | null | undefined, max = 158) {
  const clean = String(text ?? "").replace(/<[^>]*>/g, " ").replace(/\s+/g, " ").trim();
  if (clean.length <= max) return clean;
  const cut = clean.slice(0, max - 1);
  return `${cut.slice(0, cut.lastIndexOf(" ") > 80 ? cut.lastIndexOf(" ") : cut.length).replace(/[,;:.\-–]+$/, "")}…`;
}

/** Serialises structured data for a JSON-LD script tag, escaping anything that could close the tag. */
export function jsonLdString(data: unknown) {
  return JSON.stringify(data).replace(/</g, "\\u003c").replace(new RegExp("[\\u2028\\u2029]", "g"), "");
}
