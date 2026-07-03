"use server";

import { createClient } from "@/lib/supabase/server";
import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";

export async function createPackage(formData: FormData): Promise<void> {
  const supabase = await createClient();

  const { data: { user } } = await supabase.auth.getUser();
  if (!user) redirect("/login");

  const name = formData.get("name") as string;
  const cycle_type = formData.get("cycle_type") as string;
  const amount = Number(formData.get("amount"));
  const data_gb = formData.get("data_gb") as string;

  if (!name || !cycle_type || !amount || amount <= 0) {
    redirect(`/packages/new?error=${encodeURIComponent("Fill in name, type, and a valid amount")}`);
  }

  if (cycle_type === "data_based" && !data_gb) {
    redirect(`/packages/new?error=${encodeURIComponent("Enter data amount (GB) for data-based packages")}`);
  }

  const { error } = await supabase.from("packages").insert({
    name,
    cycle_type,
    amount,
    data_gb: cycle_type === "data_based" ? Number(data_gb) : null,
  });

  if (error) {
    redirect(`/packages/new?error=${encodeURIComponent(error.message)}`);
  }

  revalidatePath("/packages");
  redirect("/packages?success=Package added");
}

export async function updatePackage(formData: FormData): Promise<void> {
  const supabase = await createClient();

  const { data: { user } } = await supabase.auth.getUser();
  if (!user) redirect("/login");

  const package_id = formData.get("package_id") as string;
  const name = formData.get("name") as string;
  const amount = Number(formData.get("amount"));
  const data_gb = formData.get("data_gb") as string;
  const cycle_type = formData.get("cycle_type") as string;
  const is_active = formData.get("is_active") === "on";

  if (!name || !amount || amount <= 0) {
    redirect(`/packages/${package_id}/edit?error=${encodeURIComponent("Enter a valid name and amount")}`);
  }

  const { error } = await supabase
    .from("packages")
    .update({
      name,
      amount,
      data_gb: cycle_type === "data_based" ? Number(data_gb) : null,
      is_active,
    })
    .eq("id", package_id);

  if (error) {
    redirect(`/packages/${package_id}/edit?error=${encodeURIComponent(error.message)}`);
  }

  revalidatePath("/packages");
  redirect("/packages?success=Package updated");
}