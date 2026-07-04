"use client";

import { useState } from "react";
import { recordPayment } from "../actions";

export default function PaymentForm({
  billId,
  remaining,
}: {
  billId: string;
  remaining: number;
}) {
  const [amount, setAmount] = useState(remaining > 0 ? String(remaining) : "");

  return (
    <form action={recordPayment} className="flex items-end gap-3">
      <input type="hidden" name="bill_id" value={billId} />
      <div className="flex-1">
        <label className="block text-sm font-medium text-text mb-1.5">
          Payment Amount (AFN)
        </label>
        <input
          type="number"
          step="0.01"
          name="amount"
          value={amount}
          onChange={(e) => setAmount(e.target.value)}
          max={remaining}
          required
          className="w-full px-4 py-2.5 border border-border rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-forest bg-bg"
        />
      </div>
      <button
        type="submit"
        className="bg-forest text-white px-5 py-2.5 rounded-full text-sm font-medium hover:opacity-90 active:scale-95 transition duration-150 cursor-pointer"
      >
        Record Payment
      </button>
    </form>
  );
}