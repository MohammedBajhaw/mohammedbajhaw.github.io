"use client";

import { useState } from "react";
import { Languages } from "lucide-react";
import { ApiError } from "@/lib/admin/api";
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

/** "Translate from English" for the Arabic and Turkish copies, using the service configured under Translation. */
export function AutoTranslateBar({ onTranslate, onError, onDone, current = "en" }: Props) {
  const [busy, setBusy] = useState(false);
  const [overwrite, setOverwrite] = useState(false);

  async function run(langs: TranslationLang[]) {
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

  return (
    <div className="flex flex-wrap items-center gap-x-4 gap-y-3 rounded-[22px] bg-[#f4f8f7] px-4 py-3">
      <span className="inline-flex items-center gap-2 font-sans text-[13.5px] font-bold text-[#0f2422]">
        <Languages size={17} className="text-teal" aria-hidden="true" /> Translate from English
      </span>
      <div className="flex flex-wrap items-center gap-2">
        {current !== "en" && (
          <FormButton size="sm" busy={busy} onClick={() => void run([current])}>
            {current === "ar" ? "Arabic" : "Turkish"} only
          </FormButton>
        )}
        <FormButton size="sm" variant={current === "en" ? "primary" : "soft"} busy={busy} onClick={() => void run(["ar", "tr"])}>
          Arabic + Turkish
        </FormButton>
      </div>
      <Checkbox checked={overwrite} onChange={setOverwrite} label="Replace texts that are already translated" />
    </div>
  );
}
