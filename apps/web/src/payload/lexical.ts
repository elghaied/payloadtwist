import {
  BlocksFeature,
  DebugJsxConverterFeature,
  defaultColors,
  FixedToolbarFeature,
  lexicalEditor,
  LinkFeature,
  TableFeature,
  TestRecorderFeature,
  TextStateFeature,
  TreeViewFeature,
  UploadFeature,
} from '@payloadcms/richtext-lexical'
import type { Block } from 'payload'

// Every Lexical feature Payload v4 ships, so themes are judged against all rich-text UI:
// default formats/headings/lists/quote/HR/align/indent/relationship + fixed toolbar, tables,
// blocks and inline blocks, text colors/highlights, links with custom fields and internal
// targets, uploads with extra fields.

export const calloutBlock: Block = {
  slug: 'callout',
  fields: [
    {
      name: 'style',
      type: 'select',
      defaultValue: 'info',
      options: ['info', 'success', 'warning', 'danger'],
    },
    { name: 'title', type: 'text' },
    { name: 'message', type: 'textarea', required: true },
  ],
}

export const codeBlock: Block = {
  slug: 'codeSnippet',
  labels: { singular: 'Code snippet', plural: 'Code snippets' },
  fields: [
    { name: 'language', type: 'select', defaultValue: 'ts', options: ['ts', 'tsx', 'css', 'json', 'bash'] },
    { name: 'code', type: 'code', required: true, admin: { language: 'typescript' } },
  ],
}

export const mentionInline: Block = {
  slug: 'mention',
  fields: [{ name: 'user', type: 'relationship', relationTo: 'users', required: true }],
}

export const badgeInline: Block = {
  slug: 'badge',
  fields: [
    { name: 'label', type: 'text', required: true },
    { name: 'tone', type: 'select', defaultValue: 'brand', options: ['brand', 'success', 'warning', 'danger'] },
  ],
}

const features = () =>
  lexicalEditor({
    features: ({ defaultFeatures }) => [
      // replaced below with configured versions
      ...defaultFeatures.filter((f) => f.key !== 'link' && f.key !== 'upload'),
      LinkFeature({
        enabledCollections: ['posts', 'pages'],
        fields: ({ defaultFields }) => [
          ...defaultFields,
          {
            name: 'rel',
            label: 'Rel attribute',
            type: 'select',
            hasMany: true,
            options: ['noopener', 'noreferrer', 'nofollow'],
          },
        ],
      }),
      UploadFeature({
        collections: {
          media: {
            fields: [
              { name: 'caption', type: 'text' },
              { name: 'credit', type: 'text' },
            ],
          },
        },
      }),
      FixedToolbarFeature(),
      TableFeature(),
      BlocksFeature({ blocks: [calloutBlock, codeBlock], inlineBlocks: [mentionInline, badgeInline] }),
      TextStateFeature({
        state: {
          color: { ...defaultColors.text, ...defaultColors.background },
          underline: {
            wavy: { label: 'Wavy', css: { 'text-decoration': 'underline wavy', 'text-underline-offset': '4px' } },
            dashed: { label: 'Dashed', css: { 'text-decoration': 'underline dashed', 'text-underline-offset': '4px' } },
          },
        },
      }),
    ],
  })

/** The editor every rich-text field uses. */
export const fullEditor = features()

/** Same features plus Lexical's developer panels (tree view, JSX output, test recorder). */
export const debugEditor = lexicalEditor({
  features: ({ rootFeatures }) => [...rootFeatures, TreeViewFeature(), DebugJsxConverterFeature(), TestRecorderFeature()],
})
