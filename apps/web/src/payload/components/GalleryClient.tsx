'use client'

import {
  Banner,
  Button,
  Card,
  CheckboxInput,
  Chip,
  Collapsible,
  DatePicker,
  Drawer,
  DrawerToggler,
  FieldError,
  Gutter,
  Pill,
  Popup,
  PopupList,
  SelectInput,
  Switch,
  TextareaInput,
  TextInput,
  toast,
  Tooltip,
} from '@payloadcms/ui'
import { useState, type ChangeEvent, type ReactNode } from 'react'

import './preview-admin.css'

export interface SwatchGroup {
  section: string
  vars: string[]
}

const BUTTON_STYLES = [
  'primary',
  'secondary',
  'ghost',
  'primary-ghost',
  'dashed',
  'destructive',
  'link',
] as const
const BANNERS = ['brand', 'default', 'success', 'warning', 'danger'] as const
const PILLS = ['light', 'light-gray', 'dark', 'success', 'warning', 'error', 'white'] as const

function Section({ id, title, children }: { id: string; title: string; children: ReactNode }) {
  return (
    <section className="pt-gallery__section" id={id}>
      <h2 className="pt-gallery__title">{title}</h2>
      {children}
    </section>
  )
}

export function GalleryClient({
  groups,
  ramps,
}: {
  groups: SwatchGroup[]
  ramps: Record<string, string[]>
}) {
  const [text, setText] = useState('Northwind Studio')
  const [notes, setNotes] = useState('Editorial guidelines for the spring launch.')
  const [status, setStatus] = useState('review')
  const [checked, setChecked] = useState(true)
  const [toggle, setToggle] = useState(true)
  const [date, setDate] = useState<Date | undefined>(new Date())
  const [chip, setChip] = useState('design')

  return (
    <Gutter className="pt-gallery">
      <header className="pt-gallery__header">
        <h1>Component gallery</h1>
        <p>Every Payload v4 component family, rendered with the theme you are editing.</p>
      </header>

      <Section id="buttons" title="Buttons">
        {(['large', 'medium'] as const).map((size) => (
          <div className="pt-gallery__row" key={size}>
            {BUTTON_STYLES.map((style) => (
              <Button buttonStyle={style} key={style} margin={false} size={size}>
                {style.replace('-', ' ')}
              </Button>
            ))}
          </div>
        ))}
        <div className="pt-gallery__row">
          <Button disabled margin={false}>
            Disabled
          </Button>
          <Button buttonStyle="secondary" disabled margin={false}>
            Disabled secondary
          </Button>
        </div>
      </Section>

      <Section id="status" title="Banners, pills and chips">
        <div className="pt-gallery__stack">
          {BANNERS.map((type) => (
            <Banner key={type} type={type}>
              {type[0].toUpperCase() + type.slice(1)} banner — semantic background and text roles.
            </Banner>
          ))}
        </div>
        <div className="pt-gallery__row">
          {PILLS.map((style) => (
            <Pill key={style} pillStyle={style} rounded>
              {style}
            </Pill>
          ))}
        </div>
        <div className="pt-gallery__row">
          {['design', 'engineering', 'product'].map((c) => (
            <Chip key={c} onClick={() => setChip(c)} selected={chip === c}>
              {c}
            </Chip>
          ))}
          <Chip disabled>disabled</Chip>
        </div>
      </Section>

      <Section id="fields" title="Fields">
        <div className="pt-gallery__grid">
          <TextInput
            description="Default text input with a description."
            label="Site name"
            onChange={(e: ChangeEvent<HTMLInputElement>) => setText(e.target.value)}
            path="gallery-text"
            value={text}
          />
          <TextInput
            Error={<FieldError message="This field is required." path="gallery-error" showError />}
            label="Field with an error"
            onChange={() => undefined}
            path="gallery-error"
            required
            showError
            value=""
          />
          <TextInput label="Read-only" path="gallery-readonly" readOnly value="Locked by Priya" />
          <SelectInput
            label="Workflow status"
            name="gallery-select"
            onChange={(option) => {
              const selected = Array.isArray(option) ? option[0] : option
              setStatus(String(selected?.value ?? ''))
            }}
            options={[
              { label: 'Draft', value: 'draft' },
              { label: 'In review', value: 'review' },
              { label: 'Approved', value: 'approved' },
            ]}
            path="gallery-select"
            value={status}
          />
          <TextareaInput
            label="Notes"
            onChange={(e: ChangeEvent<HTMLTextAreaElement>) => setNotes(e.target.value)}
            path="gallery-notes"
            value={notes}
          />
          <div className="pt-gallery__field">
            <label className="field-label" htmlFor="gallery-date">
              Publish date
            </label>
            <DatePicker
              id="gallery-date"
              onChange={setDate}
              pickerAppearance="dayAndTime"
              value={date}
            />
          </div>
          <div className="pt-gallery__stack">
            <CheckboxInput
              checked={checked}
              label="Featured on the homepage"
              onToggle={() => setChecked((c) => !c)}
            />
            <CheckboxInput
              checked={false}
              label="Read-only option"
              onToggle={() => undefined}
              readOnly
            />
            <Switch checked={toggle} label="Send notifications" onChange={setToggle} />
          </div>
        </div>
      </Section>

      <Section id="overlays" title="Menus, tooltips, drawers and toasts">
        <div className="pt-gallery__row">
          <Popup
            button={
              <Button buttonStyle="secondary" el="span" margin={false}>
                Open menu
              </Button>
            }
            buttonType="custom"
          >
            <PopupList.ButtonGroup>
              <PopupList.Button onClick={() => undefined}>Duplicate</PopupList.Button>
              <PopupList.Button onClick={() => undefined}>Move to folder</PopupList.Button>
              <PopupList.Button disabled onClick={() => undefined}>
                Unpublish
              </PopupList.Button>
            </PopupList.ButtonGroup>
          </Popup>
          <span className="pt-gallery__tooltip-target">
            <Button buttonStyle="ghost" margin={false}>
              Hover for tooltip
            </Button>
            <Tooltip show>Tooltips use the inverse surface</Tooltip>
          </span>
          <DrawerToggler
            className="btn btn--style-secondary btn--size-medium"
            slug="gallery-drawer"
          >
            Open drawer
          </DrawerToggler>
          <Drawer slug="gallery-drawer" title="Drawer surface">
            <p>Drawers sit on the elevated background with the modal backdrop behind them.</p>
          </Drawer>
        </div>
        <div className="pt-gallery__row">
          <Button
            buttonStyle="secondary"
            margin={false}
            onClick={() => toast.success('Post published')}
          >
            Success toast
          </Button>
          <Button
            buttonStyle="secondary"
            margin={false}
            onClick={() => toast.warning('Draft has unsaved changes')}
          >
            Warning toast
          </Button>
          <Button
            buttonStyle="secondary"
            margin={false}
            onClick={() => toast.error('Could not save document')}
          >
            Error toast
          </Button>
          <Button
            buttonStyle="secondary"
            margin={false}
            onClick={() => toast.info('Changes synced')}
          >
            Info toast
          </Button>
        </div>
      </Section>

      <Section id="surfaces" title="Cards and collapsibles">
        <div className="pt-gallery__grid">
          <Card title="Posts" href="/preview/collections/posts" />
          <Card title="Media library" href="/preview/collections/media" />
          <Card title="Site settings" href="/preview/globals/site-settings" />
        </div>
        <Collapsible header="Collapsible section" initCollapsed={false}>
          <p>Collapsibles group related fields inside documents.</p>
        </Collapsible>
      </Section>

      <Section id="tokens" title="Semantic color tokens">
        {groups.map((g) => (
          <div className="pt-gallery__swatch-group" key={g.section}>
            <h3>{g.section}</h3>
            <div className="pt-gallery__swatches">
              {g.vars.map((v) => (
                <div className="pt-swatch" key={v} title={v}>
                  <span
                    className="pt-swatch__chip"
                    style={
                      g.section === 'Text' || g.section === 'Icon'
                        ? { color: `var(${v})` }
                        : { background: `var(${v})` }
                    }
                  >
                    {g.section === 'Text' || g.section === 'Icon' ? 'Aa' : ''}
                  </span>
                  <code>{v.replace(/^--color-/, '')}</code>
                </div>
              ))}
            </div>
          </div>
        ))}
      </Section>

      <Section id="ramps" title="Color ramps">
        {Object.entries(ramps).map(([family, steps]) => (
          <div className="pt-ramp" key={family}>
            <code>{family}</code>
            <div className="pt-ramp__steps">
              {steps.map((s) => (
                <span
                  key={s}
                  style={{ background: `var(--ramp-${family}-${s})` }}
                  title={`--ramp-${family}-${s}`}
                />
              ))}
            </div>
          </div>
        ))}
      </Section>
    </Gutter>
  )
}
