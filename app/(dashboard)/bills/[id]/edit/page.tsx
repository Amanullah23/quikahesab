import { createClient } from "@/lib/supabase/server";
import Link from "next/link";
import { redirect } from "next/navigation";
import EditForm from "./edit-form";

export default async function EditBillPage({
  params,
  searchParams,
}: {
  params: Promise<{ id: string }>;
  searchParams: Promise<{ error?: string }>;
}) {
  const { id } = await params;
  const { error } = await searchParams;
  const supabase = await createClient();

  // Role gate: only admin/finance may reach this page
  const { data: { user } } = await supabase.auth.getUser();
  const { data: profile } = await supabase
    .from("profiles")
    .select("role")
    .eq("id", user!.id)
    .single();

  if (profile?.role !== "admin" && profile?.role !== "finance") {
    redirect("/bills");
  }

  const { data: bill } = await supabase
    .from("bills")
    .select("id, bill_number, amount_due, cycle_start, comment, status")
    .eq("id", id)
    .single();

  if (!bill) {
    return <p className="text-slate-500">Bill not found.</p>;
  }

  if (bill.status === "cancelled") {
    redirect(`/bills/${id}?error=${encodeURIComponent("Cannot edit a cancelled bill")}`);
  }

  return (
    <div>
      <div className="flex items-center gap-3 mb-6">
        <Link href={`/bills/${id}`} className="text-slate-400 hover:text-slate-600">
          ← Back
        </Link>
        <h1 className="text-2xl font-bold text-slate-900">Edit Bill #{bill.bill_number}</h1>
      </div>

      <EditForm bill={bill} error={error} />
    </div>
  );
}