/* Small static logo for nav/footer */
export function LogoMark({ size = 32 }: { size?: number }) {
  return (
    <svg width={size} height={size} viewBox="0 0 200 200" fill="none">
      <defs>
        <linearGradient id={`sm-s1-${size}`} x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" stopColor="#a855f7" />
          <stop offset="100%" stopColor="#ec4899" />
        </linearGradient>
        <linearGradient id={`sm-s2-${size}`} x1="0%" y1="100%" x2="100%" y2="0%">
          <stop offset="0%" stopColor="#06b6d4" />
          <stop offset="100%" stopColor="#22c55e" />
        </linearGradient>
        <linearGradient id={`sm-core-${size}`} x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" stopColor="#a855f7" />
          <stop offset="33%" stopColor="#ec4899" />
          <stop offset="66%" stopColor="#06b6d4" />
          <stop offset="100%" stopColor="#22c55e" />
        </linearGradient>
      </defs>
      <path d="M 56 56 C 56 90, 90 95, 100 100 C 110 105, 144 110, 144 144" stroke={`url(#sm-s2-${size})`} strokeWidth="16" strokeLinecap="round" fill="none" opacity="0.35" />
      <path d="M 144 56 C 144 90, 110 95, 100 100 C 90 105, 56 110, 56 144" stroke={`url(#sm-s1-${size})`} strokeWidth="16" strokeLinecap="round" fill="none" />
      <path d="M 100 100 C 110 105, 144 110, 144 144" stroke={`url(#sm-s2-${size})`} strokeWidth="16" strokeLinecap="round" fill="none" />
      <circle cx="100" cy="100" r="10" style={{ fill: 'var(--lp-logo-center)' }} />
      <circle cx="100" cy="100" r="7" fill={`url(#sm-core-${size})`} />
      <circle cx="100" cy="100" r="3" fill="white" />
      <circle cx="144" cy="56" r="6" fill="#ec4899" />
      <circle cx="56" cy="56" r="6" fill="#06b6d4" />
      <circle cx="56" cy="144" r="6" fill="#a855f7" />
      <circle cx="144" cy="144" r="6" fill="#22c55e" />
    </svg>
  )
}

export function Wordmark({ className = '' }: { className?: string }) {
  return (
    <span className={`font-display font-bold tracking-tight ${className}`}>
      payload<span className="text-gradient">twist</span>
    </span>
  )
}
