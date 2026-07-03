"use client";

type Package = { id: string; name: string };

export default function CustomerForm({
  action,
  packages,
  error,
  defaultValues,
}: {
  action: (formData: FormData) => Promise<void>;
  packages: Package[];
  error?: string;
  defaultValues?: {
    id?: string;
    customer_number?: string;
    full_name?: string;
    whatsapp_number?: string;
    package_id?: string;
    whatsapp_valid?: boolean;
    is_active?: boolean;
  };
}) {
  const inputClass =
    "w-full px-4 py-2.5 border border-border rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-forest bg-bg";
  const labelClass = "block text-sm font-medium text-text mb-1.5";
  const isEdit = !!defaultValues?.id;

  return (
    <form action={action} className="bg-card border border-border rounded-3xl p-6 max-w-lg space-y-4">
      {isEdit && (
        <input type="hidden" name="customer_id" value={defaultValues!.id} />
      )}

      {error && (
        <p className="text-sm text-badge-red-text bg-badge-red-bg rounded-xl px-4 py-2.5">
          {error}
        </p>
      )}

      {isEdit ? (
  <div>
    <label className={labelClass}>Customer ID</label>
    <p className="px-4 py-2.5 bg-bg rounded-xl text-sm text-text-muted font-medium">
      {defaultValues!.customer_number}
    </p>
  </div>
) : (
  <div>
    <label className={labelClass}>Customer ID</label>
    <input
      type="text"
      name="customer_number"
      placeholder="e.g. A05"
      required
      className={`${inputClass} uppercase`}
      style={{ textTransform: "uppercase" }}
    />
    <p className="text-xs text-text-muted mt-1.5">
      Must be unique, e.g. A01–A10, B01–B10 ... Z01–Z10, AA01...
    </p>
  </div>
)}

      <div>
        <label className={labelClass}>Full Name</label>
        <input
          type="text"
          name="full_name"
          defaultValue={defaultValues?.full_name}
          required
          className={inputClass}
        />
      </div>

      <div>
        <label className={labelClass}>WhatsApp Number</label>
        <input
          type="text"
          name="whatsapp_number"
          defaultValue={defaultValues?.whatsapp_number}
          placeholder="93700123456"
          className={inputClass}
        />
        <p className="text-xs text-text-muted mt-1.5">Country code, no + or spaces</p>
      </div>

      <div>
        <label className={labelClass}>Package</label>
        <select
          name="package_id"
          defaultValue={defaultValues?.package_id}
          required
          className={inputClass}
        >
          <option value="">Select package...</option>
          {packages.map((p) => (
            <option key={p.id} value={p.id}>{p.name}</option>
          ))}
        </select>
      </div>

      {isEdit && (
        <div className="flex gap-6 pt-2">
          <label className="flex items-center gap-2 text-sm text-text">
            <input
              type="checkbox"
              name="whatsapp_valid"
              defaultChecked={defaultValues!.whatsapp_valid}
              className="accent-forest w-4 h-4"
            />
            WhatsApp number is valid
          </label>
          <label className="flex items-center gap-2 text-sm text-text">
            <input
              type="checkbox"
              name="is_active"
              defaultChecked={defaultValues!.is_active}
              className="accent-forest w-4 h-4"
            />
            Active customer
          </label>
        </div>
      )}

      <button
        type="submit"
        className="w-full bg-forest text-white py-3 rounded-full font-medium hover:opacity-90 active:scale-[0.98] transition duration-150"
      >
        {isEdit ? "Save Changes" : "Add Customer"}
      </button>
    </form>
  );
}