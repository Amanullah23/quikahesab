import { createClient } from "@/lib/supabase/server";
import SidebarNav from "./sidebar-nav";
import HeaderSearch from "./header-search";
import DashboardShell from "./dashboard-shell";
import { Mail, Bell } from "lucide-react";

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
        <button className="hidden sm:flex w-9 h-9 rounded-full border border-border items-center justify-center text-text-muted hover:bg-bg transition">
          <Mail size={16} />
        </button>
        <button className="hidden sm:flex w-9 h-9 rounded-full border border-border items-center justify-center text-text-muted hover:bg-bg transition">
          <Bell size={16} />
        </button>

        <div className="flex items-center gap-2.5 pl-1">
          <div className="w-9 h-9 rounded-full bg-forest text-white flex items-center justify-center text-sm font-semibold shrink-0">
            {profile?.full_name?.charAt(0).toUpperCase()}
          </div>
          <div className="hidden sm:block">
            <p className="text-sm font-semibold text-text leading-tight">
              {profile?.full_name}
            </p>
            <p className="text-xs text-text-muted leading-tight">{user?.email}</p>
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