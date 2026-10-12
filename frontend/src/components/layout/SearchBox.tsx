"use client";

import { useEffect, useId, useMemo, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import { useQuery } from "@apollo/client/react";
import { Search } from "lucide-react";
import { GET_PRODUCTS } from "@/lib/graphql/queries";
import type { Product } from "@/lib/types";
import { useIsTouch } from "@/lib/device";
import { suggest } from "@/lib/search";
import { cn, formatPrice } from "@/lib/utils";

/**
 * Header search with live suggestions. Keyboard: `/` focuses it from anywhere, arrows move through
 * suggestions, Enter opens one (or runs the search), Escape closes. Products are fetched lazily,
 * the first time the box is focused, then served from the Apollo cache.
 */
export function SearchBox({
  className,
  shortcut = false,
  onNavigate,
}: {
  className?: string;
  /** Register the global "/" shortcut (only one box on the page should). */
  shortcut?: boolean;
  onNavigate?: () => void;
}) {
  const router = useRouter();
  const inputRef = useRef<HTMLInputElement>(null);
  const listId = useId();
  const [query, setQuery] = useState("");
  const [armed, setArmed] = useState(false);
  const [open, setOpen] = useState(false);
  const [active, setActive] = useState(-1);
  const touch = useIsTouch();

  const { data } = useQuery<{ getProducts: Product[] }>(GET_PRODUCTS, { skip: !armed });
  const results = useMemo(() => suggest(data?.getProducts ?? [], query), [data, query]);
  const showList = open && query.trim().length > 0;

  useEffect(() => {
    if (!shortcut) return;
    function onKey(e: KeyboardEvent) {
      if (e.key !== "/" || e.metaKey || e.ctrlKey || e.altKey) return;
      const el = e.target as HTMLElement | null;
      if (el && (el.isContentEditable || /^(INPUT|TEXTAREA|SELECT)$/.test(el.tagName))) return;
      e.preventDefault();
      inputRef.current?.focus();
    }
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [shortcut]);

  function go(href: string) {
    setOpen(false);
    setActive(-1);
    inputRef.current?.blur();
    onNavigate?.();
    router.push(href);
  }

  function submit() {
    const picked = active >= 0 ? results[active] : undefined;
    if (picked) {
      setQuery("");
      return go(`/products/${picked.id}`);
    }
    const q = query.trim();
    go(q ? `/products?q=${encodeURIComponent(q)}` : "/products");
  }

  function onKeyDown(e: React.KeyboardEvent) {
    if (e.key === "ArrowDown") {
      e.preventDefault();
      setOpen(true);
      setActive((i) => (results.length ? (i + 1) % results.length : -1));
    } else if (e.key === "ArrowUp") {
      e.preventDefault();
      setActive((i) => (results.length ? (i <= 0 ? results.length - 1 : i - 1) : -1));
    } else if (e.key === "Escape") {
      if (open) {
        e.preventDefault();
        setOpen(false);
        setActive(-1);
      } else {
        inputRef.current?.blur();
      }
    }
  }

  return (
    <div
      className={cn("relative", className)}
      onBlur={(e) => {
        if (!e.currentTarget.contains(e.relatedTarget)) {
          setOpen(false);
          setActive(-1);
        }
      }}
    >
      <form
        role="search"
        onSubmit={(e) => {
          e.preventDefault();
          submit();
        }}
      >
        <Search
          className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-subtle"
          strokeWidth={2}
          aria-hidden
        />
        <input
          ref={inputRef}
          type="search"
          role="combobox"
          aria-expanded={showList}
          aria-controls={listId}
          aria-autocomplete="list"
          aria-activedescendant={active >= 0 ? `${listId}-${active}` : undefined}
          aria-label="Search products"
          autoComplete="off"
          value={query}
          placeholder="Search products"
          onChange={(e) => {
            setQuery(e.target.value);
            setOpen(true);
            setActive(-1);
          }}
          onFocus={() => {
            setArmed(true);
            setOpen(true);
          }}
          onKeyDown={onKeyDown}
          className="h-10 w-full rounded-md border border-line-strong bg-surface pl-9 pr-9 text-sm text-fg placeholder:text-subtle transition-colors focus:border-brand focus:outline-none focus:ring-2 focus:ring-[var(--ring)]"
        />
        {shortcut && !touch && !query && (
          <kbd
            aria-hidden
            className="pointer-events-none absolute right-2.5 top-1/2 -translate-y-1/2 rounded border border-line-strong bg-surface-2 px-1.5 text-xs text-subtle"
          >
            /
          </kbd>
        )}
      </form>

      {showList && (
        <ul
          id={listId}
          role="listbox"
          aria-label="Suggestions"
          // Keep focus in the input while clicking an option.
          onMouseDown={(e) => e.preventDefault()}
          className="absolute left-0 right-0 top-full z-50 mt-1.5 overflow-hidden rounded-lg border border-line-strong bg-surface py-1 shadow-[var(--shadow-lift)]"
        >
          {results.map((p, i) => (
            <li
              key={p.id}
              id={`${listId}-${i}`}
              role="option"
              aria-selected={i === active}
              onMouseEnter={() => setActive(i)}
              onClick={() => {
                setQuery("");
                go(`/products/${p.id}`);
              }}
              className={cn(
                "flex cursor-pointer items-center justify-between gap-3 px-3 py-2 text-sm",
                i === active ? "bg-surface-2" : "hover:bg-surface-2"
              )}
            >
              <span className="truncate text-fg">{p.name}</span>
              <span className="shrink-0 tabular-nums text-subtle">{formatPrice(p.price)}</span>
            </li>
          ))}
          {results.length === 0 && (
            <li role="presentation" className="px-3 py-2 text-sm text-subtle">
              {data ? "No matching products" : "Searching…"}
            </li>
          )}
          <li
            role="option"
            aria-selected={false}
            onClick={submit}
            className="cursor-pointer border-t border-line px-3 py-2 text-sm text-brand-text hover:bg-surface-2"
          >
            Search all for “{query.trim()}”
          </li>
        </ul>
      )}
    </div>
  );
}
