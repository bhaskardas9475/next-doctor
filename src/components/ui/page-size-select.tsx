"use client";

import { usePathname, useRouter, useSearchParams } from "next/navigation";
import { Select } from "./select";

export function PageSizeSelect({ value }: { value: number }) {
  const router = useRouter();
  const pathname = usePathname();
  const params = useSearchParams();
  return (
    <label className="field-label">
      Rows
      <Select
        value={String(value)}
        options={["10", "25", "50"].map((option) => ({ label: option, value: option }))}
        placeholder="Rows"
        onValueChange={(event) => {
          const next = new URLSearchParams(params.toString());
          next.set("pageSize", event);
          next.delete("page");
          router.replace(`${pathname}?${next.toString()}`);
        }}
      />
    </label>
  );
}
