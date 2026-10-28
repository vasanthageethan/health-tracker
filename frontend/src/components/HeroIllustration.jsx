export default function HeroIllustration({ size = 120 }) {
  return (
    <svg viewBox="0 0 160 160" width={size} height={size} className="hero-illustration" aria-hidden="true">
      <circle cx="80" cy="80" r="70" fill="var(--accent)" opacity="0.08" />
      <circle cx="80" cy="80" r="52" fill="none" stroke="var(--accent)" strokeWidth="2" opacity="0.35" />
      <path d="M30 80 H56 L66 54 L78 106 L90 66 L98 80 H130"
        fill="none" stroke="var(--accent)" strokeWidth="3.5" strokeLinecap="round" strokeLinejoin="round" />
      <circle cx="78" cy="106" r="4" fill="var(--accent)" />
    </svg>
  )
}
