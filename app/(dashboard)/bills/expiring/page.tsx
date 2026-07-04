import { createClient } from "@/lib/supabase/server";
import Link from "next/link";
import { ArrowLeft, Clock } from "lucide-react";
import BillRow from "../bill-row";

const EXPIRY_WINDOW_DAYS = 3;

export default async function ExpiringBillsPage() {
  const supabase = await createClient();

  const now = new Date();
  const startOfToday = new Date(Date.UTC(now.getUTCFullYear(), now.getUTCMonth(), now.getUTCDate()));
  const windowEnd = new Date(startOfToday);
  windowEnd.setUTCDate(windowEnd.getUTCDate() + EXPIRY_WINDOW_DAYS);
  const todayStr = startOfToday.toISOString().split("T")[0];
  const windowEndStr = windowEnd.toISOString().split("T")[0];

  const { data: expiringSoon } = await supabase
    .from("bills")
    .select("id, bill_number, cycle_end, amount_due, status, customers(full_name, whatsapp_number)")
    .not("cycle_end", "is", null)
    .neq("status", "cancelled")
    .gte("cycle_end", todayStr)
    .lte("cycle_end", windowEndStr)
    .order("cycle_end", { ascending: true });

  const STATUS_STYLES: Record<string, string> = {
    pending: "bg-bg text-text-muted",
    partial: "bg-badge-amber-bg text-badge-amber-text",
    paid: "bg-badge-green-bg text-badge-green-text",
  };

  return (
    <div>
      <div className="flex items-center gap-3 mb-8">
        <Link
          href="/"
          className="w-9 h-9 rounded-full border border-border flex items-center justify-center text-text-muted hover:bg-bg transition shrink-0"
        >
          <ArrowLeft size={16} />
        </Link>
        <div>
          <h1 className="font-display text-2xl sm:text-3xl font-bold text-text flex items-center gap-2">
            <Clock size={22} className="text-badge-amber-text" />
            Expiring Soon
          </h1>
          <p className="text-text-muted mt-1">
            {expiringSoon?.length ?? 0} bill(s) expiring in the next {EXPIRY_WINDOW_DAYS} days
          </p>
        </div>
      </div>

      <div className="bg-card border border-border rounded-3xl overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-sm min-w-[640px] table-fixed">
            <thead className="bg-bg">
              <tr>
                <th className="w-[30%] text-left px-5 py-3.5 font-medium text-text-muted text-xs uppercase tracking-wide">
                  Customer
                </th>
                <th className="w-[15%] text-left px-5 py-3.5 font-medium text-text-muted text-xs uppercase tracking-wide">
                  Bill #
                </th>
                <th className="w-[20%] text-left px-5 py-3.5 font-medium text-text-muted text-xs uppercase tracking-wide">
                  Amount
                </th>
                <th className="w-[15%] text-left px-5 py-3.5 font-medium text-text-muted text-xs uppercase tracking-wide">
                  Status
                </th>
                <th className="w-[20%] text-left px-5 py-3.5 font-medium text-text-muted text-xs uppercase tracking-wide">
                  Expires
                </th>
              </tr>
            </thead>
            <tbody>
              {expiringSoon?.map((b: any) => (
                <BillRow key={b.id} href={`/bills/${b.id}`}>
                  <td className="px-5 py-3.5 font-semibold text-forest truncate">
                    {b.customers?.full_name}
                  </td>
                  <td className="px-5 py-3.5 text-text truncate">{b.bill_number}</td>
                  <td className="px-5 py-3.5 text-text truncate">{b.amount_due} AFN</td>
                  <td className="px-5 py-3.5">
                    <span
                      className={`px-2.5 py-1 rounded-full text-xs font-semibold capitalize ${STATUS_STYLES[b.status]}`}
                    >
                      {b.status}
                    </span>
                  </td>
                  <td className="px-5 py-3.5 text-badge-amber-text font-medium truncate">
                    {b.cycle_end}
                  </td>
                </BillRow>
              ))}
            </tbody>
          </table>
        </div>

        {(!expiringSoon || expiringSoon.length === 0) && (
          <p className="text-center text-text-muted py-12 text-sm">
            No bills expiring in the next {EXPIRY_WINDOW_DAYS} days 🎉
          </p>
        )}
      </div>
    </div>
  );
}