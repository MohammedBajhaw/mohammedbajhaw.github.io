"use client";

import { useEffect, useState } from "react";
import { Activity, CheckCircle2, KeyRound, Plus, Save, Trash2, XCircle } from "lucide-react";
import { ApiError, translationApi, type TranslationFormat, type TranslationLanguage, type TranslationProvider, type TranslationSettings as Settings } from "@/lib/admin/api";
import { Checkbox, FormButton, FormMessage, Input, Select, Textarea, Toggle } from "@/components/forms";
import { Card, Eyebrow, IconButton, Spinner, StatusToast } from "./ui";

type Form = {
  enabled: boolean;
  provider: TranslationProvider;
  apiBaseUrl: string;
  apiKey: string;
  model: string;
  outputFormat: TranslationFormat;
  temperature: string;
  timeoutSeconds: string;
  systemPrompt: string;
  customInstructions: string;
  languages: TranslationLanguage[];
};

const PROVIDERS: { value: TranslationProvider; label: string }[] = [
  { value: "openai_compatible", label: "Standard Chat API (Bearer Token)" },
  { value: "gemini", label: "GenerateContent API (Query Key)" },
];
const FORMATS: { value: TranslationFormat; label: string }[] = [
  { value: "natural", label: "Natural — fluent, idiomatic" },
  { value: "formal", label: "Formal — official, executive" },
  { value: "technical", label: "Technical — keeps engineering terms" },
  { value: "concise", label: "Concise — short and direct" },
];
const CODE_PATTERN = /^[a-zA-Z]{2,8}(?:-[a-zA-Z0-9]{2,8})?$/;

const toForm = (s: Settings): Form => ({
  enabled: s.enabled,
  provider: s.provider,
  apiBaseUrl: s.apiBaseUrl,
  apiKey: "",
  model: s.model,
  outputFormat: s.outputFormat,
  temperature: String(s.temperature),
  timeoutSeconds: String(Math.round(s.timeoutMs / 1000)),
  systemPrompt: s.systemPrompt,
  customInstructions: s.customInstructions,
  languages: s.supportedLanguages.map((item) => ({ ...item })),
});

/** The automatic-translation service: which AI provider, how it should write, and which languages the studio offers. */
export function TranslationSettings() {
  const [saved, setSaved] = useState<Settings | null>(null);
  const [form, setForm] = useState<Form | null>(null);
  const [baseline, setBaseline] = useState("");
  const [loadError, setLoadError] = useState("");
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [focusTick, setFocusTick] = useState(0);
  const [saving, setSaving] = useState(false);
  const [testing, setTesting] = useState(false);
  const [testResult, setTestResult] = useState<{ ok: boolean; message: string; latencyMs?: number } | null>(null);
  const [notice, setNotice] = useState("");
  const [error, setError] = useState("");

  useEffect(() => {
    let active = true;
    translationApi
      .settings()
      .then((data) => {
        if (!active) return;
        const next = toForm(data);
        setSaved(data);
        setForm(next);
        setBaseline(JSON.stringify(next));
      })
      .catch((failure: unknown) => {
        if (active) setLoadError(failure instanceof ApiError ? failure.readable : "Could not load the translation settings.");
      });
    return () => {
      active = false;
    };
  }, []);

  useEffect(() => {
    if (!notice) return;
    const timer = window.setTimeout(() => setNotice(""), 4500);
    return () => window.clearTimeout(timer);
  }, [notice]);

  useEffect(() => {
    if (!focusTick) return;
    const first = document.querySelector<HTMLElement>('[aria-invalid="true"]');
    if (!first) return;
    first.scrollIntoView({ behavior: window.matchMedia("(prefers-reduced-motion: reduce)").matches ? "auto" : "smooth", block: "center" });
    first.focus({ preventScroll: true });
  }, [focusTick]);

  const dirty = form !== null && JSON.stringify(form) !== baseline;
  const patch = (change: Partial<Form>, key?: string) => {
    if (key) setErrors((current) => Object.fromEntries(Object.entries(current).filter(([name]) => name !== key)));
    setForm((current) => (current ? { ...current, ...change } : current));
  };
  const patchLanguage = (index: number, change: Partial<TranslationLanguage>) =>
    setForm((current) => (current ? { ...current, languages: current.languages.map((item, i) => (i === index ? { ...item, ...change } : item)) } : current));

  async function testKey() {
    if (!form || testing) return;
    setTesting(true);
    setTestResult(null);
    try {
      const reply = await translationApi.test({
        provider: form.provider,
        apiBaseUrl: form.apiBaseUrl.trim() || undefined,
        ...(form.apiKey.trim() ? { apiKey: form.apiKey.trim() } : {}),
        model: form.model.trim() || undefined,
      });
      setTestResult({
        ok: reply.ok,
        latencyMs: reply.latencyMs,
        message: `${reply.message} (${reply.model} · ${reply.latencyMs} ms)`,
      });
    } catch (failure) {
      setTestResult({
        ok: false,
        message: failure instanceof ApiError ? failure.readable : "Connection test failed.",
      });
    } finally {
      setTesting(false);
    }
  }

  async function save() {
    if (!form) return;
    const problems: Record<string, string> = {};
    const temperature = Number(form.temperature);
    const seconds = Number(form.timeoutSeconds);
    if (!form.apiBaseUrl.trim()) problems.apiBaseUrl = "The API address is required.";
    else if (!/^https:\/\//i.test(form.apiBaseUrl.trim()) && !/^http:\/\/(localhost|127\.0\.0\.1)/i.test(form.apiBaseUrl.trim())) problems.apiBaseUrl = "The address must start with https:// (http:// only for localhost).";
    if (!form.model.trim()) problems.model = "The model is required.";
    if (form.systemPrompt.trim().length < 10) problems.systemPrompt = "The base instructions need at least 10 characters.";
    if (!Number.isFinite(temperature) || temperature < 0 || temperature > 1.5) problems.temperature = "Use a number from 0 to 1.5.";
    if (!Number.isFinite(seconds) || seconds < 3 || seconds > 120) problems.timeoutSeconds = "Use 3 to 120 seconds.";
    const seen = new Set<string>();
    form.languages.forEach((item, index) => {
      const code = item.code.trim().toLowerCase();
      if (!CODE_PATTERN.test(code)) problems[`lang-code-${index}`] = "Use a language code such as ar or pt-BR.";
      else if (seen.has(code)) problems[`lang-code-${index}`] = "This code is already listed.";
      seen.add(code);
      if (!item.name.trim()) problems[`lang-name-${index}`] = "Name is required.";
      if (!item.nativeName.trim()) problems[`lang-native-${index}`] = "Native name is required.";
    });
    if (!form.languages.some((item) => item.enabled)) problems.languages = "Keep at least one language enabled.";
    if (Object.keys(problems).length) {
      setErrors(problems);
      setError("");
      setNotice("");
      setFocusTick((tick) => tick + 1);
      return;
    }

    setSaving(true);
    setError("");
    setNotice("");
    setErrors({});
    try {
      const reply = await translationApi.update({
        enabled: form.enabled,
        provider: form.provider,
        apiBaseUrl: form.apiBaseUrl,
        ...(form.apiKey.trim() ? { apiKey: form.apiKey } : {}),
        model: form.model,
        outputFormat: form.outputFormat,
        temperature,
        timeoutMs: Math.round(seconds * 1000),
        systemPrompt: form.systemPrompt,
        customInstructions: form.customInstructions,
        supportedLanguages: form.languages.map((item) => ({ code: item.code.trim(), name: item.name, nativeName: item.nativeName, rtl: item.rtl, enabled: item.enabled })),
      });
      const next = toForm(reply);
      setSaved(reply);
      setForm(next);
      setBaseline(JSON.stringify(next));
      setNotice("Translation settings saved.");
    } catch (failure) {
      setError(failure instanceof ApiError ? failure.readable : "Saving failed.");
    } finally {
      setSaving(false);
    }
  }

  return (
    <div className="grid gap-5 lg:gap-6">
      <header>
        <Eyebrow>Platform</Eyebrow>
        <h1 className="m-0 mt-2 font-sans text-[clamp(28px,3.4vw,40px)] font-extrabold leading-[1.08] tracking-[-0.04em] text-[#0f2422]">Translation</h1>
        <p className="m-0 mt-2 max-w-[620px] font-sans text-[14.5px] leading-[1.65] text-[#526563]">
          Connect an AI provider so any record can be translated from English in one click. Translations are always shown for review before you save them.
        </p>
      </header>

      {loadError && <FormMessage tone="error">{loadError}</FormMessage>}
      {!form && !loadError && <Spinner label="Loading translation settings" />}

      {form && saved && (
        <>
          <Card className="grid gap-5">
            <Toggle checked={form.enabled} onChange={(enabled) => patch({ enabled })} label="Automatic translation" help="When off, the Translate buttons in the studio are refused by the server." />
            <div className="grid gap-x-5 gap-y-5 sm:grid-cols-2">
              <Select
                label="API format"
                value={form.provider}
                onChange={(event) => {
                  setTestResult(null);
                  patch({ provider: event.target.value as TranslationProvider });
                }}
                options={PROVIDERS}
              />
              <Input id="tr-model" label="Model *" error={errors.model} value={form.model} onChange={(event) => { setTestResult(null); patch({ model: event.target.value }, "model"); }} placeholder="Enter model identifier" maxLength={150} />
              <Input id="tr-url" label="API address *" error={errors.apiBaseUrl} wide value={form.apiBaseUrl} onChange={(event) => { setTestResult(null); patch({ apiBaseUrl: event.target.value }, "apiBaseUrl"); }} placeholder="https://api.example.com/v1" />
              <Input
                label="API key"
                wide
                type="password"
                autoComplete="off"
                leading={<KeyRound size={16} aria-hidden="true" />}
                value={form.apiKey}
                onChange={(event) => { setTestResult(null); patch({ apiKey: event.target.value }); }}
                placeholder={saved.hasApiKey ? `Saved (${saved.apiKeyMasked ?? "hidden"}) — type to replace` : "Paste the provider's key"}
                help={saved.hasApiKey ? "The key is stored on the server and never shown again. Leave this empty to keep it." : "No key is saved yet, so translation cannot run."}
              />
            </div>

            <div className="flex flex-wrap items-center gap-3 rounded-[22px] bg-[#f4f8f7] px-4 py-3">
              <FormButton
                variant="soft"
                busy={testing}
                disabled={!saved.hasApiKey && !form.apiKey.trim()}
                icon={<Activity size={16} aria-hidden="true" />}
                onClick={() => void testKey()}
              >
                {testing ? "Testing key…" : "Test key & connection"}
              </FormButton>
              {testResult ? (
                <span
                  role="status"
                  className={`inline-flex items-center gap-1.5 font-sans text-[13.5px] font-semibold ${testResult.ok ? "text-[#0c6b58]" : "text-[#b42318]"}`}
                >
                  {testResult.ok ? (
                    <CheckCircle2 size={16} aria-hidden="true" />
                  ) : (
                    <XCircle size={16} aria-hidden="true" />
                  )}
                  <span>{testResult.message}</span>
                </span>
              ) : (
                <span className="font-sans text-[13px] text-[#526563]">
                  Checks whether the selected model, API address, and key respond right now.
                </span>
              )}
            </div>
          </Card>

          <Card className="grid gap-5">
            <Eyebrow>Writing style</Eyebrow>
            <div className="grid gap-x-5 gap-y-5 sm:grid-cols-2">
              <Select label="Tone" value={form.outputFormat} onChange={(event) => patch({ outputFormat: event.target.value as TranslationFormat })} options={FORMATS} />
              <div className="grid gap-5 sm:grid-cols-2">
                <Input id="tr-temp" label="Creativity" help="0 – 1.5" type="number" step={0.1} min={0} max={1.5} error={errors.temperature} value={form.temperature} onChange={(event) => patch({ temperature: event.target.value }, "temperature")} />
                <Input id="tr-timeout" label="Time limit" help="Seconds" type="number" min={3} max={120} error={errors.timeoutSeconds} value={form.timeoutSeconds} onChange={(event) => patch({ timeoutSeconds: event.target.value }, "timeoutSeconds")} />
              </div>
              <Textarea id="tr-system" label="Base instructions *" error={errors.systemPrompt} wide rows={5} value={form.systemPrompt} onChange={(event) => patch({ systemPrompt: event.target.value }, "systemPrompt")} maxLength={4000} showCount />
              <Textarea label="Your own instructions" help="Extra rules, for example: keep “ROS 2” and product names in English." wide rows={3} value={form.customInstructions} onChange={(event) => patch({ customInstructions: event.target.value })} maxLength={2000} showCount />
            </div>
          </Card>

          <Card className="grid gap-4">
            <div className="flex flex-wrap items-center justify-between gap-3">
              <div>
                <Eyebrow>Languages</Eyebrow>
                <p className="m-0 mt-2 font-sans text-[14px] leading-[1.65] text-[#526563]">The languages the translation service may write. The studio edits Arabic and Turkish copies.</p>
              </div>
              <FormButton variant="soft" icon={<Plus size={16} aria-hidden="true" />} onClick={() => patch({ languages: [...form.languages, { code: "", name: "", nativeName: "", rtl: false, enabled: true }] })}>
                Add language
              </FormButton>
            </div>
            {errors.languages && (
              <p aria-invalid="true" tabIndex={-1} className="m-0 font-sans text-[13px] font-semibold text-[#c0392b]">
                {errors.languages}
              </p>
            )}
            {form.languages.map((item, index) => (
              <div key={index} className="grid gap-3 rounded-[22px] bg-[#f4f8f7] p-4 sm:grid-cols-[110px_1fr_1fr_auto] sm:items-start">
                <Input tone="white" label="Code" error={errors[`lang-code-${index}`]} value={item.code} onChange={(event) => { patchLanguage(index, { code: event.target.value }); setErrors((current) => Object.fromEntries(Object.entries(current).filter(([name]) => name !== `lang-code-${index}`))); }} maxLength={16} dir="ltr" />
                <Input tone="white" label="Name" error={errors[`lang-name-${index}`]} value={item.name} onChange={(event) => patchLanguage(index, { name: event.target.value })} maxLength={64} />
                <Input tone="white" label="Native name" error={errors[`lang-native-${index}`]} value={item.nativeName} onChange={(event) => patchLanguage(index, { nativeName: event.target.value })} maxLength={64} />
                <div className="flex items-center gap-4 sm:pt-8">
                  <Checkbox checked={item.enabled} onChange={(enabled) => patchLanguage(index, { enabled })} label="On" />
                  <Checkbox checked={item.rtl} onChange={(rtl) => patchLanguage(index, { rtl })} label="RTL" />
                  <IconButton label="Remove language" className="hover:bg-[#fbeeee]! hover:text-[#a32a2a]!" disabled={form.languages.length <= 1} onClick={() => patch({ languages: form.languages.filter((_, i) => i !== index) })}>
                    <Trash2 size={17} />
                  </IconButton>
                </div>
              </div>
            ))}
          </Card>

          <div className="sticky bottom-4 z-10 inline-flex w-fit justify-self-start flex-wrap items-center gap-3 rounded-full bg-white/90 p-2 shadow-[0_14px_36px_rgba(16,41,39,0.14)] backdrop-blur-md">
            <FormButton busy={saving} disabled={!dirty} icon={<Save size={16} aria-hidden="true" />} onClick={() => void save()}>
              {saving ? "Saving…" : "Save translation settings"}
            </FormButton>
            {dirty && <span className="font-sans text-[12.5px] font-bold text-[#b0651d]">Unsaved changes</span>}
          </div>

          <StatusToast error={error} notice={notice} />
        </>
      )}
    </div>
  );
}
