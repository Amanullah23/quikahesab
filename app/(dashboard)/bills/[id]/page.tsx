import { createClient } from "@/lib/supabase/server";
import Link from "next/link";
import { ArrowLeft, Pencil } from "lucide-react";
import { redirect } from "next/navigation";
import PaymentForm from "./payment-form";
import CancelForm from "./cancel-form";
import WhatsAppButton from "./whatsapp-button";

const STATUS_STYLES: Record<string, string> = {
  pending: "bg-bg text-text-muted",
  partial: "bg-badge-amber-bg text-badge-amber-text",
  paid: "bg-badge-green-bg text-badge-green-text",
  cancelled: "bg-badge-red-bg text-badge-red-text",
};

export default async function BillDetailPage({
  params,
  searchParams,
}: {
  params: Promise<{ id: string }>;
  searchParams: Promise<{ error?: string; success?: string; warning?: string }>;
}) {
  const { id } = await params;
  const { error, success, warning } = await searchParams;
  const supabase = await createClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    redirect("/login");
  }

  const { data: profile } = await supabase
    .from("profiles")
    .select("role")
    .eq("id", user.id)
    .single();
  const isAdmin = profile?.role === "admin";
  const isFinance = profile?.role === "finance";

  const { data: bill } = await supabase
    .from("bills")
    .select(
      `
      id, bill_number, amount_due, status, month_label, cycle_start, cycle_end, comment,
      customers ( full_name, whatsapp_number, whatsapp_valid ),
      packages ( name )
    `,
    )
    .eq("id", id)
    .single();

  if (!bill) {
    return <p className="text-text-muted">Bill not found.</p>;
  }

  const { data: payments } = await supabase
    .from("payments")
    .select("id, amount, paid_at, whatsapp_sent, profiles(full_name)")
    .eq("bill_id", id)
    .order("paid_at", { ascending: false });

  // These were missing — required by every customer?./pkg?. reference below
  const customer: any = Array.isArray(bill.customers) ? bill.customers[0] : bill.customers;
  const pkg: any = Array.isArray(bill.packages) ? bill.packages[0] : bill.packages;

  const totalPaid = payments?.reduce((sum, p) => sum + Number(p.amount), 0) ?? 0;
  const remaining = Number(bill.amount_due) - totalPaid;

  // Declared once now, not twice
  function buildMessage(amount: number, remainingAfter: number) {
    return `Quika ISP — Payment Confirmation
Bill #${bill!.bill_number}
Amount received: ${amount} AFN
Remaining: ${remainingAfter > 0 ? remainingAfter : 0} AFN
Thank you — QuikaHesab`;
  }

  return (
    <div>
      {/* Header */}
      <div className="flex items-center gap-3 mb-6">
        <Link
          href="/bills"
          className="w-9 h-9 rounded-full border border-border flex items-center justify-center text-text-muted hover:bg-bg transition"
        >
          <ArrowLeft size={16} />
        </Link>
        <h1 className="font-display text-2xl font-bold text-text">
          Bill #{bill.bill_number}
        </h1>
        <span
          className={`px-3 py-1 rounded-full text-xs font-semibold capitalize ${STATUS_STYLES[bill.status]}`}
        >
          {bill.status}
        </span>

        <div className="ml-auto flex items-center gap-2">
          {(isAdmin || isFinance) && bill.status !== "cancelled" && (
            <Link
              href={`/bills/${bill.id}/edit`}
              className="flex items-center gap-1.5 bg-badge-green-bg text-badge-green-text px-4 py-2 rounded-full text-sm font-medium hover:opacity-80 active:scale-95 transition duration-150"
            >
              <Pencil size={14} />
              Edit
            </Link>
          )}
          {isAdmin && bill.status !== "cancelled" && (
            <CancelForm billId={bill.id} />
          )}
        </div>
      </div>

      {/* Alerts */}
      {success && (
        <p className="text-sm text-badge-green-text bg-badge-green-bg rounded-xl px-4 py-2.5 mb-4">
          {success}
        </p>
      )}
      {warning && (
        <p className="text-sm text-badge-amber-text bg-badge-amber-bg rounded-xl px-4 py-2.5 mb-4">
          ⚠️ {warning}
        </p>
      )}
      {error && (
        <p className="text-sm text-badge-red-text bg-badge-red-bg rounded-xl px-4 py-2.5 mb-4">
          {error}
        </p>
      )}

      {/* Details + Balance */}
      <div className="grid grid-cols-2 gap-4 mb-6">
        <div className="bg-card border border-border rounded-3xl p-6">
          <h2 className="text-sm font-medium text-text-muted mb-4">Details</h2>
          <dl className="space-y-3 text-sm">
            <div className="flex justify-between">
              <dt className="text-text-muted">Customer</dt>
              <dd className="text-text font-medium">{customer?.full_name}</dd>
            </div>
            <div className="flex justify-between">
              <dt className="text-text-muted">WhatsApp</dt>
              <dd className="text-text">
                {customer?.whatsapp_number}
                {!customer?.whatsapp_valid && (
                  <span className="text-badge-red-text ml-1 text-xs">
                    ⚠️ invalid
                  </span>
                )}
              </dd>
            </div>
            <div className="flex justify-between">
              <dt className="text-text-muted">Package</dt>
              <dd className="text-text">{pkg?.name}</dd>
            </div>
            <div className="flex justify-between">
              <dt className="text-text-muted">Month</dt>
              <dd className="text-text">{bill.month_label}</dd>
            </div>
            <div className="flex justify-between">
              <dt className="text-text-muted">Cycle</dt>
              <dd className="text-text">
                {bill.cycle_start}{" "}
                {bill.cycle_end ? `→ ${bill.cycle_end}` : "(open)"}
              </dd>
            </div>
            {bill.comment && (
              <div className="flex justify-between">
                <dt className="text-text-muted">Comment</dt>
                <dd className="text-text">{bill.comment}</dd>
              </div>
            )}
          </dl>
        </div>

        <div className="bg-card border border-border rounded-3xl p-6">
          <h2 className="text-sm font-medium text-text-muted mb-4">Balance</h2>
          <dl className="space-y-3 text-sm mb-5">
            <div className="flex justify-between">
              <dt className="text-text-muted">Amount Due</dt>
              <dd className="text-text font-medium">{bill.amount_due} AFN</dd>
            </div>
            <div className="flex justify-between">
              <dt className="text-text-muted">Total Paid</dt>
              <dd className="text-badge-green-text font-medium">
                {totalPaid} AFN
              </dd>
            </div>
            <div className="flex justify-between">
              <dt className="text-text-muted">Remaining</dt>
              <dd className="font-display text-text font-bold text-lg">
                {remaining > 0 ? remaining : 0} AFN
              </dd>
            </div>
          </dl>

          {bill.status !== "cancelled" && bill.status !== "paid" && (
            <PaymentForm billId={bill.id} remaining={remaining} />
          )}
        </div>
      </div>

      {/* Payment history */}
      <div className="bg-card border border-border rounded-3xl overflow-hidden">
        <h2 className="text-sm font-medium text-text-muted px-6 py-4 border-b border-border">
          Payment History
        </h2>
        <table className="w-full text-sm">
          <thead className="bg-bg">
            <tr>
              <th className="text-left px-6 py-3 font-medium text-text-muted text-xs uppercase tracking-wide">
                Amount
              </th>
              <th className="text-left px-6 py-3 font-medium text-text-muted text-xs uppercase tracking-wide">
                Date
              </th>
              <th className="text-left px-6 py-3 font-medium text-text-muted text-xs uppercase tracking-wide">
                Collected By
              </th>
              <th className="text-left px-6 py-3 font-medium text-text-muted text-xs uppercase tracking-wide">
                WhatsApp
              </th>
            </tr>
          </thead>
          <tbody>
            {payments?.map((p: any) => (
              <tr key={p.id} className="border-t border-border">
                <td className="px-6 py-3 font-medium text-text">
                  {p.amount} AFN
                </td>
                <td className="px-6 py-3 text-text-muted">
                  {new Date(p.paid_at).toLocaleString()}
                </td>
                <td className="px-6 py-3 text-text-muted">
                  {p.profiles?.full_name}
                </td>
                <td className="px-6 py-3">
                  {p.whatsapp_sent ? (
                    <span className="text-badge-green-text text-xs font-medium">
                      ✅ Sent
                    </span>
                  ) : customer?.whatsapp_valid && customer?.whatsapp_number ? (
                    <WhatsAppButton
                      paymentId={p.id}
                      phone={customer.whatsapp_number}
                      message={buildMessage(Number(p.amount), remaining)}
                    />
                  ) : (
                    <span className="text-badge-red-text text-xs">
                      ⚠️ No valid number
                    </span>
                  )}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
        {payments?.length === 0 && (
          <p className="text-center text-text-muted py-10 text-sm">
            No payments yet
          </p>
        )}
      </div>
    </div>
  );
}