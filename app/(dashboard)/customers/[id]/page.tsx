import { createClient } from "@/lib/supabase/server";
import Link from "next/link";
import { ArrowLeft, Pencil } from "lucide-react";

const STATUS_STYLES: Record<string, string> = {
  pending: "bg-bg text-text-muted",
  partial: "bg-badge-amber-bg text-badge-amber-text",
  paid: "bg-badge-green-bg text-badge-green-text",
  cancelled: "bg-badge-red-bg text-badge-red-text",
};

export default async function CustomerDetailPage({
  params,
  searchParams,
}: {
  params: Promise<{ id: string }>;
  searchParams: Promise<{ success?: string }>;
}) {
  const { id } = await params;
  const { success } = await searchParams;
  const supabase = await createClient();

  const { data: customer } = await supabase
    .from("customers")
    .select(
      "id, customer_number, full_name, whatsapp_number, whatsapp_valid, is_active, packages(name, cycle_type, amount)"
    )
    .eq("id", id)
    .single();

  if (!customer) {
    return <p className="text-text-muted">Customer not found.</p>;
  }

  const pkg: any = Array.isArray(customer.packages) ? customer.packages[0] : customer.packages;

  const { data: bills } = await supabase
    .from("bills")
    .select("id, bill_number, month_label, cycle_start, amount_due, status")
    .eq("customer_id", id)
    .order("bill_number", { ascending: false });

  // Pull payments for all these bills at once, to compute paid/outstanding totals
  const billIds = bills?.map((b) => b.id) ?? [];
  const { data: payments } = billIds.length
    ? await supabase.from("payments").select("bill_id, amount").in("bill_id", billIds)
    : { data: [] as { bill_id: string; amount: number }[] };

  const paidByBill = new Map<string, number>();
  payments?.forEach((p) => {
    paidByBill.set(p.bill_id, (paidByBill.get(p.bill_id) ?? 0) + Number(p.amount));
  });

  const totalBilled = bills?.reduce((sum, b) => sum + Number(b.amount_due), 0) ?? 0;
  const totalPaid = payments?.reduce((sum, p) => sum + Number(p.amount), 0) ?? 0;
  const totalOutstanding = totalBilled - totalPaid;

  return (
    <div>
      {/* Header */}
      <div className="flex flex-wrap items-center gap-3 mb-6">
        <Link
          href="/customers"
          className="w-9 h-9 rounded-full border border-border flex items-center justify-center text-text-muted hover:bg-bg transition shrink-0"
        >
          <ArrowLeft size={16} />
        </Link>
        <h1 className="font-display text-xl sm:text-2xl font-bold text-text whitespace-nowrap">
          {customer.full_name}
        </h1>
        <span className="px-3 py-1 rounded-full text-xs font-semibold bg-bg text-text-muted shrink-0">
          {customer.customer_number}
        </span>
        <span
          className={`px-3 py-1 rounded-full text-xs font-semibold shrink-0 ${
            customer.is_active
              ? "bg-badge-green-bg text-badge-green-text"
              : "bg-bg text-text-muted"
          }`}
        >
          {customer.is_active ? "Active" : "Inactive"}
        </span>

        <Link
          href={`/customers/${customer.id}/edit`}
          className="flex items-center gap-1.5 bg-badge-green-bg text-badge-green-text px-4 py-2 rounded-full text-sm font-medium hover:opacity-80 active:scale-95 transition duration-150 basis-full sm:basis-auto sm:ml-auto justify-center"
        >
          <Pencil size={14} />
          Edit
        </Link>
      </div>
{success && (
        <p className="text-sm text-badge-green-text bg-badge-green-bg rounded-xl px-4 py-2.5 mb-4">
          {success}
        </p>
      )}

      
      {/* Info + Summary */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
        <div className="bg-card border border-border rounded-3xl p-6">
          <h2 className="text-sm font-medium text-text-muted mb-4">Customer Info</h2>
          <dl className="space-y-3 text-sm">
            <div className="flex flex-col sm:flex-row sm:justify-between gap-0.5 sm:gap-0">
              <dt className="text-text-muted">Customer ID</dt>
              <dd className="text-text font-medium">{customer.customer_number}</dd>
            </div>
            <div className="flex flex-col sm:flex-row sm:justify-between gap-0.5 sm:gap-0">
              <dt className="text-text-muted">WhatsApp</dt>
              <dd className="text-text">
                {customer.whatsapp_number || "—"}
                {customer.whatsapp_number && !customer.whatsapp_valid && (
                  <span className="text-badge-red-text ml-1 text-xs">⚠️ invalid</span>
                )}
              </dd>
            </div>
            <div className="flex flex-col sm:flex-row sm:justify-between gap-0.5 sm:gap-0">
              <dt className="text-text-muted">Package</dt>
              <dd className="text-text">{pkg?.name}</dd>
            </div>
            <div className="flex flex-col sm:flex-row sm:justify-between gap-0.5 sm:gap-0">
              <dt className="text-text-muted">Package Price</dt>
              <dd className="text-text">{pkg?.amount} AFN</dd>
            </div>
          </dl>
        </div>

        <div className="bg-card border border-border rounded-3xl p-6">
          <h2 className="text-sm font-medium text-text-muted mb-4">Billing Summary</h2>
          <dl className="space-y-3 text-sm">
            <div className="flex flex-col sm:flex-row sm:justify-between gap-0.5 sm:gap-0">
              <dt className="text-text-muted">Total Bills</dt>
              <dd className="text-text font-medium">{bills?.length ?? 0}</dd>
            </div>
            <div className="flex flex-col sm:flex-row sm:justify-between gap-0.5 sm:gap-0">
              <dt className="text-text-muted">Total Billed</dt>
              <dd className="text-text font-medium">{totalBilled} AFN</dd>
            </div>
            <div className="flex flex-col sm:flex-row sm:justify-between gap-0.5 sm:gap-0">
              <dt className="text-text-muted">Total Paid</dt>
              <dd className="text-badge-green-text font-medium">{totalPaid} AFN</dd>
            </div>
            <div className="flex flex-col sm:flex-row sm:justify-between gap-0.5 sm:gap-0">
              <dt className="text-text-muted">Outstanding</dt>
              <dd className="font-display text-text font-bold text-lg">
                {totalOutstanding > 0 ? totalOutstanding : 0} AFN
              </dd>
            </div>
          </dl>
        </div>
      </div>

      {/* Bill history */}
      <div className="bg-card border border-border rounded-3xl overflow-hidden">
        <h2 className="text-sm font-medium text-text-muted px-6 py-4 border-b border-border">
          Bill History
        </h2>
        <div className="overflow-x-auto">
          <table className="w-full text-sm min-w-[560px]">
            <thead className="bg-bg">
              <tr>
                <th className="text-left px-6 py-3 font-medium text-text-muted text-xs uppercase tracking-wide">
                  Bill #
                </th>
                <th className="text-left px-6 py-3 font-medium text-text-muted text-xs uppercase tracking-wide">
                  Date
                </th>
                <th className="text-left px-6 py-3 font-medium text-text-muted text-xs uppercase tracking-wide">
                  Amount
                </th>
                <th className="text-left px-6 py-3 font-medium text-text-muted text-xs uppercase tracking-wide">
                  Paid
                </th>
                <th className="text-left px-6 py-3 font-medium text-text-muted text-xs uppercase tracking-wide">
                  Status
                </th>
              </tr>
            </thead>
            <tbody>
              {bills?.map((b) => (
                <tr key={b.id} className="border-t border-border hover:bg-bg transition">
                  <td className="px-6 py-3 font-semibold text-forest">
                    <Link href={`/bills/${b.id}`} className="hover:underline">
                      {b.bill_number}
                    </Link>
                  </td>
                  <td className="px-6 py-3 text-text-muted">{b.cycle_start}</td>
                  <td className="px-6 py-3 text-text">{b.amount_due} AFN</td>
                  <td className="px-6 py-3 text-badge-green-text">
                    {paidByBill.get(b.id) ?? 0} AFN
                  </td>
                  <td className="px-6 py-3">
                    <span
                      className={`px-2.5 py-1 rounded-full text-xs font-semibold capitalize ${STATUS_STYLES[b.status]}`}
                    >
                      {b.status}
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        {bills?.length === 0 && (
          <p className="text-center text-text-muted py-10 text-sm">
            No bills yet for this customer
          </p>
        )}
      </div>
    </div>
  );
}