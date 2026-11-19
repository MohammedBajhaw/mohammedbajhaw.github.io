"use client";

import { useState, type FormEvent } from "react";
import Link from "next/link";
import { ArrowUpRight, LockKeyhole } from "lucide-react";
import { FormButton, FormMessage, Input } from "@/components/forms";
import { ApiError, authApi } from "@/lib/admin/api";

/** Sign-in for the single owner account. The server sets the session cookie; nothing is stored in the browser here. */
export function LoginScreen({ onSignedIn }: { onSignedIn: () => void }) {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState("");

  async function submit(event: FormEvent) {
    event.preventDefault();
    setBusy(true);
    setError("");
    try {
      await authApi.login(email.trim(), password);
      onSignedIn();
    } catch (failure) {
      setError(
        failure instanceof ApiError
          ? failure.status === 429
            ? "Too many attempts. Wait a minute and try again."
            : failure.status === 401 || failure.status === 403
              ? "That email or password is not right."
              : failure.readable
          : "Sign-in failed.",
      );
    } finally {
      setBusy(false);
    }
  }

  return (
    <main className="relative isolate grid min-h-dvh place-items-center overflow-hidden bg-[#0b2220] px-5 py-10">
      <div className="pointer-events-none absolute -top-28 end-[-8%] -z-10 h-[460px] w-[560px] rounded-full bg-radial from-[#176b69]/75 via-[#102927]/40 to-transparent blur-3xl" aria-hidden="true" />
      <div className="pointer-events-none absolute -bottom-32 start-[-10%] -z-10 h-[420px] w-[500px] rounded-full bg-radial from-[#176b69]/50 via-[#102927]/30 to-transparent blur-3xl" aria-hidden="true" />

      <div className="w-full max-w-[440px]">
        <Link href="/" className="mb-6 inline-flex items-center gap-1.5 font-sans text-[14px] font-bold text-[#7fd4c6] no-underline">
          <span className="bg-linear-to-r from-[#ffffff] via-[#bfe8df] to-[#63bdb0] bg-clip-text pb-[0.14em] text-[20px] font-extrabold tracking-[-0.04em] text-transparent">Mohammed Bajhaw</span>
          <ArrowUpRight size={15} aria-hidden="true" />
        </Link>

        <section className="rounded-[34px] bg-white p-7 shadow-[0_30px_80px_rgba(0,0,0,0.35)] sm:p-9">
          <span className="grid size-12 place-items-center rounded-full bg-[#eef5f3] text-teal">
            <LockKeyhole size={22} aria-hidden="true" />
          </span>
          <p className="mono-eyebrow m-0 mt-5">Content studio</p>
          <h1 className="m-0 mt-2 font-sans text-[30px] font-extrabold leading-[1.1] tracking-[-0.04em] text-[#0f2422]">Welcome back</h1>
          <p className="m-0 mt-2 font-sans text-[14.5px] leading-[1.65] text-[#526563]">Sign in to update your projects, research, services and profile.</p>

          <form onSubmit={submit} className="mt-6 grid gap-4">
            <Input id="admin-email" label="Email" type="email" autoComplete="username" required value={email} onChange={(event) => setEmail(event.target.value)} />
            <Input id="admin-password" label="Password" type="password" autoComplete="current-password" required minLength={6} value={password} onChange={(event) => setPassword(event.target.value)} />
            {error && <FormMessage tone="error">{error}</FormMessage>}
            <FormButton type="submit" busy={busy} className="w-full">
              {busy ? "Signing in…" : "Sign in securely"}
            </FormButton>
          </form>
        </section>
      </div>
    </main>
  );
}
