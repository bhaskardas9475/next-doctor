"use client";

import { useEffect, useState } from "react";
import { usePathname, useRouter } from "next/navigation";

export function SearchInput({ placeholder = "Search..." }: { placeholder?: string }) {
  const router = useRouter();
  const pathname = usePathname();
  const [value, setValue] = useState(() => {
    if (typeof window === "undefined") return "";
    return new URLSearchParams(window.location.search).get("q") ?? "";
  });
  useEffect(() => {
    const timer = setTimeout(() => {
      const next = new URLSearchParams(window.location.search);
      if (value) next.set("q", value);
      else next.delete("q");
      next.delete("page");
      router.replace(`${pathname}?${next.toString()}`);
    }, 350);
    return () => clearTimeout(timer);
  }, [value, pathname, router]);
  return (
    <input
      value={value}
      onChange={(event) => setValue(event.target.value)}
      placeholder={placeholder}
      aria-label={placeholder}
      className="search-input"
    />
  );
}
