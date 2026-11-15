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
export const IconRuler = ({ size, className }: P) => (<svg {...base(size)} className={className}><path d="M4 16 16 4l4 4L8 20z" /><path d="m8 12 2 2M11 9l2 2M14 6l2 2" /></svg>);
export const IconChat = ({ size, className }: P) => (<svg {...base(size)} className={className}><path d="M4 5h16v11H9l-5 4z" /><path d="M8 9.5h8M8 12.5h5" /></svg>);
export const IconClock = ({ size, className }: P) => (<svg {...base(size)} className={className}><circle cx="12" cy="12" r="8.5" /><path d="M12 7.5V12l3 2" /></svg>);
export const IconHome = ({ size, className }: P) => (<svg {...base(size)} className={className}><path d="M3 11.5 12 4l9 7.5M5.5 9.5V20h13V9.5M10 20v-5.5h4V20" /></svg>);
export const IconFlame = ({ size, className }: P) => (<svg {...base(size)} className={className}><path d="M12 21c-3.9 0-6.5-2.6-6.5-6.2 0-3.4 2.4-5.4 3.6-7.6.5 1.6 1.4 2.6 2.4 3.1.2-3.1 1.6-5.6 3.6-7.3.2 3 3.4 5.4 3.4 9.4 0 4.6-2.8 8.6-6.5 8.6Z" /><path d="M12 21c-1.7 0-2.9-1.2-2.9-2.9 0-1.9 1.6-2.8 2.4-4.3.7 1.2 3.4 2.2 3.4 4.4 0 1.6-1.2 2.8-2.9 2.8Z" /></svg>);
export const IconShield = ({ size, className }: P) => (<svg {...base(size)} className={className}><path d="M12 3 4.5 6v5.5c0 4.6 3.2 8.4 7.5 9.5 4.3-1.1 7.5-4.9 7.5-9.5V6z" /><path d="m8.5 12 2.5 2.5 4.5-5" /></svg>);
export const IconHeadset = ({ size, className }: P) => (<svg {...base(size)} className={className}><path d="M4 14v-2a8 8 0 0 1 16 0v2" /><path d="M4 14h3v5H5.5A1.5 1.5 0 0 1 4 17.5zM20 14h-3v5h1.5a1.5 1.5 0 0 0 1.5-1.5zM17 19c0 1.1-1.8 2-4 2" /></svg>);
export const IconLock = ({ size, className }: P) => (<svg {...base(size)} className={className}><rect x="5" y="10.5" width="14" height="10" rx="1.5" /><path d="M8 10.5V7.5a4 4 0 0 1 8 0v3" /></svg>);
/** Logo WhatsApp (forme pleine) */
export const IconWhatsApp = ({ size = 20, className }: P) => (<svg width={size} height={size} viewBox="0 0 24 24" fill="currentColor" aria-hidden="true" className={className}><path d="M12.04 2a9.9 9.9 0 0 0-8.5 14.9L2 22l5.25-1.38A9.9 9.9 0 1 0 12.04 2Zm0 18.1a8.2 8.2 0 0 1-4.18-1.14l-.3-.18-3.12.82.83-3.04-.2-.31a8.2 8.2 0 1 1 6.97 3.85Zm4.5-6.15c-.25-.12-1.46-.72-1.69-.8-.23-.09-.39-.12-.56.12-.16.25-.64.8-.78.97-.14.16-.29.18-.54.06-.25-.12-1.05-.39-2-1.23-.74-.66-1.24-1.47-1.38-1.72-.14-.25-.02-.38.1-.5.11-.11.25-.29.37-.43.12-.14.16-.25.25-.41.08-.17.04-.31-.02-.43-.06-.12-.56-1.35-.77-1.85-.2-.48-.4-.42-.56-.43h-.48c-.17 0-.43.06-.66.31-.23.25-.87.85-.87 2.07s.89 2.4 1.01 2.57c.12.17 1.75 2.67 4.24 3.74.59.26 1.05.41 1.41.52.59.19 1.13.16 1.56.1.48-.07 1.46-.6 1.67-1.18.2-.58.2-1.08.14-1.18-.06-.1-.23-.17-.48-.29Z" /></svg>);
