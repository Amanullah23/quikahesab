import { createClient } from "@/lib/supabase/server";
import Link from "next/link";
import { Plus } from "lucide-react";

export default async function PackagesPage({
  searchParams,
}: {
  searchParams: Promise<{ success?: string }>;
}) {
  const { success } = await searchParams;
  const supabase = await createClient();

  const { data: packages } = await supabase
    .from("packages")
    .select("id, name, cycle_type, data_gb, amount, is_active")
    .order("name");

  return (
    <div>
      <div className="flex flex-col md:flex-row md:items-start justify-between gap-4 mb-8">
        <div>
          <h1 className="font-display text-3xl font-bold text-text">
            Packages
          </h1>
          <p className="text-text-muted mt-1">
            {packages?.length ?? 0} packages
          </p>
        </div>
        <Link
          href="/packages/new"
          className="flex items-center justify-center gap-2 bg-forest text-white px-5 py-2.5 rounded-full text-sm font-medium hover:opacity-90 active:scale-95 transition duration-150"
        >
          <Plus size={16} />
          Add Package
        </Link>
      </div>

      {success && (
        <p className="text-sm text-badge-green-text bg-badge-green-bg rounded-xl px-4 py-2.5 mb-4 inline-block">
          {success}
        </p>
      )}

      <div className="bg-card border border-border rounded-3xl overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-sm min-w-160">
            <thead className="bg-bg">
              <tr>
                <th className="text-left px-5 py-3.5 font-medium text-text-muted text-xs uppercase tracking-wide">
                  Name
                </th>
                <th className="text-left px-5 py-3.5 font-medium text-text-muted text-xs uppercase tracking-wide">
                  Type
                </th>
                <th className="text-left px-5 py-3.5 font-medium text-text-muted text-xs uppercase tracking-wide">
                  Data
                </th>
                <th className="text-left px-5 py-3.5 font-medium text-text-muted text-xs uppercase tracking-wide">
                  Price
                </th>
                <th className="text-left px-5 py-3.5 font-medium text-text-muted text-xs uppercase tracking-wide">
                  Status
                </th>
              </tr>
            </thead>
            <tbody>
              {packages?.map((p) => (
                <tr
                  key={p.id}
                  className="border-t border-border hover:bg-bg transition"
                >
                  <td className="px-5 py-3.5 font-semibold text-forest">
                    <Link
                      href={`/packages/${p.id}/edit`}
                      className="hover:underline"
                    >
                      {p.name}
                    </Link>
                  </td>
                  <td className="px-5 py-3.5 text-text-muted capitalize">
                    {p.cycle_type.replace("_", " ")}
                  </td>
                  <td className="px-5 py-3.5 text-text-muted">
                    {p.data_gb ? `${p.data_gb} GB` : "—"}
                  </td>
                  <td className="px-5 py-3.5 text-text">{p.amount} AFN</td>
                  <td className="px-5 py-3.5">
                    <span
                      className={`px-2.5 py-1 rounded-full text-xs font-semibold ${
                        p.is_active
                          ? "bg-badge-green-bg text-badge-green-text"
                          : "bg-bg text-text-muted"
                      }`}
                    >
                      {p.is_active ? "Active" : "Inactive"}
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        {packages?.length === 0 && (
          <p className="text-center text-text-muted py-12 text-sm">
            No packages yet
          </p>
        )}
      </div>
    </div>
  );
}
