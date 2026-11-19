"use client";

import { useEffect, useRef, useState, type ReactNode } from "react";
import { Bold, Check, Code2, Heading2, Heading3, Italic, Link2, List, ListOrdered, Quote, Redo2, Underline, Undo2, X } from "lucide-react";
import { ACCEPT, UploadButton } from "@/components/forms";
import { uploadApi } from "@/lib/admin/api";

type RichTextEditorProps = {
  id: string;
  value: string;
  placeholder?: string;
  dir?: "ltr" | "rtl";
  /** Marks the editor as failing validation (red outline, announced to screen readers). */
  invalid?: boolean;
  onChange: (value: string) => void;
  onError: (message: string) => void;
};

/** One toolbar button. It never takes focus from the text, so the selection it formats stays selected. */
function Tool({ label, onClick, active, children }: { label: string; onClick: () => void; active?: boolean; children: ReactNode }) {
  return (
    <button
      type="button"
      aria-label={label}
      title={label}
      aria-pressed={active}
      onMouseDown={(event) => event.preventDefault()}
      onClick={onClick}
      className={`grid size-9 shrink-0 place-items-center rounded-[12px] border-0 p-0 cursor-pointer transition-colors duration-150 focus-visible:outline-2 focus-visible:outline-teal ${
        active ? "bg-white text-[#0c4545] shadow-[0_2px_8px_rgba(16,41,39,0.1)]" : "bg-transparent text-[#41605b] hover:bg-white hover:text-[#0c4545]"
      }`}
    >
      {children}
    </button>
  );
}

const Divider = () => <span className="mx-1.5 h-5 w-px shrink-0 bg-[#c9dad6]" aria-hidden="true" />;

/**
 * HTML article editor (the original approach: a content-editable surface and the browser's editing commands).
 * The toolbar is grouped in one row: text, blocks, insert, history. The public site sanitizes this HTML again when it
 * renders it, so what is stored here is trusted only as content.
 */
export function RichTextEditor({ id, value, placeholder, dir = "ltr", invalid = false, onChange, onError }: RichTextEditorProps) {
  const editorRef = useRef<HTMLDivElement>(null);
  const savedRange = useRef<Range | null>(null);
  const [linkOpen, setLinkOpen] = useState(false);
  const [link, setLink] = useState("");

  useEffect(() => {
    if (editorRef.current && editorRef.current.innerHTML !== value) editorRef.current.innerHTML = value;
  }, [value]);

  const emit = () => onChange(editorRef.current?.innerHTML ?? "");

  function command(name: string, argument?: string) {
    editorRef.current?.focus();
    document.execCommand(name, false, argument);
    emit();
  }

  /** Typing a link address moves focus out of the text, so the selection is remembered and put back when the link is applied. */
  function openLink() {
    const selection = window.getSelection();
    if (selection?.rangeCount && editorRef.current?.contains(selection.anchorNode)) savedRange.current = selection.getRangeAt(0).cloneRange();
    setLinkOpen(true);
  }
  function closeLink() {
    setLinkOpen(false);
    setLink("");
  }
  function applyLink() {
    const url = link.trim();
    if (!url) return;
    editorRef.current?.focus();
    const selection = window.getSelection();
    if (selection && savedRange.current) {
      selection.removeAllRanges();
      selection.addRange(savedRange.current);
    }
    document.execCommand("createLink", false, url);
    emit();
    closeLink();
  }

  function insertImage(url: string) {
    editorRef.current?.focus();
    const safe = url.replace(/"/g, "&quot;");
    document.execCommand("insertHTML", false, `<figure><img src="${safe}" alt="" /><figcaption>Caption</figcaption></figure><p><br></p>`);
    emit();
  }

  return (
    <div className={`overflow-hidden rounded-[20px] bg-[#f4f8f7] ${invalid ? "shadow-[0_0_0_2px_#c0392b]" : ""}`}>
      <div className="bg-[#e9f1ef]">
        <div role="toolbar" aria-label="Formatting" className="flex items-center gap-0.5 overflow-x-auto px-2.5 py-2">
          <Tool label="Heading" onClick={() => command("formatBlock", "h2")}><Heading2 size={18} /></Tool>
          <Tool label="Subheading" onClick={() => command("formatBlock", "h3")}><Heading3 size={18} /></Tool>
          <Tool label="Bold" onClick={() => command("bold")}><Bold size={17} /></Tool>
          <Tool label="Italic" onClick={() => command("italic")}><Italic size={17} /></Tool>
          <Tool label="Underline" onClick={() => command("underline")}><Underline size={17} /></Tool>
          <Divider />
          <Tool label="Bullet list" onClick={() => command("insertUnorderedList")}><List size={18} /></Tool>
          <Tool label="Numbered list" onClick={() => command("insertOrderedList")}><ListOrdered size={18} /></Tool>
          <Tool label="Quote" onClick={() => command("formatBlock", "blockquote")}><Quote size={17} /></Tool>
          <Tool label="Code" onClick={() => command("formatBlock", "pre")}><Code2 size={18} /></Tool>
          <Divider />
          <Tool label="Link" active={linkOpen} onClick={() => (linkOpen ? closeLink() : openLink())}><Link2 size={18} /></Tool>
          <UploadButton upload={uploadApi.upload} accept={ACCEPT.image} maxSizeMB={50} icon="image" size="sm" variant="ghost" className="ms-1 shrink-0" onUploaded={(file) => insertImage(file.url)} onError={onError}>
            Image
          </UploadButton>
          <span className="ms-auto flex shrink-0 items-center gap-0.5 ps-3">
            <Tool label="Undo" onClick={() => command("undo")}><Undo2 size={18} /></Tool>
            <Tool label="Redo" onClick={() => command("redo")}><Redo2 size={18} /></Tool>
          </span>
        </div>

        {linkOpen && (
          <div className="flex items-center gap-2 border-t border-[#d6e4e0] px-2.5 py-2">
            <input
              autoFocus
              aria-label="Link address"
              value={link}
              onChange={(event) => setLink(event.target.value)}
              onKeyDown={(event) => {
                if (event.key === "Enter") {
                  event.preventDefault();
                  applyLink();
                } else if (event.key === "Escape") closeLink();
              }}
              placeholder="Paste the link address, then press Enter"
              className="h-9 min-w-0 flex-1 rounded-full border-0 bg-white px-4 font-sans text-[13.5px] outline-none placeholder:text-[#8aa19d] focus:shadow-[0_0_0_2px_#176b69]"
            />
            <button type="button" onClick={applyLink} aria-label="Apply link" title="Apply link" className="grid size-9 shrink-0 place-items-center rounded-full border-0 bg-teal p-0 text-white cursor-pointer hover:bg-[#0c4545]">
              <Check size={17} aria-hidden="true" />
            </button>
            <button type="button" onClick={closeLink} aria-label="Cancel" title="Cancel" className="grid size-9 shrink-0 place-items-center rounded-full border-0 bg-transparent p-0 text-[#41605b] cursor-pointer hover:bg-white">
              <X size={17} aria-hidden="true" />
            </button>
          </div>
        )}
      </div>

      <div
        id={id}
        ref={editorRef}
        dir={dir}
        contentEditable
        suppressContentEditableWarning
        role="textbox"
        aria-multiline="true"
        aria-invalid={invalid || undefined}
        aria-label="Article"
        data-placeholder={placeholder}
        onInput={emit}
        onBlur={emit}
        className="rich-content min-h-[260px] max-h-[560px] overflow-y-auto px-5 py-4 font-sans text-[16px] leading-[1.7] text-ink outline-none empty:before:text-[#8aa19d] empty:before:content-[attr(data-placeholder)] focus:shadow-[inset_0_0_0_2px_#176b69]"
      />
    </div>
  );
}
