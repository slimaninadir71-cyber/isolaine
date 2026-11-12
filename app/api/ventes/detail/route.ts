import { NextResponse } from "next/server";
import { tokenOk, ventes } from "@/lib/ventes";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

const PAGE = 500;
const DAY = /^\d{4}-\d{2}-\d{2}$/;

/** Une ligne par vente encaissée (date, jour, montant) : le tableau de bord recalcule lui-même toutes les périodes. */
export async function GET(req: Request) {
  if (!tokenOk(req)) return NextResponse.json({ error: "unauthorized" }, { status: 401 });
  const u = new URL(req.url);
  const d = u.searchParams.get("depuis") || "";
  const depuis = DAY.test(d) ? d : "2000-01-01";
  const page = Math.min(50, Math.max(1, parseInt(u.searchParams.get("page") || "1", 10) || 1));

  try {
    const all = await ventes(depuis);
    const pages = Math.max(1, Math.ceil(all.length / PAGE));
    return NextResponse.json(
      { depuis, page, pages, total: all.length, ventes: all.slice((page - 1) * PAGE, page * PAGE) },
      { headers: { "Cache-Control": "no-store" } },
    );
  } catch (e) {
    console.error("ventes detail", (e as Error).message);
    return NextResponse.json({ error: "erreur de lecture", code: (e as Error).message.match(/\((\d{3})\)/)?.[1] ?? "config" }, { status: 500 }); // code HTTP de la base seulement, jamais de secret
  }
}
