"use client";

import { useState } from "react";
import type { IAIContent } from "@/types";

interface AIContentDisplayProps {
  content: IAIContent;
}

export default function AIContentDisplay({ content }: AIContentDisplayProps) {
  const [activeTab, setActiveTab] = useState<"recap" | "linkedin" | "twitter">(
    "recap"
  );
  const [copied, setCopied] = useState(false);

  const tabs = [
    { id: "recap" as const, label: "Recap", icon: "📝" },
    { id: "linkedin" as const, label: "LinkedIn", icon: "💼" },
    { id: "twitter" as const, label: "X / Twitter", icon: "🐦" },
  ];

  const currentContent =
    activeTab === "recap"
      ? content.recap
      : activeTab === "linkedin"
      ? content.linkedInDraft
      : content.twitterDraft;

  const handleCopy = async () => {
    await navigator.clipboard.writeText(currentContent);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handlePostToLinkedIn = () => {
    const text = encodeURIComponent(content.linkedInDraft);
    window.open(
      `https://www.linkedin.com/feed/?shareActive=true&text=${text}`,
      "_blank",
      "noopener,noreferrer"
    );
  };

  const handlePostToTwitter = () => {
    const text = encodeURIComponent(content.twitterDraft);
    window.open(
      `https://twitter.com/intent/tweet?text=${text}`,
      "_blank",
      "noopener,noreferrer"
    );
  };

  return (
    <div className="space-y-4 animate-slide-in">
      {/* ── Tab Bar ──────────────────────────────────────────── */}
      <div className="flex items-center gap-1 p-1 rounded-xl bg-[var(--es-bg-secondary)]">
        {tabs.map((tab) => (
          <button
            key={tab.id}
            onClick={() => setActiveTab(tab.id)}
            className={`flex-1 flex items-center justify-center gap-2 px-4 py-2.5 rounded-lg text-sm font-medium transition-all ${
              activeTab === tab.id
                ? "bg-gradient-to-r from-indigo-500/20 to-violet-500/20 text-white border border-indigo-500/30"
                : "text-[var(--es-text-muted)] hover:text-[var(--es-text-secondary)]"
            }`}
          >
            <span>{tab.icon}</span>
            {tab.label}
          </button>
        ))}
      </div>

      {/* ── Content ──────────────────────────────────────────── */}
      <div className="relative glass rounded-xl p-5">
        <div className="absolute top-4 right-4 flex items-center gap-2">
          {activeTab === "linkedin" && (
            <button
              onClick={handlePostToLinkedIn}
              className="flex items-center gap-1.5 text-xs px-3 py-1.5 rounded-lg font-medium text-white transition-all"
              style={{ background: "#0A66C2" }}
              title="Post to LinkedIn"
            >
              <svg width="14" height="14" viewBox="0 0 24 24" fill="currentColor">
                <path d="M20.447 20.452h-3.554v-5.569c0-1.328-.027-3.037-1.852-3.037-1.853 0-2.136 1.445-2.136 2.939v5.667H9.351V9h3.414v1.561h.046c.477-.9 1.637-1.85 3.37-1.85 3.601 0 4.267 2.37 4.267 5.455v6.286zM5.337 7.433c-1.144 0-2.063-.926-2.063-2.065 0-1.138.92-2.063 2.063-2.063 1.14 0 2.064.925 2.064 2.063 0 1.139-.925 2.065-2.064 2.065zm1.782 13.019H3.555V9h3.564v11.452zM22.225 0H1.771C.792 0 0 .774 0 1.729v20.542C0 23.227.792 24 1.771 24h20.451C23.2 24 24 23.227 24 22.271V1.729C24 .774 23.2 0 22.222 0h.003z"/>
              </svg>
              Post to LinkedIn
            </button>
          )}
          {activeTab === "twitter" && (
            <button
              onClick={handlePostToTwitter}
              className="flex items-center gap-1.5 text-xs px-3 py-1.5 rounded-lg font-medium text-white bg-black border border-gray-700 hover:bg-gray-900 transition-all"
              title="Post to X"
            >
              <svg width="13" height="13" viewBox="0 0 24 24" fill="currentColor">
                <path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z"/>
              </svg>
              Post to X
            </button>
          )}
          <button
            onClick={handleCopy}
            className="btn-secondary text-xs px-3 py-1.5 flex items-center gap-1.5"
          >
            {copied ? (
              <>
                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M20 6 9 17l-5-5"/>
                </svg>
                Copied!
              </>
            ) : (
              <>
                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <rect width="14" height="14" x="8" y="8" rx="2" ry="2"/>
                  <path d="M4 16c-1.1 0-2-.9-2-2V4c0-1.1.9-2 2-2h10c1.1 0 2 .9 2 2"/>
                </svg>
                Copy
              </>
            )}
          </button>
        </div>

        <pre className="whitespace-pre-wrap text-sm text-[var(--es-text-secondary)] leading-relaxed font-[inherit] pr-40">
          {currentContent}
        </pre>

        <div className="mt-4 pt-3 border-t border-[var(--es-border)] flex items-center gap-2 text-xs text-[var(--es-text-muted)]">
          <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <path d="M12 2v4"/><path d="m6.343 6.343 2.828 2.828"/><path d="M2 12h4"/><path d="m6.343 17.657 2.828-2.828"/><path d="M12 18v4"/><path d="m17.657 17.657-2.828-2.828"/><path d="M18 12h4"/><path d="m17.657 6.343-2.828 2.828"/>
          </svg>
          Generated {new Date(content.generatedAt).toLocaleString()}
        </div>
      </div>
    </div>
  );
}
