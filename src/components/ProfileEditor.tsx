"use client";

import { useState } from "react";
import type { IProfile } from "@/types";

interface ProfileEditorProps {
  profile: IProfile;
  onSave: (updates: Partial<Omit<IProfile, "id">>) => void;
  onClose: () => void;
}

export default function ProfileEditor({ profile, onSave, onClose }: ProfileEditorProps) {
  const [form, setForm] = useState({
    name: profile.name,
    title: profile.title,
    bio: profile.bio,
    avatarUrl: profile.avatarUrl,
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSave(form);
    onClose();
  };

  return (
    <div className="fixed inset-0 z-[60] flex items-center justify-center p-4">
      {/* Backdrop */}
      <div
        className="absolute inset-0 bg-black/60 backdrop-blur-sm"
        onClick={onClose}
      />

      {/* Modal */}
      <div className="relative glass-strong rounded-2xl p-8 w-full max-w-lg glow-border animate-slide-in z-10">
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-xl font-bold gradient-text">Edit Profile</h2>
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
            <label className="text-sm font-medium text-[var(--es-text-secondary)]">Name</label>
            <input
              type="text"
              value={form.name}
              onChange={(e) => setForm({ ...form, name: e.target.value })}
              className="input-field"
              required
            />
          </div>

          <div className="space-y-1.5">
            <label className="text-sm font-medium text-[var(--es-text-secondary)]">Title</label>
            <input
              type="text"
              value={form.title}
              onChange={(e) => setForm({ ...form, title: e.target.value })}
              className="input-field"
              placeholder="e.g. Senior Software Engineer"
            />
          </div>

          <div className="space-y-1.5">
            <label className="text-sm font-medium text-[var(--es-text-secondary)]">Bio</label>
            <textarea
              value={form.bio}
              onChange={(e) => setForm({ ...form, bio: e.target.value })}
              className="input-field min-h-[100px] resize-none"
              rows={4}
            />
          </div>

          <div className="space-y-1.5">
            <label className="text-sm font-medium text-[var(--es-text-secondary)]">Avatar URL</label>
            <input
              type="url"
              value={form.avatarUrl}
              onChange={(e) => setForm({ ...form, avatarUrl: e.target.value })}
              className="input-field"
              placeholder="https://..."
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
