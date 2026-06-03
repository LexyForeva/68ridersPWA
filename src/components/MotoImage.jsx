import { useId } from 'react'

export default function MotoImage({ type = 'ride', label = '' }) {
  const gradientId = `road-${useId().replace(/:/g, '')}`

  return (
    <div className={`moto-img ${type}`} aria-label={label || '68 Riders motosiklet görseli'}>
      <svg viewBox="0 0 420 260" role="img">
        <defs>
          <linearGradient id={gradientId} x1="0" x2="1">
            <stop offset="0" stopColor="#09090b" />
            <stop offset="1" stopColor="#3f1115" />
          </linearGradient>
        </defs>
        <rect width="420" height="260" rx="24" fill={`url(#${gradientId})`} />
        <path
          d="M0 210 C95 170 165 165 250 190 C315 210 365 205 420 178 L420 260 L0 260 Z"
          fill="#17171c"
          opacity=".9"
        />
        <circle cx="145" cy="190" r="38" fill="#050506" stroke="#ef232b" strokeWidth="7" />
        <circle cx="300" cy="190" r="38" fill="#050506" stroke="#ef232b" strokeWidth="7" />
        <path
          d="M145 188 L198 132 L238 188 L300 188 M195 132 L255 132 L288 166 M210 115 L238 188"
          fill="none"
          stroke="#e5e7eb"
          strokeWidth="10"
          strokeLinecap="round"
          strokeLinejoin="round"
        />
        <path
          d="M250 110 C276 92 308 105 318 130"
          fill="none"
          stroke="#ef232b"
          strokeWidth="12"
          strokeLinecap="round"
        />
        <circle cx="230" cy="88" r="19" fill="#d4d4d8" />
        <path d="M215 108 C235 105 252 116 265 143" stroke="#d4d4d8" strokeWidth="14" strokeLinecap="round" />
        <path d="M50 72 C96 45 140 38 189 54" stroke="#fff" strokeWidth="3" opacity=".25" />
        <path d="M310 58 C350 48 382 53 415 75" stroke="#ef232b" strokeWidth="3" opacity=".35" />
      </svg>
      {label && <span>{label}</span>}
    </div>
  )
}
