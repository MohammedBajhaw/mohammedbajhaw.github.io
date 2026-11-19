"use client";

import { useId } from "react";
import Image from "next/image";
import { FileText, X } from "lucide-react";
import { FileUpload, type FileUploadProps } from "./FileUpload";
import { FormField, describedBy, type FieldMeta } from "./FormField";
import { FormButton } from "./FormButton";
import { isImagePath } from "./files";
import { controlClass, cx, type Tone } from "./styles";
import { ACCEPT } from "./useUploadQueue";

type MediaFieldProps = FieldMeta &
  Pick<FileUploadProps, "upload" | "onError" | "maxSizeMB" | "labels" | "messages"> & {
    /** The stored path or link. */
    value: string;
    onChange: (value: string) => void;
    kind?: "image" | "document";
    tone?: Tone;
    placeholder?: string;
    id?: string;
    required?: boolean;
    clearLabel?: string;
  };

/**
 * A field whose value is a file location: type or paste a link, or drop a file to upload it and fill the link in.
 * Images show a preview. It is the single-file counterpart of FileUpload.
 */
export function MediaField({ value, onChange, upload, onError, kind = "image", tone = "soft", placeholder = "/uploads/… or https://…", maxSizeMB, labels, messages, clearLabel = "Clear", id, required, label, help, error, labelStyle, wide, wrapperClassName }: MediaFieldProps) {
  const autoId = useId();
  const fieldId = id ?? autoId;
  return (
    <FormField id={fieldId} label={label} help={help} error={error} required={required} labelStyle={labelStyle} wide={wide} wrapperClassName={wrapperClassName}>
      <div className="grid gap-3">
        <div className="flex items-center gap-3">
          <input
            id={fieldId}
            value={value}
            onChange={(event) => onChange(event.target.value)}
            placeholder={placeholder}
            aria-invalid={error ? true : undefined}
            aria-describedby={describedBy(fieldId, help, error)}
            className={cx(controlClass({ tone, invalid: Boolean(error) }), "min-w-0 flex-1")}
          />
          {value && (
            <FormButton variant="ghost" size="sm" icon={<X size={14} aria-hidden="true" />} onClick={() => onChange("")}>
              {clearLabel}
            </FormButton>
          )}
        </div>
        <FileUpload compact upload={upload} accept={kind === "image" ? ACCEPT.image : ACCEPT.document} maxSizeMB={maxSizeMB} labels={labels} messages={messages} onError={onError} onUploaded={(result) => onChange(result.url)} />
        {value &&
          (isImagePath(value) ? (
            <div className="relative h-40 w-full max-w-[320px] overflow-hidden rounded-[20px] bg-[#f4f8f7]">
              <Image src={value} alt="" fill unoptimized sizes="320px" className="object-contain p-2" />
            </div>
          ) : (
            <p className="m-0 inline-flex items-center gap-2 font-sans text-[13px] text-[#526563]">
              <FileText size={16} className="text-teal" aria-hidden="true" />
              <span className="break-all">{value}</span>
            </p>
          ))}
      </div>
    </FormField>
  );
}
