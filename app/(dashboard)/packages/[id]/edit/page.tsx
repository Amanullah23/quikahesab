import { createClient } from "@/lib/supabase/server";
import Link from "next/link";
import { ArrowLeft } from "lucide-react";
import PackageForm from "../../new/package-form";
import { updatePackage } from "../../actions";

export default async function EditPackagePage({
  params,
  searchParams,
}: {
  params: Promise<{ id: string }>;
  searchParams: Promise<{ error?: string }>;
}) {
  const { id } = await params;
  const { error } = await searchParams;
  const supabase = await createClient();

  const { data: pkg } = await supabase
    .from("packages")
    .select("id, name, cycle_type, data_gb, amount, is_active")
    .eq("id", id)
    .single();

  if (!pkg) {
    return <p className="text-text-muted">Package not found.</p>;
  }

  return (
    <div>
      <div className="flex items-center gap-3 mb-6">
        <Link
          href="/packages"
          className="w-9 h-9 rounded-full border border-border flex items-center justify-center text-text-muted hover:bg-bg transition"
        >
          <ArrowLeft size={16} />
        </Link>
        <h1 className="font-display text-2xl font-bold text-text">Edit Package</h1>
      </div>

      <PackageForm action={updatePackage} error={error} defaultValues={pkg} />
    </div>
  );
}