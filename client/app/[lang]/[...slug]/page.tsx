import { notFound } from "next/navigation";

/**
 * Any URL under a locale that matches no route lands here, so the visitor sees the designed,
 * translated 404 (app/[lang]/not-found.tsx) instead of the framework default.
 */
export default function UnmatchedPage() {
  notFound();
}
