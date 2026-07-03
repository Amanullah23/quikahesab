import { createClient } from "@/lib/supabase/server";
import Link from "next/link";
import { ArrowUpRight, Upload } from "lucide-react";
import AnimatedGrid from "./animated-grid";

export default async function DashboardHome() {
  const supabase = await createClient();

  const { data: bills } = await supabase.from("bills").select("status");

  const counts = {
    pending: bills?.filter((b) => b.status === "pending").length ?? 0,
    partial: bills?.filter((b) => b.status === "partial").length ?? 0,
    paid: bills?.filter((b) => b.status === "paid").length ?? 0,
    cancelled: bills?.filter((b) => b.status === "cancelled").length ?? 0,
  };
  const total = bills?.length ?? 0;

  const { count: activeCustomers } = await supabase
    .from("customers")
    .select("*", { count: "exact", head: true })
    .eq("is_active", true);

  const { count: totalCustomers } = await supabase
    .from("customers")
    .select("*", { count: "exact", head: true });

  const todayStart = new Date();
  todayStart.setHours(0, 0, 0, 0);

  const { data: todayPayments } = await supabase
    .from("payments")
    .select("amount")
    .gte("paid_at", todayStart.toISOString());

  const todayCount = todayPayments?.length ?? 0;
  const todayTotal =
    todayPayments?.reduce((sum, p) => sum + Number(p.amount), 0) ?? 0;

  const { data: overdue } = await supabase
    .from("overdue_customers")
    .select("*")
    .order("total_outstanding", { ascending: false })
    .limit(10);

  const cards = [
    {
      label: "Pending",
      value: counts.pending,
      badge: "bg-badge-amber-bg text-badge-amber-text",
      href: "/bills?status=pending",
    },
    {
      label: "Partial",
      value: counts.partial,
      badge: "bg-badge-amber-bg text-badge-amber-text",
      href: "/bills?status=partial",
    },
    {
      label: "Paid",
      value: counts.paid,
      badge: "bg-badge-green-bg text-badge-green-text",
      href: "/bills?status=paid",
    },
    {
      label: "Cancelled",
      value: counts.cancelled,
      badge: "bg-badge-red-bg text-badge-red-text",
      href: "/bills?status=cancelled",
    },
  ];

  return (
    <div>
      <div className="flex flex-col md:flex-row md:items-start justify-between gap-4 mb-8">
        <div>
          <h1 className="font-display text-3xl font-bold text-text">
            Dashboard
          </h1>
          <p className="text-text-muted mt-1">
            Welcome to QuikaHesab — {total} total bills
          </p>
        </div>
        <div className="flex items-center gap-3">
          <Link
            href="/customers/import"
            className="flex-1 md:flex-none flex items-center justify-center gap-2 border border-border text-text px-4 py-2.5 rounded-full text-sm font-medium hover:bg-bg active:scale-95 transition duration-150 whitespace-nowrap"
          >
            <Upload size={15} />
            Import CSV
          </Link>
          <Link
            href="/bills/new"
            className="flex-1 md:flex-none flex items-center justify-center gap-2 bg-forest text-white px-5 py-2.5 rounded-full text-sm font-medium hover:opacity-90 active:scale-95 transition duration-150 whitespace-nowrap"
          >
            + Add Bill
          </Link>
        </div>
      </div>

      <AnimatedGrid className="grid grid-cols-2 md:grid-cols-4 gap-3 md:gap-4 mb-6">
        {cards.map((c, i) => {
          const isHighlighted = i === 0;
          return (
            <Link
              key={c.label}
              href={c.href}
              className={`rounded-3xl p-5 transition hover:shadow-md ${
                isHighlighted
                  ? "bg-forest text-white"
                  : "bg-card border border-border text-text"
              }`}
            >
              <div className="flex items-center justify-between mb-5">
                <p
                  className={`text-sm ${isHighlighted ? "text-white/70" : "text-text-muted"}`}
                >
                  {c.label}
                </p>
                <span
                  className={`w-8 h-8 rounded-full flex items-center justify-center ${
                    isHighlighted ? "bg-white/15" : "bg-bg"
                  }`}
                >
                  <ArrowUpRight
                    size={15}
                    className={isHighlighted ? "text-white" : "text-text-muted"}
                  />
                </span>
              </div>
              <span className="font-display text-4xl font-bold">{c.value}</span>
              <div className="mt-3">
                <span
                  className={`px-2.5 py-1 rounded-full text-xs font-semibold ${
                    isHighlighted ? "bg-white/15 text-white" : c.badge
                  }`}
                >
                  {total > 0 ? Math.round((c.value / total) * 100) : 0}%
                </span>
              </div>
            </Link>
          );
        })}
      </AnimatedGrid>

      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-4">
        <div className="bg-card border border-border rounded-3xl p-5">
          <h2 className="text-sm text-text-muted mb-4">Customers</h2>
          <span className="font-display text-4xl font-bold text-text">
            {activeCustomers ?? 0}
          </span>
          <p className="text-sm text-text-muted mt-3">
            active of {totalCustomers ?? 0} total
          </p>
        </div>

        <div className="bg-card border border-border rounded-3xl p-5">
          <h2 className="text-sm text-text-muted mb-4">Today's Collections</h2>
          <span className="font-display text-4xl font-bold text-text">
            {todayCount}
          </span>
          <p className="text-sm text-text-muted mt-3">
            transactions · {todayTotal.toLocaleString()} AFN
          </p>
        </div>

        <div className="bg-card border border-border rounded-3xl p-5 col-span-2">
          <h2 className="text-sm text-text-muted mb-4">
            Overdue Customers{" "}
            <span className="text-text-muted/70">(2+ unpaid bills)</span>
          </h2>
          {overdue && overdue.length > 0 ? (
            <table className="w-full text-sm">
              <thead>
                <tr className="text-left text-text-muted text-xs">
                  <th className="pb-2 font-medium">Customer</th>
                  <th className="pb-2 font-medium">Unpaid</th>
                  <th className="pb-2 font-medium">Outstanding</th>
                </tr>
              </thead>
              <tbody>
                {overdue.map((o: any) => (
                  <tr key={o.id} className="border-t border-border">
                    <td className="py-2 text-text font-medium">
                      {o.full_name}
                    </td>
                    <td className="py-2 text-text-muted">{o.unpaid_bills}</td>
                    <td className="py-2 text-badge-red-text font-semibold">
                      {o.total_outstanding} AFN
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          ) : (
            <p className="text-sm text-text-muted py-4">
              No overdue customers right now 🎉
            </p>
          )}
        </div>
      </div>
    </div>
  );
}
