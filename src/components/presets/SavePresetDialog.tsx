'use client'

import { useState, useRef, useEffect } from 'react'
import { X } from 'lucide-react'
import { createPreset, updatePreset } from '@/lib/actions/presets'
import type { PayloadThemeConfig } from '@/payload-theme/types'

interface SavePresetDialogProps {
  open: boolean
  onClose: () => void
  themeData: PayloadThemeConfig
  existingPreset?: { id: string; name: string; description?: string | null; isPublic: boolean } | null
  onSaved?: (presetId: string) => void
}

export function SavePresetDialog({
  open,
  onClose,
  themeData,
  existingPreset,
  onSaved,
}: SavePresetDialogProps) {
  const [name, setName] = useState(existingPreset?.name || '')
  const [description, setDescription] = useState(existingPreset?.description || '')
  const [isPublic, setIsPublic] = useState(existingPreset?.isPublic ?? false)
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState('')
  const dialogRef = useRef<HTMLDialogElement>(null)

  useEffect(() => {
    if (open) {
      dialogRef.current?.showModal()
      if (existingPreset) {
        setName(existingPreset.name)
        setDescription(existingPreset.description || '')
        setIsPublic(existingPreset.isPublic)
      }
    } else {
      dialogRef.current?.close()
    }
  }, [open, existingPreset])

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!name.trim()) return

    setSaving(true)
    setError('')

    try {
      if (existingPreset) {
        await updatePreset(existingPreset.id, {
          name: name.trim(),
          description: description.trim(),
          themeData,
          isPublic,
        })
        onSaved?.(existingPreset.id)
      } else {
        const preset = await createPreset({
          name: name.trim(),
          description: description.trim(),
          themeData,
          isPublic,
        })
        onSaved?.(preset.id)
      }
      onClose()
      setName('')
      setDescription('')
      setIsPublic(false)
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to save')
    } finally {
      setSaving(false)
    }
  }

  if (!open) return null

  return (
    <dialog
      ref={dialogRef}
      className="backdrop:bg-black/50 bg-transparent p-0 m-auto rounded-xl"
      onClose={onClose}
    >
      <div className="w-[400px] rounded-xl border border-[var(--pt-border)] bg-[var(--pt-surface)] text-[var(--pt-text)] shadow-2xl">
        <div className="flex items-center justify-between px-4 py-3 border-b border-[var(--pt-border)]">
          <h2 className="text-sm font-semibold">
            {existingPreset ? 'Update Preset' : 'Save Preset'}
          </h2>
          <button
            onClick={onClose}
            className="p-1 rounded hover:bg-[var(--pt-surface-hover)] text-[var(--pt-text-muted)] transition-colors"
          >
            <X size={14} />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-4 flex flex-col gap-3">
          <div>
            <label className="text-[11px] text-[var(--pt-text-muted)] uppercase tracking-wider mb-1 block">
              Name
            </label>
            <input
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="My awesome theme"
              required
              className="w-full rounded-md border border-[var(--pt-border)] bg-[var(--pt-bg)] px-3 py-2 text-sm text-[var(--pt-text)] placeholder:text-[var(--pt-text-faint)] focus:outline-none focus:ring-1 focus:ring-purple-500/50"
            />
          </div>

          <div>
            <label className="text-[11px] text-[var(--pt-text-muted)] uppercase tracking-wider mb-1 block">
              Description
            </label>
            <textarea
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="Optional description..."
              rows={2}
              className="w-full rounded-md border border-[var(--pt-border)] bg-[var(--pt-bg)] px-3 py-2 text-sm text-[var(--pt-text)] placeholder:text-[var(--pt-text-faint)] focus:outline-none focus:ring-1 focus:ring-purple-500/50 resize-none"
            />
          </div>

          <label className="flex items-center gap-2 cursor-pointer">
            <input
              type="checkbox"
              checked={isPublic}
              onChange={(e) => setIsPublic(e.target.checked)}
              className="rounded border-[var(--pt-border)] accent-purple-500"
            />
            <span className="text-xs text-[var(--pt-text-muted)]">
              Make public (visible in gallery)
            </span>
          </label>

          {error && <p className="text-xs text-red-500">{error}</p>}

          <button
            type="submit"
            disabled={saving || !name.trim()}
            className="w-full rounded-md bg-gradient-to-r from-purple-600 via-pink-600 to-cyan-600 hover:from-purple-500 hover:via-pink-500 hover:to-cyan-500 text-white px-4 py-2 text-sm font-medium transition-all disabled:opacity-50"
          >
            {saving ? 'Saving...' : existingPreset ? 'Update' : 'Save'}
          </button>
        </form>
      </div>
    </dialog>
  )
}
