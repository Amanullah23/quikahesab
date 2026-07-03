import Link from "next/link";
import { ArrowLeft } from "lucide-react";
import PackageForm from "./package-form";
import { createPackage } from "../actions";

export default async function NewPackagePage({
  searchParams,
}: {
  searchParams: Promise<{ error?: string }>;
}) {
  const { error } = await searchParams;

  return (
    <div>
      <div className="flex items-center gap-3 mb-6">
        <Link
          href="/packages"
          className="w-9 h-9 rounded-full border border-border flex items-center justify-center text-text-muted hover:bg-bg transition"
        >
          <ArrowLeft size={16} />
        </Link>
        <h1 className="font-display text-2xl font-bold text-text">New Package</h1>
      </div>

      <PackageForm action={createPackage} error={error} />
    </div>
  );
}