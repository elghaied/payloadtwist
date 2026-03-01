'use client'

import { useState, useCallback, useMemo } from 'react'
import { useEditorStore } from '@/store/editor-store'
import { highlightBemBlock } from '@/payload-theme/generator'
import type { PayloadThemeConfig } from '@/payload-theme/types'
import { ChevronRight, Plus, X } from 'lucide-react'
import schema from '@/payload-theme/payload-theme-schema.json'

interface BemBlock {
  blockName: string
  elements: string[]
  modifiers: string[]
  category: string
}

const bemBlocks = schema.bemBlocks as Record<string, BemBlock[]>

const CATEGORY_LABELS: Record<string, string> = {
  navigation: 'Navigation',
  'list-view': 'List View',
  'edit-view': 'Edit View',
  dashboard: 'Dashboard',
  fields: 'Fields',
  overlays: 'Overlays',
  actions: 'Actions',
  table: 'Table',
  other: 'Other',
}

const CATEGORY_ORDER = [
  'navigation',
  'list-view',
  'edit-view',
  'dashboard',
  'fields',
  'overlays',
  'actions',
  'table',
  'other',
]

function generateTemplate(block: BemBlock): string {
  const lines: string[] = []
  lines.push(`.${block.blockName} {`)
  lines.push('  /* Block styles */')

  if (block.elements.length > 0) {
    lines.push('')
    lines.push('  /* Elements: */')
    for (const el of block.elements) {
      lines.push(`  /* .${el} { } */`)
    }
  }

  if (block.modifiers.length > 0) {
    lines.push('')
    lines.push('  /* Modifiers: */')
    for (const mod of block.modifiers) {
      lines.push(`  /* .${mod} { } */`)
    }
  }

  lines.push('}')
  return lines.join('\n')
}

interface BemSectionProps {
  config: PayloadThemeConfig
}

export function BemSection({ config }: BemSectionProps) {
  const { setBemOverride } = useEditorStore()
  const [expandedCategories, setExpandedCategories] = useState<Set<string>>(new Set())
  const [selectedBlock, setSelectedBlock] = useState<BemBlock | null>(null)
  const [editorValue, setEditorValue] = useState('')

  const overrides = config.bemOverrides ?? {}
  const overrideCount = Object.keys(overrides).length

  const toggleCategory = useCallback((cat: string) => {
    setExpandedCategories((prev) => {
      const next = new Set(prev)
      if (next.has(cat)) next.delete(cat)
      else next.add(cat)
      return next
    })
  }, [])

  const handleSelectBlock = useCallback(
    (block: BemBlock) => {
      setSelectedBlock(block)
      const existing = overrides[block.blockName]
      setEditorValue(existing ?? generateTemplate(block))
      highlightBemBlock(block.blockName)
    },
    [overrides],
  )

  const handleSave = useCallback(() => {
    if (!selectedBlock) return
    setBemOverride(selectedBlock.blockName, editorValue)
  }, [selectedBlock, editorValue, setBemOverride])

  const handleClose = useCallback(() => {
    setSelectedBlock(null)
    setEditorValue('')
  }, [])

  const categories = useMemo(() => {
    return CATEGORY_ORDER.filter((cat) => bemBlocks[cat]?.length > 0)
  }, [])

  // Editor view
  if (selectedBlock) {
    return (
      <div className="flex flex-col h-full -m-3">
        {/* Editor header */}
        <div className="flex items-center justify-between px-3 py-2 border-b border-[#E5E2DC]">
          <div className="flex items-center gap-2 min-w-0">
            <button
              onClick={handleClose}
              className="p-1 rounded hover:bg-[#F0EDE8] text-[#78726C] hover:text-[#1C1917] transition-colors flex-shrink-0"
              aria-label="Close editor"
            >
              <X size={14} />
            </button>
            <span
              className="text-xs text-[#1C1917] truncate"
              style={{ fontFamily: "'JetBrains Mono', monospace" }}
            >
              .{selectedBlock.blockName}
            </span>
          </div>
          <button
            onClick={handleSave}
            className="text-[10px] uppercase tracking-wider text-[#5B6CF0] hover:text-[#4A5AD9] transition-colors px-2 py-1 font-medium"
          >
            Apply
          </button>
        </div>

        {/* Info */}
        <div className="px-3 py-2 border-b border-[#E5E2DC]/50">
          <div className="flex gap-3 text-[10px] text-[#78726C]">
            {selectedBlock.elements.length > 0 && (
              <span>{selectedBlock.elements.length} elements</span>
            )}
            {selectedBlock.modifiers.length > 0 && (
              <span>{selectedBlock.modifiers.length} modifiers</span>
            )}
          </div>
        </div>

        {/* Code editor */}
        <div className="flex-1 min-h-0">
          <textarea
            value={editorValue}
            onChange={(e) => setEditorValue(e.target.value)}
            spellCheck={false}
            className="w-full h-full resize-none bg-[#F8F7F5] text-[#1C1917] text-xs p-3 focus:outline-none border-0"
            style={{
              fontFamily: "'JetBrains Mono', monospace",
              lineHeight: '1.6',
              tabSize: 2,
              minHeight: '300px',
            }}
          />
        </div>
      </div>
    )
  }

  // Block list view
  return (
    <div className="space-y-1">
      <div className="flex items-center gap-2 mb-3">
        <span className="text-[10px] uppercase tracking-widest text-[#78726C] font-medium">
          BEM Block Overrides
        </span>
        <div className="flex-1 h-px bg-[#E5E2DC]" />
        {overrideCount > 0 && (
          <span
            className="text-[10px] text-[#78726C] bg-[#F0EDE8] px-1.5 py-0.5 rounded-full tabular-nums"
            style={{ fontFamily: "'JetBrains Mono', monospace" }}
          >
            {overrideCount}
          </span>
        )}
      </div>

      <p className="text-[11px] text-[#78726C] mb-3">
        Write CSS overrides targeting specific Payload admin components by their BEM class names.
      </p>

      {categories.map((cat) => {
        const blocks = bemBlocks[cat]
        const isExpanded = expandedCategories.has(cat)

        return (
          <div key={cat}>
            <button
              onClick={() => toggleCategory(cat)}
              className="w-full flex items-center gap-1.5 py-1.5 px-1 text-left hover:bg-[#F0EDE8] rounded transition-colors"
            >
              <ChevronRight
                size={12}
                className={`text-[#78726C] transition-transform flex-shrink-0 ${isExpanded ? 'rotate-90' : ''}`}
              />
              <span className="text-[10px] uppercase tracking-wider text-[#78726C] flex-1 font-medium">
                {CATEGORY_LABELS[cat] ?? cat}
              </span>
              <span
                className="text-[10px] text-[#78726C] tabular-nums"
                style={{ fontFamily: "'JetBrains Mono', monospace" }}
              >
                {blocks.length}
              </span>
            </button>

            {isExpanded && (
              <div className="ml-4 border-l border-[#E5E2DC] pl-2 mb-1">
                {blocks.map((block) => {
                  const hasOverride = !!overrides[block.blockName]
                  return (
                    <button
                      key={block.blockName}
                      onClick={() => handleSelectBlock(block)}
                      className={`w-full flex items-center gap-2 py-1 px-1.5 text-left rounded transition-colors group ${
                        hasOverride
                          ? 'text-[#1C1917] bg-[#F0EDE8]/50'
                          : 'text-[#78726C] hover:text-[#1C1917] hover:bg-[#F0EDE8]'
                      }`}
                    >
                      <span
                        className="text-[11px] flex-1 truncate"
                        style={{ fontFamily: "'JetBrains Mono', monospace" }}
                      >
                        .{block.blockName}
                      </span>
                      {hasOverride && (
                        <span className="w-1.5 h-1.5 rounded-full bg-[#5B6CF0] flex-shrink-0" />
                      )}
                      {block.elements.length > 0 && (
                        <span
                          className="text-[9px] text-[#78726C] flex-shrink-0"
                          style={{ fontFamily: "'JetBrains Mono', monospace" }}
                        >
                          {block.elements.length}
                        </span>
                      )}
                      <Plus
                        size={10}
                        className="text-[#78726C] opacity-0 group-hover:opacity-100 transition-opacity flex-shrink-0"
                      />
                    </button>
                  )
                })}
              </div>
            )}
          </div>
        )
      })}
    </div>
  )
}
