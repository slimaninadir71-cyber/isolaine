// Envois automatiques : reprise de l'e-mail 1, séquence (J+2, J+4, J+7, J+10) et newsletters validées par l'administrateur.
import { listCampaigns, prospectsByIds, rpc, sbRows, updateCampaign, updateProspect, P_SELECT, type CampaignFull, type Prospect } from "@/lib/supabase-admin";
import { sendCampaign } from "@/lib/emailing";

const pace = () => new Promise((r) => setTimeout(r, Math.max(0, Number(process.env.EMAIL_PACE_MS ?? 600)))); // rythme compatible avec la limite du service d'envoi
/** Nombre d'e-mails par passage (l'offre gratuite du service d'envoi est plafonnée par jour). */
const runLimit = () => Math.max(1, Number(process.env.MARKETING_RUN_LIMIT) || 80);

/** Envoie une newsletter validée aux abonnés qui ne l'ont pas encore reçue. Renvoie ce que le service d'envoi a confirmé. */
export async function sendNewsletter(c: CampaignFull, limit: number, deadline: number) {
  const due = await rpc<{ prospect_id: number; remaining: number }[]>("newsletter_due", { p_campaign: c.id, p_limit: limit });
  const people = await prospectsByIds(due.map((d) => d.prospect_id));
  let envoyes = 0, echecs = 0, traites = 0;
  if (c.status !== "en cours" && people.length) await updateCampaign(c.id, { status: "en cours" });
  for (const p of people) {
    if (Date.now() > deadline) break;
    const r = await sendCampaign(p, c);
    traites++;
    if (r === "envoyé") envoyes++; else if (r === "échec") echecs++;
    await pace();
  }
  const restant = Math.max(0, Number(due[0]?.remaining ?? 0) - traites + echecs);
  if (restant === 0 && Number(due[0]?.remaining ?? 0) - traites <= 0) await updateCampaign(c.id, { status: "envoyée", sent_at: new Date().toISOString() });
  return { envoyes, echecs, restant };
}

/** Passage complet (tâche planifiée quotidienne ou bouton de l'administration). Peut être relancé sans risque de doublon. */
export async function runAll(maxMs = 45000) {
  const deadline = Date.now() + maxMs;
  let budget = runLimit();
  const out = { bienvenue: 0, sequence: 0, newsletters: 0, echecs: 0 };
  const camps = await listCampaigns();
  const count = (r: string, k: "bienvenue" | "sequence") => { if (r === "envoyé") { out[k]++; budget--; } else if (r === "échec") out.echecs++; };

  // 1. E-mail 1 qui n'est pas parti à l'inscription (panne du service d'envoi) : repris pendant sept jours.
  const welcome = camps.find((c) => c.key === "bienvenue");
  if (welcome) {
    const late = await sbRows<Prospect>(`prospects?guide_sent_at=is.null&created_at=gte.${encodeURIComponent(new Date(Date.now() - 7 * 86400000).toISOString())}&select=${P_SELECT}&order=id.asc&limit=50`);
    for (const p of late) {
      if (budget <= 0 || Date.now() > deadline) break;
      const r = await sendCampaign(p, welcome);
      if (r === "envoyé") { const now = new Date().toISOString(); await updateProspect(p.id, { guide_sent_at: now, coupon_sent_at: now }); }
      count(r, "bienvenue"); await pace();
    }
  }
  // 2. Séquence : la base désigne, pour chaque abonné, le prochain e-mail arrivé à échéance (un seul par jour et par personne).
  const due = await rpc<{ prospect_id: number; campaign_id: number }[]>("sequence_due", { p_limit: Math.max(0, Math.min(200, budget)) });
  const people = new Map((await prospectsByIds([...new Set(due.map((d) => d.prospect_id))])).map((p) => [p.id, p]));
  for (const d of due) {
    if (budget <= 0 || Date.now() > deadline) break;
    const p = people.get(d.prospect_id), c = camps.find((x) => x.id === d.campaign_id && x.campaign_type === "sequence");
    if (!p || !c) continue;
    count(await sendCampaign(p, c), "sequence"); await pace(); // l'accord newsletter est revérifié dans sendCampaign
  }
  // 3. Newsletters validées, arrivées à leur date.
  const now = new Date().toISOString();
  for (const c of camps.filter((x) => x.campaign_type === "newsletter" && x.active && (x.status === "validée" || x.status === "en cours") && (!x.scheduled_at || x.scheduled_at <= now))) {
    if (budget <= 0 || Date.now() > deadline) break;
    const r = await sendNewsletter(c, budget, deadline);
    out.newsletters += r.envoyes; out.echecs += r.echecs; budget -= r.envoyes;
  }
  return out;
}
