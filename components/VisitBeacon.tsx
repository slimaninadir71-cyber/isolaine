"use client";
import { usePathname } from "next/navigation";
import { useEffect } from "react";

/** Signale chaque page vue au compteur de visites du site (anonyme, sans cookie). */
export function VisitBeacon() {
  const path = usePathname();
  useEffect(() => {
    if (!path || path.startsWith("/admin")) return;
    try {
      const data = JSON.stringify({ p: path, r: document.referrer });
      if (!navigator.sendBeacon?.("/api/visite", data)) fetch("/api/visite", { method: "POST", body: data, keepalive: true }).catch(() => {});
    } catch { /* jamais bloquant */ }
  }, [path]);
  return null;
}
