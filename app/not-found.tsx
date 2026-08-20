import Link from "next/link";

export default function NotFound() {
  return <main className="migration-shell"><p className="eyebrow">404 / Not found</p><h1>This page is not part of the portfolio.</h1><p><Link className="button primary" href="/">Return to the homepage</Link></p></main>;
}
