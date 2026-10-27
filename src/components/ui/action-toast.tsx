"use client";

import { useEffect } from "react";
import { toast } from "sonner";

export function ActionToast({ success, error }: { success?: string; error?: string }) {
  useEffect(() => {
    if (!success && !error) return;

    if (success) toast.success(success);
    if (error) toast.error(error);

    const url = new URL(window.location.href);
    url.searchParams.delete("created");
    url.searchParams.delete("error");
    window.history.replaceState({}, "", `${url.pathname}${url.search}${url.hash}`);
  }, [error, success]);

  return null;
}
