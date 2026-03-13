"use client";

import { useState } from "react";

interface NoteEditorProps {
  onSave: (content: string) => Promise<void>;
}

export default function NoteEditor({ onSave }: NoteEditorProps) {
  const [content, setContent] = useState("");
  const [loading, setLoading] = useState(false);

  const handleSave = async () => {
    if (!content.trim()) return;
    setLoading(true);
    await onSave(content.trim());
    setContent("");
    setLoading(false);
  };

  return (
    <div className="space-y-3">
      <textarea
        placeholder="Capture your thoughts, insights, and key learnings..."
        value={content}
        onChange={(e) => setContent(e.target.value)}
        className="input-field min-h-[120px] resize-none"
        rows={5}
      />
      <button
        onClick={handleSave}
        disabled={loading || !content.trim()}
        className="btn-primary text-sm"
      >
        {loading ? (
          <span className="flex items-center gap-2">
            <svg className="animate-spin h-4 w-4" viewBox="0 0 24 24" fill="none">
              <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"/>
              <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"/>
            </svg>
            Saving...
          </span>
        ) : (
          "Save Note"
        )}
      </button>
    </div>
  );
}
