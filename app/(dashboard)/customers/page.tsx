import { createClient } from "@/lib/supabase/server";
import Link from "next/link";
import { Plus, Upload } from "lucide-react";
import CustomerSearch from "./customer-search";
import CustomerRow from "./customer-row";

export default async function CustomersPage({
  searchParams,
}: {
  searchParams: Promise<{ q?: string; success?: string }>;
}) {
  const { q, success } = await searchParams;
  const supabase = await createClient();

  let query = supabase
    .from("customers")
    .select(
      "id, customer_number, full_name, whatsapp_number, whatsapp_valid, is_active, packages(name)",
    )
    .order("customer_number")
    .limit(100);

  if (q) query = query.ilike("full_name", `%${q}%`);

  const { data: customers } = await query;

  return (
    <div>
      <div className="flex flex-col md:flex-row md:items-start justify-between gap-4 mb-8">
        <div>
          <h1 className="font-display text-3xl font-bold text-text">
            Customers
          </h1>
          <p className="text-text-muted mt-1">
            {customers?.length ?? 0} customers shown
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
          <table className="w-full text-sm min-w-160">
            <thead className="bg-bg">
              <tr>
                <th className="text-left px-5 py-3.5 font-medium text-text-muted text-xs uppercase tracking-wide">
                  ID
                </th>
                <th className="text-left px-5 py-3.5 font-medium text-text-muted text-xs uppercase tracking-wide">
                  Name
                </th>
                <th className="text-left px-5 py-3.5 font-medium text-text-muted text-xs uppercase tracking-wide">
                  WhatsApp
                </th>
                <th className="text-left px-5 py-3.5 font-medium text-text-muted text-xs uppercase tracking-wide">
                  Package
                </th>
                <th className="text-left px-5 py-3.5 font-medium text-text-muted text-xs uppercase tracking-wide">
                  Status
                </th>
              </tr>
            </thead>
            <tbody>
              {customers?.map((c: any) => (
                <CustomerRow key={c.id} href={`/customers/${c.id}/edit`}>
                  <td className="px-5 py-3.5 text-text-muted font-medium">
                    {c.customer_number}
                  </td>
                  <td className="px-5 py-3.5 font-semibold text-forest">
                    {c.full_name}
                  </td>
                  <td className="px-5 py-3.5 text-text-muted">
                    {c.whatsapp_number || "—"}
                    {c.whatsapp_number && !c.whatsapp_valid && (
                      <span className="text-badge-red-text ml-1 text-xs">
                        ⚠️ invalid
                      </span>
                    )}
                  </td>
                  <td className="px-5 py-3.5 text-text">{c.packages?.name}</td>
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
    </div>
  );
}
