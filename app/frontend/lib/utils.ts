import { type ClassValue, clsx } from 'clsx'
import { twMerge } from 'tailwind-merge'

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

/**
 * Parse a date string safely. Rails sends Date columns as "YYYY-MM-DD" (no
 * timezone). JS `new Date("YYYY-MM-DD")` treats that as UTC midnight, which
 * shifts the date for users in negative UTC offsets (e.g. Americas). This
 * helper treats bare date strings as local dates.
 */
export function parseDate(dateStr: string): Date {
  if (/^\d{4}-\d{2}-\d{2}$/.test(dateStr)) {
    const [y, m, d] = dateStr.split('-').map((n) => Number(n))
    return new Date(y, m - 1, d)
  }

  return new Date(dateStr)
}

export function formatDate(dateStr: string): string {
  return parseDate(dateStr).toLocaleDateString(document.documentElement.lang, {
    year: 'numeric',
    month: 'short',
    day: 'numeric'
  })
}

export function isOverdue(dueDate: string): boolean {
  const today = new Date()
  today.setHours(0, 0, 0, 0)
  const due = parseDate(dueDate)
  due.setHours(0, 0, 0, 0)
  return due < today
}
