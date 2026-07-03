import { createClient } from "@/lib/supabase/server";
import { createStaffUser, updatePassword } from "./actions";

export default async function SettingsPage({
  searchParams,
}: {
  searchParams: Promise<{ error?: string; success?: string }>;
}) {
  const { error, success } = await searchParams;
  const supabase = await createClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();
  const { data: profile } = await supabase
    .from("profiles")
    .select("full_name, role")
    .eq("id", user!.id)
    .single();

  const isAdmin = profile?.role === "admin";

  const { data: staff } = isAdmin
    ? await supabase.from("profiles").select("full_name, role").order("role")
    : { data: null };

  const inputClass =
    "w-full px-4 py-2.5 border border-border rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-forest bg-bg";
  const labelClass = "block text-sm font-medium text-text mb-1.5";

  return (
    <div>
      <h1 className="font-display text-3xl font-bold text-text mb-1">
        Settings
      </h1>
      <p className="text-text-muted mb-8">
        Signed in as {profile?.full_name} ({profile?.role})
      </p>

      {success && (
        <p className="text-sm text-badge-green-text bg-badge-green-bg rounded-xl px-4 py-2.5 mb-4 inline-block">
          {success}
        </p>
      )}
      {error && (
        <p className="text-sm text-badge-red-text bg-badge-red-bg rounded-xl px-4 py-2.5 mb-4 inline-block">
          {error}
        </p>
      )}

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Change own password */}
        <div className="bg-card border border-border rounded-3xl p-6">
          <h2 className="font-display text-lg font-bold text-text mb-4">
            Change Password
          </h2>
          <form action={updatePassword} className="space-y-4">
            <div>
              <label className={labelClass}>New Password</label>
              <input
                type="password"
                name="new_password"
                required
                minLength={8}
                className={inputClass}
              />
            </div>
            <button
              type="submit"
              className="bg-forest text-white px-5 py-2.5 rounded-full text-sm font-medium hover:opacity-90 active:scale-95 transition duration-150"
            >
              Update Password
            </button>
          </form>
        </div>

        {/* Admin: create staff account */}
        {isAdmin && (
          <div className="bg-card border border-border rounded-3xl p-6">
            <h2 className="font-display text-lg font-bold text-text mb-4">
              Add Staff Account
            </h2>
            <form action={createStaffUser} className="space-y-4">
              <div>
                <label className={labelClass}>Full Name</label>
                <input
                  type="text"
                  name="full_name"
                  required
                  className={inputClass}
                />
              </div>
              <div>
                <label className={labelClass}>Email</label>
                <input
                  type="email"
                  name="email"
                  required
                  className={inputClass}
                />
              </div>
              <div>
                <label className={labelClass}>Password</label>
                <input
                  type="password"
                  name="password"
                  required
                  minLength={8}
                  className={inputClass}
                />
              </div>
              <div>
                <label className={labelClass}>Role</label>
                <select name="role" required className={inputClass}>
                  <option value="">Select role...</option>
                  <option value="finance">Finance</option>
                  <option value="collector">Collector</option>
                  <option value="admin">Admin</option>
                </select>
              </div>
              <button
                type="submit"
                className="bg-forest text-white px-5 py-2.5 rounded-full text-sm font-medium hover:opacity-90 active:scale-95 transition duration-150"
              >
                Create Account
              </button>
            </form>
          </div>
        )}
      </div>

      {/* Admin: staff list */}
      {isAdmin && staff && (
        <div className="bg-card border border-border rounded-3xl overflow-hidden mt-6">
          <h2 className="font-display text-lg font-bold text-text px-6 py-4 border-b border-border">
            All Staff
          </h2>
          <div className="overflow-x-auto">
            <table className="w-full text-sm min-w-75">
              <tbody>
                {staff.map((s: any, i: number) => (
                  <tr
                    key={i}
                    className="border-t border-border first:border-t-0"
                  >
                    <td className="px-6 py-3 text-text font-medium">
                      {s.full_name}
                    </td>
                    <td className="px-6 py-3">
                      <span className="px-2.5 py-1 rounded-full text-xs font-semibold bg-bg text-text-muted capitalize">
                        {s.role}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
}
