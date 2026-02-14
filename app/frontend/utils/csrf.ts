/**
 * Gets the CSRF token from cookies or meta tag
 * @returns The CSRF token
 */
export function getCsrfToken(): string {
  // First try to get from cookie (for API requests)
  const cookieValue = document.cookie
    .split('; ')
    .find(row => row.startsWith('XSRF-TOKEN='))
    ?.split('=')[1]

  // Fall back to meta tag
  const metaToken = (document.querySelector('meta[name="csrf-token"]') as HTMLMetaElement)?.content

  return cookieValue || metaToken || ''
}
