"use server";

import { createClient } from "@/lib/supabase/server";

export type SearchResult = {
  type: "bill" | "customer";
  id: string;
  title: string;
  subtitle: string;
};

export async function globalSearch(query: string): Promise<SearchResult[]> {
  if (!query || query.trim().length < 1) return [];

  const supabase = await createClient();
  const results: SearchResult[] = [];

  // Search bills by number (only if query looks numeric)
  const asNumber = Number(query);
  if (!isNaN(asNumber)) {
    const { data: bills } = await supabase
      .from("bills")
      .select("id, bill_number, status, customers(full_name)")
      .eq("bill_number", asNumber)
      .limit(5);

    bills?.forEach((b: any) => {
      results.push({
        type: "bill",
        id: b.id,
        title: `Bill #${b.bill_number}`,
        subtitle: `${b.customers?.full_name ?? "Unknown"} — ${b.status}`,
      });
    });
  }

  // Search customers by name (partial match)
  const { data: customers } = await supabase
    .from("customers")
    .select("id, full_name, whatsapp_number")
    .ilike("full_name", `%${query}%`)
    .limit(5);

  customers?.forEach((c) => {
    results.push({
      type: "customer",
      id: c.id,
      title: c.full_name,
      subtitle: c.whatsapp_number || "No WhatsApp number",
    });
  });

  return results;
}