"use client";

export default function GlobalError({ reset }: { error: Error & { digest?: string }; reset: () => void }) {
  return <html lang="en"><body><main className="migration-shell"><p className="eyebrow">Application error</p><h1>The portfolio could not load.</h1><p><button className="button primary" onClick={() => reset()}>Try again</button></p></main></body></html>;
}
