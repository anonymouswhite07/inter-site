"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { Search, Loader2 } from "lucide-react";
import { Input } from "@/components/ui/input";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";

interface SearchResult {
  id: string;
  title: string;
  type: string;
  href: string;
}

export function GlobalSearch() {
  const router = useRouter();
  const [open, setOpen] = useState(false);
  const [query, setQuery] = useState("");
  const [results, setResults] = useState<SearchResult[]>([]);
  const [isPending, setIsPending] = useState(false);

  // Listen for Ctrl+K
  useEffect(() => {
    const down = (e: KeyboardEvent) => {
      if (e.key === "k" && (e.metaKey || e.ctrlKey)) {
        e.preventDefault();
        setOpen((o) => !o);
      }
    };
    document.addEventListener("keydown", down);
    return () => document.removeEventListener("keydown", down);
  }, []);

  // Fetch search results on query change
  useEffect(() => {
    if (query.length < 2) {
      setResults([]);
      return;
    }

    const delayDebounce = setTimeout(async () => {
      setIsPending(true);
      try {
        const res = await fetch(`/api/search?q=${encodeURIComponent(query)}`);
        const data = await res.json();
        if (data.success) {
          setResults(data.results);
        }
      } catch {
        console.error("Failed to fetch search results");
      } finally {
        setIsPending(false);
      }
    }, 300); // 300ms debounce

    return () => clearTimeout(delayDebounce);
  }, [query]);

  const handleSelect = (href: string) => {
    setOpen(false);
    setQuery("");
    router.push(href);
  };

  return (
    <>
      {/* Trigger Button (Looks like Azure Search input) */}
      <div 
        onClick={() => setOpen(true)}
        className="relative hidden sm:block cursor-pointer group"
      >
        <Search className="absolute left-2 top-1/2 h-3.5 w-3.5 -translate-y-1/2 text-[hsl(var(--muted-foreground))] group-hover:text-[hsl(var(--foreground))]" />
        <Input
          readOnly
          placeholder="Search resources, tasks... (Ctrl+K)"
          className="fluent-input h-7 w-60 pl-7 pr-3 text-[11px] cursor-pointer bg-[hsl(var(--background))] hover:bg-[hsl(var(--accent))/0.5]"
        />
      </div>

      {/* Command Dialog */}
      <Dialog open={open} onOpenChange={setOpen}>
        <DialogContent className="sm:max-w-[480px] p-0 rounded border bg-[hsl(var(--card))] overflow-hidden">
          <div className="flex items-center border-b px-3">
            <Search className="mr-2 h-4 w-4 shrink-0 text-[hsl(var(--muted-foreground))]" />
            <input
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder="Type to search..."
              className="flex h-10 w-full rounded-md bg-transparent py-3 text-xs outline-none placeholder:text-[hsl(var(--muted-foreground))] disabled:cursor-not-allowed disabled:opacity-50"
            />
            {isPending && <Loader2 className="h-3.5 w-3.5 animate-spin text-[hsl(var(--muted-foreground))]" />}
          </div>

          <div className="max-h-[300px] overflow-y-auto p-2 text-xs space-y-3">
            {query.length === 0 ? (
              /* Navigation Suggestions */
              <div className="space-y-1.5">
                <span className="px-2 text-[9px] font-semibold uppercase tracking-wider text-[hsl(var(--muted-foreground))]">
                  Quick Navigation
                </span>
                <div className="space-y-0.5">
                  <div
                    onClick={() => handleSelect("/dashboard/leaderboard")}
                    className="flex items-center px-2 py-1.5 rounded cursor-pointer hover:bg-[hsl(var(--accent))] transition-colors"
                  >
                    🏆 Cohort Leaderboard
                  </div>
                  <div
                    onClick={() => handleSelect("/dashboard/resources")}
                    className="flex items-center px-2 py-1.5 rounded cursor-pointer hover:bg-[hsl(var(--accent))] transition-colors"
                  >
                    📚 Knowledge Resources
                  </div>
                </div>
              </div>
            ) : results.length === 0 ? (
              <div className="py-6 text-center text-[11px] text-[hsl(var(--muted-foreground))]">
                No results found for &ldquo;{query}&rdquo;
              </div>
            ) : (
              /* Search Results */
              <div className="space-y-1">
                {results.map((res) => (
                  <div
                    key={res.id}
                    onClick={() => handleSelect(res.href)}
                    className="flex items-center justify-between px-2 py-2 rounded cursor-pointer hover:bg-[hsl(var(--accent))] transition-colors"
                  >
                    <span className="font-medium text-[hsl(var(--foreground))]">{res.title}</span>
                    <span className="text-[9px] uppercase tracking-wider text-[hsl(var(--muted-foreground))] font-semibold px-1.5 py-0.5 rounded bg-[hsl(var(--muted))]">
                      {res.type}
                    </span>
                  </div>
                ))}
              </div>
            )}
          </div>
        </DialogContent>
      </Dialog>
    </>
  );
}
