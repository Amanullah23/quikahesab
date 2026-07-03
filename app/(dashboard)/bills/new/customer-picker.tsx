"use client";

import { useState, useRef, useEffect } from "react";
import { Search, Check, ChevronDown } from "lucide-react";

type Customer = { id: string; full_name: string; customer_number?: string };

export default function CustomerPicker({ customers }: { customers: Customer[] }) {
  const [query, setQuery] = useState("");
  const [open, setOpen] = useState(false);
  const [selected, setSelected] = useState<Customer | null>(null);
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    function handleClickOutside(e: MouseEvent) {
      if (containerRef.current && !containerRef.current.contains(e.target as Node)) {
        setOpen(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const filtered = query
    ? customers.filter((c) =>
        c.full_name.toLowerCase().includes(query.toLowerCase())
      )
    : customers;

  function handleSelect(c: Customer) {
    setSelected(c);
    setQuery(c.full_name);
    setOpen(false);
  }

  return (
    <div ref={containerRef} className="relative">
      {/* Hidden input carries the actual value the server action reads */}
      <input type="hidden" name="customer_id" value={selected?.id ?? ""} required />

      <div className="flex items-center gap-2 border border-border rounded-xl px-4 py-2.5 bg-bg focus-within:ring-2 focus-within:ring-forest">
        <Search size={15} className="text-text-muted shrink-0" />
        <input
          type="text"
          value={query}
          onChange={(e) => {
            setQuery(e.target.value);
            setSelected(null);
            setOpen(true);
          }}
          onFocus={() => setOpen(true)}
          placeholder="Type to search customers..."
          className="bg-transparent text-sm text-text placeholder:text-text-muted focus:outline-none w-full"
        />
        <ChevronDown size={15} className="text-text-muted shrink-0" />
      </div>

      {open && (
        <div className="absolute top-full mt-1 w-full bg-card border border-border rounded-2xl shadow-lg overflow-hidden z-50 max-h-64 overflow-y-auto">
          {filtered.length > 0 ? (
            filtered.slice(0, 50).map((c) => (
              <button
                key={c.id}
                type="button"
                onClick={() => handleSelect(c)}
                className="w-full flex items-center justify-between gap-2 px-4 py-2.5 hover:bg-bg transition text-left"
              >
                <span className="text-sm text-text truncate">
                  {c.customer_number && (
                    <span className="text-text-muted mr-2">{c.customer_number}</span>
                  )}
                  {c.full_name}
                </span>
                {selected?.id === c.id && (
                  <Check size={14} className="text-forest shrink-0" />
                )}
              </button>
            ))
          ) : (
            <p className="text-sm text-text-muted px-4 py-3">No matches found</p>
          )}
          {filtered.length > 50 && (
            <p className="text-xs text-text-muted px-4 py-2 border-t border-border">
              Showing first 50 — keep typing to narrow down
            </p>
          )}
        </div>
      )}
    </div>
  );
}