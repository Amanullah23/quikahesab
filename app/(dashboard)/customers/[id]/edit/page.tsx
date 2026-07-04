import { createClient } from "@/lib/supabase/server";
import Link from "next/link";
import CustomerForm from "../../new/customer-form";
import { updateCustomer } from "../../actions";
import { ArrowLeft } from "lucide-react";

export default async function EditCustomerPage({
  params,
  searchParams,
}: {
  params: Promise<{ id: string }>;
  searchParams: Promise<{ error?: string }>;
}) {
  const { id } = await params;
  const { error } = await searchParams;
  const supabase = await createClient();

const { data: customer } = await supabase
  .from("customers")
  .select("id, customer_number, full_name, whatsapp_number, whatsapp_valid, is_active, package_id")
  .eq("id", id)
  .single();

  const { data: packages } = await supabase
    .from("packages")
    .select("id, name")
    .eq("is_active", true);

  if (!customer) {
    return <p className="text-slate-500">Customer not found.</p>;
  }

  return (
    <div>
      <div className="flex items-center gap-3 mb-6">
  <Link
  href={`/customers/${id}`}
  className="w-9 h-9 rounded-full border border-border flex items-center justify-center text-text-muted hover:bg-bg transition"
>
  <ArrowLeft size={16} />
</Link>
  <h1 className="font-display text-2xl font-bold text-text">Edit Customer</h1>
</div>

      <CustomerForm
        action={updateCustomer}
        packages={packages ?? []}
        error={error}
        defaultValues={customer}
      />
    </div>
  );
}