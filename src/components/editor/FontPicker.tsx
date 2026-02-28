'use client'

import { useState, useRef, useEffect, useCallback } from 'react'
import { ChevronDown } from 'lucide-react'

interface FontOption {
  label: string
  value: string
  type: 'system' | 'google'
}

const FONT_OPTIONS: { group: string; fonts: FontOption[] }[] = [
  {
    group: 'System',
    fonts: [
      {
        label: 'System Default',
        value: "-apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif",
        type: 'system',
      },
      { label: 'Georgia', value: 'Georgia, serif', type: 'system' },
      { label: 'SF Mono', value: "'SF Mono', Menlo, monospace", type: 'system' },
    ],
  },
  {
    group: 'Sans Serif',
    fonts: [
      { label: 'Inter', value: "'Inter', sans-serif", type: 'google' },
      { label: 'DM Sans', value: "'DM Sans', sans-serif", type: 'google' },
      { label: 'Outfit', value: "'Outfit', sans-serif", type: 'google' },
      { label: 'Geist', value: "'Geist', sans-serif", type: 'google' },
    ],
  },
  {
    group: 'Serif',
    fonts: [
      { label: 'Playfair Display', value: "'Playfair Display', serif", type: 'google' },
      { label: 'Lora', value: "'Lora', serif", type: 'google' },
    ],
  },
  {
    group: 'Monospace',
    fonts: [
      { label: 'JetBrains Mono', value: "'JetBrains Mono', monospace", type: 'google' },
      { label: 'Fira Code', value: "'Fira Code', monospace", type: 'google' },
      { label: 'Source Code Pro', value: "'Source Code Pro', monospace", type: 'google' },
    ],
  },
]

// Track which Google Fonts have been loaded into the iframe
const loadedFontsInIframe = new Set<string>()

function getFontFamily(value: string): string {
  // Extract the first font name from the stack for display
  const first = value.split(',')[0].trim().replace(/'/g, '')
  return first
}

function getGoogleFontUrl(fontLabel: string): string {
  const encoded = fontLabel.replace(/\s+/g, '+')
  return `https://fonts.googleapis.com/css2?family=${encoded}:wght@400;500;600;700&display=swap`
}

function injectFontIntoIframe(fontLabel: string): void {
  if (loadedFontsInIframe.has(fontLabel)) return

  const iframe = document.querySelector('iframe#payload-preview') as HTMLIFrameElement | null
  const iframeDoc = iframe?.contentDocument ?? iframe?.contentWindow?.document
  if (!iframeDoc) return

  const linkId = `tweakpayload-font-${fontLabel.replace(/\s+/g, '-').toLowerCase()}`
  if (iframeDoc.getElementById(linkId)) {
    loadedFontsInIframe.add(fontLabel)
    return
  }

  const link = iframeDoc.createElement('link')
  link.id = linkId
  link.rel = 'stylesheet'
  link.href = getGoogleFontUrl(fontLabel)
  iframeDoc.head.appendChild(link)
  loadedFontsInIframe.add(fontLabel)
}

interface FontPickerProps {
  value: string
  onChange: (value: string) => void
  varName: string
}

export function FontPicker({ value, onChange, varName }: FontPickerProps) {
  const [isOpen, setIsOpen] = useState(false)
  const dropdownRef = useRef<HTMLDivElement>(null)

  const currentLabel = (() => {
    for (const group of FONT_OPTIONS) {
      const found = group.fonts.find((f) => f.value === value)
      if (found) return found.label
    }
    return getFontFamily(value) || 'Custom'
  })()

  // Close on click outside
  useEffect(() => {
    if (!isOpen) return
    const handler = (e: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target as Node)) {
        setIsOpen(false)
      }
    }
    document.addEventListener('mousedown', handler)
    return () => document.removeEventListener('mousedown', handler)
  }, [isOpen])

  const handleSelect = useCallback(
    (font: FontOption) => {
      if (font.type === 'google') {
        injectFontIntoIframe(font.label)
      }
      onChange(font.value)
      setIsOpen(false)
    },
    [onChange],
  )

  return (
    <div className="space-y-2">
      <label
        className="text-xs text-zinc-400 block"
        style={{ fontFamily: "'JetBrains Mono', monospace" }}
      >
        {varName}
      </label>

      <div ref={dropdownRef} className="relative">
        <button
          onClick={() => setIsOpen(!isOpen)}
          className="w-full flex items-center justify-between gap-2 px-2.5 py-1.5 text-xs bg-zinc-800 border border-zinc-700 rounded hover:border-zinc-500 transition-colors text-left"
        >
          <span className="text-zinc-200 truncate" style={{ fontFamily: value || undefined }}>
            {currentLabel}
          </span>
          <ChevronDown
            size={12}
            className={`text-zinc-500 flex-shrink-0 transition-transform ${isOpen ? 'rotate-180' : ''}`}
          />
        </button>

        {isOpen && (
          <div className="absolute z-50 top-full left-0 right-0 mt-1 bg-zinc-900 border border-zinc-700 rounded shadow-xl max-h-64 overflow-y-auto">
            {FONT_OPTIONS.map((group) => (
              <div key={group.group}>
                <div className="px-2.5 py-1 text-[10px] uppercase tracking-wider text-zinc-500 bg-zinc-900 sticky top-0">
                  {group.group}
                </div>
                {group.fonts.map((font) => (
                  <button
                    key={font.value}
                    onClick={() => handleSelect(font)}
                    className={`w-full text-left px-2.5 py-1.5 text-xs hover:bg-zinc-800 transition-colors ${
                      font.value === value ? 'text-blue-400 bg-zinc-800/50' : 'text-zinc-300'
                    }`}
                    style={{ fontFamily: font.value }}
                  >
                    {font.label}
                  </button>
                ))}
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Font preview */}
      <div className="rounded border border-zinc-800 bg-zinc-900/50 px-3 py-2">
        <p className="text-sm text-zinc-300" style={{ fontFamily: value || undefined }}>
          The quick brown fox jumps over the lazy dog
        </p>
        <p className="text-[10px] text-zinc-500 mt-1" style={{ fontFamily: value || undefined }}>
          ABCDEFGHIJKLMNOPQRSTUVWXYZ abcdefghijklmnopqrstuvwxyz 0123456789
        </p>
      </div>
    </div>
  )
}
