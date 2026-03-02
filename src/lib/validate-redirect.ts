/**
 * Validates a redirect URL to prevent open redirect attacks.
 * Only allows relative paths (starting with /) and rejects protocol-relative URLs.
 */
export function safeRedirectUrl(url: string | null | undefined, fallback = '/'): string {
  if (!url) return fallback

  // Must start with / and not // (protocol-relative) or contain backslashes
  if (url.startsWith('/') && !url.startsWith('//') && !url.includes('\\')) {
    return url
  }

  return fallback
}
