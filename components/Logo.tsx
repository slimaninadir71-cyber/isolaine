// Logo Isolaine (rouleau de laine stylisé + nom). « light » = version pour fond vert foncé (en-tête, pied de page).
export function Logo({ light = false }: { light?: boolean }) {
  return (
    <span className={`logo${light ? " logo-light" : ""}`}>
      <img src={light ? "/img/logo/isolaine-logo-fond-vert.svg" : "/img/logo/isolaine-logo.svg"} alt="Isolaine" width={143} height={40} className="logo-img" />
    </span>
  );
}
