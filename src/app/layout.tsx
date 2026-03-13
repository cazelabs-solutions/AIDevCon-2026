import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "EventScribe — AI-Powered Event Learning",
  description:
    "Capture, synthesize, and share your conference learnings with AI-powered note-taking and social content generation.",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" className="dark">
      <head>
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link
          rel="preconnect"
          href="https://fonts.gstatic.com"
          crossOrigin="anonymous"
        />
        <link
          href="https://fonts.googleapis.com/css2?family=Inter:wght@300;400;500;600;700;800&display=swap"
          rel="stylesheet"
        />
      </head>
      <body className="min-h-screen antialiased">
        {/* ── Navigation ─────────────────────────────────────── */}
        <nav className="fixed top-0 left-0 right-0 z-50 glass-strong">
          <div className="mx-auto max-w-6xl flex items-center justify-between px-6 py-4">
            <a href="/" className="flex items-center gap-3 group">
              <div className="relative flex h-9 w-9 items-center justify-center rounded-lg bg-gradient-to-br from-indigo-500 to-violet-600 shadow-lg shadow-indigo-500/25 group-hover:shadow-indigo-500/40 transition-shadow">
                <svg
                  width="18"
                  height="18"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2.5"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  className="text-white"
                >
                  <path d="M12 20h9" />
                  <path d="M16.376 3.622a1 1 0 0 1 3.002 3.002L7.368 18.635a2 2 0 0 1-.855.506l-2.872.838a.5.5 0 0 1-.62-.62l.838-2.872a2 2 0 0 1 .506-.854z" />
                </svg>
              </div>
              <span className="text-lg font-bold tracking-tight">
                Event<span className="gradient-text">Scribe</span>
              </span>
            </a>

            <div className="flex items-center gap-4">
              <a
                href="/event/new"
                className="btn-primary text-sm flex items-center gap-2"
              >
                <svg
                  width="16"
                  height="16"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2.5"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                >
                  <path d="M12 5v14" />
                  <path d="M5 12h14" />
                </svg>
                New Event
              </a>
            </div>
          </div>
        </nav>

        {/* ── Main Content ───────────────────────────────────── */}
        <main className="pt-20">{children}</main>
      </body>
    </html>
  );
}
