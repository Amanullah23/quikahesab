import { createClient } from "@/lib/supabase/server";
import Link from "next/link";
import {
  Plus,
  Upload,
  ChevronLeft,
  ChevronRight,
  ArrowUp,
  ArrowDown,
  ArrowUpDown,
} from "lucide-react";
import CustomerSearch from "./customer-search";
import CustomerRow from "./customer-row";

const PAGE_SIZE = 20;

// Whitelist: only these keys can be sorted, mapped to real DB columns.
// Prevents a crafted URL from sorting by an arbitrary/unsafe column.
const SORTABLE_COLUMNS: Record<string, string> = {
  id: "customer_number",
  name: "full_name",
  status: "is_active",
};

export default async function CustomersPage({
  searchParams,
}: {
  searchParams: Promise<{
    q?: string;
    success?: string;
    page?: string;
    sort?: string;
    dir?: string;
  }>;
}) {
  const { q, success, page: pageParam, sort, dir } = await searchParams;
  const page = Math.max(1, Number(pageParam) || 1);
  const from = (page - 1) * PAGE_SIZE;
  const to = from + PAGE_SIZE - 1;

  const sortKey = sort && SORTABLE_COLUMNS[sort] ? sort : "id";
  const sortColumn = SORTABLE_COLUMNS[sortKey];
  const sortAsc = dir === "desc" ? false : true; // default ascending unless explicitly desc

  const supabase = await createClient();

  let query = supabase
    .from("customers")
    .select(
      "id, customer_number, full_name, whatsapp_number, whatsapp_valid, is_active, packages(name)",
      { count: "exact" },
    )
    .order(sortColumn, { ascending: sortAsc })
    .range(from, to);

  if (q) query = query.ilike("full_name", `%${q}%`);

  const { data: customers, count } = await query;

  const totalPages = count ? Math.ceil(count / PAGE_SIZE) : 1;

  function pageHref(p: number) {
    const params = new URLSearchParams();
    if (q) params.set("q", q);
    if (sort) params.set("sort", sort);
    if (dir) params.set("dir", dir);
    params.set("page", String(p));
    return `/customers?${params.toString()}`;
  }

  function sortHref(key: string) {
    const params = new URLSearchParams();
    if (q) params.set("q", q);
    params.set("sort", key);
    const nextDir = sortKey === key && sortAsc ? "desc" : "asc";
    params.set("dir", nextDir);
    // no page param → resets to page 1
    return `/customers?${params.toString()}`;
  }

  function SortIcon({ column }: { column: string }) {
    if (sortKey !== column) {
      return <ArrowUpDown size={12} className="text-text-muted/50" />;
    }
    return sortAsc ? (
      <ArrowUp size={12} className="text-forest" />
    ) : (
      <ArrowDown size={12} className="text-forest" />
    );
  }

  return (
    <div>
      <div className="flex flex-col md:flex-row md:items-start justify-between gap-4 mb-8">
        <div>
          <h1 className="font-display text-3xl font-bold text-text">
            Customers
          </h1>
          <p className="text-text-muted mt-1">
            {count ?? 0} customers total — page {page} of {totalPages}
          </p>
        </div>
        <div className="flex items-center gap-3">
          <Link
            href="/customers/import"
            className="flex-1 md:flex-none flex items-center justify-center gap-2 border border-border text-text px-5 py-2.5 rounded-full text-sm font-medium hover:bg-bg active:scale-95 transition duration-150"
          >
            <Upload size={15} />
            Import CSV
          </Link>
          <Link
            href="/customers/new"
            className="flex-1 md:flex-none flex items-center justify-center gap-2 bg-forest text-white px-5 py-2.5 rounded-full text-sm font-medium hover:opacity-90 active:scale-95 transition duration-150"
          >
            <Plus size={16} />
            Add Customer
          </Link>
        </div>
      </div>

      {success && (
        <p className="text-sm text-badge-green-text bg-badge-green-bg rounded-xl px-4 py-2.5 mb-4 inline-block">
          {success}
        </p>
      )}

      <div className="mb-6">
        <CustomerSearch />
      </div>

      <div className="bg-card border border-border rounded-3xl overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-sm min-w-160 table-fixed">
            <thead className="bg-bg">
              <tr>
                <th className="w-[12%] text-left px-5 py-3.5 font-medium text-text-muted text-xs uppercase tracking-wide">
                  <Link
                    href={sortHref("id")}
                    className="inline-flex items-center gap-1.5 hover:text-text transition"
                  >
                    ID <SortIcon column="id" />
                  </Link>
                </th>
                <th className="w-[25%] text-left px-5 py-3.5 font-medium text-text-muted text-xs uppercase tracking-wide">
                  <Link
                    href={sortHref("name")}
                    className="inline-flex items-center gap-1.5 hover:text-text transition"
                  >
                    Name <SortIcon column="name" />
                  </Link>
                </th>
                <th className="w-[25%] text-left px-5 py-3.5 font-medium text-text-muted text-xs uppercase tracking-wide">
                  WhatsApp
                </th>
                <th className="w-[23%] text-left px-5 py-3.5 font-medium text-text-muted text-xs uppercase tracking-wide">
                  Package
                </th>
                <th className="w-[15%] text-left px-5 py-3.5 font-medium text-text-muted text-xs uppercase tracking-wide">
                  <Link
                    href={sortHref("status")}
                    className="inline-flex items-center gap-1.5 hover:text-text transition"
                  >
                    Status <SortIcon column="status" />
                  </Link>
                </th>
              </tr>
            </thead>
            <tbody>
              {customers?.map((c: any) => (
                <CustomerRow key={c.id} href={`/customers/${c.id}`}>
                  <td className="px-5 py-3.5 text-text-muted font-medium truncate">
                    {c.customer_number}
                  </td>
                  <td className="px-5 py-3.5 font-semibold text-forest truncate">
                    {c.full_name}
                  </td>
                  <td className="px-5 py-3.5 text-text-muted truncate">
                    {c.whatsapp_number || "—"}
                    {c.whatsapp_number && !c.whatsapp_valid && (
                      <span className="text-badge-red-text ml-1 text-xs">
                        ⚠️ invalid
                      </span>
                    )}
                  </td>
                  <td className="px-5 py-3.5 text-text truncate">
                    {c.packages?.name}
                  </td>
                  <td className="px-5 py-3.5">
                    <span
                      className={`px-2.5 py-1 rounded-full text-xs font-semibold ${
                        c.is_active
                          ? "bg-badge-green-bg text-badge-green-text"
                          : "bg-bg text-text-muted"
                      }`}
                    >
                      {c.is_active ? "Active" : "Inactive"}
                    </span>
                  </td>
                </CustomerRow>
              ))}
            </tbody>
          </table>
        </div>

        {customers?.length === 0 && (
          <p className="text-center text-text-muted py-12 text-sm">
            No customers found
          </p>
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