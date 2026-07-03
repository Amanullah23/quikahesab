import { createClient } from "@/lib/supabase/server";
import Link from "next/link";
import { Search, Plus, ChevronLeft, ChevronRight } from "lucide-react";

const STATUS_STYLES: Record<string, string> = {
  pending: "bg-bg text-text-muted",
  partial: "bg-badge-amber-bg text-badge-amber-text",
  paid: "bg-badge-green-bg text-badge-green-text",
  cancelled: "bg-badge-red-bg text-badge-red-text",
};

const PAGE_SIZE = 20;

export default async function BillsPage({
  searchParams,
}: {
  searchParams: Promise<{ status?: string; q?: string; page?: string }>;
}) {
  const { status, q, page: pageParam } = await searchParams;
  const page = Math.max(1, Number(pageParam) || 1);
  const from = (page - 1) * PAGE_SIZE;
  const to = from + PAGE_SIZE - 1;

  const supabase = await createClient();

  let query = supabase
    .from("bills")
    .select("id, bill_number, amount_due, status, month_label, customers(full_name)", {
      count: "exact",
    })
    .order("bill_number", { ascending: false })
    .range(from, to);

  if (status) query = query.eq("status", status);
  if (q) query = query.eq("bill_number", Number(q));

  const { data: bills, error, count } = await query;

  const totalPages = count ? Math.ceil(count / PAGE_SIZE) : 1;

  function pageHref(p: number) {
    const params = new URLSearchParams();
    if (status) params.set("status", status);
    if (q) params.set("q", q);
    params.set("page", String(p));
    return `/bills?${params.toString()}`;
  }

  const tabs = [
    { label: "All", value: "" },
    { label: "Pending", value: "pending" },
    { label: "Partial", value: "partial" },
    { label: "Paid", value: "paid" },
    { label: "Cancelled", value: "cancelled" },
  ];

  return (
    <div>
      <div className="flex flex-col md:flex-row md:items-start justify-between gap-4 mb-8">
        <div>
          <h1 className="font-display text-3xl font-bold text-text">Bills</h1>
          <p className="text-text-muted mt-1">
            {count ?? 0} bills total — page {page} of {totalPages}
          </p>
        </div>
        <Link
          href="/bills/new"
          className="flex items-center justify-center gap-2 bg-forest text-white px-5 py-2.5 rounded-full text-sm font-medium hover:opacity-90 active:scale-95 transition duration-150"
        >
          <Plus size={16} />
          Add Bill
        </Link>
      </div>

      {/* Search */}
      <form className="mb-5" method="get">
        <div className="flex items-center gap-2 bg-card border border-border rounded-full px-4 py-2.5 max-w-xs">
          <Search size={16} className="text-text-muted shrink-0" />
          <input
            type="text"
            name="q"
            defaultValue={q}
            placeholder="Search bill number..."
            className="bg-transparent text-sm text-text placeholder:text-text-muted focus:outline-none w-full"
          />
        </div>
      </form>

      {/* Status tabs */}
      <div className="flex gap-2 mb-6 overflow-x-auto">
        {tabs.map((tab) => (
          <Link
            key={tab.value}
            href={tab.value ? `/bills?status=${tab.value}` : "/bills"}
            className={`px-4 py-2 rounded-full text-sm font-medium transition whitespace-nowrap active:scale-95 duration-150 ${
              (status || "") === tab.value
                ? "bg-forest text-white"
                : "bg-card border border-border text-text-muted hover:bg-bg"
            }`}
          >
            {tab.label}
          </Link>
        ))}
      </div>

      {/* Table */}
      <div className="bg-card border border-border rounded-3xl overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-sm min-w-[640px]">
            <thead className="bg-bg">
              <tr>
                <th className="text-left px-5 py-3.5 font-medium text-text-muted text-xs uppercase tracking-wide">
                  Bill #
                </th>
                <th className="text-left px-5 py-3.5 font-medium text-text-muted text-xs uppercase tracking-wide">
                  Customer
                </th>
                <th className="text-left px-5 py-3.5 font-medium text-text-muted text-xs uppercase tracking-wide">
                  Month
                </th>
                <th className="text-left px-5 py-3.5 font-medium text-text-muted text-xs uppercase tracking-wide">
                  Amount
                </th>
                <th className="text-left px-5 py-3.5 font-medium text-text-muted text-xs uppercase tracking-wide">
                  Status
                </th>
              </tr>
            </thead>
            <tbody>
              {bills?.map((bill: any) => (
                <tr
                  key={bill.id}
                  className="border-t border-border hover:bg-bg transition"
                >
                  <td className="px-5 py-3.5 font-semibold text-forest">
                    <Link href={`/bills/${bill.id}`} className="hover:underline">
                      {bill.bill_number}
                    </Link>
                  </td>
                  <td className="px-5 py-3.5 text-text">{bill.customers?.full_name}</td>
                  <td className="px-5 py-3.5 text-text-muted">{bill.month_label}</td>
                  <td className="px-5 py-3.5 text-text">{bill.amount_due} AFN</td>
                  <td className="px-5 py-3.5">
                    <span
                      className={`px-2.5 py-1 rounded-full text-xs font-semibold capitalize ${STATUS_STYLES[bill.status]}`}
                    >
                      {bill.status}
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {bills?.length === 0 && (
          <p className="text-center text-text-muted py-12 text-sm">No bills found</p>
        )}
        {error && (
          <p className="text-center text-badge-red-text py-12 text-sm">{error.message}</p>
        )}
      </div>

      {/* Pagination */}
      {totalPages > 1 && (
        <div className="flex items-center justify-between mt-5">
          <Link
            href={pageHref(Math.max(1, page - 1))}
            aria-disabled={page === 1}
            className={`flex items-center gap-1.5 px-4 py-2 rounded-full text-sm font-medium border border-border transition ${
              page === 1
                ? "opacity-40 pointer-events-none"
                : "text-text hover:bg-bg active:scale-95"
            }`}
          >
            <ChevronLeft size={15} />
            Previous
          </Link>

          <span className="text-sm text-text-muted">
            Page {page} of {totalPages}
          </span>

          <Link
            href={pageHref(Math.min(totalPages, page + 1))}
            aria-disabled={page === totalPages}
            className={`flex items-center gap-1.5 px-4 py-2 rounded-full text-sm font-medium border border-border transition ${
              page === totalPages
                ? "opacity-40 pointer-events-none"
                : "text-text hover:bg-bg active:scale-95"
            }`}
          >
            Next
            <ChevronRight size={15} />
          </Link>
        </div>
      )}
    </div>
  );
}