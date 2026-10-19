"use client";

import { usePathname } from "next/navigation";
import { useEffect } from "react";

/** Names the current area on <html data-realm> so the cosmic backdrop can shift its light gently. */
export function RealmLight() {
  const path = usePathname();
  useEffect(() => {
    document.documentElement.dataset.realm = path.split("/")[1] || "home";
  }, [path]);
  return null;
}
