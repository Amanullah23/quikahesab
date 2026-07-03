"use server";

import { createClient } from "@/lib/supabase/server";
import { createAdminClient } from "@/lib/supabase/admin";
import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";

export async function createStaffUser(formData: FormData): Promise<void> {
  const supabase = await createClient();

  const { data: { user } } = await supabase.auth.getUser();
  if (!user) redirect("/login");

  // Verify the requester is really admin — never trust the client
  const { data: profile } = await supabase
    .from("profiles")
    .select("role")
    .eq("id", user.id)
    .single();

  if (profile?.role !== "admin") {
    redirect("/settings?error=Only admin can create staff accounts");
  }

  const email = formData.get("email") as string;
  const password = formData.get("password") as string;
  const full_name = formData.get("full_name") as string;
  const role = formData.get("role") as string;

  if (!email || !password || !full_name || !role) {
    redirect(`/settings?error=${encodeURIComponent("All fields are required")}`);
  }

  if (password.length < 8) {
    redirect(`/settings?error=${encodeURIComponent("Password must be at least 8 characters")}`);
  }

  const admin = createAdminClient();

  const { data: newUser, error: createError } = await admin.auth.admin.createUser({
    email,
    password,
    email_confirm: true,
  });

  if (createError || !newUser.user) {
    redirect(`/settings?error=${encodeURIComponent(createError?.message ?? "Could not create user")}`);
  }

  const { error: profileError } = await admin.from("profiles").insert({
    id: newUser.user!.id,
    full_name,
    role,
  });

  if (profileError) {
    // Roll back: don't leave an orphaned auth user with no profile
    await admin.auth.admin.deleteUser(newUser.user!.id);
    redirect(`/settings?error=${encodeURIComponent(profileError.message)}`);
  }

  revalidatePath("/settings");
  redirect("/settings?success=Staff account created");
}

export async function updatePassword(formData: FormData): Promise<void> {
  const supabase = await createClient();

  const { data: { user } } = await supabase.auth.getUser();
  if (!user) redirect("/login");

  const newPassword = formData.get("new_password") as string;

  if (!newPassword || newPassword.length < 8) {
    redirect(`/settings?error=${encodeURIComponent("Password must be at least 8 characters")}`);
  }

  const { error } = await supabase.auth.updateUser({ password: newPassword });

  if (error) {
    redirect(`/settings?error=${encodeURIComponent(error.message)}`);
  }

  redirect("/settings?success=Password updated");
}