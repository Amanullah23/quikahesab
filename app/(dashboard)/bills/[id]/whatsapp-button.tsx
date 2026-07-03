"use client";

import { useTransition } from "react";
import { MessageCircle } from "lucide-react";
import { markWhatsAppSent } from "../actions";

export default function WhatsAppButton({
  paymentId,
  phone,
  message,
}: {
  paymentId: string;
  phone: string;
  message: string;
}) {
  const [isPending, startTransition] = useTransition();

  function handleClick() {
    const url = `https://wa.me/${phone}?text=${encodeURIComponent(message)}`;
    window.open(url, "_blank");

    startTransition(() => {
      markWhatsAppSent(paymentId);
    });
  }

  return (
    <button
      onClick={handleClick}
      disabled={isPending}
      className="flex items-center gap-1.5 bg-badge-green-bg text-badge-green-text px-3 py-1.5 rounded-full text-xs font-semibold hover:opacity-80 active:scale-95 disabled:opacity-50 transition duration-150"
    >
      <MessageCircle size={13} />
      {isPending ? "Sending..." : "Send WhatsApp"}
    </button>
  );
}