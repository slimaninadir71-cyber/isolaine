import type { ReactNode } from "react";
import { Breadcrumbs } from "./Breadcrumbs";

export function LegalPage({ title, updated, children }: { title: string; updated?: string; children: ReactNode }) {
  return (
    <div className="wrap page">
      <Breadcrumbs items={[{ name: title }]} />
      <article className="legal">
        <h1>{title}</h1>
        {updated && <p className="muted">Mise à jour : {updated}</p>}
        {children}
      </article>
    </div>
  );
}

export const UPDATED = "21 octobre 2026";
