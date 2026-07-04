"use client";

import { useState } from "react";

export default function PackageForm({
  action,
  error,
  defaultValues,
}: {
  action: (formData: FormData) => Promise<void>;
  error?: string;
  defaultValues?: {
    id?: string;
    name?: string;
    cycle_type?: string;
    data_gb?: number | null;
    validity_days?: number | null;
    amount?: number;
    is_active?: boolean;
  };
}) {
  const [cycleType, setCycleType] = useState(
    defaultValues?.cycle_type ?? "monthly",
  );
  const isEdit = !!defaultValues?.id;

  const inputClass =
    "w-full px-4 py-2.5 border border-border rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-forest bg-bg";
  const labelClass = "block text-sm font-medium text-text mb-1.5";

  return (
    <form
      action={action}
      className="bg-card border border-border rounded-3xl p-6 max-w-lg space-y-4"
    >
      {isEdit && (
        <input type="hidden" name="package_id" value={defaultValues!.id} />
      )}
      {isEdit && (
        <input
          type="hidden"
          name="cycle_type"
          value={defaultValues!.cycle_type}
        />
      )}

      {error && (
        <p className="text-sm text-badge-red-text bg-badge-red-bg rounded-xl px-4 py-2.5">
          {error}
        </p>
      )}

      <div>
        <label className={labelClass}>Package Name</label>
        <input
          type="text"
          name="name"
          defaultValue={defaultValues?.name}
          required
          placeholder="e.g. Unlimited Monthly"
          className={inputClass}
        />
      </div>

      <div>
        <label className={labelClass}>Type</label>
        {isEdit ? (
          <p className="px-4 py-2.5 bg-bg rounded-xl text-sm text-text-muted capitalize">
            {defaultValues!.cycle_type!.replace("_", " ")} (cannot be changed
            after creation)
          </p>
        ) : (
          <select
            name="cycle_type"
            value={cycleType}
            onChange={(e) => setCycleType(e.target.value)}
            required
            className={inputClass}
          >
            <option value="monthly">Monthly (unlimited)</option>
            <option value="data_based">Data-based (limited GB)</option>
          </select>
        )}
      </div>

      {cycleType === "data_based" && (
        <div>
          <label className={labelClass}>Data Amount (GB)</label>
          <input
            type="number"
            step="0.01"
            name="data_gb"
            defaultValue={defaultValues?.data_gb ?? ""}
            required
            className={inputClass}
          />
        </div>
      )}

      {cycleType === "data_based" && (
        <div>
          <label className={labelClass}>Validity (days)</label>
          <input
            type="number"
            name="validity_days"
            defaultValue={defaultValues?.validity_days ?? ""}
            placeholder="e.g. 10, 20, 30"
            className={inputClass}
          />
          <p className="text-xs text-text-muted mt-1.5">
            Optional — how many days this package is valid for. Editable
            anytime.
          </p>
        </div>
      )}

      <div>
        <label className={labelClass}>Price (AFN)</label>
        <input
          type="number"
          step="0.01"
          name="amount"
          defaultValue={defaultValues?.amount}
          required
          className={inputClass}
        />
      </div>

      {isEdit && (
        <label className="flex items-center gap-2 text-sm text-text pt-2">
          <input
            type="checkbox"
            name="is_active"
            defaultChecked={defaultValues?.is_active}
            className="accent-forest w-4 h-4"
          />
          Active (visible when creating new bills/customers)
        </label>
      )}

      <button
        type="submit"
        className="w-full bg-forest text-white py-3 rounded-full font-medium hover:opacity-90 active:scale-[0.98] transition duration-150"
      >
        {isEdit ? "Save Changes" : "Add Package"}
      </button>
    </form>
  );
}
