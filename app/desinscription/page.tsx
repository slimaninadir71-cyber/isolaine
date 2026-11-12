import type { Metadata } from "next";
import { Unsubscribe } from "./Unsubscribe";

export const metadata: Metadata = { title: "Désinscription", robots: { index: false, follow: false } };

export default function Page() {
  return (
    <div className="wrap page narrow">
      <h1>Désinscription</h1>
      <Unsubscribe />
    </div>
  );
}
