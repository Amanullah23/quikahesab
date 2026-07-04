"use client";

import { useState } from "react";
import { deletePackage } from "../../actions";
import { Trash2 } from "lucide-react";

export default function DeleteForm({ packageId }: { packageId: string }) {
  const [confirming, setConfirming] = useState(false);

  if (!confirming) {
  return (
    <button
      type="button"
      onClick={() => setConfirming(true)}
      className="flex items-center gap-1.5 bg-badge-red-bg text-badge-red-text px-4 py-2 rounded-full text-sm font-medium hover:opacity-80 active:scale-95 transition duration-150 cursor-pointer"
    >
      <Trash2 size={14} />
      Delete Package
    </button>
  );
}

  return (
    <form action={deletePackage} className="space-y-2 bg-badge-red-bg rounded-2xl p-4">
      <input type="hidden" name="package_id" value={packageId} />
      <p className="text-sm text-badge-red-text font-medium">
        Are you sure? This cannot be undone.
      </p>
      <div className="flex gap-2">
        <button
          type="submit"
          className="bg-badge-red-text text-white px-4 py-1.5 rounded-full text-sm font-medium hover:opacity-90 active:scale-95 transition duration-150"
        >
          Confirm Delete
        </button>
        <button
          type="button"
          onClick={() => setConfirming(false)}
          className="text-sm text-text-muted hover:text-text px-2 transition"
        >
          Never mind
        </button>
      </div>
    </form>
  );
}