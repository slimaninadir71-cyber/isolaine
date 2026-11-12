import type { Metadata } from "next";
import { Admin } from "./Admin";

export const metadata: Metadata = { title: "Administration", robots: { index: false, follow: false } };

export default function Page() {
  return <div className="wrap page adm"><Admin /></div>;
}
