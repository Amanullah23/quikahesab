import { createClient } from "@/lib/supabase/server";
import SidebarNav from "./sidebar-nav";
import HeaderSearch from "./header-search";
import DashboardShell from "./dashboard-shell";
import { Mail, Bell, Receipt } from "lucide-react";
import Link from "next/link";

export default async function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const supabase = await createClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();

  const { data: profile } = await supabase
    .from("profiles")
    .select("full_name, role")
    .eq("id", user!.id)
    .single();

  const now = new Date();
  const startOfToday = new Date(
    Date.UTC(now.getUTCFullYear(), now.getUTCMonth(), now.getUTCDate()),
  );
  const windowEnd = new Date(startOfToday);
  windowEnd.setUTCDate(windowEnd.getUTCDate() + 3);
  const todayStr = startOfToday.toISOString().split("T")[0];
  const windowEndStr = windowEnd.toISOString().split("T")[0];

  const { count: expiringCount } = await supabase
    .from("bills")
    .select("id", { count: "exact", head: true })
    .not("cycle_end", "is", null)
    .neq("status", "cancelled")
    .gte("cycle_end", todayStr)
    .lte("cycle_end", windowEndStr);

  const { count: overdueCount } = await supabase
    .from("overdue_customers")
    .select("id", { count: "exact", head: true });
  const sidebarContent = (
    <>
      <div className="p-6">
        <h1 className="font-display text-xl font-bold text-text">QuikaHesab</h1>
      </div>
      <SidebarNav />
    </>
  );

  const headerContent = (
    <>
      <HeaderSearch />

      <div className="flex items-center gap-3 shrink-0">
        <Link
          href="/bills/expiring"
          className="flex relative w-9 h-9 rounded-full border border-border items-center justify-center text-text-muted hover:bg-bg transition shrink-0"
        >
          <Receipt size={16} />
          {expiringCount && expiringCount > 0 ? (
            <span className="absolute -top-1 -right-1 text-[10px] font-bold bg-badge-red-bg text-badge-red-text w-4 h-4 rounded-full flex items-center justify-center">
              {expiringCount}
            </span>
          ) : null}
        </Link>
        <button className="hidden sm:flex w-9 h-9 rounded-full border border-border items-center justify-center text-text-muted hover:bg-bg transition">
          <Mail size={16} />
        </button>
        <Link
          href="/customers/overdue"
          className="flex relative w-9 h-9 rounded-full border border-border items-center justify-center text-text-muted hover:bg-bg transition shrink-0"
        >
          <Bell size={16} />
          {overdueCount && overdueCount > 0 ? (
            <span className="absolute -top-1 -right-1 text-[10px] font-bold bg-badge-red-bg text-badge-red-text w-4 h-4 rounded-full flex items-center justify-center">
              {overdueCount}
            </span>
          ) : null}
        </Link>

        <div className="flex items-center gap-2.5 pl-1">
          <div className="w-9 h-9 rounded-full bg-forest text-white flex items-center justify-center text-sm font-semibold shrink-0">
            {profile?.full_name?.charAt(0).toUpperCase()}
          </div>
          <div className="hidden sm:block">
            <p className="text-sm font-semibold text-text leading-tight">
              {profile?.full_name}
            </p>
            <p className="text-xs text-text-muted leading-tight">
              {user?.email}
            </p>
          </div>
        </div>
      </div>
    </>
  );

  return (
    <DashboardShell sidebar={sidebarContent} header={headerContent}>
      {children}
    </DashboardShell>
  );
}
