"use client";

import { Bold, Code2, Heading2, ImagePlus, Italic, Link2, List, ListOrdered, Quote, Redo2, Underline, Undo2 } from "lucide-react";
import { useEffect, useRef, useState } from "react";

type RichTextEditorProps = {
  id: string;
  value: string;
  placeholder?: string;
  onChange: (value: string) => void;
};

export function RichTextEditor({ id, value, placeholder, onChange }: RichTextEditorProps) {
  const editorRef = useRef<HTMLDivElement>(null);
  const [assetUrl, setAssetUrl] = useState("");

  useEffect(() => {
    if (editorRef.current && editorRef.current.innerHTML !== value) editorRef.current.innerHTML = value;
  }, [value]);

  function emitChange() {
    onChange(editorRef.current?.innerHTML ?? "");
  }

  function command(name: string, commandValue?: string) {
    editorRef.current?.focus();
    document.execCommand(name, false, commandValue);
    emitChange();
  }

  function addLink() {
    const url = assetUrl.trim();
    if (!url) return;
    command("createLink", url);
    setAssetUrl("");
  }

  function addImage() {
    const url = assetUrl.trim();
    if (!url) return;
    editorRef.current?.focus();
    document.execCommand("insertHTML", false, `<figure><img src="${url.replace(/"/g, "&quot;")}" alt="Project image" /><figcaption>Project media</figcaption></figure><p><br></p>`);
    emitChange();
    setAssetUrl("");
  }

  return (
    <div className="rich-editor" data-testid="rich-text-editor">
      <div className="rich-toolbar" role="toolbar" aria-label="Project content formatting">
        <div className="rich-toolbar-group">
          <button type="button" title="Heading" aria-label="Heading" onClick={() => command("formatBlock", "h2")}><Heading2 size={16} /></button>
          <button type="button" title="Bold" aria-label="Bold" onClick={() => command("bold")}><Bold size={16} /></button>
          <button type="button" title="Italic" aria-label="Italic" onClick={() => command("italic")}><Italic size={16} /></button>
          <button type="button" title="Underline" aria-label="Underline" onClick={() => command("underline")}><Underline size={16} /></button>
        </div>
        <div className="rich-toolbar-group">
          <button type="button" title="Bullet list" aria-label="Bullet list" onClick={() => command("insertUnorderedList")}><List size={16} /></button>
          <button type="button" title="Numbered list" aria-label="Numbered list" onClick={() => command("insertOrderedList")}><ListOrdered size={16} /></button>
          <button type="button" title="Quote" aria-label="Quote" onClick={() => command("formatBlock", "blockquote")}><Quote size={16} /></button>
          <button type="button" title="Code" aria-label="Code" onClick={() => command("formatBlock", "pre")}><Code2 size={16} /></button>
        </div>
        <div className="rich-toolbar-group">
          <button type="button" title="Undo" aria-label="Undo" onClick={() => command("undo")}><Undo2 size={16} /></button>
          <button type="button" title="Redo" aria-label="Redo" onClick={() => command("redo")}><Redo2 size={16} /></button>
        </div>
        <div className="rich-asset-actions">
          <input aria-label="Link or image URL" value={assetUrl} onChange={(event) => setAssetUrl(event.target.value)} placeholder="Paste a link or uploaded image URL" />
          <button type="button" onClick={addLink}><Link2 size={15} /> Link</button>
          <button type="button" onClick={addImage}><ImagePlus size={15} /> Image</button>
        </div>
      </div>
      <div id={id} ref={editorRef} className="rich-editor-surface" contentEditable suppressContentEditableWarning role="textbox" aria-multiline="true" data-placeholder={placeholder} onInput={emitChange} onBlur={emitChange} />
      <p className="rich-editor-help">Use the toolbar for formatting. Uploading an image in this project inserts it into this page automatically.</p>
    </div>
  );
}
