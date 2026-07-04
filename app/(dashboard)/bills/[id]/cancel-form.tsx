"use client";

import { useState } from "react";
import { cancelBill } from "../actions";
import { X } from "lucide-react";

export default function CancelForm({ billId }: { billId: string }) {
  const [confirming, setConfirming] = useState(false);

  if (!confirming) {
  return (
    <button
      onClick={() => setConfirming(true)}
      className="flex items-center gap-1.5 bg-badge-red-bg text-badge-red-text px-4 py-2 rounded-full text-sm font-medium hover:opacity-80 active:scale-95 transition duration-150 cursor-pointer"
    >
      <X size={14} />
      Cancel Bill
    </button>
  );
}

  return (
    <form action={cancelBill} className="space-y-2 bg-badge-red-bg rounded-2xl p-4">
      <input type="hidden" name="bill_id" value={billId} />
      <p className="text-sm text-badge-red-text font-medium">
        Are you sure? This cannot be undone by anyone except admin.
      </p>
      <input
        type="text"
        name="comment"
        placeholder="Reason for cancellation (optional)"
        className="w-full px-4 py-2 border border-badge-red-text/20 rounded-xl text-sm bg-card focus:outline-none focus:ring-2 focus:ring-badge-red-text/40"
      />
      <div className="flex gap-2">
        <button
          type="submit"
          className="bg-badge-red-text text-white px-4 py-1.5 rounded-full text-sm font-medium hover:opacity-90 active:scale-95 transition duration-150 cursor-pointer"
        >
          Confirm Cancel
        </button>
        <button
          type="button"
          onClick={() => setConfirming(false)}
          className="text-sm text-text-muted hover:text-text px-2 transition cursor-pointer"
        >
          Never mind
        </button>
      </div>
    </form>
  );
}