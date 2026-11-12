import { NextResponse } from "next/server";
import { adminConfigured, getProspectByToken, logEvent, sb } from "@/lib/supabase-admin";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

const SB = process.env.NEXT_PUBLIC_SUPABASE_URL ?? "https://kquzvuhieiavbwtutpfi.supabase.co";
const GUIDE_URL = process.env.GUIDE_PDF_URL || `${SB}/storage/v1/object/public/guides/guide-isolation-isolaine.pdf`;

/** Lien de téléchargement personnel du guide : compte le téléchargement puis redirige vers le PDF. */
export async function GET(req: Request) {
  const t = new URL(req.url).searchParams.get("t") || "";
  try {
    const p = adminConfigured() ? await getProspectByToken(t) : null;
    if (p) {
      await sb(`rpc/guide_downloaded`, { method: "POST", body: JSON.stringify({ p_id: p.id }) });
      await logEvent(p.id, "telechargement");
    }
  } catch (e) { console.error("guide", (e as Error).message); }
  return NextResponse.redirect(GUIDE_URL, 302);
}
