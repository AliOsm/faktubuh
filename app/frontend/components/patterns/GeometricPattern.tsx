export function GeometricPattern({
  variant = 'star',
  opacity = 0.03,
}: {
  variant?: 'star' | 'grid' | 'arabesque' | 'dots'
  opacity?: number
}) {
  const patterns = {
    star: (
      <pattern
        id="islamic-star"
        x="0"
        y="0"
        width="100"
        height="100"
        patternUnits="userSpaceOnUse"
      >
        <path
          d="M50,20 L55,40 L75,40 L60,52 L65,72 L50,60 L35,72 L40,52 L25,40 L45,40 Z"
          fill="currentColor"
          opacity={opacity}
        />
      </pattern>
    ),
    grid: (
      <pattern
        id="islamic-grid"
        x="0"
        y="0"
        width="80"
        height="80"
        patternUnits="userSpaceOnUse"
      >
        <path
          d="M0,40 L40,0 L80,40 L40,80 Z M40,20 L60,40 L40,60 L20,40 Z"
          fill="none"
          stroke="currentColor"
          strokeWidth="1"
          opacity={opacity}
        />
      </pattern>
    ),
    arabesque: (
      <pattern
        id="islamic-arabesque"
        x="0"
        y="0"
        width="120"
        height="120"
        patternUnits="userSpaceOnUse"
      >
        <path
          d="M60,10 Q80,30 60,50 Q40,30 60,10 M60,70 Q80,90 60,110 Q40,90 60,70"
          fill="none"
          stroke="currentColor"
          strokeWidth="1.5"
          opacity={opacity}
        />
        <path
          d="M10,60 Q30,80 50,60 Q30,40 10,60 M70,60 Q90,80 110,60 Q90,40 70,60"
          fill="none"
          stroke="currentColor"
          strokeWidth="1.5"
          opacity={opacity}
        />
      </pattern>
    ),
    dots: (
      <pattern
        id="islamic-dots"
        x="0"
        y="0"
        width="20"
        height="20"
        patternUnits="userSpaceOnUse"
      >
        <circle
          cx="10"
          cy="10"
          r="1"
          fill="currentColor"
          opacity={opacity}
        />
      </pattern>
    ),
  }

  return (
    <svg
      className="absolute inset-0 h-full w-full pointer-events-none"
      aria-hidden="true"
    >
      <defs>{patterns[variant]}</defs>
      <rect width="100%" height="100%" fill={`url(#islamic-${variant})`} />
    </svg>
  )
}
