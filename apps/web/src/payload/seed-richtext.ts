// Lexical JSON builders for seed content. Shapes follow @payloadcms/richtext-lexical's serialized
// node types; Payload validates every node against the editor config on create.

type Node = Record<string, unknown>
type Format = '' | 'left' | 'center' | 'right' | 'justify'

// Text format bitmask (lexical): bold 1, italic 2, strikethrough 4, underline 8, code 16,
// subscript 32, superscript 64
export const F = { bold: 1, italic: 2, strike: 4, underline: 8, code: 16, sub: 32, sup: 64 } as const

export const text = (value: string, format = 0, state?: Record<string, string>): Node => ({
  type: 'text',
  version: 1,
  text: value,
  format,
  detail: 0,
  mode: 'normal',
  style: '',
  ...(state ? { $: state } : {}),
})

const element = (type: string, children: Node[], extra: Node = {}, format: Format = '', indent = 0): Node => ({
  type,
  version: 1,
  direction: 'ltr',
  format,
  indent,
  children,
  ...extra,
})

export const p = (children: Node[] | string, format: Format = '', indent = 0) =>
  element('paragraph', typeof children === 'string' ? [text(children)] : children, { textFormat: 0, textStyle: '' }, format, indent)

export const h = (tag: 'h1' | 'h2' | 'h3' | 'h4' | 'h5' | 'h6', value: string) => element('heading', [text(value)], { tag })

export const quote = (children: Node[]) => element('quote', children)

const item = (children: Node[], value: number, checked?: boolean) =>
  element('listitem', children, { value, ...(checked === undefined ? {} : { checked }) })

export const list = (type: 'bullet' | 'number' | 'check', items: (string | Node[] | { children: Node[]; nested?: Node; checked?: boolean })[]) =>
  element(
    'list',
    items.map((it, i) => {
      if (typeof it === 'string') return item([text(it)], i + 1, type === 'check' ? false : undefined)
      if (Array.isArray(it)) return item(it, i + 1, type === 'check' ? false : undefined)
      return item([...it.children, ...(it.nested ? [it.nested] : [])], i + 1, type === 'check' ? !!it.checked : undefined)
    }),
    { listType: type, start: 1, tag: type === 'number' ? 'ol' : 'ul' },
  )

export const link = (label: string, fields: Node) =>
  element('link', [text(label)], { fields: { newTab: false, ...fields }, id: crypto.randomUUID() })

export const hr = (): Node => ({ type: 'horizontalrule', version: 1 })
export const br = (): Node => ({ type: 'linebreak', version: 1 })
export const tab = (): Node => ({ type: 'tab', version: 1, text: '\t', format: 0, detail: 2, mode: 'normal', style: '' })

export const relationship = (relationTo: string, value: number | string): Node => ({
  type: 'relationship',
  version: 2,
  format: '',
  relationTo,
  value,
})

export const upload = (value: number | string, fields: Node = {}): Node => ({
  type: 'upload',
  version: 3,
  format: '',
  id: crypto.randomUUID(),
  relationTo: 'media',
  value,
  fields,
})

export const block = (fields: Node): Node => ({
  type: 'block',
  version: 2,
  format: '',
  fields: { id: crypto.randomUUID(), blockName: '', ...fields },
})

export const inlineBlock = (fields: Node): Node => ({
  type: 'inlineBlock',
  version: 1,
  fields: { id: crypto.randomUUID(), ...fields },
})

const cell = (value: string, header: boolean): Node =>
  element('tablecell', [p(value)], { headerState: header ? 1 : 0, colSpan: 1, rowSpan: 1, backgroundColor: null })

export const table = (rows: string[][]): Node =>
  element(
    'table',
    rows.map((row, r) => element('tablerow', row.map((v) => cell(v, r === 0)), { height: undefined })),
    { colWidths: rows[0].map(() => 180) },
  )

export const root = (children: Node[]) => ({
  root: { type: 'root', version: 1, direction: 'ltr', format: '', indent: 0, children },
})

/** One document that exercises every node type, format and option the editor supports. */
export function everythingDocument(
  ids: { media: (number | string)[]; post: number | string; page: number | string; user: number | string },
  /** Only nodes Payload's default JSX converters render (for the debug JSX panel): no custom blocks or internal links */
  { portable = false }: { portable?: boolean } = {},
) {
  const internal = (label: string, relationTo: string, value: number | string) =>
    portable ? link(label, { linkType: 'custom', url: `/preview/collections/${relationTo}/${value}` }) : link(label, { linkType: 'internal', doc: { relationTo, value } })
  const nodes = [
    h('h1', 'Heading 1 — launch brief'),
    p([
      text('Every '),
      text('Lexical', F.bold),
      text(' feature in one place: '),
      text('italic', F.italic),
      text(', '),
      text('underline', F.underline),
      text(', '),
      text('strikethrough', F.strike),
      text(', '),
      text('inline code', F.code),
      text(', H'),
      text('2', F.sub),
      text('O, E = mc'),
      text('2', F.sup),
      text(' and '),
      text('bold italic underline', F.bold | F.italic | F.underline),
      text('.'),
    ]),
    h('h2', 'Heading 2 — colors and highlights'),
    p([
      text('Text colors: '),
      text('red', 0, { color: 'text-red' }),
      text(', '),
      text('orange', 0, { color: 'text-orange' }),
      text(', '),
      text('green', 0, { color: 'text-green' }),
      text(', '),
      text('blue', 0, { color: 'text-blue' }),
      text(', '),
      text('purple', 0, { color: 'text-purple' }),
      text('. Highlights: '),
      text('yellow', 0, { color: 'bg-yellow' }),
      text(', '),
      text('pink', 0, { color: 'bg-pink' }),
      text('. Underlines: '),
      text('wavy', 0, { underline: 'wavy' }),
      text(' and '),
      text('dashed', 0, { underline: 'dashed' }),
      text('.'),
    ]),
    h('h3', 'Heading 3 — alignment and indent'),
    p('Left aligned paragraph (default).'),
    p('Centered paragraph.', 'center'),
    p('Right aligned paragraph.', 'right'),
    p(
      'Justified paragraph — long enough to wrap across several lines so the justification is visible in the editor: payloadtwist themes every token Payload v4 exposes, from ramps to semantic roles.',
      'justify',
    ),
    p('Indented once.', '', 1),
    p('Indented twice.', '', 2),
    p([text('A line'), br(), text('with a line break and'), tab(), text('a tab.')]),
    h('h4', 'Heading 4 — lists'),
    list('bullet', [
      'Bulleted item',
      { children: [text('Item with a nested list')], nested: list('bullet', ['Nested item', 'Another nested item']) },
      [text('Item with '), text('formatting', F.bold)],
    ]),
    list('number', ['First step', 'Second step', 'Third step']),
    list('check', [
      { children: [text('Write the hero copy')], checked: true },
      { children: [text('Legal review')], checked: false },
      { children: [text('Schedule the newsletter')], checked: false },
    ]),
    h('h5', 'Heading 5 — quotes, links and rules'),
    quote([text('A theme should feel native, not bolted on. '), text('— Payload team', F.italic)]),
    p([
      text('Links: '),
      link('external, new tab', { linkType: 'custom', url: 'https://payloadcms.com', newTab: true, rel: ['noopener', 'noreferrer'] }),
      text(', '),
      internal('internal to a post', 'posts', ids.post),
      text(' and '),
      internal('internal to a page', 'pages', ids.page),
      text('.'),
    ]),
    hr(),
    h('h6', 'Heading 6 — embedded content'),
    p('Relationships to a post and a page:'),
    relationship('posts', ids.post),
    relationship('pages', ids.page),
    p('An upload with caption and credit fields:'),
    upload(ids.media[0], { caption: 'Aurora — cover artwork', credit: 'Northwind design team' }),
    upload(ids.media[3]),
    p('A table with a header row:'),
    table([
      ['Channel', 'Owner', 'Status', 'Budget'],
      ['Newsletter', 'Priya', 'In review', '$4,000'],
      ['Homepage', 'Jonas', 'Ready', '$2,500'],
      ['Social', 'Maya', 'Draft', '$5,500'],
    ]),
    p('Blocks (custom block types):'),
    block({ blockType: 'callout', style: 'info', title: 'Heads up', message: 'Callouts are Lexical blocks with their own fields.' }),
    block({ blockType: 'callout', style: 'warning', title: 'Deadline', message: 'Copy freeze is on Thursday.' }),
    block({ blockType: 'codeSnippet', language: 'ts', code: "export const theme = buildThemeCss(preset)\n" }),
    p([
      text('Inline blocks: ping '),
      inlineBlock({ blockType: 'mention', user: ids.user }),
      text(' and tag it '),
      inlineBlock({ blockType: 'badge', label: 'Launch', tone: 'success' }),
      text(' '),
      inlineBlock({ blockType: 'badge', label: 'Blocked', tone: 'danger' }),
      text('.'),
    ]),
  ]
  if (!portable) return root(nodes)
  const isCustom = (n: Node) => n.type === 'block' || n.type === 'inlineBlock'
  const strip = (n: Node): Node =>
    Array.isArray(n.children) ? { ...n, children: (n.children as Node[]).filter((c) => !isCustom(c)).map(strip) } : n
  const isBlocksIntro = (n: Node) => n.type === 'paragraph' && (n.children as Node[])[0]?.text === 'Blocks (custom block types):'
  return root(
    nodes
      .filter((n) => !isCustom(n) && !isBlocksIntro(n) && !(n.type === 'paragraph' && (n.children as Node[]).some(isCustom)))
      .map(strip),
  )
}

/** Shorter rich text for posts: headings, a list, a quote, a link and an image. */
export function articleDocument(excerpt: string, ids: { media: number | string; post?: number | string }) {
  return root([
    p(excerpt),
    h('h2', 'What changed'),
    p([
      text('Payload 4 ships a new design system built on '),
      text('semantic tokens', F.bold),
      text(', so a single variable can restyle a whole family of components in '),
      text('both color modes', F.italic),
      text('.'),
    ]),
    list('bullet', ['Ramps for raw color', 'Semantic roles with light and dark values', 'Plain, layered CSS']),
    upload(ids.media, { caption: 'Cover artwork' }),
    quote([text('Tokens first, components second.')]),
    h('h3', 'Next steps'),
    list('number', ['Pick a preset', 'Tune surfaces and components', 'Export custom.css']),
    p([
      text('Read the '),
      link('Payload docs', { linkType: 'custom', url: 'https://payloadcms.com/docs', newTab: true }),
      text(' for more.'),
    ]),
  ])
}
