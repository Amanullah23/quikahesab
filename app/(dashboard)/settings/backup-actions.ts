"use server";

import { createClient } from "@/lib/supabase/server";
import { createAdminClient } from "@/lib/supabase/admin";
import { revalidatePath } from "next/cache";

type ImportResult = {
  success: boolean;
  error?: string;
  counts?: { packages: number; customers: number; bills: number; payments: number };
  remapped?: number;
  skipped?: { table: string; id: string; reason: string }[];
};

export async function importBackup(formData: FormData): Promise<ImportResult> {
  const supabase = await createClient();

const { data: { user } } = await supabase.auth.getUser();
if (!user) return { success: false, error: "Not logged in" };

const userId = user.id; // captured once, after the null-check, so TypeScript can safely narrow it inside closures below

const { data: profile } = await supabase
  .from("profiles")
  .select("role")
  .eq("id", userId)
  .single();

  if (profile?.role !== "admin") {
    return { success: false, error: "Only admin can restore a backup" };
  }

  const file = formData.get("backup_file") as File;
  if (!file) return { success: false, error: "No file selected" };

  let parsed: any;
  try {
    const text = await file.text();
    parsed = JSON.parse(text);
  } catch {
    return { success: false, error: "File is not valid JSON" };
  }

  if (!parsed?.meta?.app || parsed.meta.app !== "QuikaHesab") {
    return { success: false, error: "This doesn't look like a QuikaHesab backup file" };
  }

  const admin = createAdminClient();
  const skipped: { table: string; id: string; reason: string }[] = [];
  const counts = { packages: 0, customers: 0, bills: 0, payments: 0 };

  // Known profile IDs in THIS database — used to detect references that won't exist
  // (e.g. restoring into a different project) and remap them to the current admin instead.
  const { data: knownProfiles } = await admin.from("profiles").select("id");
  const knownProfileIds = new Set((knownProfiles ?? []).map((p) => p.id));
  let remapped = 0;

  function remapProfileRef(id: string | null): string | null {
  if (!id) return id;
  if (knownProfileIds.has(id)) return id;
  remapped++;
  return userId;
}

  // 1. Packages (no foreign keys to worry about)
  for (const pkg of parsed.packages ?? []) {
    const { error } = await admin.from("packages").upsert(
      {
        id: pkg.id,
        name: pkg.name,
        cycle_type: pkg.cycle_type,
        data_gb: pkg.data_gb,
        validity_days: pkg.validity_days,
        amount: pkg.amount,
        is_active: pkg.is_active,
        created_at: pkg.created_at,
      },
      { onConflict: "id" }
    );
    if (error) skipped.push({ table: "packages", id: pkg.id, reason: error.message });
    else counts.packages++;
  }

  // 2. Customers (reference packages)
  for (const cust of parsed.customers ?? []) {
    const { error } = await admin.from("customers").upsert(
      {
        id: cust.id,
        customer_number: cust.customer_number,
        full_name: cust.full_name,
        whatsapp_number: cust.whatsapp_number,
        whatsapp_valid: cust.whatsapp_valid,
        package_id: cust.package_id,
        is_active: cust.is_active,
        created_at: cust.created_at,
      },
      { onConflict: "id" }
    );
    if (error) skipped.push({ table: "customers", id: cust.id, reason: error.message });
    else counts.customers++;
  }

  // 3. Bills (reference customers, packages, and profiles for created_by/cancelled_by)
  for (const bill of parsed.bills ?? []) {
    const { error } = await admin.from("bills").upsert(
      {
        id: bill.id,
        bill_number: bill.bill_number,
        customer_id: bill.customer_id,
        package_id: bill.package_id,
        amount_due: bill.amount_due,
        cycle_start: bill.cycle_start,
        cycle_end: bill.cycle_end,
        month_label: bill.month_label,
        status: bill.status,
        comment: bill.comment,
        cancelled_at: bill.cancelled_at,
        cancelled_by: remapProfileRef(bill.cancelled_by),
        created_by: remapProfileRef(bill.created_by),
        created_at: bill.created_at,
        updated_at: bill.updated_at,
      },
      { onConflict: "id" }
    );
    if (error) skipped.push({ table: "bills", id: bill.id, reason: error.message });
    else counts.bills++;
  }

  // 4. Payments (reference bills and profiles for collected_by)
  for (const p of parsed.payments ?? []) {
    const { error } = await admin.from("payments").upsert(
      {
        id: p.id,
        local_id: p.local_id,
        bill_id: p.bill_id,
        amount: p.amount,
        paid_at: p.paid_at,
        collected_by: remapProfileRef(p.collected_by) ?? userId,
        whatsapp_sent: p.whatsapp_sent,
        note: p.note,
        created_at: p.created_at,
      },
      { onConflict: "id" }
    );
    if (error) skipped.push({ table: "payments", id: p.id, reason: error.message });
    else counts.payments++;
  }

  revalidatePath("/");
  revalidatePath("/bills");
  revalidatePath("/customers");
  revalidatePath("/packages");

  return { success: true, counts, remapped, skipped };
}