"use client";

import { useState, useEffect } from "react";
import { usePathname } from "next/navigation";
import { Menu, PanelLeftClose, PanelLeft } from "lucide-react";

export default function DashboardShell({
  sidebar,
  header,
  children,
}: {
  sidebar: React.ReactNode;
  header: React.ReactNode;
  children: React.ReactNode;
}) {
  const [mobileOpen, setMobileOpen] = useState(false);
  const [desktopOpen, setDesktopOpen] = useState(true);
  const pathname = usePathname();

  // Auto-close the mobile drawer whenever the route changes
  useEffect(() => {
    setMobileOpen(false);
  }, [pathname]);

  return (
    <div className="min-h-screen bg-bg p-0 md:p-4">
      <div className="max-w-[1600px] mx-auto flex bg-card md:rounded-3xl border-0 md:border border-border overflow-hidden shadow-sm min-h-screen md:min-h-[calc(100vh-2rem)] relative">
        {/* Mobile-only dark overlay behind the drawer */}
        {mobileOpen && (
          <div
            onClick={() => setMobileOpen(false)}
            className="fixed inset-0 bg-black/40 z-40 md:hidden"
          />
        )}

        {/* Sidebar: slide-in drawer on mobile, collapsible column on desktop */}
        <aside
          className={`fixed md:static top-0 left-0 h-full flex flex-col border-r border-border bg-card z-50 transition-all duration-200 overflow-hidden ${
            mobileOpen ? "translate-x-0" : "-translate-x-full"
          } md:translate-x-0 ${
            desktopOpen ? "w-64" : "md:w-0 md:border-r-0"
          } w-64`}
        >
          <div className={`w-64 flex flex-col h-full ${desktopOpen ? "" : "md:opacity-0"}`}>
            {sidebar}
          </div>
        </aside>

        {/* Main area */}
        <div className="flex-1 flex flex-col min-w-0">
          <header className="h-16 md:h-20 flex items-center gap-2 px-4 md:px-8 border-b border-border">
            {/* Mobile: hamburger opens the drawer */}
            <button
              onClick={() => setMobileOpen(true)}
              title="Open sidebar"
              className="md:hidden w-9 h-9 rounded-full border border-border flex items-center justify-center text-text-muted shrink-0"
            >
              <Menu size={18} />
            </button>

            {/* Desktop: toggle collapses/expands the sidebar */}
            <button
              onClick={() => setDesktopOpen(!desktopOpen)}
              title={desktopOpen ? "Close sidebar" : "Open sidebar"}
              className="hidden md:flex w-9 h-9 rounded-full border border-border items-center justify-center text-text-muted hover:bg-bg transition shrink-0"
            >
              {desktopOpen ? <PanelLeftClose size={17} /> : <PanelLeft size={17} />}
            </button>

            <div className="flex-1 flex items-center justify-between gap-4 min-w-0">
              {header}
            </div>
          </header>

          <main className="flex-1 p-4 md:p-8 overflow-x-auto">{children}</main>
        </div>
      </div>
    </div>
  );
}