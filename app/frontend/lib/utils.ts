import { clsx, type ClassValue } from "clsx"
import { twMerge } from "tailwind-merge"

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

export function csrfToken(): string {
  const metaTag = document.querySelector('meta[name="csrf-token"]');

  return metaTag?.getAttribute('content') || '';
}
