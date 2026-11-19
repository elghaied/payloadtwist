import { DefaultTemplate } from '@payloadcms/ui/rsc'
import type { AdminViewServerProps } from 'payload'
import { DEFAULT_RAMPS, schema } from '@/payload-theme/schema'
import { GalleryClient, type SwatchGroup } from './GalleryClient'

const SWATCH_SECTIONS = ['Background', 'Text', 'Border', 'Icon']

/** Custom admin view at /preview/gallery: every component family and token in one page. */
export function GalleryView(props: AdminViewServerProps) {
  const { initPageResult, params, payload, searchParams, viewActions, viewType } = props
  const { permissions, req } = initPageResult

  const groups: SwatchGroup[] = SWATCH_SECTIONS.map((section) => ({
    section,
    vars: schema.tokens
      .filter((t) => t.file === 'colors' && t.section === section)
      .map((t) => t.var),
  }))
  const ramps = Object.fromEntries(
    Object.entries(DEFAULT_RAMPS).map(([family, steps]) => [family, Object.keys(steps)]),
  )

  return (
    <DefaultTemplate
      i18n={req.i18n}
      locale={initPageResult.locale}
      params={params}
      payload={payload}
      permissions={permissions}
      req={req}
      searchParams={searchParams}
      user={req.user ?? undefined}
      viewActions={viewActions}
      viewType={viewType}
      visibleEntities={{
        collections: [...initPageResult.visibleEntities.collections],
        globals: [...initPageResult.visibleEntities.globals],
      }}
    >
      <GalleryClient groups={groups} ramps={ramps} />
    </DefaultTemplate>
  )
}

export default GalleryView
