"use client";

import { updateBill } from "../../actions";

type Bill = {
  id: string;
  amount_due: number;
  cycle_start: string;
  comment: string | null;
};

export default function EditForm({ bill, error }: { bill: Bill; error?: string }) {
  return (
    <form
      action={updateBill}
      className="bg-white rounded-xl border border-slate-200 p-6 max-w-lg space-y-4"
    >
      <input type="hidden" name="bill_id" value={bill.id} />

      {error && (
        <p className="text-sm text-red-600 bg-red-50 rounded-lg px-3 py-2">
          {error}
        </p>
      )}

      <div>
        <label className="block text-sm font-medium text-slate-700 mb-1">
          Amount Due (AFN)
        </label>
        <input
          type="number"
          step="0.01"
          name="amount_due"
          defaultValue={bill.amount_due}
          required
          className="w-full px-3 py-2 border border-slate-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-600"
        />
      </div>

      <div>
        <label className="block text-sm font-medium text-slate-700 mb-1">
          Start Date
        </label>
        <input
          type="date"
          name="cycle_start"
          defaultValue={bill.cycle_start}
          required
          className="w-full px-3 py-2 border border-slate-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-600"
        />
      </div>

      <div>
        <label className="block text-sm font-medium text-slate-700 mb-1">
          Comment
        </label>
        <textarea
          name="comment"
          rows={2}
          defaultValue={bill.comment ?? ""}
          className="w-full px-3 py-2 border border-slate-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-600"
        />
      </div>

      <button
        type="submit"
        className="w-full bg-forest cursor-pointer text-white py-2.5 rounded-lg font-medium hover:bg-forest/90 transition"
      >
        Save Changes
      </button>
    </form>
  );
}