import { cn } from '@/lib/utils'

interface SpinnerProps {
  className?: string
  size?: 'sm' | 'md' | 'lg'
}

const SIZES = {
  sm: 'w-6 h-6',
  md: 'w-12 h-12',
  lg: 'w-16 h-16'
}

export function Spinner({ className, size = 'md' }: SpinnerProps) {
  return (
    <div className={cn('relative', SIZES[size], className)} role="status" aria-label="Loading">
      <svg className="animate-spin" viewBox="0 0 50 50">
        {/* Outer ring */}
        <circle
          cx="25"
          cy="25"
          r="20"
          fill="none"
          stroke="currentColor"
          strokeWidth="3"
          strokeDasharray="80 40"
          strokeLinecap="round"
          className="text-primary"
        />

        {/* Inner star (Islamic geometric element) */}
        <path
          d="M25,15 L27,20 L32,20 L28,23 L30,28 L25,25 L20,28 L22,23 L18,20 L23,20 Z"
          fill="currentColor"
          className="text-secondary animate-pulse"
        />
      </svg>
      <span className="sr-only">Loading...</span>
    </div>
  )
}
