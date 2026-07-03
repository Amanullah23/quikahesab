import { createClient } from "@/lib/supabase/server";
import Link from "next/link";
import { ArrowLeft } from "lucide-react";
import BillForm from "./bill-form";

export default async function NewBillPage({
  searchParams,
}: {
  searchParams: Promise<{ error?: string }>;
}) {
  const { error } = await searchParams;
  const supabase = await createClient();

  const { data: customers } = await supabase
    .from("customers")
    .select("id, full_name")
    .order("full_name");

  const { data: packages } = await supabase
    .from("packages")
    .select("id, name, cycle_type, amount")
    .eq("is_active", true);

  return (
    <div>
      <div className="flex items-center gap-3 mb-6">
        <Link
          href="/bills"
          className="w-9 h-9 rounded-full border border-border flex items-center justify-center text-text-muted hover:bg-bg transition"
        >
          <ArrowLeft size={16} />
        </Link>
        <h1 className="font-display text-2xl font-bold text-text">New Bill</h1>
      </div>

      <BillForm customers={customers ?? []} packages={packages ?? []} error={error} />
    </div>
  );
}