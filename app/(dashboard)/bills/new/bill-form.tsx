"use client";

import { useState } from "react";
import { createBill } from "../actions";

type Customer = { id: string; full_name: string };
type Package = { id: string; name: string; cycle_type: string; amount: number };

export default function BillForm({
  customers,
  packages,
  error,
}: {
  customers: Customer[];
  packages: Package[];
  error?: string;
}) {
  const [amount, setAmount] = useState("");
  const [cycleType, setCycleType] = useState("");

  function handlePackageChange(e: React.ChangeEvent<HTMLSelectElement>) {
    const pkg = packages.find((p) => p.id === e.target.value);
    setAmount(pkg ? String(pkg.amount) : "");
    setCycleType(pkg ? pkg.cycle_type : "");
  }

  const inputClass =
    "w-full px-4 py-2.5 border border-border rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-forest bg-bg";
  const labelClass = "block text-sm font-medium text-text mb-1.5";

  return (
    <form
      action={createBill}
      className="bg-card border border-border rounded-3xl p-6 max-w-lg space-y-4"
    >
      {error && (
        <p className="text-sm text-badge-red-text bg-badge-red-bg rounded-xl px-4 py-2.5">
          {error}
        </p>
      )}

      <div>
        <label className={labelClass}>Bill Number</label>
        <input type="number" name="bill_number" required placeholder="e.g. 4004" className={inputClass} />
      </div>

      <div>
        <label className={labelClass}>Customer</label>
        <select name="customer_id" required className={inputClass}>
          <option value="">Select customer...</option>
          {customers.map((c) => (
            <option key={c.id} value={c.id}>{c.full_name}</option>
          ))}
        </select>
      </div>

      <div>
        <label className={labelClass}>Package</label>
        <select name="package_id" required onChange={handlePackageChange} className={inputClass}>
          <option value="">Select package...</option>
          {packages.map((p) => (
            <option key={p.id} value={p.id}>{p.name} — {p.amount} AFN</option>
          ))}
        </select>
        <input type="hidden" name="cycle_type" value={cycleType} />
      </div>

      <div>
        <label className={labelClass}>Amount Due (AFN)</label>
        <input
          type="number"
          step="0.01"
          name="amount_due"
          value={amount}
          onChange={(e) => setAmount(e.target.value)}
          required
          className={inputClass}
        />
      </div>

      <div>
        <label className={labelClass}>Start Date</label>
        <input type="date" name="cycle_start" required className={inputClass} />
      </div>

      <div>
        <label className={labelClass}>Comment (optional)</label>
        <textarea name="comment" rows={2} className={inputClass} />
      </div>

      <button
        type="submit"
        className="w-full bg-forest text-white py-3 rounded-full font-medium hover:opacity-90 active:scale-[0.98] transition duration-150"
      >
        Create Bill
      </button>
    </form>
  );
}