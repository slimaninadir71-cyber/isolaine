"use client";
import { useEffect, useRef, useState, type ReactNode } from "react";

/** Texte long replié sur téléphone, avec « Lire la suite ». Sur grand écran, tout est affiché. */
export function ReadMore({ children }: { children: ReactNode }) {
  const ref = useRef<HTMLDivElement>(null);
  const [open, setOpen] = useState(false);
  useEffect(() => {
    if (ref.current && ref.current.scrollHeight <= 340) setOpen(true);
  }, []);
  return (
    <>
      <div ref={ref} className={`rm${open ? " open" : ""}`}>{children}</div>
      {!open && <button type="button" className="btn btn-ghost btn-sm rm-btn" onClick={() => setOpen(true)}>Lire la suite</button>}
    </>
  );
}
