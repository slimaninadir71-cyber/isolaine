// Logo Isolaine : un panneau isolant stylisé (trois couches ondulées) et le nom de l'enseigne
export function Logo({ light = false }: { light?: boolean }) {
  return (
    <span className={`logo${light ? " logo-light" : ""}`}>
      <svg width="30" height="30" viewBox="0 0 32 32" aria-hidden="true" className="logo-mark">
        <rect x="1" y="1" width="30" height="30" rx="8" fill="currentColor" className="logo-bg" />
        <path d="M7 11c3-2.4 6-2.4 9 0s6 2.4 9 0M7 16.5c3-2.4 6-2.4 9 0s6 2.4 9 0M7 22c3-2.4 6-2.4 9 0s6 2.4 9 0" stroke="#f5b400" strokeWidth="2.4" fill="none" strokeLinecap="round" />
      </svg>
      <span className="logo-word">Iso<b>laine</b></span>
    </span>
  );
}
