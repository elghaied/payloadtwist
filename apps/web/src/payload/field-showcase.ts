import type { Block, CollectionConfig } from 'payload'
import { demo } from './demo'
import { debugEditor } from './lexical'

// Every Payload v4 field type, variant and state in one document, so a theme can be judged
// against everything editors will actually see.

const quoteBlock: Block = {
  slug: 'quote',
  imageAltText: 'Pull quote',
  fields: [
    { name: 'quote', type: 'textarea', required: true },
    { name: 'attribution', type: 'text' },
  ],
}

const statsBlock: Block = {
  slug: 'stats',
  labels: { singular: 'Stats row', plural: 'Stats rows' },
  fields: [
    {
      name: 'items',
      type: 'array',
      minRows: 1,
      maxRows: 4,
      fields: [
        {
          type: 'row',
          fields: [
            { name: 'value', type: 'number', required: true, admin: { width: '40%' } },
            { name: 'label', type: 'text', required: true, admin: { width: '60%' } },
          ],
        },
      ],
    },
  ],
}

const galleryBlock: Block = {
  slug: 'gallery',
  fields: [
    { name: 'images', type: 'upload', relationTo: 'media', hasMany: true },
    { name: 'layout', type: 'radio', options: ['grid', 'carousel', 'masonry'], defaultValue: 'grid', admin: { layout: 'horizontal' } },
  ],
}

export const FieldShowcase: CollectionConfig = demo({
  slug: 'field-showcase',
  labels: { singular: 'Field showcase', plural: 'Field showcase' },
  admin: {
    useAsTitle: 'title',
    group: 'Showcase',
    description: 'Every Payload v4 field type and state — use it to judge a theme against real editing UI.',
    defaultColumns: ['title', 'status', 'body', 'priority', 'rating', 'updatedAt'],
  },
  versions: { drafts: { autosave: { interval: 2000 } } },
  trash: true,
  fields: [
    {
      type: 'tabs',
      tabs: [
        {
          label: 'Content',
          fields: [
            { name: 'body', type: 'richText', localized: true, admin: { description: 'Every Lexical feature, seeded with every node type.' } },
            {
              name: 'debugBody',
              label: 'Rich text with developer panels',
              type: 'richText',
              editor: debugEditor,
              admin: { description: 'Same content plus Lexical’s tree view, JSX output and test recorder.' },
            },
            { name: 'sections', type: 'blocks', blocks: [quoteBlock, statsBlock, galleryBlock] },
          ],
        },
        {
          label: 'Basics',
          description: 'Text-like inputs and their states.',
          fields: [
            { name: 'title', type: 'text', required: true, localized: true, admin: { placeholder: 'A clear, short title' } },
            { name: 'slug', type: 'slug', useAsSlug: 'title' },
            {
              name: 'summary',
              type: 'textarea',
              localized: true,
              maxLength: 280,
              admin: { description: 'Shown in listings. Max 280 characters.', rows: 3 },
            },
            {
              type: 'row',
              fields: [
                { name: 'contactEmail', type: 'email', admin: { width: '50%', placeholder: 'team@example.com' } },
                { name: 'priority', type: 'number', min: 1, max: 5, admin: { width: '25%', step: 1 } },
                { name: 'rating', type: 'number', admin: { width: '25%', step: 0.5 } },
              ],
            },
            { name: 'keywords', type: 'text', hasMany: true, admin: { description: 'Text field with hasMany — press enter to add.' } },
            { name: 'scores', type: 'number', hasMany: true },
            {
              name: 'internalId',
              type: 'text',
              admin: { readOnly: true, description: 'Read-only field.' },
            },
            {
              name: 'reviewNotes',
              type: 'textarea',
              admin: { condition: (data) => data?.status === 'review', description: 'Only shown while the status is “In review” (conditional field).' },
            },
          ],
        },
        {
          label: 'Choices',
          fields: [
            {
              name: 'status',
              type: 'select',
              required: true,
              defaultValue: 'review',
              options: [
                { label: 'Idea', value: 'idea' },
                { label: 'In progress', value: 'progress' },
                { label: 'In review', value: 'review' },
                { label: 'Done', value: 'done' },
              ],
            },
            {
              name: 'channels',
              type: 'select',
              hasMany: true,
              options: ['web', 'email', 'social', 'print', 'podcast'],
            },
            {
              name: 'audience',
              type: 'radio',
              options: ['everyone', 'members', 'staff'],
              defaultValue: 'everyone',
              admin: { layout: 'horizontal' },
            },
            {
              name: 'tone',
              type: 'radio',
              options: [
                { label: 'Friendly', value: 'friendly' },
                { label: 'Neutral', value: 'neutral' },
                { label: 'Formal', value: 'formal' },
              ],
              admin: { layout: 'vertical' },
            },
            { name: 'featured', type: 'checkbox', label: 'Feature on the homepage' },
            { name: 'allowComments', type: 'checkbox', defaultValue: true },
          ],
        },
        {
          label: 'Dates & data',
          fields: [
            {
              type: 'row',
              fields: [
                { name: 'publishAt', type: 'date', admin: { width: '50%', date: { pickerAppearance: 'dayAndTime' } } },
                { name: 'deadline', type: 'date', admin: { width: '50%', date: { pickerAppearance: 'dayOnly' } } },
              ],
            },
            {
              type: 'row',
              fields: [
                { name: 'reminderTime', type: 'date', admin: { width: '50%', date: { pickerAppearance: 'timeOnly' } } },
                { name: 'campaignMonth', type: 'date', admin: { width: '50%', date: { pickerAppearance: 'monthOnly' } } },
              ],
            },
            { name: 'location', type: 'point', admin: { description: 'Longitude / latitude.' } },
            { name: 'snippet', type: 'code', admin: { language: 'typescript', editorOptions: { lineNumbers: 'on' } } },
            { name: 'styles', type: 'code', admin: { language: 'css' } },
            { name: 'metadata', type: 'json' },
          ],
        },
        {
          label: 'Relations',
          fields: [
            { name: 'owner', type: 'relationship', relationTo: 'users' },
            { name: 'relatedPosts', type: 'relationship', relationTo: 'posts', hasMany: true },
            {
              name: 'linkedContent',
              type: 'relationship',
              relationTo: ['posts', 'pages'],
              hasMany: true,
              admin: { description: 'Polymorphic relationship to posts and pages.' },
            },
            { name: 'cover', type: 'upload', relationTo: 'media' },
            { name: 'attachments', type: 'upload', relationTo: 'media', hasMany: true },
          ],
        },
        {
          name: 'structure',
          label: 'Layout fields',
          description: 'Named tab: its fields are stored under `structure`.',
          fields: [
            {
              name: 'checklist',
              type: 'array',
              labels: { singular: 'Step', plural: 'Steps' },
              admin: { initCollapsed: false },
              fields: [
                {
                  type: 'row',
                  fields: [
                    { name: 'task', type: 'text', required: true, admin: { width: '70%' } },
                    { name: 'done', type: 'checkbox', admin: { width: '30%' } },
                  ],
                },
              ],
            },
            {
              name: 'seo',
              type: 'group',
              label: 'SEO (named group)',
              fields: [
                { name: 'title', type: 'text' },
                { name: 'description', type: 'textarea' },
                { name: 'noIndex', type: 'checkbox' },
              ],
            },
            {
              type: 'group',
              label: 'Unnamed group',
              admin: { description: 'Groups without a name only change the layout.' },
              fields: [{ name: 'internalNote', type: 'text' }],
            },
            {
              type: 'collapsible',
              label: 'Advanced options',
              admin: { initCollapsed: false },
              fields: [
                { name: 'cacheSeconds', type: 'number', defaultValue: 300 },
                { name: 'experimental', type: 'checkbox' },
              ],
            },
            {
              type: 'collapsible',
              label: 'Collapsed by default',
              admin: { initCollapsed: true },
              fields: [{ name: 'hiddenDetail', type: 'text' }],
            },
            {
              name: 'notice',
              type: 'ui',
              admin: { components: { Field: '@/payload/components/ShowcaseNotice#ShowcaseNotice' } },
            },
          ],
        },
      ],
    },
    { name: 'reviewer', type: 'relationship', relationTo: 'users', admin: { position: 'sidebar' } },
    { name: 'dueDate', type: 'date', admin: { position: 'sidebar' } },
    { name: 'confidential', type: 'checkbox', admin: { position: 'sidebar' } },
  ],
})
