"use client";

import { useState } from "react";

interface EventEditorProps {
  title: string;
  date: string;
  location: string;
  description: string;
  onSave: (updates: { title: string; date: string; location: string; description: string }) => void;
  onClose: () => void;
}

export default function EventEditor({
  title,
  date,
  location,
  description,
  onSave,
  onClose,
}: EventEditorProps) {
  const [form, setForm] = useState({ title, date, location, description });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSave(form);
    onClose();
  };

  return (
    <div className="fixed inset-0 z-[60] flex items-center justify-center p-4">
      <div
        className="absolute inset-0 bg-black/60 backdrop-blur-sm"
        onClick={onClose}
      />
      <div className="relative glass-strong rounded-2xl p-8 w-full max-w-lg glow-border animate-slide-in z-10">
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-xl font-bold gradient-text">Edit Event</h2>
          <button
            onClick={onClose}
            className="text-[var(--es-text-muted)] hover:text-white transition-colors p-1"
          >
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <path d="M18 6 6 18"/><path d="m6 6 12 12"/>
            </svg>
          </button>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-1.5">
            <label className="text-sm font-medium text-[var(--es-text-secondary)]">Event Title</label>
            <input
              type="text"
              value={form.title}
              onChange={(e) => setForm({ ...form, title: e.target.value })}
              className="input-field"
              required
            />
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="space-y-1.5">
              <label className="text-sm font-medium text-[var(--es-text-secondary)]">Date</label>
              <input
                type="date"
                value={form.date}
                onChange={(e) => setForm({ ...form, date: e.target.value })}
                className="input-field"
                required
              />
            </div>
            <div className="space-y-1.5">
              <label className="text-sm font-medium text-[var(--es-text-secondary)]">Location</label>
              <input
                type="text"
                value={form.location}
                onChange={(e) => setForm({ ...form, location: e.target.value })}
                className="input-field"
                placeholder="e.g. San Francisco, CA"
                required
              />
            </div>
          </div>

          <div className="space-y-1.5">
            <label className="text-sm font-medium text-[var(--es-text-secondary)]">Description</label>
            <textarea
              value={form.description}
              onChange={(e) => setForm({ ...form, description: e.target.value })}
              className="input-field min-h-[80px] resize-none"
              rows={3}
            />
          </div>

          <div className="flex items-center gap-3 pt-2">
            <button type="submit" className="btn-primary text-sm">
              Save Changes
            </button>
            <button type="button" onClick={onClose} className="btn-secondary text-sm">
              Cancel
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
