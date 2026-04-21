export function DaisySVG({ size = 72 }: { size?: number }) {
  return (
    <svg width={size} height={size} viewBox="0 0 72 72" fill="none">
      {Array.from({ length: 8 }).map((_, i) => (
        <g key={i} transform={`rotate(${i * 45} 36 36)`}>
          <ellipse
            cx="36"
            cy="15"
            rx="7"
            ry="13"
            fill="white"
            fillOpacity="0.92"
            style={{ filter: 'drop-shadow(0 1px 2px rgba(0,0,0,0.08))' }}
          />
        </g>
      ))}
      <circle cx="36" cy="36" r="13" fill="#FCD34D" />
      <circle cx="36" cy="36" r="10" fill="#FBBF24" />
      <circle cx="36" cy="36" r="13" fill="url(#daisy-glow)" />
      <defs>
        <radialGradient id="daisy-glow" cx="40%" cy="35%">
          <stop offset="0%" stopColor="white" stopOpacity="0.4" />
          <stop offset="100%" stopColor="white" stopOpacity="0" />
        </radialGradient>
      </defs>
    </svg>
  )
}
