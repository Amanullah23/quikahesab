"use server";

import { createClient } from "@/lib/supabase/server";
import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";

export async function createCustomer(formData: FormData): Promise<void> {
  const supabase = await createClient();

  const { data: { user } } = await supabase.auth.getUser();
  if (!user) redirect("/login");

  const full_name = formData.get("full_name") as string;
  const whatsapp_number = formData.get("whatsapp_number") as string;
  const package_id = formData.get("package_id") as string;
  const rawId = (formData.get("customer_number") as string) ?? "";
  const customer_number = rawId.trim().toUpperCase();

  if (!full_name || !package_id || !customer_number) {
    redirect(`/customers/new?error=${encodeURIComponent("ID, name, and package are required")}`);
  }

  // Format check: one or more letters, then exactly two digits (A05, AA05, etc.)
  if (!/^[A-Z]+\d{2}$/.test(customer_number)) {
    redirect(`/customers/new?error=${encodeURIComponent("ID must look like A05, B10, AA01, etc.")}`);
  }

  const { data: existing } = await supabase
    .from("customers")
    .select("id")
    .eq("customer_number", customer_number)
    .maybeSingle();

  if (existing) {
    redirect(`/customers/new?error=${encodeURIComponent(`ID ${customer_number} is already in use`)}`);
  }

  const { error } = await supabase.from("customers").insert({
    customer_number,
    full_name,
    whatsapp_number: whatsapp_number || null,
    package_id,
  });

  if (error) {
    redirect(`/customers/new?error=${encodeURIComponent(error.message)}`);
  }

  revalidatePath("/customers");
  redirect("/customers?success=Customer added");
}

export async function updateCustomer(formData: FormData): Promise<void> {
  const supabase = await createClient();

  const { data: { user } } = await supabase.auth.getUser();
  if (!user) redirect("/login");

  const customer_id = formData.get("customer_id") as string;
  const full_name = formData.get("full_name") as string;
  const whatsapp_number = formData.get("whatsapp_number") as string;
  const package_id = formData.get("package_id") as string;
  const whatsapp_valid = formData.get("whatsapp_valid") === "on";
  const is_active = formData.get("is_active") === "on";

  if (!full_name || !package_id) {
    redirect(`/customers/${customer_id}/edit?error=${encodeURIComponent("Name and package are required")}`);
  }

  const { error } = await supabase
    .from("customers")
    .update({
      full_name,
      whatsapp_number: whatsapp_number || null,
      package_id,
      whatsapp_valid,
      is_active,
    })
    .eq("id", customer_id);

  if (error) {
    redirect(`/customers/${customer_id}/edit?error=${encodeURIComponent(error.message)}`);
  }

revalidatePath("/customers");
revalidatePath(`/customers/${customer_id}`);
redirect(`/customers/${customer_id}?success=Customer updated`);
}