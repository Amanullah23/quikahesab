"use server";

import { createClient } from "@/lib/supabase/server";
import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";

export async function createBill(formData: FormData): Promise<void> {
  const supabase = await createClient();

  const { data: { user } } = await supabase.auth.getUser();
  if (!user) {
    redirect("/login");
  }

  const bill_number = Number(formData.get("bill_number"));
  const customer_id = formData.get("customer_id") as string;
  const package_id = formData.get("package_id") as string;
  const amount_due = Number(formData.get("amount_due"));
  const cycle_start = formData.get("cycle_start") as string;
  const cycle_type = formData.get("cycle_type") as string;
  const comment = formData.get("comment") as string;

  if (!bill_number || !customer_id || !package_id || !amount_due || !cycle_start) {
    redirect(`/bills/new?error=${encodeURIComponent("Please fill in all required fields")}`);
  }

  const { data: existing } = await supabase
    .from("bills")
    .select("id")
    .eq("bill_number", bill_number)
    .maybeSingle();

  if (existing) {
    redirect(`/bills/new?error=${encodeURIComponent(`Bill number ${bill_number} already exists`)}`);
  }

  let cycle_end: string | null = null;
  if (cycle_type === "monthly") {
    const start = new Date(cycle_start);
    const end = new Date(start);
    end.setMonth(end.getMonth() + 1);
    cycle_end = end.toISOString().split("T")[0];
  }

  const month_label = cycle_start.slice(0, 7);

  const { error } = await supabase.from("bills").insert({
    bill_number,
    customer_id,
    package_id,
    amount_due,
    cycle_start,
    cycle_end,
    month_label,
    comment: comment || null,
    created_by: user.id,
  });

  if (error) {
    redirect(`/bills/new?error=${encodeURIComponent(error.message)}`);
  }

  revalidatePath("/bills");
  redirect("/bills");
}

export async function recordPayment(formData: FormData): Promise<void> {
  const supabase = await createClient();

  const { data: { user } } = await supabase.auth.getUser();
  if (!user) {
    redirect("/login");
  }

  const bill_id = formData.get("bill_id") as string;
  const amount = Number(formData.get("amount"));

  if (!bill_id || !amount || amount <= 0) {
    redirect(`/bills/${bill_id}?error=${encodeURIComponent("Enter a valid amount")}`);
  }

  // Fetch bill + customer to check WhatsApp validity and remaining balance
  const { data: bill } = await supabase
    .from("bills")
    .select("amount_due, status, customers(whatsapp_number, whatsapp_valid, full_name)")
    .eq("id", bill_id)
    .single();

  if (!bill) {
    redirect("/bills?error=Bill not found");
  }

  if (bill!.status === "cancelled") {
    redirect(`/bills/${bill_id}?error=${encodeURIComponent("Cannot pay a cancelled bill")}`);
  }

  const customer = Array.isArray(bill!.customers) ? bill!.customers[0] : bill!.customers;
  const whatsappOk = customer?.whatsapp_valid && customer?.whatsapp_number;

  const { error } = await supabase.from("payments").insert({
    bill_id,
    amount,
    collected_by: user.id,
    whatsapp_sent: false, // set true only after the agent actually sends it (Step 21+)
  });

  if (error) {
    redirect(`/bills/${bill_id}?error=${encodeURIComponent(error.message)}`);
  }

  revalidatePath(`/bills/${bill_id}`);
  revalidatePath("/bills");

  if (!whatsappOk) {
    redirect(`/bills/${bill_id}?warning=${encodeURIComponent("Payment recorded, but WhatsApp number is invalid — confirmation not sent")}`);
  }

  redirect(`/bills/${bill_id}?success=${encodeURIComponent("Payment recorded")}`);
}
export async function cancelBill(formData: FormData): Promise<void> {
  const supabase = await createClient();

  const { data: { user } } = await supabase.auth.getUser();
  if (!user) {
    redirect("/login");
  }

  const bill_id = formData.get("bill_id") as string;
  const comment = formData.get("comment") as string;

  const { error } = await supabase
    .from("bills")
    .update({
      cancelled_at: new Date().toISOString(),
      comment: comment || null,
    })
    .eq("id", bill_id);

  if (error) {
    // This is exactly where the guard trigger's error surfaces
    // if a non-admin somehow reaches this action
    redirect(`/bills/${bill_id}?error=${encodeURIComponent(error.message)}`);
  }

  revalidatePath(`/bills/${bill_id}`);
  revalidatePath("/bills");
  redirect(`/bills/${bill_id}?success=${encodeURIComponent("Bill cancelled")}`);
}
export async function updateBill(formData: FormData): Promise<void> {
  const supabase = await createClient();

  const { data: { user } } = await supabase.auth.getUser();
  if (!user) {
    redirect("/login");
  }

  const bill_id = formData.get("bill_id") as string;
  const amount_due = Number(formData.get("amount_due"));
  const cycle_start = formData.get("cycle_start") as string;
  const comment = formData.get("comment") as string;

  if (!bill_id || !amount_due || amount_due <= 0 || !cycle_start) {
    redirect(`/bills/${bill_id}/edit?error=${encodeURIComponent("Enter a valid amount and start date")}`);
  }

  const month_label = cycle_start.slice(0, 7);

  const { error } = await supabase
    .from("bills")
    .update({
      amount_due,
      cycle_start,
      month_label,
      comment: comment || null,
    })
    .eq("id", bill_id);

  if (error) {
    // Surfaces here if RLS blocks a collector who somehow reached this action
    redirect(`/bills/${bill_id}/edit?error=${encodeURIComponent(error.message)}`);
  }

  revalidatePath(`/bills/${bill_id}`);
  revalidatePath("/bills");
  redirect(`/bills/${bill_id}?success=${encodeURIComponent("Bill updated")}`);
}
export async function markWhatsAppSent(paymentId: string): Promise<void> {
  const supabase = await createClient();

  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return;

  await supabase
    .from("payments")
    .update({ whatsapp_sent: true })
    .eq("id", paymentId);

  revalidatePath("/bills");
}