"use client";

import { useState,useRef } from "react";
import { Download, Upload, AlertTriangle } from "lucide-react";
import { importBackup } from "./backup-actions";

export default function BackupForm() {
  const [confirmed, setConfirmed] = useState(false);
  const [isPending, setIsPending] = useState(false);
  const [result, setResult] = useState<Awaited<ReturnType<typeof importBackup>> | null>(null);

  const fileInputRef = useRef<HTMLInputElement>(null);
  const [fileName, setFileName] = useState<string | null>(null);

  async function handleImport(formData: FormData) {
    setIsPending(true);
    const res = await importBackup(formData);
    setResult(res);
    setIsPending(false);
  }

  return (
    <div className="space-y-4">
      {/* Export */}
      <div>
        <p className="text-sm text-text-muted mb-2">
          Download a full backup of your packages, customers, bills, and payments as a JSON file.
        </p>
        <a
          href="/api/backup/export"
          download
          className="inline-flex items-center gap-2 bg-forest text-white px-5 py-2.5 rounded-full text-sm font-medium hover:opacity-90 active:scale-95 transition duration-150"
        >
          <Download size={15} />
          Download Backup
        </a>
      </div>

      <div className="border-t border-border pt-4">
        <p className="text-sm text-text-muted mb-2">
          Restore from a previously downloaded backup file. Existing records with matching IDs will be
          updated; everything else will be added.
        </p>

        <div className="flex items-start gap-2 bg-badge-amber-bg text-badge-amber-text rounded-xl px-4 py-3 mb-3 text-sm">
          <AlertTriangle size={16} className="shrink-0 mt-0.5" />
          <span>
            This can overwrite existing data. Staff logins are not included in backups — recreate them
            separately if needed.
          </span>
        </div>

        <form action={handleImport} className="space-y-3">
          <div>
            <input
              ref={fileInputRef}
              type="file"
              name="backup_file"
              accept="application/json"
              required
              onChange={(e) => setFileName(e.target.files?.[0]?.name ?? null)}
              className="hidden"
            />
            <button
              type="button"
              onClick={() => fileInputRef.current?.click()}
              className="flex items-center gap-2 border border-border text-text px-4 py-2.5 rounded-xl text-sm font-medium hover:bg-bg transition"
            >
              Choose File
            </button>
            <p className="text-xs text-text-muted mt-1.5">
              {fileName ?? "No file chosen"}
            </p>
          </div>

          <label className="flex items-center gap-2 text-sm text-text">
            <input
              type="checkbox"
              checked={confirmed}
              onChange={(e) => setConfirmed(e.target.checked)}
              className="accent-forest w-4 h-4"
            />
            I understand this may overwrite existing records
          </label>

          <button
            type="submit"
            disabled={!confirmed || isPending}
            className="flex items-center gap-2 bg-badge-red-text text-white px-5 py-2.5 rounded-full text-sm font-medium hover:opacity-90 active:scale-95 disabled:opacity-40 disabled:cursor-not-allowed transition duration-150"
          >
            <Upload size={15} />
            {isPending ? "Restoring..." : "Restore Backup"}
          </button>
        </form>
      </div>

      {result && (
        <div className="border-t border-border pt-4">
          {result.success ? (
            <div className="space-y-2">
              <p className="text-sm font-medium text-badge-green-text">
                ✅ Restore complete
              </p>
              <p className="text-sm text-text-muted">
                {result.counts?.packages} packages · {result.counts?.customers} customers ·{" "}
                {result.counts?.bills} bills · {result.counts?.payments} payments
              </p>
              {result.remapped && result.remapped > 0 && (
                <p className="text-sm text-badge-amber-text">
                  ⚠️ {result.remapped} record(s) had their original staff attribution reassigned to you,
                  since those logins don't exist in this environment.
                </p>
              )}
              {result.skipped && result.skipped.length > 0 && (
                <div>
                  <p className="text-sm text-badge-red-text font-medium mb-1">
                    {result.skipped.length} row(s) skipped:
                  </p>
                  <div className="max-h-40 overflow-y-auto text-xs text-text-muted space-y-1">
                    {result.skipped.map((s, i) => (
                      <p key={i}>
                        {s.table} ({s.id}): {s.reason}
                      </p>
                    ))}
                  </div>
                </div>
              )}
            </div>
          ) : (
            <p className="text-sm text-badge-red-text">❌ {result.error}</p>
          )}
        </div>
      )}
    </div>
  );
}