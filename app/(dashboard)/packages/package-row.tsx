"use client";

import { useRouter } from "next/navigation";

export default function PackageRow({
  href,
  children,
}: {
  href: string;
  children: React.ReactNode;
}) {
  const router = useRouter();

  return (
    <tr
      onClick={() => router.push(href)}
      className="border-t border-border hover:bg-bg transition cursor-pointer"
    >
      {children}
    </tr>
  );
}