import { createClient } from "@/lib/supabase/server";
import Link from "next/link";
import { ArrowLeft, AlertTriangle } from "lucide-react";
import CustomerRow from "../customer-row";

export default async function OverdueCustomersPage() {
  const supabase = await createClient();

  const { data: overdue } = await supabase
    .from("overdue_customers")
    .select("*")
    .order("total_outstanding", { ascending: false });

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
            <AlertTriangle size={22} className="text-badge-red-text" />
            Overdue Customers
          </h1>
          <p className="text-text-muted mt-1">
            {overdue?.length ?? 0} customer(s) with 2+ unpaid bills
          </p>
        </div>
      </div>

      <div className="bg-card border border-border rounded-3xl overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-sm min-w-[560px] table-fixed">
            <thead className="bg-bg">
              <tr>
                <th className="w-[40%] text-left px-5 py-3.5 font-medium text-text-muted text-xs uppercase tracking-wide">
                  Customer
                </th>
                <th className="w-[30%] text-left px-5 py-3.5 font-medium text-text-muted text-xs uppercase tracking-wide">
                  Unpaid Bills
                </th>
                <th className="w-[30%] text-left px-5 py-3.5 font-medium text-text-muted text-xs uppercase tracking-wide">
                  Outstanding
                </th>
              </tr>
            </thead>
            <tbody>
              {overdue?.map((o: any) => (
                <CustomerRow key={o.id} href={`/customers/${o.id}`}>
                  <td className="px-5 py-3.5 font-semibold text-forest truncate">
                    {o.full_name}
                  </td>
                  <td className="px-5 py-3.5 text-text truncate">{o.unpaid_bills}</td>
                  <td className="px-5 py-3.5 text-badge-red-text font-semibold truncate">
                    {o.total_outstanding} AFN
                  </td>
                </CustomerRow>
              ))}
            </tbody>
          </table>
        </div>

        {(!overdue || overdue.length === 0) && (
          <p className="text-center text-text-muted py-12 text-sm">
            No overdue customers right now 🎉
          </p>
        )}
      </div>
    </div>
  );
}