"use client";

import { useId, useRef, useState, type DragEvent, type KeyboardEvent } from "react";
import Image from "next/image";
import { Check, FileText, RotateCcw, UploadCloud, X } from "lucide-react";
import { FormField, describedBy, type FieldMeta } from "./FormField";
import { formatBytes } from "./files";
import { ProgressBar } from "./ProgressBar";
import { cx, focusRing } from "./styles";
import { useUploadQueue, type QueueItem, type UploadMessages, type UploadResult, type UploadFn } from "./useUploadQueue";

export type FileUploadLabels = {
  drop: string;
  browse: string;
  dropping: string;
  uploading: string;
  done: string;
  retry: string;
  cancel: string;
  remove: string;
};

export const DEFAULT_FILE_UPLOAD_LABELS: FileUploadLabels = {
  drop: "Drag files here or",
  browse: "browse",
  dropping: "Drop to upload",
  uploading: "Uploading",
  done: "Uploaded",
  retry: "Retry",
  cancel: "Cancel upload",
  remove: "Remove",
};

export type FileUploadProps = FieldMeta & {
  upload: UploadFn;
  onUploaded: (result: UploadResult, file: File) => void;
  onError?: (message: string) => void;
  /** MIME types (`image/*`, `application/pdf`) or extensions (`.pdf`). See `ACCEPT` for ready-made lists. */
  accept?: readonly string[];
  maxSizeMB?: number;
  multiple?: boolean;
  disabled?: boolean;
  /** One short line under the drop text. Defaults to the size limit. */
  hint?: string;
  /** A single-row drop target, for places where the area would be too large. */
  compact?: boolean;
  labels?: Partial<FileUploadLabels>;
  messages?: Partial<UploadMessages>;
  id?: string;
};

/**
 * Drag-and-drop file upload with a per-file progress bar. Drop files on it, click it, or focus it and press Enter.
 * Each file shows a preview, a determinate progress bar, and Cancel / Retry / Remove. It is server-agnostic: the page
 * passes `upload`, and receives each finished file through `onUploaded`.
 */
export function FileUpload({
  upload,
  onUploaded,
  onError,
  accept,
  maxSizeMB,
  multiple = false,
  disabled = false,
  hint,
  compact = false,
  labels: labelOverrides,
  messages,
  id,
  label,
  help,
  error,
  labelStyle,
  wide,
  wrapperClassName,
}: FileUploadProps) {
  const autoId = useId();
  const fieldId = id ?? autoId;
  const labels = { ...DEFAULT_FILE_UPLOAD_LABELS, ...labelOverrides };
  const inputRef = useRef<HTMLInputElement>(null);
  const [dragging, setDragging] = useState(false);
  // Files turned away before uploading (wrong type, too big) are explained right under the drop area.
  const [rejected, setRejected] = useState<string | undefined>();
  const queue = useUploadQueue({
    upload,
    onUploaded,
    onError: (message) => {
      setRejected(message);
      onError?.(message);
    },
    accept,
    maxSizeMB,
    messages,
  });
  const addFiles = (files: FileList | File[]) => {
    setRejected(undefined);
    queue.add(files);
  };

  const open = () => {
    if (!disabled) inputRef.current?.click();
  };
  const onKeyDown = (event: KeyboardEvent<HTMLDivElement>) => {
    if (event.key === "Enter" || event.key === " ") {
      event.preventDefault();
      open();
    }
  };
  const onDrop = (event: DragEvent<HTMLDivElement>) => {
    event.preventDefault();
    setDragging(false);
    if (disabled) return;
    const files = Array.from(event.dataTransfer.files);
    addFiles(multiple ? files : files.slice(0, 1));
  };
  const hintText = hint ?? (maxSizeMB ? `Up to ${maxSizeMB} MB` : undefined);

  return (
    <FormField id={fieldId} label={label} help={help} error={error ?? rejected} labelStyle={labelStyle} wide={wide} wrapperClassName={wrapperClassName}>
      <div
        id={fieldId}
        role="button"
        tabIndex={disabled ? -1 : 0}
        aria-disabled={disabled || undefined}
        aria-describedby={cx(hintText && `${fieldId}-hint`, describedBy(fieldId, help, error ?? rejected)) || undefined}
        onClick={open}
        onKeyDown={onKeyDown}
        onDragEnter={(event) => {
          event.preventDefault();
          if (!disabled) setDragging(true);
        }}
        onDragOver={(event) => event.preventDefault()}
        onDragLeave={(event) => {
          if (!event.currentTarget.contains(event.relatedTarget as Node | null)) setDragging(false);
        }}
        onDrop={onDrop}
        className={cx(
          "flex cursor-pointer items-center justify-center rounded-[20px] border-2 border-dashed text-center transition-colors duration-150",
          compact ? "flex-row gap-3 px-4 py-3" : "flex-col gap-1.5 px-5 py-8",
          dragging ? "border-teal bg-[#e5f3ef]" : error || rejected ? "border-[#c0392b] bg-[#fdf4f3]" : "border-[#c7d9d5] bg-[#f4f8f7] hover:border-[#9ec3bd] hover:bg-[#eef5f3]",
          disabled && "cursor-not-allowed opacity-60",
          focusRing,
        )}
      >
        <UploadCloud size={compact ? 20 : 28} className={cx("shrink-0 transition-transform duration-200", dragging ? "scale-110 text-teal" : "text-[#6b9e98]")} aria-hidden="true" />
        <span className="grid gap-0.5">
          <span className="font-sans text-[14px] font-semibold text-[#0f2422] rtl:text-[16px]">
            {dragging ? (
              labels.dropping
            ) : (
              <>
                {labels.drop} <span className="text-teal underline underline-offset-4">{labels.browse}</span>
              </>
            )}
          </span>
          {hintText && (
            <span id={`${fieldId}-hint`} className="font-sans text-[12.5px] text-[#6b7f7d] rtl:text-[14.5px]">
              {hintText}
            </span>
          )}
        </span>
      </div>
      <input
        ref={inputRef}
        type="file"
        multiple={multiple}
        accept={accept?.join(",")}
        disabled={disabled}
        tabIndex={-1}
        aria-hidden="true"
        className="sr-only"
        onChange={(event) => {
          if (event.target.files) addFiles(event.target.files);
          event.target.value = "";
        }}
      />

      {queue.items.length > 0 && (
        <ul aria-live="polite" className="m-0 mt-3 grid list-none gap-2 p-0">
          {queue.items.map((item) => (
            <UploadRow key={item.id} item={item} labels={labels} onCancel={() => queue.cancel(item.id)} onRetry={() => queue.retry(item.id)} onRemove={() => queue.remove(item.id)} />
          ))}
        </ul>
      )}
    </FormField>
  );
}

function UploadRow({ item, labels, onCancel, onRetry, onRemove }: { item: QueueItem; labels: FileUploadLabels; onCancel: () => void; onRetry: () => void; onRemove: () => void }) {
  const failed = item.status === "error";
  const done = item.status === "done";
  const iconButton = "grid size-8 shrink-0 place-items-center rounded-full border-0 bg-transparent p-0 text-[#526563] cursor-pointer hover:bg-[#e5efed] hover:text-[#0c4545]";
  return (
    <li className="flex items-center gap-3 rounded-[18px] bg-white p-2.5 shadow-[0_4px_18px_rgba(16,41,39,0.06)]">
      <span className="relative grid size-11 shrink-0 place-items-center overflow-hidden rounded-[12px] bg-[#eef5f3] text-teal">
        {item.previewUrl ? <Image src={item.previewUrl} alt="" fill unoptimized sizes="44px" className="object-cover" /> : <FileText size={20} aria-hidden="true" />}
      </span>
      <span className="grid min-w-0 flex-1 gap-1">
        <span className="flex items-baseline justify-between gap-3">
          <span className="truncate font-sans text-[13.5px] font-semibold text-[#0f2422] rtl:text-[15px]">{item.file.name}</span>
          <span className="shrink-0 font-mono text-[11.5px] font-bold text-[#6b7f7d]" dir="ltr">
            {failed ? formatBytes(item.file.size) : done ? labels.done : `${item.progress}%`}
          </span>
        </span>
        {failed ? (
          <span className="truncate font-sans text-[12.5px] font-semibold text-[#a32a2a] rtl:text-[14px]" role="alert">
            {item.error}
          </span>
        ) : (
          <ProgressBar value={item.progress} label={`${labels.uploading} ${item.file.name}`} />
        )}
      </span>
      {item.status === "uploading" && (
        <button type="button" onClick={onCancel} aria-label={labels.cancel} title={labels.cancel} className={iconButton}>
          <X size={16} aria-hidden="true" />
        </button>
      )}
      {failed && (
        <>
          <button type="button" onClick={onRetry} aria-label={labels.retry} title={labels.retry} className={iconButton}>
            <RotateCcw size={16} aria-hidden="true" />
          </button>
          <button type="button" onClick={onRemove} aria-label={labels.remove} title={labels.remove} className={iconButton}>
            <X size={16} aria-hidden="true" />
          </button>
        </>
      )}
      {done && <Check size={18} className="me-1 shrink-0 text-teal" aria-hidden="true" />}
    </li>
  );
}
