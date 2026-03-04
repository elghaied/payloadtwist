'use client'

import { useState, useRef, useEffect, useCallback, useMemo } from 'react'
import { ChevronDown, Search, X } from 'lucide-react'
import {
  GOOGLE_FONTS_CATALOG,
  SYSTEM_FONTS,
  type FontCategory,
  type GoogleFont,
} from '@/payload-theme/google-fonts-catalog'

// ─── Types ──────────────────────────────────────────────────────────────────

type CategoryFilter = FontCategory | 'all'

interface CategoryTab {
  value: CategoryFilter
  label: string
}

const CATEGORY_TABS: CategoryTab[] = [
  { value: 'all', label: 'All' },
  { value: 'sans-serif', label: 'Sans' },
  { value: 'serif', label: 'Serif' },
  { value: 'display', label: 'Display' },
  { value: 'handwriting', label: 'Script' },
  { value: 'monospace', label: 'Mono' },
]

const CATEGORY_LABELS: Record<FontCategory, string> = {
  'sans-serif': 'Sans',
  serif: 'Serif',
  display: 'Display',
  handwriting: 'Script',
  monospace: 'Mono',
}

const MAX_RENDERED_ITEMS = 80

// ─── Font loading ───────────────────────────────────────────────────────────

const loadedFontsInIframe = new Set<string>()
const loadedFontsInParent = new Set<string>()

function getGoogleFontUrl(family: string): string {
  const encoded = family.replace(/\s+/g, '+')
  return `https://fonts.googleapis.com/css2?family=${encoded}:wght@400;500;600;700&display=swap`
}

function injectFontIntoIframe(family: string): void {
  if (loadedFontsInIframe.has(family)) return

  const iframe = document.querySelector('iframe#payload-preview') as HTMLIFrameElement | null
  const iframeDoc = iframe?.contentDocument ?? iframe?.contentWindow?.document
  if (!iframeDoc) return

  const linkId = `tweakpayload-font-${family.replace(/\s+/g, '-').toLowerCase()}`
  if (iframeDoc.getElementById(linkId)) {
    loadedFontsInIframe.add(family)
    return
  }

  const link = iframeDoc.createElement('link')
  link.id = linkId
  link.rel = 'stylesheet'
  link.href = getGoogleFontUrl(family)
  iframeDoc.head.appendChild(link)
  loadedFontsInIframe.add(family)
}

function loadFontInParent(family: string): void {
  if (loadedFontsInParent.has(family)) return

  const linkId = `fontpicker-preview-${family.replace(/\s+/g, '-').toLowerCase()}`
  if (document.getElementById(linkId)) {
    loadedFontsInParent.add(family)
    return
  }

  const link = document.createElement('link')
  link.id = linkId
  link.rel = 'stylesheet'
  link.href = getGoogleFontUrl(family)
  document.head.appendChild(link)
  loadedFontsInParent.add(family)
}

// ─── Helper ─────────────────────────────────────────────────────────────────

/** Generate a CSS font-family value from a family name and category fallback. */
export function fontValueFromFamily(family: string, category: FontCategory): string {
  const fallback =
    category === 'sans-serif'
      ? 'sans-serif'
      : category === 'serif'
        ? 'serif'
        : category === 'monospace'
          ? 'monospace'
          : category === 'display'
            ? 'sans-serif'
            : 'cursive'
  return `'${family}', ${fallback}`
}

/** Extract the primary family name from a CSS font-family value. */
function getFamilyFromValue(value: string): string {
  const first = value.split(',')[0].trim().replace(/'/g, '')
  return first
}

// ─── Component ──────────────────────────────────────────────────────────────

interface FontPickerProps {
  value: string
  onChange: (value: string) => void
  label: string
  defaultCategory?: CategoryFilter
}

export function FontPicker({
  value,
  onChange,
  label,
  defaultCategory = 'all',
}: FontPickerProps) {
  const [isOpen, setIsOpen] = useState(false)
  const [search, setSearch] = useState('')
  const [category, setCategory] = useState<CategoryFilter>(defaultCategory)
  const dropdownRef = useRef<HTMLDivElement>(null)
  const searchInputRef = useRef<HTMLInputElement>(null)

  // Derive the display label from the current value
  const currentLabel = useMemo(() => {
    // Check system fonts first
    const systemMatch = SYSTEM_FONTS.find((f) => f.value === value)
    if (systemMatch) return systemMatch.label

    // Check catalog
    const family = getFamilyFromValue(value)
    const catalogMatch = GOOGLE_FONTS_CATALOG.find((f) => f.family === family)
    if (catalogMatch) return catalogMatch.family

    return family || 'Custom'
  }, [value])

  // Load current font into parent for preview
  useEffect(() => {
    const family = getFamilyFromValue(value)
    const isSystemFont = SYSTEM_FONTS.some((f) => f.value === value)
    if (family && !isSystemFont) {
      loadFontInParent(family)
    }
  }, [value])

  // Filter the catalog
  const filteredFonts = useMemo(() => {
    let fonts = GOOGLE_FONTS_CATALOG

    if (category !== 'all') {
      fonts = fonts.filter((f) => f.category === category)
    }

    if (search.trim()) {
      const q = search.trim().toLowerCase()
      fonts = fonts.filter((f) => f.family.toLowerCase().includes(q))
    }

    return fonts
  }, [category, search])

  const isTruncated = filteredFonts.length > MAX_RENDERED_ITEMS
  const renderedFonts = isTruncated ? filteredFonts.slice(0, MAX_RENDERED_ITEMS) : filteredFonts

  // Show system fonts when no search and category is "all"
  const showSystemFonts = !search.trim() && category === 'all'

  // Close on outside click
  useEffect(() => {
    if (!isOpen) return
    const handler = (e: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target as Node)) {
        setIsOpen(false)
        setSearch('')
        setCategory(defaultCategory)
      }
    }
    document.addEventListener('mousedown', handler)
    return () => document.removeEventListener('mousedown', handler)
  }, [isOpen, defaultCategory])

  // Autofocus search input on open
  useEffect(() => {
    if (isOpen && searchInputRef.current) {
      searchInputRef.current.focus()
    }
  }, [isOpen])

  const handleSelectGoogle = useCallback(
    (font: GoogleFont) => {
      injectFontIntoIframe(font.family)
      loadFontInParent(font.family)
      onChange(fontValueFromFamily(font.family, font.category))
      setIsOpen(false)
      setSearch('')
      setCategory(defaultCategory)
    },
    [onChange, defaultCategory],
  )

  const handleSelectSystem = useCallback(
    (fontValue: string) => {
      onChange(fontValue)
      setIsOpen(false)
      setSearch('')
      setCategory(defaultCategory)
    },
    [onChange, defaultCategory],
  )

  const mono = "'JetBrains Mono', monospace"

  return (
    <div className="space-y-2">
      <label
        className="text-[11px] text-[var(--pt-text-label)] block"
        style={{ fontFamily: mono }}
      >
        {label}
      </label>

      <div ref={dropdownRef} className="relative">
        {/* Trigger button */}
        <button
          onClick={() => setIsOpen(!isOpen)}
          className="w-full flex items-center justify-between gap-2 px-2.5 py-1.5 text-xs bg-[var(--pt-bg)] border border-[var(--pt-border)] rounded hover:border-[var(--pt-border-strong)] transition-colors text-left focus-visible:ring-1 focus-visible:ring-[var(--pt-accent)] focus-visible:outline-none"
        >
          <span
            className="text-[var(--pt-text)] truncate"
            style={{ fontFamily: value || undefined }}
          >
            {currentLabel}
          </span>
          <ChevronDown
            size={12}
            className={`text-[var(--pt-text-muted)] flex-shrink-0 transition-transform ${isOpen ? 'rotate-180' : ''}`}
          />
        </button>

        {/* Dropdown */}
        {isOpen && (
          <div className="absolute z-50 top-full left-0 right-0 mt-1 bg-[var(--pt-surface)] border border-[var(--pt-border)] rounded shadow-lg overflow-hidden">
            {/* Search input */}
            <div className="relative border-b border-[var(--pt-border)]">
              <Search
                size={12}
                className="absolute left-2.5 top-1/2 -translate-y-1/2 text-[var(--pt-text-muted)]"
              />
              <input
                ref={searchInputRef}
                type="text"
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                placeholder="Search fonts..."
                className="w-full text-xs bg-transparent pl-7 pr-7 py-2 text-[var(--pt-text)] placeholder:text-[var(--pt-text-muted)] focus:outline-none"
              />
              {search && (
                <button
                  onClick={() => setSearch('')}
                  className="absolute right-2 top-1/2 -translate-y-1/2 text-[var(--pt-text-muted)] hover:text-[var(--pt-text)] transition-colors"
                >
                  <X size={12} />
                </button>
              )}
            </div>

            {/* Category filter tabs */}
            <div className="flex border-b border-[var(--pt-border)] bg-[var(--pt-bg)]">
              {CATEGORY_TABS.map((tab) => (
                <button
                  key={tab.value}
                  onClick={() => setCategory(tab.value)}
                  className={`flex-1 text-[10px] py-1.5 transition-colors ${
                    category === tab.value
                      ? 'text-[var(--pt-accent)] border-b border-[var(--pt-accent)] font-medium'
                      : 'text-[var(--pt-text-muted)] hover:text-[var(--pt-text)]'
                  }`}
                >
                  {tab.label}
                </button>
              ))}
            </div>

            {/* Scrollable font list */}
            <div className="max-h-64 overflow-y-auto panel-scroll">
              {/* System fonts section */}
              {showSystemFonts && (
                <>
                  <div className="px-2.5 py-1 text-[10px] uppercase tracking-wider text-[var(--pt-text-muted)] bg-[var(--pt-bg)] sticky top-0 font-medium z-10">
                    System
                  </div>
                  {SYSTEM_FONTS.map((font) => (
                    <button
                      key={font.value}
                      onClick={() => handleSelectSystem(font.value)}
                      className={`w-full text-left px-2.5 py-1.5 text-xs flex items-center justify-between hover:bg-[var(--pt-surface-hover)] transition-colors ${
                        font.value === value
                          ? 'text-[var(--pt-accent)] bg-[var(--pt-surface-hover)]/50'
                          : 'text-[var(--pt-text)]'
                      }`}
                      style={{ fontFamily: font.value }}
                    >
                      <span>{font.label}</span>
                      <span className="text-[9px] text-[var(--pt-text-muted)] ml-2">System</span>
                    </button>
                  ))}
                </>
              )}

              {/* Google fonts section */}
              {showSystemFonts && renderedFonts.length > 0 && (
                <div className="px-2.5 py-1 text-[10px] uppercase tracking-wider text-[var(--pt-text-muted)] bg-[var(--pt-bg)] sticky top-0 font-medium z-10">
                  Google Fonts
                </div>
              )}

              {renderedFonts.map((font) => {
                const fontValue = fontValueFromFamily(font.family, font.category)
                return (
                  <button
                    key={font.family}
                    onClick={() => handleSelectGoogle(font)}
                    className={`w-full text-left px-2.5 py-1.5 text-xs flex items-center justify-between hover:bg-[var(--pt-surface-hover)] transition-colors ${
                      fontValue === value
                        ? 'text-[var(--pt-accent)] bg-[var(--pt-surface-hover)]/50'
                        : 'text-[var(--pt-text)]'
                    }`}
                  >
                    <span>{font.family}</span>
                    <span className="text-[9px] text-[var(--pt-text-muted)] ml-2">
                      {CATEGORY_LABELS[font.category]}
                    </span>
                  </button>
                )
              })}

              {renderedFonts.length === 0 && !showSystemFonts && (
                <div className="px-2.5 py-4 text-xs text-[var(--pt-text-muted)] text-center">
                  No fonts found
                </div>
              )}

              {isTruncated && (
                <div className="px-2.5 py-2 text-[10px] text-[var(--pt-text-muted)] text-center border-t border-[var(--pt-border)]">
                  Showing first {MAX_RENDERED_ITEMS} results — refine your search
                </div>
              )}
            </div>
          </div>
        )}
      </div>

      {/* Preview panel */}
      <div className="rounded border border-[var(--pt-border)] bg-[var(--pt-bg)] px-3 py-2">
        <p
          className="text-sm text-[var(--pt-text)]"
          style={{ fontFamily: value || undefined }}
        >
          The quick brown fox jumps over the lazy dog
        </p>
        <p
          className="text-[10px] text-[var(--pt-text-muted)] mt-1"
          style={{ fontFamily: value || undefined }}
        >
          ABCDEFGHIJKLMNOPQRSTUVWXYZ abcdefghijklmnopqrstuvwxyz 0123456789
        </p>
      </div>
    </div>
  )
}
