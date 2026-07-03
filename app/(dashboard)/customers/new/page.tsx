import { createClient } from "@/lib/supabase/server";
import Link from "next/link";
import CustomerForm from "./customer-form";
import { createCustomer } from "../actions";
import { ArrowLeft } from "lucide-react";

export default async function NewCustomerPage({
  searchParams,
}: {
  searchParams: Promise<{ error?: string }>;
}) {
  const { error } = await searchParams;
  const supabase = await createClient();

  const { data: packages } = await supabase
    .from("packages")
    .select("id, name")
    .eq("is_active", true);

  return (
    <div>
      <div className="flex items-center gap-3 mb-6">
  <Link
    href="/customers"
    className="w-9 h-9 rounded-full border border-border flex items-center justify-center text-text-muted hover:bg-bg transition"
  >
    <ArrowLeft size={16} />
  </Link>
  <h1 className="font-display text-2xl font-bold text-text">New Customer</h1>
</div>

      <CustomerForm action={createCustomer} packages={packages ?? []} error={error} />
    </div>
  );
}