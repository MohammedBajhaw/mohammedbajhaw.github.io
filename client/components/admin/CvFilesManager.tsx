"use client";

import { Trash2 } from "lucide-react";
import { uploadApi } from "@/lib/admin/api";
import { LANGS, type CvFilesByLang, type Lang } from "@/lib/admin/resources";
import { FileUpload, Input } from "@/components/forms";
import { IconButton } from "./ui";

const CV_ACCEPT = [
  "application/pdf",
  "application/msword",
  "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
  ".pdf",
  ".doc",
  ".docx",
] as const;

type Props = {
  value: CvFilesByLang;
  lang: Lang;
  onChange: (next: CvFilesByLang) => void;
};

/** Single-per-language CV uploader on the Profile form, scoped to the active language tab. */
export function CvFilesManager({ value, lang, onChange }: Props) {
  const activeLang = LANGS.find((item) => item.code === lang) ?? LANGS[0];
  const filePath = value[lang] ?? "";

  return (
    <div className="sm:col-span-2 grid gap-3 rounded-[22px] bg-[#f4f8f7] p-4">
      <div className="flex items-start justify-between gap-3">
        <div>
          <p className="m-0 font-sans text-[12px] font-bold uppercase tracking-[0.1em] text-[#0c4545]">
            CV file ({activeLang.label})
          </p>
          <p className="m-0 mt-1 font-sans text-[13px] text-[#526563]">
            One CV file per language. Switch tabs above to upload the CV for another language.
          </p>
        </div>
        {filePath && (
          <IconButton
            label={`Remove ${activeLang.label} CV`}
            className="hover:bg-[#fbeeee]! hover:text-[#a32a2a]!"
            onClick={() => onChange({ ...value, [lang]: "" })}
          >
            <Trash2 size={17} />
          </IconButton>
        )}
      </div>

      <Input
        tone="white"
        label={`${activeLang.label} CV file path`}
        value={filePath}
        onChange={(event) => onChange({ ...value, [lang]: event.target.value })}
        placeholder="/uploads/documents/..."
        maxLength={400}
        dir="ltr"
      />

      <FileUpload
        label={`Upload ${activeLang.label} CV (PDF, DOC, DOCX)`}
        accept={CV_ACCEPT}
        maxSizeMB={50}
        hint="PDF, DOC, or DOCX up to 50 MB"
        upload={uploadApi.upload}
        onUploaded={(uploaded) => onChange({ ...value, [lang]: uploaded.url })}
      />
    </div>
  );
}
