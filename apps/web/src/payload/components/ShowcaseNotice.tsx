import { Banner } from '@payloadcms/ui'

/** A `ui` field: renders in the form without storing data. */
export function ShowcaseNotice() {
  return (
    <Banner type="warning">
      This is a <strong>ui</strong> field — custom content rendered inside the form, with no stored value.
    </Banner>
  )
}
