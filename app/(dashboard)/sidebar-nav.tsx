"use client";

import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import {
  LayoutDashboard,
  Receipt,
  Users,
  Package,
  Settings,
  HelpCircle,
  LogOut,
} from "lucide-react";
import { createClient } from "@/lib/supabase/client";

const mainNav = [
  { href: "/", label: "Dashboard", icon: LayoutDashboard },
  { href: "/bills", label: "Bills", icon: Receipt },
  { href: "/customers", label: "Customers", icon: Users },
  { href: "/packages", label: "Packages", icon: Package },
];

export default function SidebarNav() {
  const pathname = usePathname();
  const router = useRouter();

  async function handleLogout() {
    const supabase = createClient();
    await supabase.auth.signOut();
    router.push("/login");
    router.refresh();
  }

  function renderLink(item: { href: string; label: string; icon: any }) {
    const isActive =
      item.href === "/" ? pathname === "/" : pathname.startsWith(item.href);
    const Icon = item.icon;

    return (
      <div key={item.href} className="relative flex items-center">
        {isActive && (
          <span className="absolute -left-4 h-7 w-1.5 rounded-full bg-forest" />
        )}
        <Link
          href={item.href}
          className={`flex items-center gap-3 w-full px-3 py-2.5 rounded-xl text-sm transition ${
            isActive ? "bg-bg" : "hover:bg-bg"
          }`}
        >
          <span
            className={`w-8 h-8 rounded-lg flex items-center justify-center shrink-0 ${
              isActive ? "bg-forest text-white" : "text-text-muted"
            }`}
          >
            <Icon size={16} strokeWidth={2} />
          </span>
          <span
            className={`${
              isActive
                ? "text-text font-semibold"
                : "text-text-muted font-medium"
            }`}
          >
            {item.label}
          </span>
        </Link>
      </div>
    );
  }

  return (
    <nav className="flex-1 px-4 mt-4 flex flex-col">
      <p className="text-[11px] font-medium tracking-wider text-text-muted uppercase px-3 mb-2">
        Menu
      </p>
      <div className="space-y-1">{mainNav.map(renderLink)}</div>

      <p className="text-[11px] font-medium tracking-wider text-text-muted uppercase px-3 mb-2 mt-3">
        General
      </p>
      <div className="space-y-1">
        <Link
          href="/settings"
          className={`flex items-center gap-3 px-3 py-2 rounded-xl text-sm transition ${
            pathname.startsWith("/settings")
              ? "bg-bg text-text font-semibold"
              : "text-text-muted hover:bg-bg hover:text-text font-medium"
          }`}
        >
          <span
            className={`w-8 h-8 rounded-lg flex items-center justify-center ${
              pathname.startsWith("/settings") ? "bg-forest text-white" : ""
            }`}
          >
            <Settings size={16} strokeWidth={2} />
          </span>
          Settings
        </Link>

        <Link
          href="/help"
          className={`flex items-center gap-3 px-3 py-2 rounded-xl text-sm transition ${
            pathname.startsWith("/help")
              ? "bg-bg text-text font-semibold"
              : "text-text-muted hover:bg-bg hover:text-text font-medium"
          }`}
        >
          <span
            className={`w-8 h-8 rounded-lg flex items-center justify-center ${
              pathname.startsWith("/help") ? "bg-forest text-white" : ""
            }`}
          >
            <HelpCircle size={16} strokeWidth={2} />
          </span>
          Help
        </Link>
        <button
          onClick={handleLogout}
          className="flex items-center gap-3 px-3 py-2 rounded-xl text-sm text-badge-red-text hover:bg-badge-red-bg transition w-full text-left cursor-pointer"
        >
          <span className="w-8 h-8 rounded-lg flex items-center justify-center">
            <LogOut size={16} strokeWidth={2} />
          </span>
          <span className="font-medium">Logout</span>
        </button>
      </div>
    </nav>
  );
}
