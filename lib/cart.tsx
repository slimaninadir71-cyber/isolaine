"use client";
import Link from "next/link";
import { createContext, useCallback, useContext, useEffect, useMemo, useRef, useState, type ReactNode } from "react";

export type CartItem = {
  key: string; // slug:variante
  slug: string;
  variantId: string;
  name: string;
  label: string;
  price: number;
  qty: number;
  image: string;
  pickup: boolean;
};

type Ctx = {
  items: CartItem[];
  ready: boolean;
  add: (i: Omit<CartItem, "key" | "qty">, qty?: number) => void;
  setQty: (key: string, q: number) => void;
  remove: (key: string) => void;
  clear: () => void;
  count: number;
  subtotal: number;
  notify: (msg: string, link?: { href: string; label: string }) => void;
};

const CartCtx = createContext<Ctx | null>(null);
const KEY = "isolaine-panier-v2";
const MAX_QTY = 999;

export function CartProvider({ children }: { children: ReactNode }) {
  const [items, setItems] = useState<CartItem[]>([]);
  const [ready, setReady] = useState(false);
  const [toast, setToast] = useState<{ msg: string; link?: { href: string; label: string }; id: number } | null>(null);
  const timer = useRef<ReturnType<typeof setTimeout> | null>(null);

  useEffect(() => {
    try {
      const s = localStorage.getItem(KEY);
      if (s) {
        const parsed = JSON.parse(s);
        if (Array.isArray(parsed)) setItems(parsed.filter((x) => x && typeof x.key === "string" && typeof x.price === "number"));
      }
    } catch { /* stockage indisponible : panier en mémoire */ }
    setReady(true);
  }, []);
  useEffect(() => {
    if (!ready) return;
    try { localStorage.setItem(KEY, JSON.stringify(items)); } catch { /* ignore */ }
  }, [items, ready]);

  const notify = useCallback((msg: string, link?: { href: string; label: string }) => {
    if (timer.current) clearTimeout(timer.current);
    setToast({ msg, link, id: Date.now() });
    timer.current = setTimeout(() => setToast(null), 4500);
  }, []);

  const add = useCallback((i: Omit<CartItem, "key" | "qty">, qty = 1) => {
    const key = `${i.slug}:${i.variantId}`;
    const q = Math.max(1, Math.min(MAX_QTY, Math.round(qty) || 1));
    setItems((c) => c.some((x) => x.key === key)
      ? c.map((x) => (x.key === key ? { ...x, qty: Math.min(MAX_QTY, x.qty + q) } : x))
      : [...c, { ...i, key, qty: q }]);
  }, []);
  const setQty = useCallback((key: string, q: number) =>
    setItems((c) => c.map((x) => (x.key === key ? { ...x, qty: Math.max(1, Math.min(MAX_QTY, Math.round(q) || 1)) } : x))), []);
  const remove = useCallback((key: string) => setItems((c) => c.filter((x) => x.key !== key)), []);
  const clear = useCallback(() => setItems([]), []);

  const value = useMemo<Ctx>(() => ({
    items, ready, add, setQty, remove, clear, notify,
    count: items.reduce((n, i) => n + i.qty, 0),
    subtotal: Math.round(items.reduce((n, i) => n + i.qty * i.price, 0) * 100) / 100,
  }), [items, ready, add, setQty, remove, clear, notify]);

  return (
    <CartCtx.Provider value={value}>
      {children}
      <div className="toast-zone" aria-live="polite" role="status">
        {toast && (
          <div className="toast" key={toast.id}>
            <span className="toast-ic" aria-hidden="true">✓</span>
            <span>{toast.msg}</span>
            {toast.link && <Link className="toast-link" href={toast.link.href} onClick={() => setToast(null)}>{toast.link.label}</Link>}
            <button type="button" className="toast-x" aria-label="Fermer" onClick={() => setToast(null)}>×</button>
          </div>
        )}
      </div>
    </CartCtx.Provider>
  );
}

export function useCart() {
  const c = useContext(CartCtx);
  if (!c) throw new Error("CartProvider manquant");
  return c;
}
