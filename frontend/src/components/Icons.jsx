const I = ({ size = 16, children, ...props }) => (
  <svg
    width={size} height={size}
    viewBox="0 0 24 24" fill="none"
    stroke="currentColor" strokeWidth="1.75"
    strokeLinecap="round" strokeLinejoin="round"
    {...props}
  >
    {children}
  </svg>
);

export const EyeIcon = ({ size }) => (
  <I size={size}>
    <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"/>
    <circle cx="12" cy="12" r="3"/>
  </I>
);

export const HomeIcon = ({ size }) => (
  <I size={size}>
    <path d="M3 9l9-7 9 7v11a2 2 0 01-2 2H5a2 2 0 01-2-2z"/>
    <polyline points="9,22 9,12 15,12 15,22"/>
  </I>
);

export const BookIcon = ({ size }) => (
  <I size={size}>
    <path d="M4 19.5A2.5 2.5 0 016.5 17H20"/>
    <path d="M6.5 2H20v20H6.5A2.5 2.5 0 014 19.5v-15A2.5 2.5 0 016.5 2z"/>
  </I>
);

export const PlayIcon = ({ size }) => (
  <I size={size}><polygon points="5,3 19,12 5,21"/></I>
);

export const BarChartIcon = ({ size }) => (
  <I size={size}>
    <line x1="18" y1="20" x2="18" y2="10"/>
    <line x1="12" y1="20" x2="12" y2="4"/>
    <line x1="6"  y1="20" x2="6"  y2="14"/>
  </I>
);

export const ShieldIcon = ({ size }) => (
  <I size={size}><path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"/></I>
);

export const LogOutIcon = ({ size }) => (
  <I size={size}>
    <path d="M9 21H5a2 2 0 01-2-2V5a2 2 0 012-2h4"/>
    <polyline points="16,17 21,12 16,7"/>
    <line x1="21" y1="12" x2="9" y2="12"/>
  </I>
);

export const CheckIcon = ({ size }) => (
  <I size={size}><polyline points="20,6 9,17 4,12"/></I>
);

export const XIcon = ({ size }) => (
  <I size={size}><line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/></I>
);

export const ChevronDownIcon = ({ size }) => (
  <I size={size}><polyline points="6,9 12,15 18,9"/></I>
);

export const ChevronUpIcon = ({ size }) => (
  <I size={size}><polyline points="18,15 12,9 6,15"/></I>
);

export const BookmarkIcon = ({ size, filled }) => (
  <I size={size}>
    <path
      d="M19 21l-7-5-7 5V5a2 2 0 012-2h10a2 2 0 012 2z"
      fill={filled ? 'currentColor' : 'none'}
    />
  </I>
);

export const ImageIcon = ({ size }) => (
  <I size={size}>
    <rect x="3" y="3" width="18" height="18" rx="2" ry="2"/>
    <circle cx="8.5" cy="8.5" r="1.5"/>
    <polyline points="21,15 16,10 5,21"/>
  </I>
);

export const PlusIcon = ({ size }) => (
  <I size={size}><line x1="12" y1="5" x2="12" y2="19"/><line x1="5" y1="12" x2="19" y2="12"/></I>
);

export const EditIcon = ({ size }) => (
  <I size={size}>
    <path d="M11 4H4a2 2 0 00-2 2v14a2 2 0 002 2h14a2 2 0 002-2v-7"/>
    <path d="M18.5 2.5a2.121 2.121 0 013 3L12 15l-4 1 1-4 9.5-9.5z"/>
  </I>
);

export const TrashIcon = ({ size }) => (
  <I size={size}>
    <polyline points="3,6 5,6 21,6"/>
    <path d="M19 6l-1 14a2 2 0 01-2 2H8a2 2 0 01-2-2L5 6"/>
    <path d="M10 11v6M14 11v6"/>
    <path d="M9 6V4a1 1 0 011-1h4a1 1 0 011 1v2"/>
  </I>
);

export const UploadIcon = ({ size }) => (
  <I size={size}>
    <polyline points="16,16 12,12 8,16"/>
    <line x1="12" y1="12" x2="12" y2="21"/>
    <path d="M20.39 18.39A5 5 0 0018 9h-1.26A8 8 0 103 16.3"/>
  </I>
);

export const FilterIcon = ({ size }) => (
  <I size={size}><polygon points="22,3 2,3 10,12.46 10,19 14,21 14,12.46 22,3"/></I>
);

export const SearchIcon = ({ size }) => (
  <I size={size}><circle cx="11" cy="11" r="8"/><line x1="21" y1="21" x2="16.65" y2="16.65"/></I>
);

export const ClockIcon = ({ size }) => (
  <I size={size}><circle cx="12" cy="12" r="10"/><polyline points="12,6 12,12 16,14"/></I>
);

export const FlameIcon = ({ size }) => (
  <I size={size}><path d="M8.5 14.5A2.5 2.5 0 0011 12c0-1.38-.5-2-1-3-1.072-2.143-.224-4.054 2-6 .5 2.5 2 4.9 4 6.5 2 1.6 3 3.5 3 5.5a7 7 0 11-14 0c0-1.153.433-2.294 1-3a2.5 2.5 0 002.5 2.5z"/></I>
);

export const ArrowLeftIcon = ({ size }) => (
  <I size={size}><line x1="19" y1="12" x2="5" y2="12"/><polyline points="12,19 5,12 12,5"/></I>
);

export const ArrowRightIcon = ({ size }) => (
  <I size={size}><line x1="5" y1="12" x2="19" y2="12"/><polyline points="12,5 19,12 12,19"/></I>
);

export const AlertCircleIcon = ({ size }) => (
  <I size={size}><circle cx="12" cy="12" r="10"/><line x1="12" y1="8" x2="12" y2="12"/><line x1="12" y1="16" x2="12.01" y2="16"/></I>
);

export const TrophyIcon = ({ size }) => (
  <I size={size}>
    <path d="M6 9H4.5a2.5 2.5 0 010-5H6"/>
    <path d="M18 9h1.5a2.5 2.5 0 000-5H18"/>
    <path d="M4 22h16M10 14.66V17c0 .55-.47.98-.97 1.21C7.85 18.75 7 20.24 7 22"/>
    <path d="M14 14.66V17c0 .55.47.98.97 1.21C16.15 18.75 17 20.24 17 22"/>
    <path d="M18 2H6v7a6 6 0 006 6 6 6 0 006-6V2z"/>
  </I>
);

export const LayoutIcon = ({ size }) => (
  <I size={size}>
    <rect x="3" y="3" width="18" height="18" rx="2" ry="2"/>
    <line x1="3" y1="9" x2="21" y2="9"/>
    <line x1="9" y1="21" x2="9" y2="9"/>
  </I>
);
