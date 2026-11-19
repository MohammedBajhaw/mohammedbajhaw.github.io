"use client";

import { useRef, type ReactNode } from "react";
import { ImagePlus, Upload } from "lucide-react";
import { FormButton, type FormButtonProps } from "./FormButton";
import { useUploadQueue, type UploadFn, type UploadMessages, type UploadResult } from "./useUploadQueue";

type UploadButtonProps = {
  upload: UploadFn;
  onUploaded: (result: UploadResult, file: File) => void;
  onError?: (message: string) => void;
  accept?: readonly string[];
  maxSizeMB?: number;
  multiple?: boolean;
  /** Button text. While uploading it shows the progress instead. */
  children?: ReactNode;
  uploadingLabel?: string;
  icon?: "image" | "file";
  variant?: FormButtonProps["variant"];
  size?: FormButtonProps["size"];
  className?: string;
  messages?: Partial<UploadMessages>;
};

/** The same upload as the drop area, as a plain button: for toolbars and places too small for a dropzone. */
export function UploadButton({ upload, onUploaded, onError, accept, maxSizeMB, multiple = false, children = "Upload file", uploadingLabel = "Uploading", icon = "file", variant = "soft", size = "md", className, messages }: UploadButtonProps) {
  const inputRef = useRef<HTMLInputElement>(null);
  const queue = useUploadQueue({ upload, onUploaded, onError, accept, maxSizeMB, messages, autoClearMs: 400 });
  const Icon = icon === "image" ? ImagePlus : Upload;

  return (
    <>
      <input
        ref={inputRef}
        type="file"
        multiple={multiple}
        accept={accept?.join(",")}
        tabIndex={-1}
        aria-hidden="true"
        className="sr-only"
        onChange={(event) => {
          if (event.target.files) queue.add(event.target.files);
          event.target.value = "";
        }}
      />
      <FormButton variant={variant} size={size} busy={queue.busy} className={className} icon={<Icon size={16} aria-hidden="true" />} onClick={() => inputRef.current?.click()}>
        {queue.busy ? `${uploadingLabel} ${queue.overall}%` : children}
      </FormButton>
    </>
  );
}
