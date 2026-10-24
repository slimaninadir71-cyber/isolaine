// Écriture côté serveur dans Supabase avec la clé publique (droits limités à la création, voir les règles RLS).
const SB = process.env.NEXT_PUBLIC_SUPABASE_URL ?? "https://kquzvuhieiavbwtutpfi.supabase.co";
const KEY = process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY ?? "sb_publishable_8Nph9o5frxQ7K7-08_7Urg_HG2cvvnq";

export async function insertRow(table: "orders" | "requests", row: Record<string, unknown>) {
  const res = await fetch(`${SB}/rest/v1/${table}`, {
    method: "POST",
    headers: { apikey: KEY, "Content-Type": "application/json", Prefer: "return=minimal" },
    body: JSON.stringify(row),
    cache: "no-store",
  });
  if (!res.ok) {
    const detail = await res.text().catch(() => "");
    throw new Error(`Supabase ${res.status} ${detail.slice(0, 300)}`);
  }
}

export const isEmail = (s: string) => /^[^@\s]+@[^@\s]+\.[^@\s]+$/.test(s) && s.length <= 200;
export const clean = (v: unknown, max: number) => (typeof v === "string" ? v.replace(/[\u0000-\u0008\u000B\u000C\u000E-\u001F]/g, "").trim().slice(0, max) : "");
