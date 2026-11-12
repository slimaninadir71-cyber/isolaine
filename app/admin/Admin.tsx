"use client";
import { useCallback, useEffect, useState, type FormEvent, type ReactNode } from "react";

type Campaign = { id: number; key: string; name: string; subject: string; content: string; campaign_type: string; scheduled_delay: number; active: boolean; status: string; scheduled_at: string | null; sent_at: string | null };
type Stats = Record<string, number> & { sources: { source: string; prospects: number; abonnes: number; telechargeurs: number; clients: number }[]; campagnes: { id: number; envoyes: number; echecs: number; en_attente: number }[] };
type Promo = { code: string; pct: number; active: boolean };
type Prospect = { id: number; email: string; created_at: string; source: string | null; page: string | null; newsletter_consent: boolean; newsletter_consent_at: string | null; consent_policy_version: string | null; guide_sent_at: string | null; guide_downloads: number; customer_status: string; coupon_used_at: string | null; unsubscribed_at: string | null };
type Ev = { id: number; campaign_id: number | null; event_type: string; status: string; attempts: number; sent_at: string | null; error_message: string | null; created_at: string };

const day = (s?: string | null) => (s ? new Date(s).toLocaleDateString("fr-FR", { day: "2-digit", month: "2-digit", year: "numeric" }) : "–");
const dt = (s?: string | null) => (s ? new Date(s).toLocaleString("fr-FR", { day: "2-digit", month: "2-digit", year: "numeric", hour: "2-digit", minute: "2-digit" }) : "–");
const eur = (n: number) => new Intl.NumberFormat("fr-FR", { style: "currency", currency: "EUR" }).format(Number(n) || 0);
const SRC: Record<string, string> = { accueil: "Page d'accueil", produit: "Pages produits", categorie: "Pages catégories", "laine-de-verre": "Pages laine de verre", blog: "Articles de blog", "pied-de-page": "Pied de page", panier: "Panier", autre: "Autres pages" };

async function api<T>(url: string, body?: unknown): Promise<T> {
  const r = await fetch(url, body === undefined ? { cache: "no-store" } : { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify(body) });
  const d = await r.json().catch(() => ({}));
  if (!r.ok) throw new Error(d.error === "unauthorized" ? "Session expirée : rechargez la page et reconnectez-vous." : d.error || "Erreur");
  return d as T;
}

export function Admin() {
  const [auth, setAuth] = useState<"wait" | "off" | "login" | "ok">("wait");
  const [tab, setTab] = useState<"vue" | "prospects" | "emails" | "reglages">("vue");
  const [data, setData] = useState<{ stats: Stats; campaigns: Campaign[]; promo: Promo[] } | null>(null);
  const [msg, setMsg] = useState<{ ok: boolean; text: string } | null>(null);
  const say = (text: string, ok = true) => setMsg({ ok, text });
  const load = useCallback(async () => { try { setData(await api("/api/admin/data?view=stats")); } catch (e) { setMsg({ ok: false, text: (e as Error).message }); } }, []);
  useEffect(() => { api<{ enabled: boolean; ok: boolean }>("/api/admin/session").then((s) => setAuth(!s.enabled ? "off" : s.ok ? "ok" : "login")).catch(() => setAuth("login")); }, []);
  useEffect(() => { if (auth === "ok") load(); }, [auth, load]);
  const run = async (body: Record<string, unknown>, done?: string) => { try { const r = await api<Record<string, unknown>>("/api/admin/action", body); if (done) say(done); await load(); return r; } catch (e) { say((e as Error).message, false); return null; } };

  if (auth === "wait") return <p className="muted" role="status">Chargement…</p>;
  if (auth === "off") return <div className="empty"><h1>Administration</h1><p>L'administration n'est pas encore activée. Ajoutez la variable <code>ADMIN_PASSWORD</code> (12 caractères au moins) dans les réglages Vercel du projet, puis redéployez.</p></div>;
  if (auth === "login") return <Login onOk={() => setAuth("ok")} />;
  return (
    <>
      <div className="adm-top"><h1>Marketing &amp; Newsletter</h1><button type="button" className="btn btn-ghost btn-sm" onClick={async () => { await fetch("/api/admin/session", { method: "DELETE" }); setAuth("login"); }}>Se déconnecter</button></div>
      <div className="adm-tabs" role="tablist">{([["vue", "Vue d'ensemble"], ["prospects", "Prospects"], ["emails", "E-mails"], ["reglages", "Réglages"]] as const).map(([k, l]) => <button key={k} type="button" role="tab" aria-selected={tab === k} className={tab === k ? "on" : ""} onClick={() => { setTab(k); setMsg(null); }}>{l}</button>)}</div>
      {msg && <p className={msg.ok ? "adm-ok" : "form-err"} role={msg.ok ? "status" : "alert"}>{msg.text}</p>}
      {!data ? <p className="muted" role="status">Chargement des données…</p>
        : tab === "vue" ? <Overview s={data.stats} />
        : tab === "prospects" ? <Prospects campaigns={data.campaigns} run={run} say={say} />
        : tab === "emails" ? <Emails campaigns={data.campaigns} stats={data.stats} run={run} say={say} />
        : <Settings promo={data.promo} run={run} say={say} />}
    </>
  );
}

function Login({ onOk }: { onOk: () => void }) {
  const [pw, setPw] = useState(""); const [err, setErr] = useState(""); const [busy, setBusy] = useState(false);
  const go = async (e: FormEvent) => { e.preventDefault(); setBusy(true); setErr(""); try { await api("/api/admin/session", { password: pw }); onOk(); } catch (x) { setErr((x as Error).message); } setBusy(false); };
  return <form onSubmit={go} className="adm-login form"><h1>Administration</h1><label>Mot de passe<input type="password" required autoComplete="current-password" value={pw} onChange={(e) => setPw(e.target.value)} /></label>{err && <p className="form-err" role="alert">{err}</p>}<button className="btn btn-primary" disabled={busy}>{busy ? "Connexion…" : "Se connecter"}</button></form>;
}

const Tile = ({ label, value, sub }: { label: string; value: ReactNode; sub?: string }) => <div className="adm-tile"><span>{label}</span><b>{value}</b>{sub && <small>{sub}</small>}</div>;

function Overview({ s }: { s: Stats }) {
  return (
    <>
      <div className="adm-tiles">
        <Tile label="Prospects au total" value={s.prospects} sub={`${s.clients} devenus clients`} />
        <Tile label="Nouveaux, 7 derniers jours" value={s.semaine} />
        <Tile label="Nouveaux, 30 derniers jours" value={s.mois} />
        <Tile label="Abonnés à la newsletter" value={s.abonnes} sub={`${s.desinscrits} désinscrits`} />
        <Tile label="Guides téléchargés" value={s.telechargeurs} sub={`${s.telechargements} téléchargements, ${s.guides_envoyes} guides envoyés`} />
        <Tile label="E-mails envoyés" value={s.emails_envoyes} sub={s.emails_echec ? `${s.emails_echec} en échec` : "aucun échec"} />
        <Tile label="Commandes avec BIENVENUE10" value={s.commandes_code} sub={`${eur(s.remise_code)} de remise accordée`} />
        <Tile label="Chiffre d'affaires avec le code" value={eur(s.ca_code)} sub="commandes payées" />
      </div>
      <p className="muted adm-note">Taux d'ouverture et de clic : non mesurés. Les mesurer demande un traceur dans les e-mails, soumis à l'accord des destinataires. Les téléchargements du guide et l'utilisation du code, eux, sont comptés.</p>
      <h2>D'où viennent les prospects</h2>
      <div className="adm-scroll"><table className="adm-table"><thead><tr><th>Origine</th><th>Prospects</th><th>Abonnés</th><th>Guide téléchargé</th><th>Clients</th><th>Taux de clients</th></tr></thead>
        <tbody>{s.sources.length ? s.sources.map((r) => <tr key={r.source}><td>{SRC[r.source] ?? r.source}</td><td>{r.prospects}</td><td>{r.abonnes}</td><td>{r.telechargeurs}</td><td>{r.clients}</td><td>{r.prospects ? `${Math.round((r.clients / r.prospects) * 100)} %` : "–"}</td></tr>) : <tr><td colSpan={6} className="muted">Aucune inscription pour l'instant.</td></tr>}</tbody></table></div>
    </>
  );
}

type Run = (b: Record<string, unknown>, done?: string) => Promise<Record<string, unknown> | null>;
type Say = (t: string, ok?: boolean) => void;

function Prospects({ campaigns, run, say }: { campaigns: Campaign[]; run: Run; say: Say }) {
  const [q, setQ] = useState(""); const [filter, setFilter] = useState(""); const [source, setSource] = useState(""); const [page, setPage] = useState(0);
  const [res, setRes] = useState<{ rows: Prospect[]; total: number; size: number } | null>(null);
  const [open, setOpen] = useState<{ id: number; events: Ev[] } | null>(null);
  const qs = `q=${encodeURIComponent(q)}&filter=${filter}&source=${source}`;
  const load = useCallback(async () => { try { setRes(await api(`/api/admin/data?view=prospects&${qs}&page=${page}`)); } catch (e) { say((e as Error).message, false); } }, [qs, page]); // eslint-disable-line react-hooks/exhaustive-deps
  useEffect(() => { const t = setTimeout(load, 250); return () => clearTimeout(t); }, [load]);
  const history = async (id: number) => { if (open?.id === id) return setOpen(null); try { setOpen({ id, events: (await api<{ events: Ev[] }>(`/api/admin/data?view=history&id=${id}`)).events }); } catch (e) { say((e as Error).message, false); } };
  const cname = (id: number | null) => campaigns.find((c) => c.id === id)?.name ?? "";
  const EV: Record<string, string> = { envoi: "E-mail", inscription: "Inscription", telechargement: "Guide téléchargé", desinscription: "Désinscription" };
  return (
    <>
      <div className="adm-bar">
        <input type="search" placeholder="Rechercher une adresse e-mail" aria-label="Rechercher une adresse e-mail" value={q} onChange={(e) => { setQ(e.target.value); setPage(0); }} />
        <select aria-label="Filtrer" value={filter} onChange={(e) => { setFilter(e.target.value); setPage(0); }}><option value="">Tous</option><option value="abonnes">Abonnés newsletter</option><option value="sans-accord">Sans accord newsletter</option><option value="clients">Clients</option><option value="guide-telecharge">Guide téléchargé</option><option value="code-utilise">Code utilisé</option><option value="desinscrits">Désinscrits</option></select>
        <select aria-label="Origine" value={source} onChange={(e) => { setSource(e.target.value); setPage(0); }}><option value="">Toutes les origines</option>{Object.entries(SRC).map(([k, l]) => <option key={k} value={k}>{l}</option>)}</select>
        <a className="btn btn-ghost btn-sm" href={`/api/admin/data?view=prospects&format=csv&${qs}`}>Exporter en CSV</a>
      </div>
      <div className="adm-scroll"><table className="adm-table"><thead><tr><th>Adresse e-mail</th><th>Inscription</th><th>Origine</th><th>Newsletter</th><th>Guide envoyé</th><th>Statut</th><th>Désinscription</th><th></th></tr></thead>
        <tbody>{!res ? <tr><td colSpan={8} className="muted">Chargement…</td></tr> : !res.rows.length ? <tr><td colSpan={8} className="muted">Aucun prospect.</td></tr> : res.rows.map((p) => (
          <FragmentRow key={p.id}>
            <tr><td>{p.email}</td><td>{day(p.created_at)}</td><td>{SRC[p.source ?? "autre"] ?? p.source}</td><td>{p.newsletter_consent ? `Oui (${day(p.newsletter_consent_at)})` : "Non"}</td><td>{p.guide_sent_at ? `${day(p.guide_sent_at)}${p.guide_downloads ? ", téléchargé" : ""}` : "Non"}</td><td>{p.customer_status === "client" ? "Client" : "Prospect"}{p.coupon_used_at ? ", code utilisé" : ""}</td><td>{p.unsubscribed_at ? day(p.unsubscribed_at) : "–"}</td><td><button type="button" className="adm-link" onClick={() => history(p.id)}>{open?.id === p.id ? "Fermer" : "Détail"}</button></td></tr>
            {open?.id === p.id && <tr className="adm-detail"><td colSpan={8}>
              <p><b>Preuve de l'accord :</b> {p.newsletter_consent_at ? `case cochée le ${dt(p.newsletter_consent_at)}, texte version ${p.consent_policy_version}` : `case non cochée (texte version ${p.consent_policy_version ?? "–"})`}. Page d'inscription : {p.page ?? "–"}.</p>
              <ul>{open.events.map((e) => <li key={e.id}>{dt(e.sent_at ?? e.created_at)} · {EV[e.event_type] ?? e.event_type}{e.campaign_id ? ` « ${cname(e.campaign_id)} »` : ""}{e.event_type === "envoi" ? ` : ${e.status}${e.status === "échec" ? ` (${e.attempts} tentative${e.attempts > 1 ? "s" : ""}) ${e.error_message ?? ""}` : ""}` : ""}</li>)}</ul>
              <div className="adm-actions">
                <a className="btn btn-ghost btn-sm" href={`/api/admin/data?view=export&id=${p.id}`}>Télécharger ses données</a>
                {!p.unsubscribed_at && p.newsletter_consent && <button type="button" className="btn btn-ghost btn-sm" onClick={async () => { if (await run({ action: "unsubscribe", id: p.id }, "Personne désinscrite.")) { setOpen(null); load(); } }}>Désinscrire</button>}
                <EraseButton onConfirm={async () => { if (await run({ action: "erase", id: p.id }, "Données supprimées.")) { setOpen(null); load(); } }} />
              </div>
            </td></tr>}
          </FragmentRow>))}</tbody></table></div>
      {res && res.total > res.size && <div className="adm-pager"><button type="button" className="btn btn-ghost btn-sm" disabled={page === 0} onClick={() => setPage(page - 1)}>Précédent</button><span>{page * res.size + 1} à {Math.min(res.total, (page + 1) * res.size)} sur {res.total}</span><button type="button" className="btn btn-ghost btn-sm" disabled={(page + 1) * res.size >= res.total} onClick={() => setPage(page + 1)}>Suivant</button></div>}
    </>
  );
}
const FragmentRow = ({ children }: { children: ReactNode }) => <>{children}</>;
/** Suppression en deux temps, sans fenêtre du navigateur. */
function EraseButton({ onConfirm }: { onConfirm: () => void }) {
  const [sure, setSure] = useState(false);
  return sure ? <span className="adm-sure">Supprimer définitivement cette personne et son historique ? <button type="button" className="btn btn-sm adm-danger" onClick={onConfirm}>Oui, supprimer</button> <button type="button" className="btn btn-ghost btn-sm" onClick={() => setSure(false)}>Annuler</button></span> : <button type="button" className="btn btn-ghost btn-sm" onClick={() => setSure(true)}>Supprimer ses données</button>;
}

function Emails({ campaigns, stats, run, say }: { campaigns: Campaign[]; stats: Stats; run: Run; say: Say }) {
  const [edit, setEdit] = useState<Campaign | null>(null);
  const [creating, setCreating] = useState(false);
  const count = (id: number) => stats.campagnes.find((c) => c.id === id);
  const seq = campaigns.filter((c) => c.campaign_type !== "newsletter"), news = campaigns.filter((c) => c.campaign_type === "newsletter");
  if (edit || creating) return <Editor c={edit} onClose={() => { setEdit(null); setCreating(false); }} run={run} say={say} />;
  return (
    <>
      <div className="adm-head"><h2>Séquence automatique</h2><button type="button" className="btn btn-ghost btn-sm" onClick={async () => { const r = await run({ action: "runNow" }); if (r) say(`Passage terminé : ${r.bienvenue} e-mail(s) de bienvenue repris, ${r.sequence} e-mail(s) de séquence, ${r.newsletters} newsletter(s), ${r.echecs} échec(s).`); }}>Lancer le passage maintenant</button></div>
      <p className="muted adm-note">Le passage automatique a lieu une fois par jour. L'e-mail 1 part à l'inscription, pour tout le monde. Les e-mails 2 à 5 ne partent qu'aux personnes qui ont coché la case newsletter, et s'arrêtent dès qu'elles commandent ou se désinscrivent.</p>
      <div className="adm-scroll"><table className="adm-table"><thead><tr><th>E-mail</th><th>Objet</th><th>Envoi</th><th>Envoyés</th><th>Échecs</th><th>Actif</th><th></th></tr></thead>
        <tbody>{seq.map((c) => <tr key={c.id}><td>{c.name}</td><td>{c.subject}</td><td>{c.campaign_type === "transactionnel" ? "À l'inscription" : `J+${c.scheduled_delay}`}</td><td>{count(c.id)?.envoyes ?? 0}</td><td>{count(c.id)?.echecs ?? 0}</td>
          <td><label className="check"><input type="checkbox" checked={c.active} aria-label={`Activer ${c.name}`} onChange={(e) => run({ action: "toggle", id: c.id, active: e.target.checked }, e.target.checked ? "E-mail activé." : "E-mail désactivé.")} /></label></td>
          <td><button type="button" className="adm-link" onClick={() => setEdit(c)}>Modifier</button></td></tr>)}</tbody></table></div>
      <div className="adm-head"><h2>Newsletters</h2><button type="button" className="btn btn-primary btn-sm" onClick={() => setCreating(true)}>Nouvelle newsletter</button></div>
      <p className="muted adm-note">Une newsletter ne part jamais sans votre validation. Elle n'est envoyée qu'aux abonnés ({stats.abonnes} aujourd'hui).</p>
      <div className="adm-scroll"><table className="adm-table"><thead><tr><th>Nom</th><th>Objet</th><th>État</th><th>Envoyés</th><th></th></tr></thead>
        <tbody>{news.length ? news.map((c) => <tr key={c.id}><td>{c.name}</td><td>{c.subject}</td><td>{c.status}{c.status === "validée" ? (c.scheduled_at ? `, prévue le ${dt(c.scheduled_at)}` : ", au prochain passage") : c.status === "envoyée" ? ` le ${day(c.sent_at)}` : ""}</td><td>{count(c.id)?.envoyes ?? 0}</td><td><button type="button" className="adm-link" onClick={() => setEdit(c)}>{c.status === "brouillon" ? "Modifier et valider" : "Ouvrir"}</button></td></tr>) : <tr><td colSpan={5} className="muted">Aucune newsletter pour l'instant.</td></tr>}</tbody></table></div>
    </>
  );
}

function Editor({ c, onClose, run, say }: { c: Campaign | null; onClose: () => void; run: Run; say: Say }) {
  const [name, setName] = useState(c?.name ?? ""); const [subject, setSubject] = useState(c?.subject ?? ""); const [content, setContent] = useState(c?.content ?? "Bonjour,\n\nVotre texte ici.\n\n[[Découvrir la boutique | {{boutique_url}}]]");
  const [delay, setDelay] = useState(c?.scheduled_delay ?? 0); const [html, setHtml] = useState(""); const [to, setTo] = useState(""); const [when, setWhen] = useState(""); const [busy, setBusy] = useState("");
  const type = c?.campaign_type ?? "newsletter", isNews = type === "newsletter", locked = isNews && !!c && c.status !== "brouillon";
  const preview = async () => { try { setHtml((await api<{ html: string }>("/api/admin/action", { action: "preview", subject, content, campaign_type: type })).html); } catch (e) { say((e as Error).message, false); } };
  const save = async () => (c ? run({ action: "saveCampaign", id: c.id, name, subject, content, scheduled_delay: delay }, "Enregistré.") : run({ action: "newNewsletter", name, subject, content }, "Brouillon créé. Ouvrez-le pour le tester puis le valider."));
  const sendAll = async () => {
    setBusy("Envoi en cours…"); let total = 0;
    for (let i = 0; i < 200; i++) { const r = await run({ action: "sendNow", id: c!.id }); if (!r) break; total += Number(r.envoyes) || 0; setBusy(`Envoi en cours : ${total} envoyé(s), ${r.restant} restant(s)…`); if (!r.restant || (!r.envoyes && !r.echecs)) { say(`Envoi terminé : ${total} e-mail(s) confirmés par le service d'envoi.`); break; } }
    setBusy(""); onClose();
  };
  return (
    <div className="adm-edit">
      <button type="button" className="adm-link" onClick={onClose}>← Retour à la liste</button>
      <h2>{c ? c.name : "Nouvelle newsletter"}</h2>
      {locked && <p className="adm-ok">Cette newsletter est « {c!.status} » : son texte n'est plus modifiable.</p>}
      <div className="adm-cols">
        <div className="form">
          <label>Nom interne<input value={name} maxLength={120} disabled={locked} onChange={(e) => setName(e.target.value)} /></label>
          <label>Objet de l'e-mail<input value={subject} maxLength={150} disabled={locked} onChange={(e) => setSubject(e.target.value)} /></label>
          {type === "sequence" && <label>Envoi, en jours après l'inscription<input type="number" min={1} max={365} value={delay} onChange={(e) => setDelay(Number(e.target.value))} /></label>}
          <label>Contenu<textarea rows={18} value={content} disabled={locked} onChange={(e) => setContent(e.target.value)} /></label>
          <p className="muted adm-note">Mise en forme : une ligne vide entre les paragraphes · <code>## Titre</code> · <code>- élément de liste</code> · <code>**gras**</code> · <code>[texte](https://lien)</code> · <code>[[Texte du bouton | https://lien]]</code> · <code>&gt; encadré</code>. Variables : <code>{"{{guide_url}}"}</code>, <code>{"{{code}}"}</code>, <code>{"{{boutique_url}}"}</code>, <code>{"{{site_url}}"}</code>. Le lien de désinscription est ajouté automatiquement.</p>
          <div className="adm-actions">
            {!locked && <button type="button" className="btn btn-primary btn-sm" onClick={async () => { if ((await save()) && !c) onClose(); }}>Enregistrer</button>}
            <button type="button" className="btn btn-ghost btn-sm" onClick={preview}>Prévisualiser</button>
            {c && isNews && c.status === "brouillon" && <button type="button" className="btn btn-ghost btn-sm" onClick={async () => { if (await run({ action: "deleteNewsletter", id: c.id }, "Brouillon supprimé.")) onClose(); }}>Supprimer le brouillon</button>}
          </div>
          {c && <fieldset><legend>Tester avant envoi</legend><div className="adm-bar"><input type="email" placeholder="votre adresse e-mail" aria-label="Adresse du test" value={to} onChange={(e) => setTo(e.target.value)} /><button type="button" className="btn btn-ghost btn-sm" onClick={async () => { const r = await run({ action: "test", id: c.id, to }); if (r) say("E-mail de test accepté par le service d'envoi. Vérifiez votre boîte (version enregistrée de la campagne)."); }}>Envoyer un test</button></div></fieldset>}
          {c && isNews && c.status === "brouillon" && <fieldset><legend>Valider l'envoi</legend><label>Date d'envoi (facultatif)<input type="datetime-local" value={when} onChange={(e) => setWhen(e.target.value)} /></label><p className="muted adm-note">Sans date, la newsletter part au prochain passage quotidien, ou tout de suite avec « Envoyer maintenant ». Avec une date, elle part au premier passage quotidien qui suit.</p><button type="button" className="btn btn-primary btn-sm" onClick={async () => { if (await run({ action: "approve", id: c.id, scheduled_at: when ? new Date(when).toISOString() : "" }, "Newsletter validée.")) onClose(); }}>Valider cette newsletter</button></fieldset>}
          {c && isNews && (c.status === "validée" || c.status === "en cours") && <fieldset><legend>Envoi</legend><div className="adm-actions"><button type="button" className="btn btn-primary btn-sm" disabled={!!busy} onClick={sendAll}>Envoyer maintenant aux abonnés</button>{c.status === "validée" && <button type="button" className="btn btn-ghost btn-sm" disabled={!!busy} onClick={async () => { if (await run({ action: "unapprove", id: c.id }, "Newsletter repassée en brouillon.")) onClose(); }}>Annuler la validation</button>}</div>{busy && <p role="status">{busy}</p>}</fieldset>}
        </div>
        <div><p className="muted adm-note">Aperçu (avec des liens d'exemple)</p>{html ? <iframe title="Aperçu de l'e-mail" className="adm-frame" sandbox="" srcDoc={html} /> : <div className="adm-frame adm-empty">Cliquez sur « Prévisualiser ».</div>}</div>
      </div>
    </div>
  );
}

function Settings({ promo, run, say }: { promo: Promo[]; run: Run; say: Say }) {
  const p = promo[0];
  const [pct, setPct] = useState(p?.pct ?? 10); const [active, setActive] = useState(p?.active ?? false);
  const [guide, setGuide] = useState<{ online: boolean; size: number; url?: string } | null>(null); const [up, setUp] = useState("");
  const check = useCallback(() => { api<{ online: boolean; size: number; url?: string }>("/api/admin/guide").then(setGuide).catch(() => setGuide({ online: false, size: 0 })); }, []);
  useEffect(check, [check]);
  const upload = async (f?: File) => {
    if (!f) return; setUp("Envoi du fichier…");
    try { const r = await fetch("/api/admin/guide", { method: "POST", headers: { "Content-Type": "application/pdf" }, body: f }); const d = await r.json().catch(() => ({})); if (!r.ok) throw new Error(d.error || "Erreur"); say("Guide mis en ligne."); check(); } catch (e) { say((e as Error).message, false); }
    setUp("");
  };
  return (
    <>
      <h2>Code promotionnel</h2>
      {p ? <div className="form adm-box"><p>Code <b>{p.code}</b> : réservé aux adresses inscrites au guide, première commande, une seule utilisation, en plus des prix affichés.</p>
        <label>Remise (en %)<input type="number" min={1} max={50} value={pct} onChange={(e) => setPct(Number(e.target.value))} /></label>
        <label className="check"><input type="checkbox" checked={active} onChange={(e) => setActive(e.target.checked)} /> <span>Code actif</span></label>
        <button type="button" className="btn btn-primary btn-sm" onClick={() => run({ action: "setPromo", code: p.code, pct, active }, "Code promotionnel mis à jour.")}>Enregistrer</button>
        <p className="muted adm-note">Si vous changez le pourcentage, pensez à mettre à jour les textes des e-mails, de la fenêtre d'inscription et du guide, qui annoncent 10 %.</p></div> : <p className="muted">Aucun code.</p>}
      <h2>Guide PDF</h2>
      <div className="form adm-box"><p>{!guide ? "Vérification…" : guide.online ? <>Le guide est en ligne ({Math.round(guide.size / 1024)} Ko). <a href={guide.url} target="_blank" rel="noreferrer">Ouvrir le PDF</a></> : <b>Le guide n'est pas encore en ligne : le lien de l'e-mail 1 ne fonctionnera pas tant qu'il n'est pas envoyé ici.</b>}</p>
        <label>Mettre en ligne ou remplacer le guide (PDF, 4 Mo au plus)<input type="file" accept="application/pdf" onChange={(e) => upload(e.target.files?.[0])} /></label>{up && <p role="status">{up}</p>}</div>
    </>
  );
}
