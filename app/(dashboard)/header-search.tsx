"use client";

import { useState, useEffect, useRef } from "react";
import { useRouter } from "next/navigation";
import { Search, Receipt, User } from "lucide-react";
import { globalSearch, type SearchResult } from "./search-actions";

export default function HeaderSearch() {
  const [query, setQuery] = useState("");
  const [results, setResults] = useState<SearchResult[]>([]);
  const [open, setOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);
  const router = useRouter();

  // Wire Cmd+K / Ctrl+K to focus the search box
  useEffect(() => {
    function handleKeyDown(e: KeyboardEvent) {
      if ((e.metaKey || e.ctrlKey) && e.key === "k") {
        e.preventDefault();
        inputRef.current?.focus();
      }
      if (e.key === "Escape") {
        setOpen(false);
        inputRef.current?.blur();
      }
    }
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, []);

  // Close dropdown when clicking outside
  useEffect(() => {
    function handleClickOutside(e: MouseEvent) {
      if (containerRef.current && !containerRef.current.contains(e.target as Node)) {
        setOpen(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  // Debounced search
  useEffect(() => {
    if (!query.trim()) {
      setResults([]);
      return;
    }
    setLoading(true);
    const timer = setTimeout(async () => {
      const res = await globalSearch(query);
      setResults(res);
      setLoading(false);
    }, 250);
    return () => clearTimeout(timer);
  }, [query]);

  function handleSelect(result: SearchResult) {
    setQuery("");
    setResults([]);
    setOpen(false);
    if (result.type === "bill") {
      router.push(`/bills/${result.id}`);
    } else {
      router.push(`/customers/${result.id}/edit`);
    }
  }

  return (
    <div ref={containerRef} className="relative w-full max-w-xs">
      <div className="flex items-center gap-2 bg-bg rounded-full px-4 py-2.5">
        <Search size={16} className="text-text-muted shrink-0" />
        <input
          ref={inputRef}
          type="text"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          onFocus={() => setOpen(true)}
          placeholder="Search bills, customers..."
          className="bg-transparent text-sm text-text placeholder:text-text-muted focus:outline-none flex-1 w-full"
        />
        <kbd className="text-[10px] font-medium bg-card border border-border rounded-md px-1.5 py-0.5 text-text-muted shrink-0">
          ⌘K
        </kbd>
      </div>

      {open && query.trim() && (
        <div className="absolute top-full mt-2 w-full bg-card border border-border rounded-2xl shadow-lg overflow-hidden z-50">
          {loading ? (
            <p className="text-sm text-text-muted px-4 py-3">Searching...</p>
          ) : results.length > 0 ? (
            <div className="py-2">
              {results.map((r) => (
                <button
                  key={`${r.type}-${r.id}`}
                  onClick={() => handleSelect(r)}
                  className="w-full flex items-center gap-3 px-4 py-2.5 hover:bg-bg transition text-left"
                >
                  <span className="w-8 h-8 rounded-lg bg-bg flex items-center justify-center shrink-0">
                    {r.type === "bill" ? (
                      <Receipt size={14} className="text-forest" />
                    ) : (
                      <User size={14} className="text-forest" />
                    )}
                  </span>
                  <span className="min-w-0">
                    <p className="text-sm font-medium text-text truncate">{r.title}</p>
                    <p className="text-xs text-text-muted truncate">{r.subtitle}</p>
                  </span>
                </button>
              ))}
            </div>
          ) : (
            <p className="text-sm text-text-muted px-4 py-3">No results found</p>
          )}
        </div>
      )}
    </div>
  );
}