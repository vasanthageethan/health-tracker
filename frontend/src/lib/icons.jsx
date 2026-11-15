const common = { width: 16, height: 16, viewBox: '0 0 24 24', fill: 'none', stroke: 'currentColor', strokeWidth: 2, strokeLinecap: 'round', strokeLinejoin: 'round' }

export function CalendarIcon() {
  return (
    <svg {...common} aria-hidden="true">
      <rect x="3" y="5" width="18" height="16" rx="2" />
      <line x1="3" y1="10" x2="21" y2="10" />
      <line x1="7" y1="2" x2="7" y2="6" />
      <line x1="17" y1="2" x2="17" y2="6" />
    </svg>
  )
}

export function ClipboardIcon() {
  return (
    <svg {...common} aria-hidden="true">
      <rect x="4" y="4" width="16" height="17" rx="2" />
      <rect x="8" y="2" width="8" height="4" rx="1" />
      <polyline points="8.5 13 11 15.5 16 10" />
    </svg>
  )
}

export function TrendingIcon() {
  return (
    <svg {...common} aria-hidden="true">
      <polyline points="3 17 9 10 13 14 21 5" />
      <circle cx="21" cy="5" r="1.5" fill="currentColor" stroke="none" />
    </svg>
  )
}

export function SettingsIcon() {
  return (
    <svg {...common} aria-hidden="true">
      <line x1="4" y1="7" x2="20" y2="7" />
      <circle cx="9" cy="7" r="2" fill="currentColor" stroke="none" />
      <line x1="4" y1="14" x2="20" y2="14" />
      <circle cx="16" cy="14" r="2" fill="currentColor" stroke="none" />
      <line x1="4" y1="21" x2="20" y2="21" />
      <circle cx="11" cy="21" r="2" fill="currentColor" stroke="none" />
    </svg>
  )
}

export function MoonIcon() {
  return (
    <svg {...common} aria-hidden="true">
      <path d="M20 14.5A8.5 8.5 0 1 1 9.5 4a6.5 6.5 0 0 0 10.5 10.5z" />
    </svg>
  )
}

export function PulseIcon() {
  return (
    <svg {...common} aria-hidden="true">
      <polyline points="2 12 7 12 9 6 13 18 15 12 22 12" />
    </svg>
  )
}

export function AppleIcon() {
  return (
    <svg {...common} aria-hidden="true">
      <circle cx="12" cy="14" r="7" />
      <line x1="12" y1="7" x2="12" y2="3" />
      <path d="M12 4c1.5-1 3-1 3 0" />
    </svg>
  )
}

export function AlertIcon() {
  return (
    <svg {...common} aria-hidden="true">
      <circle cx="12" cy="12" r="9" />
      <line x1="12" y1="8" x2="12" y2="13" />
      <circle cx="12" cy="16.5" r="0.75" fill="currentColor" stroke="none" />
    </svg>
  )
}
