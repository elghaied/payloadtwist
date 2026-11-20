import type { Block, CollectionConfig, Field, GlobalConfig } from 'payload'
import { formatLabels, toWords } from 'payload/shared'
import { FIELD_TEXT } from './field-text'

// Puts French and Arabic next to every English field label, select option, block name and field
// description in the demo admin, so the translated (and right-to-left) admin isn't half English.
// Text comes from FIELD_TEXT, keyed by the English Payload would show (explicit label, or the
// label Payload derives from the field name).

type Text = { en: string; fr: string; ar: string }

/** English strings with no translation yet (checked by tests/int/demo-labels). */
export const untranslated = new Set<string>()

function tr<T>(en: T): T | Text {
  if (typeof en !== 'string' || !en) return en
  const t = FIELD_TEXT[en]
  if (!t) {
    untranslated.add(en)
    return en
  }
  // option values are lowercase; show them capitalized in English too
  return { ...t, en: t.en ?? (/^[a-z]/.test(en) ? en[0].toUpperCase() + en.slice(1) : en) }
}

type AnyField = Record<string, unknown> & { type?: string; name?: string }

function translateField(field: Field): Field {
  const f = { ...(field as unknown as AnyField) }
  const label = f.label
  if (typeof f.name === 'string' && label !== false && (label === undefined || typeof label === 'string')) {
    f.label = tr(typeof label === 'string' ? label : toWords(f.name))
  } else if (typeof label === 'string') {
    f.label = tr(label)
  }
  const labels = f.labels as { singular?: unknown; plural?: unknown } | undefined
  if (labels) f.labels = { singular: tr(labels.singular), plural: tr(labels.plural) }
  const admin = f.admin as { description?: unknown } | undefined
  if (admin && typeof admin.description === 'string') f.admin = { ...admin, description: tr(admin.description) }
  if (Array.isArray(f.options)) {
    // bare string options display their value: give them a translated label
    f.options = f.options.map((o) =>
      typeof o === 'string' ? { label: tr(o), value: o } : o && typeof o === 'object' && 'label' in o ? { ...o, label: tr(o.label) } : o,
    )
  }
  if (Array.isArray(f.fields)) f.fields = (f.fields as Field[]).map(translateField)
  if (Array.isArray(f.tabs)) {
    f.tabs = (f.tabs as AnyField[]).map((tab) => ({
      ...tab,
      label: typeof tab.label === 'string' ? tr(tab.label) : tab.label,
      description: typeof tab.description === 'string' ? tr(tab.description) : tab.description,
      fields: (tab.fields as Field[]).map(translateField),
    }))
  }
  if (Array.isArray(f.blocks)) f.blocks = (f.blocks as Block[]).map(translateBlock)
  return f as unknown as Field
}

export function translateBlock(block: Block): Block {
  const labels = block.labels ?? formatLabels(block.slug)
  return {
    ...block,
    labels: { singular: tr(labels.singular), plural: tr(labels.plural) } as Block['labels'],
    fields: block.fields.map(translateField),
  }
}

export function translateCollection(c: CollectionConfig): CollectionConfig {
  const description = c.admin?.description
  return {
    ...c,
    admin: { ...c.admin, ...(typeof description === 'string' ? { description: tr(description) } : {}) } as CollectionConfig['admin'],
    fields: c.fields.map(translateField),
  }
}

export function translateGlobal(g: GlobalConfig): GlobalConfig {
  return { ...g, fields: g.fields.map(translateField) }
}
