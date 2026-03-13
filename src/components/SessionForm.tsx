"use client";

import { useState } from "react";

interface SessionFormProps {
  onAdd: (session: {
    title: string;
    speaker: string;
    time: string;
    takeaway: string;
  }) => Promise<void>;
}

export default function SessionForm({ onAdd }: SessionFormProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  const [form, setForm] = useState({
    title: "",
    speaker: "",
    time: "",
    takeaway: "",
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!form.title.trim()) return;
    setLoading(true);
    await onAdd(form);
    setForm({ title: "", speaker: "", time: "", takeaway: "" });
    setLoading(false);
    setIsOpen(false);
  };

  if (!isOpen) {
    return (
      <button
        onClick={() => setIsOpen(true)}
        className="btn-secondary w-full flex items-center justify-center gap-2 text-sm"
      >
        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
          <path d="M12 5v14"/><path d="M5 12h14"/>
        </svg>
        Add Session
      </button>
    );
  }

  return (
    <form onSubmit={handleSubmit} className="card animate-slide-in space-y-4">
      <h4 className="text-sm font-semibold text-[var(--es-text-secondary)] uppercase tracking-wider">
        New Session
      </h4>
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
        <input
          type="text"
          placeholder="Session title"
          value={form.title}
          onChange={(e) => setForm({ ...form, title: e.target.value })}
          className="input-field"
          required
        />
        <input
          type="text"
          placeholder="Speaker name"
          value={form.speaker}
          onChange={(e) => setForm({ ...form, speaker: e.target.value })}
          className="input-field"
        />
        <input
          type="text"
          placeholder="Time (e.g. 09:00 AM)"
          value={form.time}
          onChange={(e) => setForm({ ...form, time: e.target.value })}
          className="input-field"
        />
      </div>
      <textarea
        placeholder="Key takeaway from this session..."
        value={form.takeaway}
        onChange={(e) => setForm({ ...form, takeaway: e.target.value })}
        className="input-field min-h-[80px] resize-none"
        rows={3}
      />
      <div className="flex items-center gap-3">
        <button type="submit" className="btn-primary text-sm" disabled={loading}>
          {loading ? "Adding..." : "Add Session"}
        </button>
        <button
          type="button"
          className="btn-secondary text-sm"
          onClick={() => setIsOpen(false)}
        >
          Cancel
        </button>
      </div>
    </form>
  );
}
