"use client";

import { useEffect, useState } from "react";
import { Languages } from "lucide-react";
import { ApiError, translationApi } from "@/lib/admin/api";
import type { TranslationLang } from "@/lib/admin/resources";
import { Checkbox, FormButton } from "@/components/forms";

type Props = {
  /** Runs the translation for the chosen languages; resolves with how many texts were filled in. */
  onTranslate: (langs: TranslationLang[], overwrite: boolean) => Promise<number>;
  onError: (message: string) => void;
  onDone: (message: string) => void;
  /** The tab being viewed: translating "this language" is the common case. */
  current?: TranslationLang | "en";
};

/** "Translate from English" for the Arabic and Turkish copies, enabled only when a translation API is connected. */
export function AutoTranslateBar({ onTranslate, onError, onDone, current = "en" }: Props) {
  const [busy, setBusy] = useState(false);
  const [overwrite, setOverwrite] = useState(false);
  const [connected, setConnected] = useState<boolean | null>(null);

  useEffect(() => {
    let active = true;
    translationApi
      .settings()
      .then((settings) => {
        if (!active) return;
        setConnected(Boolean(settings.enabled && settings.hasApiKey && settings.apiBaseUrl?.trim()));
      })
      .catch(() => {
        if (active) setConnected(false);
      });
    return () => {
      active = false;
    };
  }, []);

  async function run(langs: TranslationLang[]) {
    if (!connected) return;
    setBusy(true);
    try {
      const count = await onTranslate(langs, overwrite);
      onDone(count === 0 ? "Nothing needed translating." : `Translated ${count} ${count === 1 ? "text" : "texts"}. Review them, then save.`);
    } catch (failure) {
      onError(failure instanceof ApiError ? failure.readable : "Translation failed.");
    } finally {
      setBusy(false);
    }
  }

  const disabled = !connected || busy;

  return (
    <div className="flex flex-wrap items-center gap-x-4 gap-y-3 rounded-[22px] bg-[#f4f8f7] px-4 py-3">
      <span className="inline-flex items-center gap-2 font-sans text-[13.5px] font-bold text-[#0f2422]">
        <Languages size={17} className="text-teal" aria-hidden="true" /> Translate from English
      </span>
      <div className="flex flex-wrap items-center gap-2">
        {current !== "en" && (
          <FormButton size="sm" busy={busy} disabled={disabled} onClick={() => void run([current])}>
            {current === "ar" ? "Arabic" : "Turkish"} only
          </FormButton>
        )}
        <FormButton size="sm" variant={current === "en" ? "primary" : "soft"} busy={busy} disabled={disabled} onClick={() => void run(["ar", "tr"])}>
          Arabic + Turkish
        </FormButton>
      </div>
      <Checkbox checked={overwrite} onChange={setOverwrite} disabled={disabled} label="Replace texts that are already translated" />
      {connected === false && (
        <span className="font-sans text-[12.5px] text-[#526563]">
          No translation API connected.{" "}
          <a href="#translation" className="font-bold text-teal underline underline-offset-2 hover:text-[#0c4545]">
            Configure in Translation
          </a>
        </span>
      )}
    </div>
  );
}
