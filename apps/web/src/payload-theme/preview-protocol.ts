// Messages between the editor (parent window) and a preview admin in an iframe — either the
// embedded demo admin (/preview) or a user's own Payload running payloadtwist's bridge script.
// Same protocol for both, so the editor has one code path.

export const STYLE_ID = 'payloadtwist-theme'

export type ToPreview =
  | { source: 'payloadtwist'; type: 'css'; css: string }
  | { source: 'payloadtwist'; type: 'theme'; theme: 'light' | 'dark' }
  | { source: 'payloadtwist'; type: 'contrast'; enabled: boolean }
  | { source: 'payloadtwist'; type: 'navigate'; path: string }
  | { source: 'payloadtwist'; type: 'highlight'; selectors: string[] }

/** A message to the preview without the `source` tag (added by the sender). */
export type ToPreviewBody = {
  [K in ToPreview['type']]: Omit<Extract<ToPreview, { type: K }>, 'source'>
}[ToPreview['type']]

export type FromPreview =
  | { source: 'payloadtwist-preview'; type: 'ready'; version: 1 }
  | { source: 'payloadtwist-preview'; type: 'route'; path: string }

export function isFromPreview(data: unknown): data is FromPreview {
  return !!data && typeof data === 'object' && (data as { source?: unknown }).source === 'payloadtwist-preview'
}

export function isToPreview(data: unknown): data is ToPreview {
  return !!data && typeof data === 'object' && (data as { source?: unknown }).source === 'payloadtwist'
}

export const HIGHLIGHT_ID = 'payloadtwist-highlight'

/** Simple class selectors only (no attribute/combinator tricks), capped */
export function safeSelectors(selectors: unknown): string[] {
  if (!Array.isArray(selectors)) return []
  return selectors.filter((s): s is string => typeof s === 'string' && /^[.a-zA-Z0-9_ :()-]{1,120}$/.test(s)).slice(0, 80)
}

/** Outlines the given components in the preview (empty list clears it). */
export function applyHighlight(doc: Document, selectors: string[]): void {
  let el = doc.getElementById(HIGHLIGHT_ID) as HTMLStyleElement | null
  if (!el) {
    el = doc.createElement('style')
    el.id = HIGHLIGHT_ID
    doc.head.appendChild(el)
  }
  const list = safeSelectors(selectors)
  el.textContent = list.length
    ? `${list.join(',\n')} { outline: 2px solid #d946ef !important; outline-offset: 2px !important; transition: outline-color .15s; }`
    : ''
}

/** Writes theme CSS into a document — used by the bridge inside the preview. */
export function applyCss(doc: Document, css: string): void {
  let el = doc.getElementById(STYLE_ID) as HTMLStyleElement | null
  if (!el) {
    el = doc.createElement('style')
    el.id = STYLE_ID
  }
  el.textContent = css
  // Keep it last in <head> so it follows any project CSS loaded after the bridge mounted
  if (el.parentNode !== doc.head || doc.head.lastElementChild !== el) doc.head.appendChild(el)
}
