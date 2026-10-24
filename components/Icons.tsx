// Icônes simples en SVG (aucune bibliothèque)
type P = { size?: number; className?: string };
const base = (size = 20) => ({ width: size, height: size, viewBox: "0 0 24 24", fill: "none", stroke: "currentColor", strokeWidth: 1.8, strokeLinecap: "round" as const, strokeLinejoin: "round" as const, "aria-hidden": true });

export const IconSearch = ({ size, className }: P) => (<svg {...base(size)} className={className}><circle cx="11" cy="11" r="7" /><path d="m20 20-3.5-3.5" /></svg>);
export const IconCart = ({ size, className }: P) => (<svg {...base(size)} className={className}><path d="M3 4h2l2.4 11.2a2 2 0 0 0 2 1.6h7.7a2 2 0 0 0 2-1.5L21 8H6.2" /><circle cx="10" cy="20" r="1.3" /><circle cx="17" cy="20" r="1.3" /></svg>);
export const IconMenu = ({ size, className }: P) => (<svg {...base(size)} className={className}><path d="M4 6h16M4 12h16M4 18h16" /></svg>);
export const IconClose = ({ size, className }: P) => (<svg {...base(size)} className={className}><path d="M6 6l12 12M18 6 6 18" /></svg>);
export const IconChevron = ({ size, className }: P) => (<svg {...base(size)} className={className}><path d="m9 6 6 6-6 6" /></svg>);
export const IconChevronDown = ({ size, className }: P) => (<svg {...base(size)} className={className}><path d="m6 9 6 6 6-6" /></svg>);
export const IconTruck = ({ size, className }: P) => (<svg {...base(size)} className={className}><path d="M3 6h11v10H3zM14 9h4l3 3v4h-7" /><circle cx="7" cy="18" r="1.8" /><circle cx="17.5" cy="18" r="1.8" /></svg>);
export const IconStore = ({ size, className }: P) => (<svg {...base(size)} className={className}><path d="M4 10v10h16V10M3 10l2-6h14l2 6M3 10h18M9 20v-5h6v5" /></svg>);
export const IconQuote = ({ size, className }: P) => (<svg {...base(size)} className={className}><path d="M7 3h7l5 5v13H7z" /><path d="M14 3v5h5M10 13h6M10 17h6" /></svg>);
export const IconCheck = ({ size, className }: P) => (<svg {...base(size)} className={className}><path d="m5 12 4.5 4.5L19 7" /></svg>);
export const IconFilter = ({ size, className }: P) => (<svg {...base(size)} className={className}><path d="M4 6h16M7 12h10M10 18h4" /></svg>);
export const IconBox = ({ size, className }: P) => (<svg {...base(size)} className={className}><path d="m3 7 9-4 9 4-9 4zM3 7v10l9 4 9-4V7M12 11v10" /></svg>);
export const IconPhone = ({ size, className }: P) => (<svg {...base(size)} className={className}><path d="M5 4h4l2 5-2.5 1.5a11 11 0 0 0 5 5L15 13l5 2v4a2 2 0 0 1-2 2A16 16 0 0 1 3 6a2 2 0 0 1 2-2" /></svg>);
export const IconTrash = ({ size, className }: P) => (<svg {...base(size)} className={className}><path d="M4 7h16M10 11v6M14 11v6M6 7l1 13h10l1-13M9 7V4h6v3" /></svg>);
export const IconMinus = ({ size, className }: P) => (<svg {...base(size)} className={className}><path d="M5 12h14" /></svg>);
export const IconPlus = ({ size, className }: P) => (<svg {...base(size)} className={className}><path d="M12 5v14M5 12h14" /></svg>);
export const IconLayers = ({ size, className }: P) => (<svg {...base(size)} className={className}><path d="m12 3 9 5-9 5-9-5z" /><path d="m3 13 9 5 9-5" /></svg>);
export const IconRoof = ({ size, className }: P) => (<svg {...base(size)} className={className}><path d="M2 12 12 4l10 8" /><path d="M5 12.5h14M6.5 15.5h11M8 18.5h8" /></svg>);
export const IconWall = ({ size, className }: P) => (<svg {...base(size)} className={className}><path d="M3 5h18v14H3zM3 9.7h18M3 14.3h18M9 5v4.7M15 9.7v4.6M9 14.3V19M17 5v4.7" /></svg>);
export const IconWind = ({ size, className }: P) => (<svg {...base(size)} className={className}><path d="M3 8h10a3 3 0 1 0-3-3M3 12h15a3 3 0 1 1-3 3M3 16h7" /></svg>);
export const IconTool = ({ size, className }: P) => (<svg {...base(size)} className={className}><path d="m14.5 5.5 4 4M4 20l9.5-9.5M13 7l3-3 4 4-3 3z" /></svg>);
export const IconChat = ({ size, className }: P) => (<svg {...base(size)} className={className}><path d="M4 5h16v11H9l-5 4z" /><path d="M8 9.5h8M8 12.5h5" /></svg>);
export const IconClock = ({ size, className }: P) => (<svg {...base(size)} className={className}><circle cx="12" cy="12" r="8.5" /><path d="M12 7.5V12l3 2" /></svg>);
export const IconRuler =({ size, className }: P) => (<svg {...base(size)} className={className}><path d="M4 16 16 4l4 4L8 20z" /><path d="m8 12 2 2M11 9l2 2M14 6l2 2" /></svg>);
