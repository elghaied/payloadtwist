'use client'

import { useEffect, useMemo, useState } from 'react'
import Link from 'next/link'
import { Globe, Link2, Lock, Save, Star } from 'lucide-react'
import { getMyPresets, getPublicPresets } from '@/lib/actions/presets'
import { PRESET_GROUPS, presetTheme, THEME_PRESETS } from '@/payload-theme/presets'
import { resolveAll } from '@/payload-theme/schema'
import { parseTheme, type ThemeConfig } from '@/payload-theme/theme'
import { Group, SectionIntro } from '../token-ui'

function MiniAdmin({ theme, mode }: { theme: ThemeConfig; mode: 'light' | 'dark' }) {
  const r = resolveAll(mode, theme)
  const c = theme.components
  const pick = (id: string, prop: 'bg' | 'text', fallback: string) =>
    (mode === 'dark' ? c[id]?.dark?.[prop] : undefined) ?? (mode === 'light' || !c[id]?.dark ? c[id]?.light?.[prop] : undefined) ?? fallback
  const sidebar = mode === 'dark' && c.sidebar?.light?.bg && !c.sidebar?.dark?.bg ? r['--color-bg'] : pick('sidebar', 'bg', r['--color-bg'])
  const active = pick('sidebarLinkActive', 'bg', r['--color-bg-selected'])
  const button = pick('buttonPrimary', 'bg', r['--color-bg-brand'])
  const radius = theme.components.buttonPrimary?.light?.radius ?? r['--button-radius'] ?? '4px'
  return (
    <div className="flex h-14 overflow-hidden" style={{ background: r['--color-bg'] }}>
      <div className="w-[30%] p-1 space-y-1 border-r" style={{ background: sidebar, borderColor: r['--color-border'] }}>
        <div className="h-1.5 w-3/4 rounded-sm" style={{ background: active }} />
        <div className="h-1 w-1/2 rounded-sm opacity-50" style={{ background: pick('sidebarLink', 'text', r['--color-text']) }} />
        <div className="h-1 w-2/3 rounded-sm opacity-50" style={{ background: pick('sidebarLink', 'text', r['--color-text']) }} />
      </div>
      <div className="flex-1 p-1.5 space-y-1">
        <div className="h-1.5 w-1/2 rounded-sm" style={{ background: r['--color-text'] }} />
        <div className="flex gap-1">
          <div className="h-5 flex-1 rounded-[3px] border" style={{ background: r['--color-bg-elevated'], borderColor: r['--color-border'], boxShadow: r['--elevation-300-tooltip'] }} />
          <div className="h-5 flex-1 rounded-[3px]" style={{ background: r['--color-bg-secondary'] }} />
        </div>
        <div className="flex items-center gap-1">
          <div className="h-2 w-6" style={{ background: button, borderRadius: radius }} />
          <div className="h-1.5 w-3 rounded-full" style={{ background: r['--color-bg-success'] }} />
          <div className="h-1.5 w-3 rounded-full" style={{ background: r['--color-bg-warning'] }} />
        </div>
      </div>
    </div>
  )
}

function PresetCard({ name, sub, theme, onClick, badge }: { name: string; sub?: string; theme: ThemeConfig | null; onClick: () => void; badge?: React.ReactNode }) {
  return (
    <button
      onClick={onClick}
      title={sub}
      aria-label={name}
      className="group text-left rounded-lg border border-[var(--pt-border)] overflow-hidden hover:border-[var(--pt-accent)] transition-colors"
    >
      {theme ? (
        <div className="grid grid-cols-2" aria-hidden>
          <MiniAdmin theme={theme} mode="light" />
          <MiniAdmin theme={theme} mode="dark" />
        </div>
      ) : (
        <div className="h-14 flex items-center justify-center text-xs text-[var(--pt-text-faint)] bg-[var(--pt-surface-hover)]">Older format</div>
      )}
      <div className="px-2 py-1.5 bg-[var(--pt-bg)]">
        <p className="flex items-center gap-1 text-[13px] font-medium text-[var(--pt-text)]">
          <span className="truncate">{name}</span>
          {badge}
        </p>
        {sub && <p className="text-xs text-[var(--pt-text-faint)] truncate">{sub}</p>}
      </div>
    </button>
  )
}

function BuiltinGrid({ onLoad }: { onLoad: (theme: ThemeConfig) => void }) {
  const previews = useMemo(() => THEME_PRESETS.map((p) => ({ preset: p, theme: presetTheme(p) })), [])
  return (
    <div className="space-y-3">
      {PRESET_GROUPS.map((g) => (
        <div key={g.id}>
          <p className="text-xs text-[var(--pt-text-faint)] mb-1">{g.label}</p>
          <div className="grid grid-cols-2 gap-2">
            {previews
              .filter((p) => p.preset.group === g.id)
              .map(({ preset, theme }) => (
                <PresetCard key={preset.id} name={preset.name} sub={preset.description} theme={theme} onClick={() => onLoad(theme)} />
              ))}
          </div>
        </div>
      ))}
    </div>
  )
}

interface SavedPreset {
  id: string
  name: string
  description: string | null
  isPublic: boolean
  averageRating: number
  ratingCount: number
  theme: ThemeConfig | null
}

// Presets from the DB are untrusted: previews only render validated themes
const toSaved = (rows: Awaited<ReturnType<typeof getPublicPresets>>): SavedPreset[] =>
  rows.map((r) => {
    let theme: ThemeConfig | null = null
    try {
      theme = parseTheme(r.themeData)
    } catch {}
    return { id: r.id, name: r.name, description: r.description, isPublic: r.isPublic, averageRating: r.averageRating, ratingCount: r.ratingCount, theme }
  })

/** Loads a list once per refreshKey; null while loading. */
function usePresets(load: (() => ReturnType<typeof getPublicPresets>) | null, refreshKey: number) {
  const [state, setState] = useState<{ key: string; list: SavedPreset[] } | null>(null)
  const key = `${!!load}:${refreshKey}`
  useEffect(() => {
    if (!load) return
    let live = true
    load()
      .then((rows) => live && setState({ key, list: toSaved(rows) }))
      .catch(() => live && setState({ key, list: [] }))
    return () => {
      live = false
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps -- `key` captures what matters
  }, [key])
  return state?.key === key ? state.list : null
}

const loadMine = () => getMyPresets()
const loadCommunity = () => getPublicPresets({ limit: 12 })

export interface OwnPreset {
  id: string
  name: string
  isPublic: boolean
}

export function PresetsSection({
  signedIn,
  ownPreset,
  refreshKey,
  onSave,
  onOpen,
  onLoadBuiltin,
}: {
  signedIn: boolean
  ownPreset: OwnPreset | null
  refreshKey: number
  onSave: () => void
  onOpen: (id: string) => void
  onLoadBuiltin: (theme: ThemeConfig) => void
}) {
  const mine = usePresets(signedIn ? loadMine : null, refreshKey)
  const community = usePresets(loadCommunity, refreshKey)
  const [copied, setCopied] = useState(false)
  const btn = 'inline-flex items-center gap-1.5 text-[13px] rounded-md px-2.5 py-1.5 border border-[var(--pt-border)] text-[var(--pt-text)] hover:border-[var(--pt-accent)]'

  const copyLink = (id: string) => {
    navigator.clipboard?.writeText(`${window.location.origin}/presets/${id}`).then(() => {
      setCopied(true)
      setTimeout(() => setCopied(false), 1500)
    })
  }

  return (
    <div className="space-y-6">
      <SectionIntro scope="whole">
        Complete themes to start from — built-in ones, the ones you saved, and ones the community shared. Loading one
        replaces your current theme; undo brings it back.
      </SectionIntro>

      <Group title="Your theme">
        {ownPreset ? (
          <div className="space-y-2">
            <p className="flex items-center gap-1.5 text-[13px] text-[var(--pt-text)]">
              {ownPreset.isPublic ? <Globe size={13} /> : <Lock size={13} />}
              Editing <strong className="font-semibold">{ownPreset.name}</strong>
              <span className="text-[var(--pt-text-faint)]">· {ownPreset.isPublic ? 'shared publicly' : 'private'}</span>
            </p>
            <div className="flex flex-wrap gap-1.5">
              <button onClick={onSave} className={btn}>
                <Save size={13} /> Save changes
              </button>
              {ownPreset.isPublic ? (
                <button onClick={() => copyLink(ownPreset.id)} className={btn}>
                  <Link2 size={13} /> {copied ? 'Link copied' : 'Copy share link'}
                </button>
              ) : (
                <button onClick={onSave} className={btn} title="Turn on “Public” in the save dialog">
                  <Globe size={13} /> Share…
                </button>
              )}
            </div>
          </div>
        ) : signedIn ? (
          <div className="flex items-center gap-2">
            <p className="flex-1 text-[13px] text-[var(--pt-text-muted)]">Not saved yet. Save it to come back later or share it.</p>
            <button onClick={onSave} className={btn}>
              <Save size={13} /> Save as preset
            </button>
          </div>
        ) : (
          <p className="text-[13px] text-[var(--pt-text-muted)]">
            <Link href="/login?callbackUrl=/editor" className="text-[var(--pt-accent)] underline">
              Sign in
            </Link>{' '}
            to save themes as presets and share them with a link.
          </p>
        )}
      </Group>

      {signedIn && (
        <Group title="My presets">
          {mine === null ? (
            <p className="text-[13px] text-[var(--pt-text-faint)]">Loading…</p>
          ) : mine.length === 0 ? (
            <p className="text-[13px] text-[var(--pt-text-faint)]">Nothing saved yet.</p>
          ) : (
            <div className="grid grid-cols-2 gap-2">
              {mine.map((p) => (
                <PresetCard
                  key={p.id}
                  name={p.name}
                  sub={p.description || (p.isPublic ? 'Public' : 'Private')}
                  theme={p.theme}
                  onClick={() => onOpen(p.id)}
                  badge={p.isPublic ? <Globe size={11} className="shrink-0 text-[var(--pt-text-faint)]" aria-label="Public" /> : null}
                />
              ))}
            </div>
          )}
          <Link href="/dashboard" className="inline-block text-[13px] text-[var(--pt-accent)] hover:underline">
            Rename, delete or manage sharing in your dashboard →
          </Link>
        </Group>
      )}

      <Group title="Built-in themes">
        <BuiltinGrid onLoad={onLoadBuiltin} />
      </Group>

      <Group title="Community" hint="Themes other people shared. Their custom CSS is never loaded automatically.">
        {community === null ? (
          <p className="text-[13px] text-[var(--pt-text-faint)]">Loading…</p>
        ) : community.length === 0 ? (
          <p className="text-[13px] text-[var(--pt-text-faint)]">No shared themes yet — be the first.</p>
        ) : (
          <div className="grid grid-cols-2 gap-2">
            {community.map((p) => (
              <PresetCard
                key={p.id}
                name={p.name}
                sub={p.description || undefined}
                theme={p.theme}
                onClick={() => onOpen(p.id)}
                badge={
                  p.ratingCount > 0 ? (
                    <span className="ml-auto flex items-center gap-0.5 text-xs text-[var(--pt-text-faint)] shrink-0">
                      <Star size={10} /> {p.averageRating.toFixed(1)}
                    </span>
                  ) : null
                }
              />
            ))}
          </div>
        )}
        <Link href="/presets" className="inline-block text-[13px] text-[var(--pt-accent)] hover:underline">
          Browse and rate all shared themes →
        </Link>
      </Group>
    </div>
  )
}
