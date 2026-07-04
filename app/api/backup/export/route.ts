import { createClient } from "@/lib/supabase/server";
import { createAdminClient } from "@/lib/supabase/admin";
import { NextResponse } from "next/server";

export async function GET() {
  const supabase = await createClient();

  const { data: { user } } = await supabase.auth.getUser();
  if (!user) {
    return NextResponse.json({ error: "Not logged in" }, { status: 401 });
  }

  const { data: profile } = await supabase
    .from("profiles")
    .select("role")
    .eq("id", user.id)
    .single();

  if (profile?.role !== "admin") {
    return NextResponse.json({ error: "Only admin can export a backup" }, { status: 403 });
  }

  const admin = createAdminClient();

  const [{ data: packages }, { data: customers }, { data: bills }, { data: payments }] =
    await Promise.all([
      admin.from("packages").select("*"),
      admin.from("customers").select("*"),
      admin.from("bills").select("*"),
      admin.from("payments").select("*"),
    ]);

  const backup = {
    meta: {
      app: "QuikaHesab",
      version: 1,
      exported_at: new Date().toISOString(),
    },
    packages: packages ?? [],
    customers: customers ?? [],
    bills: bills ?? [],
    payments: payments ?? [],
  };

  const dateStr = new Date().toISOString().split("T")[0];

  return new NextResponse(JSON.stringify(backup, null, 2), {
    headers: {
      "Content-Type": "application/json",
      "Content-Disposition": `attachment; filename="quikahesab-backup-${dateStr}.json"`,
    },
  });
}