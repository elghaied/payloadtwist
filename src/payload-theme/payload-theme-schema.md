# Payload UI Theme Schema
Extracted from @payloadcms/ui v3.78.0 on 2026-02-28

**338** CSS variables (214 overridable) · **184** BEM component blocks · **149** component SCSS files

---

## How to use this in your custom.scss

Payload CSS lives inside `@layer payload-default`.
Your `custom.scss` automatically has higher specificity than Payload's styles.

To override a CSS variable:
```scss
:root {
  --theme-elevation-0: #f8f8f8;
}
```

To override a component style:
```scss
.collection-list {
  .collection-list__header { background: red; }
}
```

To override within Payload's specificity layer:
```scss
@layer payload-default {
  .btn--style-primary { background: purple; }
}
```

---

## CSS Variables

### Base Color Scale (primary theming lever)

Override these `--color-base-*` values to retheme everything at once.
Payload's elevation scale (`--theme-elevation-*`) references the base scale
and auto-inverts in dark mode — so you only need to set light values here.

| Variable | Value | Type | Overridable | Dark Mode |
|----------|-------|------|-------------|-----------|
| `--color-base-0` | `rgb(255, 255, 255)` | color | yes | none |
| `--color-base-100` | `rgb(235, 235, 235)` | color | yes | none |
| `--color-base-1000` | `rgb(0, 0, 0)` | color | yes | none |
| `--color-base-150` | `rgb(221, 221, 221)` | color | yes | none |
| `--color-base-200` | `rgb(208, 208, 208)` | color | yes | none |
| `--color-base-250` | `rgb(195, 195, 195)` | color | yes | none |
| `--color-base-300` | `rgb(181, 181, 181)` | color | yes | none |
| `--color-base-350` | `rgb(168, 168, 168)` | color | yes | none |
| `--color-base-400` | `rgb(154, 154, 154)` | color | yes | none |
| `--color-base-450` | `rgb(141, 141, 141)` | color | yes | none |
| `--color-base-50` | `rgb(245, 245, 245)` | color | yes | none |
| `--color-base-500` | `rgb(128, 128, 128)` | color | yes | none |
| `--color-base-550` | `rgb(114, 114, 114)` | color | yes | none |
| `--color-base-600` | `rgb(101, 101, 101)` | color | yes | none |
| `--color-base-650` | `rgb(87, 87, 87)` | color | yes | none |
| `--color-base-700` | `rgb(74, 74, 74)` | color | yes | none |
| `--color-base-750` | `rgb(60, 60, 60)` | color | yes | none |
| `--color-base-800` | `rgb(47, 47, 47)` | color | yes | none |
| `--color-base-850` | `rgb(34, 34, 34)` | color | yes | none |
| `--color-base-900` | `rgb(20, 20, 20)` | color | yes | none |
| `--color-base-950` | `rgb(7, 7, 7)` | color | yes | none |


### Elevation Aliases (computed — do not override directly)

These `--theme-elevation-*` vars are computed from the base scale.
Overriding them directly breaks dark mode inversion.

| Variable | Value | Type | Overridable | Dark Mode |
|----------|-------|------|-------------|-----------|
| `--theme-elevation-0` | `var(--color-base-0)` | color | no | auto-inverted |
| `--theme-elevation-100` | `var(--color-base-100)` | color | no | auto-inverted |
| `--theme-elevation-1000` | `var(--color-base-1000)` | color | no | auto-inverted |
| `--theme-elevation-150` | `var(--color-base-150)` | color | no | auto-inverted |
| `--theme-elevation-200` | `var(--color-base-200)` | color | no | auto-inverted |
| `--theme-elevation-250` | `var(--color-base-250)` | color | no | auto-inverted |
| `--theme-elevation-300` | `var(--color-base-300)` | color | no | auto-inverted |
| `--theme-elevation-350` | `var(--color-base-350)` | color | no | auto-inverted |
| `--theme-elevation-400` | `var(--color-base-400)` | color | no | auto-inverted |
| `--theme-elevation-450` | `var(--color-base-450)` | color | no | auto-inverted |
| `--theme-elevation-50` | `var(--color-base-50)` | color | no | auto-inverted |
| `--theme-elevation-500` | `var(--color-base-500)` | color | no | auto-inverted |
| `--theme-elevation-550` | `var(--color-base-550)` | color | no | auto-inverted |
| `--theme-elevation-600` | `var(--color-base-600)` | color | no | auto-inverted |
| `--theme-elevation-650` | `var(--color-base-650)` | color | no | auto-inverted |
| `--theme-elevation-700` | `var(--color-base-700)` | color | no | auto-inverted |
| `--theme-elevation-750` | `var(--color-base-750)` | color | no | auto-inverted |
| `--theme-elevation-800` | `var(--color-base-800)` | color | no | auto-inverted |
| `--theme-elevation-850` | `var(--color-base-850)` | color | no | auto-inverted |
| `--theme-elevation-900` | `var(--color-base-900)` | color | no | auto-inverted |
| `--theme-elevation-950` | `var(--color-base-950)` | color | no | auto-inverted |


### Theme Colors (need explicit dark overrides)

These must be overridden separately for dark mode using:
```scss
html[data-theme='dark'] {
  --theme-bg: #1a1a1a;
}
```

| Variable | Value | Type | Overridable | Dark Mode |
|----------|-------|------|-------------|-----------|
| `--theme-baseline` | `#` | color | yes | none |
| `--theme-baseline-body-size` | `#` | color | yes | none |
| `--theme-bg` | `var(--theme-elevation-0)` | other | no | explicit |
| `--theme-border-color` | `var(--theme-elevation-150)` | other | no | explicit |
| `--theme-input-bg` | `var(--theme-elevation-0)` | other | no | explicit |
| `--theme-overlay` | `rgba(5, 5, 5, 0.5)` | color | yes | explicit |
| `--theme-text` | `var(--theme-elevation-800)` | other | no | explicit |


### Status Colors — Success (auto-inverted in dark mode)

| Variable | Value | Type | Overridable | Dark Mode |
|----------|-------|------|-------------|-----------|
| `--color-success-100` | `rgb(218, 237, 248)` | color | yes | none |
| `--color-success-150` | `rgb(188, 225, 248)` | color | yes | none |
| `--color-success-200` | `rgb(156, 216, 253)` | color | yes | none |
| `--color-success-250` | `rgb(125, 204, 248)` | color | yes | none |
| `--color-success-300` | `rgb(97, 190, 241)` | color | yes | none |
| `--color-success-350` | `rgb(65, 178, 236)` | color | yes | none |
| `--color-success-400` | `rgb(36, 164, 223)` | color | yes | none |
| `--color-success-450` | `rgb(18, 148, 204)` | color | yes | none |
| `--color-success-50` | `rgb(237, 245, 249)` | color | yes | none |
| `--color-success-500` | `rgb(21, 135, 186)` | color | yes | none |
| `--color-success-550` | `rgb(12, 121, 168)` | color | yes | none |
| `--color-success-600` | `rgb(11, 110, 153)` | color | yes | none |
| `--color-success-650` | `rgb(11, 97, 135)` | color | yes | none |
| `--color-success-700` | `rgb(17, 88, 121)` | color | yes | none |
| `--color-success-750` | `rgb(17, 76, 105)` | color | yes | none |
| `--color-success-800` | `rgb(18, 66, 90)` | color | yes | none |
| `--color-success-850` | `rgb(18, 56, 76)` | color | yes | none |
| `--color-success-900` | `rgb(19, 44, 58)` | color | yes | none |
| `--color-success-950` | `rgb(22, 33, 39)` | color | yes | none |
| `--theme-success-100` | `var(--color-success-100)` | color | no | auto-inverted |
| `--theme-success-150` | `var(--color-success-150)` | color | no | auto-inverted |
| `--theme-success-200` | `var(--color-success-200)` | color | no | auto-inverted |
| `--theme-success-250` | `var(--color-success-250)` | color | no | auto-inverted |
| `--theme-success-300` | `var(--color-success-300)` | color | no | auto-inverted |
| `--theme-success-350` | `var(--color-success-350)` | color | no | auto-inverted |
| `--theme-success-400` | `var(--color-success-400)` | color | no | auto-inverted |
| `--theme-success-450` | `var(--color-success-450)` | color | no | auto-inverted |
| `--theme-success-50` | `var(--color-success-50)` | color | no | auto-inverted |
| `--theme-success-500` | `var(--color-success-500)` | color | no | auto-inverted |
| `--theme-success-550` | `var(--color-success-550)` | color | no | auto-inverted |
| `--theme-success-600` | `var(--color-success-600)` | color | no | auto-inverted |
| `--theme-success-650` | `var(--color-success-650)` | color | no | auto-inverted |
| `--theme-success-700` | `var(--color-success-700)` | color | no | auto-inverted |
| `--theme-success-750` | `var(--color-success-750)` | color | no | auto-inverted |
| `--theme-success-800` | `var(--color-success-800)` | color | no | auto-inverted |
| `--theme-success-850` | `var(--color-success-850)` | color | no | auto-inverted |
| `--theme-success-900` | `var(--color-success-900)` | color | no | auto-inverted |
| `--theme-success-950` | `var(--color-success-950)` | color | no | auto-inverted |


### Status Colors — Warning (auto-inverted in dark mode)

| Variable | Value | Type | Overridable | Dark Mode |
|----------|-------|------|-------------|-----------|
| `--color-warning-100` | `rgb(248, 232, 219)` | color | yes | none |
| `--color-warning-150` | `rgb(243, 212, 186)` | color | yes | none |
| `--color-warning-200` | `rgb(243, 200, 162)` | color | yes | none |
| `--color-warning-250` | `rgb(240, 185, 136)` | color | yes | none |
| `--color-warning-300` | `rgb(238, 166, 98)` | color | yes | none |
| `--color-warning-350` | `rgb(234, 148, 58)` | color | yes | none |
| `--color-warning-400` | `rgb(223, 132, 17)` | color | yes | none |
| `--color-warning-450` | `rgb(204, 120, 15)` | color | yes | none |
| `--color-warning-50` | `rgb(249, 242, 237)` | color | yes | none |
| `--color-warning-500` | `rgb(185, 108, 13)` | color | yes | none |
| `--color-warning-550` | `rgb(167, 97, 10)` | color | yes | none |
| `--color-warning-600` | `rgb(150, 87, 11)` | color | yes | none |
| `--color-warning-650` | `rgb(134, 78, 11)` | color | yes | none |
| `--color-warning-700` | `rgb(120, 70, 13)` | color | yes | none |
| `--color-warning-750` | `rgb(105, 61, 13)` | color | yes | none |
| `--color-warning-800` | `rgb(90, 55, 19)` | color | yes | none |
| `--color-warning-850` | `rgb(73, 47, 21)` | color | yes | none |
| `--color-warning-900` | `rgb(56, 38, 20)` | color | yes | none |
| `--color-warning-950` | `rgb(38, 29, 21)` | color | yes | none |
| `--theme-warning-100` | `var(--color-warning-100)` | color | no | auto-inverted |
| `--theme-warning-150` | `var(--color-warning-150)` | color | no | auto-inverted |
| `--theme-warning-200` | `var(--color-warning-200)` | color | no | auto-inverted |
| `--theme-warning-250` | `var(--color-warning-250)` | color | no | auto-inverted |
| `--theme-warning-300` | `var(--color-warning-300)` | color | no | auto-inverted |
| `--theme-warning-350` | `var(--color-warning-350)` | color | no | auto-inverted |
| `--theme-warning-400` | `var(--color-warning-400)` | color | no | auto-inverted |
| `--theme-warning-450` | `var(--color-warning-450)` | color | no | auto-inverted |
| `--theme-warning-50` | `var(--color-warning-50)` | color | no | auto-inverted |
| `--theme-warning-500` | `var(--color-warning-500)` | color | no | auto-inverted |
| `--theme-warning-550` | `var(--color-warning-550)` | color | no | auto-inverted |
| `--theme-warning-600` | `var(--color-warning-600)` | color | no | auto-inverted |
| `--theme-warning-650` | `var(--color-warning-650)` | color | no | auto-inverted |
| `--theme-warning-700` | `var(--color-warning-700)` | color | no | auto-inverted |
| `--theme-warning-750` | `var(--color-warning-750)` | color | no | auto-inverted |
| `--theme-warning-800` | `var(--color-warning-800)` | color | no | auto-inverted |
| `--theme-warning-850` | `var(--color-warning-850)` | color | no | auto-inverted |
| `--theme-warning-900` | `var(--color-warning-900)` | color | no | auto-inverted |
| `--theme-warning-950` | `var(--color-warning-950)` | color | no | auto-inverted |


### Status Colors — Error (auto-inverted in dark mode)

| Variable | Value | Type | Overridable | Dark Mode |
|----------|-------|------|-------------|-----------|
| `--color-error-100` | `rgb(252, 229, 227)` | color | yes | none |
| `--color-error-150` | `rgb(247, 208, 204)` | color | yes | none |
| `--color-error-200` | `rgb(254, 193, 188)` | color | yes | none |
| `--color-error-250` | `rgb(253, 177, 170)` | color | yes | none |
| `--color-error-300` | `rgb(253, 154, 146)` | color | yes | none |
| `--color-error-350` | `rgb(253, 131, 123)` | color | yes | none |
| `--color-error-400` | `rgb(246, 109, 103)` | color | yes | none |
| `--color-error-450` | `rgb(234, 90, 86)` | color | yes | none |
| `--color-error-50` | `rgb(250, 241, 240)` | color | yes | none |
| `--color-error-500` | `rgb(218, 75, 72)` | color | yes | none |
| `--color-error-550` | `rgb(200, 62, 61)` | color | yes | none |
| `--color-error-600` | `rgb(182, 54, 54)` | color | yes | none |
| `--color-error-650` | `rgb(161, 47, 47)` | color | yes | none |
| `--color-error-700` | `rgb(144, 44, 43)` | color | yes | none |
| `--color-error-750` | `rgb(123, 41, 39)` | color | yes | none |
| `--color-error-800` | `rgb(105, 39, 37)` | color | yes | none |
| `--color-error-850` | `rgb(86, 36, 33)` | color | yes | none |
| `--color-error-900` | `rgb(64, 32, 29)` | color | yes | none |
| `--color-error-950` | `rgb(44, 26, 24)` | color | yes | none |
| `--theme-error-100` | `var(--color-error-100)` | color | no | auto-inverted |
| `--theme-error-150` | `var(--color-error-150)` | color | no | auto-inverted |
| `--theme-error-200` | `var(--color-error-200)` | color | no | auto-inverted |
| `--theme-error-250` | `var(--color-error-250)` | color | no | auto-inverted |
| `--theme-error-300` | `var(--color-error-300)` | color | no | auto-inverted |
| `--theme-error-350` | `var(--color-error-350)` | color | no | auto-inverted |
| `--theme-error-400` | `var(--color-error-400)` | color | no | auto-inverted |
| `--theme-error-450` | `var(--color-error-450)` | color | no | auto-inverted |
| `--theme-error-50` | `var(--color-error-50)` | color | no | auto-inverted |
| `--theme-error-500` | `var(--color-error-500)` | color | no | auto-inverted |
| `--theme-error-550` | `var(--color-error-550)` | color | no | auto-inverted |
| `--theme-error-600` | `var(--color-error-600)` | color | no | auto-inverted |
| `--theme-error-650` | `var(--color-error-650)` | color | no | auto-inverted |
| `--theme-error-700` | `var(--color-error-700)` | color | no | auto-inverted |
| `--theme-error-750` | `var(--color-error-750)` | color | no | auto-inverted |
| `--theme-error-800` | `var(--color-error-800)` | color | no | auto-inverted |
| `--theme-error-850` | `var(--color-error-850)` | color | no | auto-inverted |
| `--theme-error-900` | `var(--color-error-900)` | color | no | auto-inverted |
| `--theme-error-950` | `var(--color-error-950)` | color | no | auto-inverted |


### Status Colors — Info (auto-inverted in dark mode)

| Variable | Value | Type | Overridable | Dark Mode |
|----------|-------|------|-------------|-----------|
| `--color-blue-100` | `rgb(218, 237, 248)` | color | yes | none |
| `--color-blue-150` | `rgb(188, 225, 248)` | color | yes | none |
| `--color-blue-200` | `rgb(156, 216, 253)` | color | yes | none |
| `--color-blue-250` | `rgb(125, 204, 248)` | color | yes | none |
| `--color-blue-300` | `rgb(97, 190, 241)` | color | yes | none |
| `--color-blue-350` | `rgb(65, 178, 236)` | color | yes | none |
| `--color-blue-400` | `rgb(36, 164, 223)` | color | yes | none |
| `--color-blue-450` | `rgb(18, 148, 204)` | color | yes | none |
| `--color-blue-50` | `rgb(237, 245, 249)` | color | yes | none |
| `--color-blue-500` | `rgb(21, 135, 186)` | color | yes | none |
| `--color-blue-550` | `rgb(12, 121, 168)` | color | yes | none |
| `--color-blue-600` | `rgb(11, 110, 153)` | color | yes | none |
| `--color-blue-650` | `rgb(11, 97, 135)` | color | yes | none |
| `--color-blue-700` | `rgb(17, 88, 121)` | color | yes | none |
| `--color-blue-750` | `rgb(17, 76, 105)` | color | yes | none |
| `--color-blue-800` | `rgb(18, 66, 90)` | color | yes | none |
| `--color-blue-850` | `rgb(18, 56, 76)` | color | yes | none |
| `--color-blue-900` | `rgb(19, 44, 58)` | color | yes | none |
| `--color-blue-950` | `rgb(22, 33, 39)` | color | yes | none |


### Typography

| Variable | Value | Type | Overridable | Dark Mode |
|----------|-------|------|-------------|-----------|
| `--base` | `calc((var(--base-px) / var(--base-body-size)) * 1rem)` | size | yes | none |
| `--base-body-size` | `13` | number | yes | none |
| `--base-px` | `20` | number | yes | none |
| `--font-body` | `-apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'H...` | font | yes | none |
| `--font-mono` | `'SF Mono', Menlo, Consolas, Monaco, monospace` | font | yes | none |
| `--font-serif` | `'Georgia', 'Bitstream Charter', 'Charis SIL', Utopia, 'UR...` | font | yes | none |


### Layout

| Variable | Value | Type | Overridable | Dark Mode |
|----------|-------|------|-------------|-----------|
| `--accessibility-outline` | `2px solid var(--theme-text)` | other | yes | none |
| `--accessibility-outline-offset` | `2px` | size | yes | none |
| `--app-header-height` | `calc(var(--base) * 2.8)` | size | yes | none |
| `--doc-controls-height` | `calc(var(--base) * 2.8)` | size | yes | none |
| `--gutter-h` | `#` | color | yes | none |
| `--nav-trans-time` | `150ms` | other | yes | none |
| `--nav-width` | `275px` | size | yes | none |
| `--scrollbar-width` | `17px` | size | yes | none |
| `--spacing-field` | `var(--base)` | size | no | none |
| `--spacing-view-bottom` | `var(--gutter-h)` | other | no | none |
| `--style-radius-l` | `#` | color | yes | none |
| `--style-radius-m` | `#` | color | yes | none |
| `--style-radius-s` | `#` | color | yes | none |
| `--z-modal` | `30` | number | yes | none |
| `--z-nav` | `20` | number | yes | none |
| `--z-popup` | `60` | number | yes | none |
| `--z-status` | `40` | number | yes | none |


### Breakpoints

| Variable | Value | Type | Overridable | Dark Mode |
|----------|-------|------|-------------|-----------|
| `--breakpoint-l-width` | `#` | color | no | none |
| `--breakpoint-m-width` | `#` | color | no | none |
| `--breakpoint-s-width` | `#` | color | no | none |
| `--breakpoint-xs-width` | `#` | color | no | none |


### Other

| Variable | Value | Type | Overridable | Dark Mode |
|----------|-------|------|-------------|-----------|
| `--active` | `after` | other | yes | none |
| `--assigned-collections-color` | `var(--theme-elevation-900)` | other | no | none |
| `--bg-color` | `var(--theme-elevation-800)` | other | no | none |
| `--border-bottom-left-radius` | `var(--style-radius-m)` | other | no | none |
| `--border-bottom-right-radius` | `var(--style-radius-m)` | other | no | none |
| `--border-top-left-radius` | `var(--style-radius-m)` | other | no | none |
| `--border-top-right-radius` | `var(--style-radius-m)` | other | no | none |
| `--btn-base-transition` | `.1s cubic-bezier(0, .2, .2, 1)` | other | yes | none |
| `--btn-border` | `1px solid var(--theme-elevation-800)` | other | yes | none |
| `--btn-color` | `var(--theme-elevation-400)` | other | no | none |
| `--btn-font-weight` | `normal` | other | yes | none |
| `--btn-icon-border-color` | `currentColor` | other | yes | none |
| `--btn-icon-content-gap` | `calc(var(--base) * .4)` | size | yes | none |
| `--btn-icon-padding` | `0px` | size | yes | none |
| `--btn-icon-size` | `calc(var(--base) * 1.2)` | size | yes | none |
| `--btn-line-height` | `calc(var(--base) * 1.1)` | size | yes | none |
| `--btn-padding-block-end` | `0` | number | yes | none |
| `--btn-padding-block-start` | `0` | number | yes | none |
| `--btn-padding-inline-end` | `0` | number | yes | none |
| `--btn-padding-inline-start` | `0` | number | yes | none |
| `--card-bg-color` | `var(--theme-elevation-0)` | other | no | none |
| `--card-border-color` | `var(--theme-elevation-150)` | other | no | none |
| `--card-icon-dots-bg-color` | `transparent` | other | yes | none |
| `--card-icon-dots-color` | `var(--theme-elevation-600)` | other | no | none |
| `--card-label-color` | `var(--theme-text)` | color | no | none |
| `--card-preview-bg-color` | `var(--theme-elevation-50)` | other | no | none |
| `--card-preview-icon-color` | `var(--theme-elevation-400)` | other | no | none |
| `--card-titlebar-icon-color` | `var(--theme-elevation-300)` | other | no | none |
| `--caret-center` | `after` | other | yes | none |
| `--caret-left` | `after` | other | yes | none |
| `--caret-right` | `after` | other | yes | none |
| `--caret-size` | `6px` | size | yes | none |
| `--clickable` | `not(.react-datepicker__week-number--selected,.react-datep...` | other | yes | none |
| `--color` | `var(--theme-elevation-0)` | other | no | none |
| `--controls-gap` | `calc(var(--base) / 2)` | size | yes | none |
| `--diff-create-link-color` | `var(--theme-success-600)` | other | no | none |
| `--diff-create-parent-bg` | `var(--theme-success-100)` | other | no | none |
| `--diff-create-parent-color` | `var(--theme-success-800)` | other | no | none |
| `--diff-create-pill-bg` | `var(--theme-success-200)` | other | no | none |
| `--diff-create-pill-border` | `var(--theme-success-400)` | other | no | none |
| `--diff-create-pill-color` | `var(--theme-success-600)` | other | no | none |
| `--diff-delete-link-color` | `var(--theme-error-600)` | other | no | none |
| `--diff-delete-parent-bg` | `var(--theme-error-100)` | other | no | none |
| `--diff-delete-parent-color` | `var(--theme-error-800)` | other | no | none |
| `--diff-delete-pill-bg` | `var(--theme-error-200)` | other | no | none |
| `--diff-delete-pill-border` | `var(--theme-error-400)` | other | no | none |
| `--diff-delete-pill-color` | `var(--theme-error-600)` | other | no | none |
| `--disabled` | `hover` | other | yes | none |
| `--doc-sidebar-width` | `325px` | size | yes | none |
| `--dot-button-width` | `calc(var(--base) * 2)` | size | yes | none |
| `--edit-upload-cell-spacing` | `calc(var(--base) * 1.5)` | size | yes | none |
| `--edit-upload-sidebar-width` | `calc(350px + var(--gutter-h))` | size | yes | none |
| `--error` | `hover div.rs__control,.react-select--error:focus-within d...` | other | yes | none |
| `--file-gutter-h` | `calc(var(--gutter-h) / 4)` | size | yes | none |
| `--foreground-opacity` | `0` | number | yes | none |
| `--gap` | `var(--base)` | size | no | none |
| `--gradient` | `linear-gradient(to left, rgba(0, 0, 0, .04) 0%, transpare...` | other | yes | none |
| `--group-by` | `first-child` | other | yes | none |
| `--hamburger-size` | `var(--base)` | size | no | none |
| `--has-action` | `hover` | other | yes | none |
| `--has-error` | `after` | other | yes | none |
| `--has-on-click` | `hover,.thumbnail-card--has-on-click:focus,.thumbnail-card...` | other | yes | none |
| `--has-onclick` | `hover` | other | yes | none |
| `--has-sidebar` | `has(.document-fields__sidebar-wrap .document-fields__side...` | other | yes | none |
| `--highlighted` | `hover,.react-datepicker__month-text--highlighted:hover,.r...` | other | yes | none |
| `--holidays` | `hover,.react-datepicker__month-text--holidays:hover,.reac...` | other | yes | none |
| `--hover-bg` | `var(--theme-elevation-600)` | other | no | none |
| `--hover-btn-border` | `1px solid var(--theme-elevation-400)` | other | yes | none |
| `--hover-color` | `var(--color)` | other | no | none |
| `--icon-width` | `40px` | size | yes | none |
| `--in-range` | `not(.react-datepicker__day--in-selecting-range,.react-dat...` | other | yes | none |
| `--in-selecting-range` | `not(.react-datepicker__day--in-range,.react-datepicker__m...` | other | yes | none |
| `--is-live-previewing` | `after` | other | yes | none |
| `--keyboard-selected` | `hover` | other | yes | none |
| `--list-button-padding` | `calc(var(--base) * .5)` | size | yes | none |
| `--main-border` | `1px solid var(--theme-elevation-100)` | other | yes | none |
| `--main-field-margin` | `calc(var(--base) * -2)` | size | yes | none |
| `--main-gutter-h-left` | `var(--gutter-h)` | other | no | none |
| `--main-gutter-h-right` | `calc(var(--base) * 2)` | size | yes | none |
| `--main-width` | `66.66%` | size | yes | none |
| `--margin-block` | `calc(var(--base) * 1.2)` | size | yes | none |
| `--menu-is-open` | `before` | other | yes | none |
| `--multi-value-label__drawer-toggler` | `hover` | other | yes | none |
| `--next` | `before` | other | yes | none |
| `--next--with-time` | `not(.react-datepicker__navigation--next--with-today-button)` | other | yes | none |
| `--no-background` | `hover` | other | yes | none |
| `--offset` | `calc(var(--gutter-h) / 2)` | size | yes | none |
| `--overlay` | `hover` | other | yes | none |
| `--pill-icon-size` | `calc(var(--base) * 1.2)` | size | yes | none |
| `--pill-padding-block-end` | `0px` | size | yes | none |
| `--pill-padding-block-start` | `0px` | size | yes | none |
| `--pill-padding-inline-end` | `0px` | size | yes | none |
| `--pill-padding-inline-start` | `0px` | size | yes | none |
| `--popup-button-highlight` | `transparent` | other | yes | none |
| `--popup-button-list-gap` | `3px` | size | yes | none |
| `--popup-caret-size` | `8px` | size | yes | none |
| `--position-bottom` | `after` | other | yes | none |
| `--position-top` | `after` | other | yes | none |
| `--previous` | `before` | other | yes | none |
| `--row-bg-color` | `transparent` | other | yes | none |
| `--row-cursor` | `pointer` | other | yes | none |
| `--row-icon-color` | `var(--theme-elevation-400)` | other | no | none |
| `--row-icon-opacity` | `1` | number | yes | none |
| `--row-opacity` | `1` | number | yes | none |
| `--row-text-color` | `var(--theme-text)` | color | no | none |
| `--rowPadding` | `calc(var(--base) / 4)` | size | yes | none |
| `--search-bg` | `var(--theme-elevation-50)` | other | no | none |
| `--selected` | `hover` | other | yes | none |
| `--sidebar-gutter-h-left` | `calc(var(--base) * 2)` | size | yes | none |
| `--sidebar-gutter-h-right` | `var(--gutter-h)` | other | no | none |
| `--sidebar-wrap-flex-shrink` | `initial` | other | yes | none |
| `--sidebar-wrap-height` | `initial` | other | yes | none |
| `--sidebar-wrap-min-width` | `0` | number | yes | none |
| `--sidebar-wrap-position` | `initial` | other | yes | none |
| `--sidebar-wrap-top` | `initial` | other | yes | none |
| `--sidebar-wrap-width` | `0` | number | yes | none |
| `--single-value__drawer-toggler` | `focus-visible` | other | yes | none |
| `--size` | `calc(var(--base) * 1.2)` | size | yes | none |
| `--size-large` | `not(.btn--icon-only).btn--icon-position-left` | other | yes | none |
| `--size-medium` | `not(.btn--icon-only).btn--icon-position-left` | other | yes | none |
| `--size-small` | `not(.btn--icon-only).btn--icon-position-left` | other | yes | none |
| `--size-xsmall` | `not(.btn--icon-only).btn--icon-position-left` | other | yes | none |
| `--style-default` | `hover` | other | yes | none |
| `--time` | `not(.react-datepicker__header--time--only)` | other | yes | none |
| `--toggle-pad-h` | `15px` | size | yes | none |
| `--toggle-pad-v` | `12px` | size | yes | none |
| `--top-level` | `first-child` | other | yes | none |
| `--within-collapsible` | `first-child` | other | yes | none |
| `--within-tab` | `first-child` | other | yes | none |


---

## BEM Component Blocks

### Navigation
**`.nav-group`**
  Elements: `.nav-group__indicator`, `.nav-group__toggle`
  Modifiers: `.nav-group--collapsed`

**`.nav-toggler`**
  Modifiers: `.nav-toggler--is-open`


### List View
**`.collection-list`**
  Elements: `.collection-list__header`, `.collection-list__list-selection`, `.collection-list__list-selection-actions`, `.collection-list__search-input`, `.collection-list__shimmer`, `.collection-list__sub-header`, `.collection-list__tables`, `.collection-list__wrap`

**`.list-controls`**
  Elements: `.list-controls__toggle-columns`, `.list-controls__toggle-group-by`, `.list-controls__toggle-sort`, `.list-controls__toggle-where`

**`.list-drawer`**
  Elements: `.list-drawer__header`, `.list-drawer__select-collection-wrap`

**`.list-header`**
  Elements: `.list-header__actions`, `.list-header__after-header-content`, `.list-header__content`, `.list-header__create-new-button`, `.list-header__title`, `.list-header__title-actions`, `.list-header__title-and-actions`

**`.list-selection`**
  Elements: `.list-selection__actions`, `.list-selection__button`


### Edit View
**`.doc-controls`**
  Elements: `.doc-controls__content`, `.doc-controls__controls`, `.doc-controls__controls-wrapper`, `.doc-controls__divider`, `.doc-controls__dots`, `.doc-controls__label`, `.doc-controls__list-item`, `.doc-controls__locked-controls`, `.doc-controls__meta`, `.doc-controls__meta-icons`, `.doc-controls__popup`, `.doc-controls__value`, `.doc-controls__value-wrap`, `.doc-controls__wrapper`

**`.doc-drawer`**
  Elements: `.doc-drawer__after-header`, `.doc-drawer__divider`, `.doc-drawer__header`, `.doc-drawer__header-close`, `.doc-drawer__header-content`, `.doc-drawer__header-text`, `.doc-drawer__header-toggler`, `.doc-drawer__toggler`

**`.document-fields`**
  Elements: `.document-fields__edit`, `.document-fields__fields`, `.document-fields__form`, `.document-fields__label`, `.document-fields__main`, `.document-fields__sidebar`, `.document-fields__sidebar-fields`, `.document-fields__sidebar-wrap`
  Modifiers: `.document-fields--force-sidebar-wrap`, `.document-fields--has-sidebar`

**`.document-locked`**
  Elements: `.document-locked__content`, `.document-locked__controls`, `.document-locked__wrapper`

**`.document-stale-data`**
  Elements: `.document-stale-data__content`, `.document-stale-data__controls`, `.document-stale-data__wrapper`

**`.document-take-over`**
  Elements: `.document-take-over__content`, `.document-take-over__controls`, `.document-take-over__wrapper`

**`.edit-many`**
  Elements: `.edit-many__collection-actions`, `.edit-many__document-actions`, `.edit-many__draft`, `.edit-many__edit`, `.edit-many__form`, `.edit-many__header`, `.edit-many__header__close`, `.edit-many__header__title`, `.edit-many__main`, `.edit-many__meta`, `.edit-many__publish`, `.edit-many__save`, `.edit-many__sidebar`, `.edit-many__sidebar-fields`, `.edit-many__sidebar-sticky-wrap`, `.edit-many__sidebar-wrap`

**`.edit-many-bulk-uploads`**
  Elements: `.edit-many-bulk-uploads__collection-actions`, `.edit-many-bulk-uploads__document-actions`, `.edit-many-bulk-uploads__edit`, `.edit-many-bulk-uploads__form`, `.edit-many-bulk-uploads__header`, `.edit-many-bulk-uploads__header__close`, `.edit-many-bulk-uploads__header__title`, `.edit-many-bulk-uploads__main`, `.edit-many-bulk-uploads__meta`, `.edit-many-bulk-uploads__sidebar`, `.edit-many-bulk-uploads__sidebar-fields`, `.edit-many-bulk-uploads__sidebar-sticky-wrap`, `.edit-many-bulk-uploads__sidebar-wrap`, `.edit-many-bulk-uploads__toggle`

**`.edit-upload`**
  Elements: `.edit-upload__actions`, `.edit-upload__crop`, `.edit-upload__crop-window`, `.edit-upload__draggable`, `.edit-upload__draggable-container`, `.edit-upload__draggable-container--dragging`, `.edit-upload__focal-wrapper`, `.edit-upload__focalOnly`, `.edit-upload__focalPoint`, `.edit-upload__groupWrap`, `.edit-upload__header`, `.edit-upload__imageWrap`, `.edit-upload__input`, `.edit-upload__inputsWrap`, `.edit-upload__point`, `.edit-upload__reset`, `.edit-upload__sidebar`, `.edit-upload__titleWrap`, `.edit-upload__toolWrap`


### Dashboard
**`.dashboard-breadcrumb-dropdown`**
  Elements: `.dashboard-breadcrumb-dropdown__editing`

**`.dashboard-breadcrumb-select`**


### Fields
**`.array-field`**
  Elements: `.array-field__add-row`, `.array-field__draggable-rows`, `.array-field__header`, `.array-field__header-action`, `.array-field__header-actions`, `.array-field__header-content`, `.array-field__header-wrap`, `.array-field__header__header-content`, `.array-field__heading-with-error`, `.array-field__row-header`, `.array-field__title`
  Modifiers: `.array-field--has-error`, `.array-field--has-no-error`

**`.blocks-field`**
  Elements: `.blocks-field__block-header`, `.blocks-field__block-number`, `.blocks-field__block-pill`, `.blocks-field__drawer-toggler`, `.blocks-field__error-pill`, `.blocks-field__header`, `.blocks-field__header-action`, `.blocks-field__header-actions`, `.blocks-field__header-wrap`, `.blocks-field__heading-with-error`, `.blocks-field__row--no-errors`, `.blocks-field__rows`
  Modifiers: `.blocks-field--has-error`, `.blocks-field--has-no-error`

**`.checkbox`**

**`.checkbox-input`**
  Elements: `.checkbox-input__icon`, `.checkbox-input__input`
  Modifiers: `.checkbox-input--checked`, `.checkbox-input--read-only`

**`.checkbox-popup`**
  Elements: `.checkbox-popup__options`

**`.code-cell`**

**`.code-editor`**

**`.code-field`**

**`.collapsible-field`**
  Elements: `.collapsible-field__row-label-wrap`

**`.date-time-field`**
  Modifiers: `.date-time-field--has-error`

**`.date-time-picker`**
  Elements: `.date-time-picker__appearance--dayOnly`, `.date-time-picker__appearance--monthOnly`, `.date-time-picker__appearance--timeOnly`, `.date-time-picker__clear-button`, `.date-time-picker__icon-wrap`, `.date-time-picker__input-wrapper`
  Modifiers: `.date-time-picker--has-error`

**`.field-description`**
  Modifiers: `.field-description--margin-bottom`

**`.field-diff`**
  Elements: `.field-diff__locale-label`

**`.field-diff-container`**

**`.field-diff-content`**

**`.field-diff-label`**

**`.field-error`**

**`.field-label`**

**`.field-select`**

**`.field-type`**
  Elements: `.field-type__wrap`

**`.file-field`**
  Elements: `.file-field__add-file-wrap`, `.file-field__dragAndDropText`, `.file-field__dropzoneButtons`, `.file-field__dropzoneContent`, `.file-field__edit`, `.file-field__file-adjustments`, `.file-field__file-selected`, `.file-field__filename`, `.file-field__orText`, `.file-field__previewDrawer`, `.file-field__remote-file`, `.file-field__remote-file-wrap`, `.file-field__remove`, `.file-field__thumbnail-wrap`, `.file-field__upload`, `.file-field__upload-actions`

**`.group-field`**
  Elements: `.group-field__header`, `.group-field__title`
  Modifiers: `.group-field--gutter`, `.group-field--has-error`, `.group-field--top-level`, `.group-field--within-collapsible`, `.group-field--within-group`, `.group-field--within-row`, `.group-field--within-tab`

**`.input-wrapper`**

**`.json-cell`**

**`.json-field`**

**`.nullify-locale-field`**

**`.query-preset-columns-field`**

**`.query-preset-group-by-field`**

**`.query-preset-where-field`**

**`.radio-group`**
  Modifiers: `.radio-group--layout-horizontal`, `.radio-group--read-only`

**`.radio-input`**
  Elements: `.radio-input__label`, `.radio-input__styled-radio`, `.radio-input__styled-radio--disabled`
  Modifiers: `.radio-input--is-selected`

**`.select-all`**
  Elements: `.select-all__checkbox`

**`.select-locales-drawer`**
  Elements: `.select-locales-drawer__content`, `.select-locales-drawer__item`, `.select-locales-drawer__sub-header`

**`.select-row`**
  Elements: `.select-row__checkbox`

**`.tabs-field`**
  Elements: `.tabs-field__content-wrap`, `.tabs-field__description`, `.tabs-field__tab--hidden`, `.tabs-field__tab-button`, `.tabs-field__tab-button--active`, `.tabs-field__tab-button--has-error`, `.tabs-field__tab-button--hidden`, `.tabs-field__tab-button__description`, `.tabs-field__tabs`, `.tabs-field__tabs-wrap`
  Modifiers: `.tabs-field--hidden`, `.tabs-field--within-collapsible`

**`.textarea`**

**`.textarea-outer`**

**`.upload`**
  Elements: `.upload__dragAndDropText`, `.upload__dropzoneAndUpload`, `.upload__dropzoneContent`, `.upload__dropzoneContent__buttons`, `.upload__dropzoneContent__orText`, `.upload__loadingRows`
  Modifiers: `.upload--has-many`

**`.upload--has-many`**
  Elements: `.upload--has-many__drag`, `.upload--has-many__dragItem`, `.upload--has-many__draggable-rows`

**`.upload-field-card`**
  Modifiers: `.upload-field-card--size-medium`, `.upload-field-card--size-small`

**`.upload-relationship-details`**
  Elements: `.upload-relationship-details__actions`, `.upload-relationship-details__details`, `.upload-relationship-details__filename`, `.upload-relationship-details__imageAndDetails`, `.upload-relationship-details__meta`, `.upload-relationship-details__thumbnail`

**`.uploadDocRelationshipContent`**
  Elements: `.uploadDocRelationshipContent__details`


### Overlays
**`.drawer`**
  Elements: `.drawer__blur-bg`, `.drawer__close`, `.drawer__content`, `.drawer__content-children`, `.drawer__header`, `.drawer__header__close`, `.drawer__header__title`
  Modifiers: `.drawer--is-open`

**`.drawer-action-header`**
  Elements: `.drawer-action-header__actions`, `.drawer-action-header__content`, `.drawer-action-header__title`

**`.drawer-close-button`**

**`.drawer-content-container`**

**`.drawer-link`**
  Elements: `.drawer-link__doc-drawer-toggler`

**`.popup`**
  Elements: `.popup__caret`, `.popup__content`, `.popup__hidden-content`, `.popup__on-hover-watch`, `.popup__scroll-container`, `.popup__scroll-container--show-scrollbar`, `.popup__trigger-wrap`
  Modifiers: `.popup--active`, `.popup--size-fit-content`, `.popup--size-large`, `.popup--size-small`, `.popup--size-xsmall`, `.popup--v-bottom`, `.popup--v-top`

**`.popup-button`**
  Modifiers: `.popup-button--background`, `.popup-button--disabled`, `.popup-button--size-large`, `.popup-button--size-medium`, `.popup-button--size-small`, `.popup-button--size-xsmall`

**`.popup-button-list`**
  Elements: `.popup-button-list__button`, `.popup-button-list__button--selected`, `.popup-button-list__disabled`, `.popup-button-list__text-align--center`, `.popup-button-list__text-align--left`, `.popup-button-list__text-align--right`

**`.popup-divider`**

**`.popup-list-group-label`**

**`.tooltip`**
  Modifiers: `.tooltip--caret-center`, `.tooltip--caret-left`, `.tooltip--caret-right`, `.tooltip--position-bottom`, `.tooltip--position-top`, `.tooltip--show`

**`.tooltip-content`**


### Actions
**`.btn`**
  Elements: `.btn__content`, `.btn__icon`, `.btn__label`
  Modifiers: `.btn--disabled`, `.btn--has-tooltip`, `.btn--icon`, `.btn--icon-only`, `.btn--icon-position-left`, `.btn--icon-position-right`, `.btn--icon-style-none`, `.btn--icon-style-without-border`, `.btn--no-margin`, `.btn--size-large`, `.btn--size-medium`, `.btn--size-small`, `.btn--size-xsmall`, `.btn--style-dashed`, `.btn--style-icon-label`, `.btn--style-none`, `.btn--style-pill`, `.btn--style-primary`, `.btn--style-secondary`, `.btn--style-subtle`, `.btn--style-tab`, `.btn--withPopup`

**`.button`**
  Modifiers: `.button--has-action`


### Table
**`.cell-_dragHandle`**

**`.cell-_select`**

**`.cell-with-icon`**

**`.row`**
  Elements: `.row__fields`

**`.row-label`**

**`.sort-by-pill`**
  Elements: `.sort-by-pill__order-option`, `.sort-by-pill__trigger`

**`.sort-column`**
  Elements: `.sort-column__button`, `.sort-column__buttons`, `.sort-column__label`
  Modifiers: `.sort-column--active`, `.sort-column--appearance-condensed`

**`.sort-complex`**

**`.sort-header`**
  Elements: `.sort-header__button`, `.sort-header__buttons`
  Modifiers: `.sort-header--active`, `.sort-header--appearance-condensed`

**`.sort-row`**
  Elements: `.sort-row__icon`

**`.table`**
  Modifiers: `.table--appearance-condensed`, `.table--drag-preview`

**`.table-wrap`**
  Modifiers: `.table-wrap--group-by`


### Other
**`.active-query-preset`**
  Elements: `.active-query-preset__clear`, `.active-query-preset__label`, `.active-query-preset__label-and-clear-wrap`, `.active-query-preset__label-text`, `.active-query-preset__label-text-max-width`, `.active-query-preset__shared`
  Modifiers: `.active-query-preset--active`

**`.api-key`**
  Elements: `.api-key__input-wrap`, `.api-key__toggle-button`, `.api-key__toggle-button-wrap`

**`.app-header`**
  Elements: `.app-header__account`, `.app-header__actions`, `.app-header__actions-wrapper`, `.app-header__bg`, `.app-header__content`, `.app-header__controls-wrapper`, `.app-header__gradient-placeholder`, `.app-header__last-action`, `.app-header__localizer`, `.app-header__localizer-spacing`, `.app-header__mobile-nav-toggler`, `.app-header__step-header`, `.app-header__step-nav-wrapper`, `.app-header__wrapper`
  Modifiers: `.app-header--nav-open`, `.app-header--show-bg`

**`.array-actions`**
  Elements: `.array-actions__action`, `.array-actions__actions`, `.array-actions__button`

**`.auth-fields`**
  Elements: `.auth-fields__api-key-label`, `.auth-fields__changing-password`, `.auth-fields__controls`

**`.banner`**
  Modifiers: `.banner--has-action`, `.banner--has-icon`, `.banner--type-default`, `.banner--type-error`, `.banner--type-success`

**`.block-search`**
  Elements: `.block-search__input`

**`.blocks-drawer`**
  Elements: `.blocks-drawer__block-group`, `.blocks-drawer__block-group-label`, `.blocks-drawer__block-group-none`, `.blocks-drawer__block-groups`, `.blocks-drawer__blocks`, `.blocks-drawer__blocks-wrapper`, `.blocks-drawer__default-image`

**`.bulk-upload`**
  Modifiers: `.bulk-upload--actions-bar`, `.bulk-upload--add-files`, `.bulk-upload--drawer-header`, `.bulk-upload--file-manager`

**`.bulk-upload--actions-bar`**
  Elements: `.bulk-upload--actions-bar__buttons`, `.bulk-upload--actions-bar__controls`, `.bulk-upload--actions-bar__locationText`, `.bulk-upload--actions-bar__navigation`, `.bulk-upload--actions-bar__saveButtons`

**`.bulk-upload--add-files`**
  Elements: `.bulk-upload--add-files__dragAndDropText`, `.bulk-upload--add-files__dropArea`

**`.bulk-upload--file-manager`**
  Elements: `.bulk-upload--file-manager__editView`

**`.card`**
  Elements: `.card__actions`, `.card__click`, `.card__title`
  Modifiers: `.card--has-onclick`

**`.clickable-arrow`**
  Modifiers: `.clickable-arrow--is-disabled`, `.clickable-arrow--left`, `.clickable-arrow--right`

**`.collapsible`**
  Elements: `.collapsible__actions`, `.collapsible__actions-wrap`, `.collapsible__content`, `.collapsible__drag`, `.collapsible__header-wrap`, `.collapsible__header-wrap--has-drag-handle`, `.collapsible__indicator`, `.collapsible__toggle`, `.collapsible__toggle-wrap`
  Modifiers: `.collapsible--collapsed`, `.collapsible--style-default`, `.collapsible--style-error`

**`.collection-edit`**
  Elements: `.collection-edit__auth`, `.collection-edit__form`, `.collection-edit__main`, `.collection-edit__main--is-live-previewing`, `.collection-edit__main--popup-open`, `.collection-edit__main-wrapper`

**`.collection-folder-list`**
  Elements: `.collection-folder-list__header`, `.collection-folder-list__no-results`, `.collection-folder-list__page-controls`, `.collection-folder-list__page-info`, `.collection-folder-list__search-input`, `.collection-folder-list__shimmer`, `.collection-folder-list__step-nav-droppable`, `.collection-folder-list__step-nav-icon-label`, `.collection-folder-list__sub-header`, `.collection-folder-list__wrap`

**`.collection-type`**
  Elements: `.collection-type__count`

**`.combobox`**
  Elements: `.combobox__content`, `.combobox__entry`, `.combobox__search-input`, `.combobox__search-wrapper`, `.combobox__search-wrapper--no-results`

**`.condition`**
  Elements: `.condition__actions`, `.condition__field`, `.condition__inputs`, `.condition__wrap`

**`.condition-value-relationship`**
  Elements: `.condition-value-relationship__error-loading`

**`.confirmation-modal`**
  Elements: `.confirmation-modal__content`, `.confirmation-modal__controls`, `.confirmation-modal__wrapper`

**`.copy-locale-data`**
  Elements: `.copy-locale-data__content`, `.copy-locale-data__sub-header`

**`.default-cell`**
  Elements: `.default-cell__first-cell`

**`.delete-document`**
  Elements: `.delete-document__checkbox`, `.delete-document__toggle`

**`.delete-documents`**
  Elements: `.delete-documents__checkbox`

**`.dots`**
  Modifiers: `.dots--horizontal`, `.dots--no-background`

**`.drag-overlay-selection`**
  Elements: `.drag-overlay-selection__card`, `.drag-overlay-selection__card-count`, `.drag-overlay-selection__cards`

**`.draggable-table-row`**
  Elements: `.draggable-table-row__cell-content`, `.draggable-table-row__drag-handle`, `.draggable-table-row__drop-area`, `.draggable-table-row__first-td`, `.draggable-table-row__last-td`
  Modifiers: `.draggable-table-row--disabled`, `.draggable-table-row--focused`, `.draggable-table-row--over`, `.draggable-table-row--selected`

**`.draggable-with-click`**
  Modifiers: `.draggable-with-click--disabled`

**`.dropdown-indicator`**
  Elements: `.dropdown-indicator__icon`

**`.droppable-button`**
  Modifiers: `.droppable-button--hover`

**`.dropzoneStyle`**
  Modifiers: `.dropzoneStyle--none`

**`.error-pill`**
  Elements: `.error-pill__count`
  Modifiers: `.error-pill--fixed-width`

**`.file`**
  Elements: `.file__filename`, `.file__thumbnail`

**`.file-details`**
  Elements: `.file-details__edit`, `.file-details__file-mutation`, `.file-details__main-detail`, `.file-details__remove`, `.file-details__size-label`, `.file-details__sizes`, `.file-details__toggle-icon`, `.file-details__toggle-more-info`

**`.file-details-draggable`**
  Elements: `.file-details-draggable__actions`, `.file-details-draggable__remove`, `.file-details-draggable__thumbnail`
  Modifiers: `.file-details-draggable--drag-wrapper`

**`.file-meta`**
  Elements: `.file-meta__edit`, `.file-meta__size-type`, `.file-meta__url`

**`.file-selections`**
  Elements: `.file-selections__animateWrapper`, `.file-selections__collectionSelect`, `.file-selections__errorCount`, `.file-selections__fileDetails`, `.file-selections__fileName`, `.file-selections__fileRow`, `.file-selections__fileRowContainer`, `.file-selections__fileRowContainer--active`, `.file-selections__fileRowContainer--error`, `.file-selections__fileSize`, `.file-selections__filesContainer`, `.file-selections__header`, `.file-selections__headerTopRow`, `.file-selections__header__actions`, `.file-selections__header__addFile`, `.file-selections__header__mobileDocActions`, `.file-selections__header__text`, `.file-selections__mobileBlur`, `.file-selections__remove`, `.file-selections__remove--overlay`, `.file-selections__remove--underlay`, `.file-selections__showingFiles`, `.file-selections__thumbnail`, `.file-selections__thumbnail-shimmer`, `.file-selections__toggler`, `.file-selections__toggler__text`

**`.folder-file-card`**
  Elements: `.folder-file-card__assigned-collections`, `.folder-file-card__drop-area`, `.folder-file-card__icon-wrap`, `.folder-file-card__name`, `.folder-file-card__preview-area`, `.folder-file-card__titlebar-area`, `.folder-file-card__titlebar-labels`
  Modifiers: `.folder-file-card--disabled`, `.folder-file-card--file`, `.folder-file-card--over`, `.folder-file-card--selected`

**`.folder-file-table`**
  Elements: `.folder-file-table__cell-with-icon`

**`.folder-list`**
  Elements: `.folder-list__header`, `.folder-list__no-results`, `.folder-list__page-controls`, `.folder-list__page-info`, `.folder-list__search-input`, `.folder-list__shimmer`, `.folder-list__step-nav-droppable`, `.folder-list__step-nav-icon-label`, `.folder-list__sub-header`, `.folder-list__toggle-view-button`, `.folder-list__wrap`

**`.folder-view-toggle-button`**
  Modifiers: `.folder-view-toggle-button--active`

**`.folderBreadcrumbs`**
  Elements: `.folderBreadcrumbs__crumb`, `.folderBreadcrumbs__crumb-chevron`, `.folderBreadcrumbs__crumb-item`

**`.graphic-account`**
  Elements: `.graphic-account__bg`, `.graphic-account__body`, `.graphic-account__head`
  Modifiers: `.graphic-account--active`

**`.group-by-builder`**
  Elements: `.group-by-builder__clear-button`, `.group-by-builder__header`, `.group-by-builder__inputs`

**`.group-by-header`**
  Elements: `.group-by-header__heading`

**`.gutter`**
  Modifiers: `.gutter--left`, `.gutter--negative-left`, `.gutter--negative-right`, `.gutter--right`

**`.hamburger`**
  Elements: `.hamburger__close-icon`, `.hamburger__open-icon`

**`.icon`**
  Modifiers: `.icon--calendar`, `.icon--check`, `.icon--chevron`, `.icon--close-menu`, `.icon--copy`, `.icon--document`, `.icon--dots`, `.icon--drag-handle`, `.icon--edit`, `.icon--externalLink`, `.icon--eye`, `.icon--folder`, `.icon--gear`, `.icon--grid-view`, `.icon--line`, `.icon--link`, `.icon--list-view`, `.icon--lock`, `.icon--logout`, `.icon--menu`, `.icon--more`, `.icon--move-folder`, `.icon--people`, `.icon--plus`, `.icon--search`, `.icon--size-large`, `.icon--size-small`, `.icon--sort`, `.icon--swap`, `.icon--trash`, `.icon--x`

**`.item-card-grid`**
  Elements: `.item-card-grid__title`

**`.item-search`**
  Elements: `.item-search__input`

**`.items-drawer`**
  Elements: `.items-drawer__default-image`, `.items-drawer__item-group`, `.items-drawer__item-group-label`, `.items-drawer__item-group-none`, `.items-drawer__item-groups`, `.items-drawer__items`, `.items-drawer__items-wrapper`

**`.live-preview-toggler`**
  Modifiers: `.live-preview-toggler--active`

**`.live-preview-toolbar`**
  Elements: `.live-preview-toolbar__drag-handle`
  Modifiers: `.live-preview-toolbar--draggable`, `.live-preview-toolbar--static`

**`.live-preview-toolbar-controls`**
  Elements: `.live-preview-toolbar-controls__breakpoint`, `.live-preview-toolbar-controls__device-size`, `.live-preview-toolbar-controls__external`, `.live-preview-toolbar-controls__size`, `.live-preview-toolbar-controls__zoom`

**`.live-preview-window`**
  Elements: `.live-preview-window__main`, `.live-preview-window__wrapper`
  Modifiers: `.live-preview-window--has-breakpoint`, `.live-preview-window--is-live-previewing`

**`.loading-overlay`**
  Elements: `.loading-overlay__bar`, `.loading-overlay__bars`, `.loading-overlay__text`
  Modifiers: `.loading-overlay--entering`, `.loading-overlay--exiting`

**`.localizer-button`**
  Elements: `.localizer-button__chevron`, `.localizer-button__current`, `.localizer-button__label`

**`.locked`**
  Elements: `.locked__tooltip`

**`.move-folder-drawer`**
  Elements: `.move-folder-drawer__add-folder-button`, `.move-folder-drawer__body-section`, `.move-folder-drawer__breadcrumbs-section`, `.move-folder-drawer__folder-breadcrumbs-root`

**`.multi-value`**
  Modifiers: `.multi-value--is-dragging`

**`.multi-value-label`**
  Elements: `.multi-value-label__text`, `.multi-value-label__text--editable`

**`.multi-value-remove`**
  Elements: `.multi-value-remove__icon`

**`.no-results`**
  Elements: `.no-results__actions`

**`.page-controls`**
  Elements: `.page-controls__page-info`

**`.paginator`**
  Elements: `.paginator__page`, `.paginator__page--is-current`, `.paginator__page--is-last-page`, `.paginator__separator`

**`.per-page`**
  Elements: `.per-page__base-button`, `.per-page__button`, `.per-page__button-active`

**`.pill`**
  Elements: `.pill__icon`, `.pill__label`
  Modifiers: `.pill--align-icon-left`, `.pill--has-action`, `.pill--has-icon`, `.pill--is-dragging`, `.pill--rounded`, `.pill--size-medium`, `.pill--size-small`, `.pill--style-always-white`, `.pill--style-dark`, `.pill--style-error`, `.pill--style-light`, `.pill--style-light-gray`, `.pill--style-success`, `.pill--style-warning`, `.pill--style-white`

**`.pill-selector`**
  Elements: `.pill-selector__pill`, `.pill-selector__pill--selected`

**`.point`**
  Elements: `.point__wrap`

**`.preview-sizes`**
  Elements: `.preview-sizes__image`, `.preview-sizes__imageWrap`, `.preview-sizes__list`, `.preview-sizes__listWrap`, `.preview-sizes__meta`, `.preview-sizes__preview`, `.preview-sizes__sizeMeta`, `.preview-sizes__sizeName`, `.preview-sizes__sizeOption`
  Modifiers: `.preview-sizes--selected`

**`.progress-bar`**
  Elements: `.progress-bar__progress`
  Modifiers: `.progress-bar--fade-out`

**`.query-preset-bar`**
  Elements: `.query-preset-bar__create-new-preset`, `.query-preset-bar__menu`, `.query-preset-bar__menu-items`

**`.rah-static`**
  Modifiers: `.rah-static--height-auto`

**`.ReactCrop`**
  Elements: `.ReactCrop__selection-addon`

**`.relationship`**
  Elements: `.relationship__error-loading`, `.relationship__wrap`
  Modifiers: `.relationship--allow-create`, `.relationship--multi-value-label`, `.relationship--single-value`

**`.relationship--multi-value-label`**
  Elements: `.relationship--multi-value-label__content`, `.relationship--multi-value-label__drawer-toggler`, `.relationship--multi-value-label__text`

**`.relationship--single-value`**
  Elements: `.relationship--single-value__drawer-toggler`, `.relationship--single-value__label`, `.relationship--single-value__label-text`, `.relationship--single-value__text`

**`.relationship-add-new`**
  Elements: `.relationship-add-new__add-button`, `.relationship-add-new__add-button--unstyled`

**`.relationship-table`**
  Elements: `.relationship-table__actions`, `.relationship-table__add-new-polymorphic`, `.relationship-table__add-new-polymorphic-wrapper`, `.relationship-table__columns-inner`, `.relationship-table__header`

**`.render-fields`**
  Modifiers: `.render-fields--margins-none`, `.render-fields--margins-small`

**`.render-title`**
  Elements: `.render-title__id`

**`.restore-button`**
  Elements: `.restore-button__checkbox`, `.restore-button__toggle`

**`.restore-many`**
  Elements: `.restore-many__checkbox`, `.restore-many__toggle`

**`.rs`**
  Elements: `.rs__control`, `.rs__control--menu-is-open`, `.rs__group-heading`, `.rs__indicator`, `.rs__indicator-separator`, `.rs__indicators`, `.rs__input`, `.rs__input-container`, `.rs__menu`, `.rs__menu-notice`, `.rs__multi-value`, `.rs__option`, `.rs__option--is-focused`, `.rs__option--is-selected`, `.rs__single-value`, `.rs__value-container`, `.rs__value-container--has-value`, `.rs__value-container--is-multi`

**`.schedule-publish`**
  Elements: `.schedule-publish__actions`, `.schedule-publish__delete`, `.schedule-publish__drawer-header`, `.schedule-publish__scheduler`, `.schedule-publish__type`, `.schedule-publish__upcoming`

**`.search-bar`**
  Elements: `.search-bar__actions`

**`.search-filter`**
  Elements: `.search-filter__input`

**`.section-title`**
  Elements: `.section-title__input`

**`.shimmer-effect`**
  Elements: `.shimmer-effect__shine`

**`.simple-table`**
  Elements: `.simple-table__hidden-cell`, `.simple-table__table`, `.simple-table__td`, `.simple-table__th`, `.simple-table__thead`, `.simple-table__tr`

**`.status`**
  Elements: `.status__action`, `.status__label`, `.status__value`, `.status__value-wrap`

**`.step-nav`**
  Elements: `.step-nav__home`

**`.thumbnail`**
  Modifiers: `.thumbnail--size-expand`, `.thumbnail--size-large`, `.thumbnail--size-medium`, `.thumbnail--size-none`, `.thumbnail--size-small`

**`.thumbnail-card`**
  Elements: `.thumbnail-card__label`, `.thumbnail-card__thumbnail`
  Modifiers: `.thumbnail-card--align-label-center`, `.thumbnail-card--has-on-click`

**`.value-container`**
  Elements: `.value-container__label`

**`.where-builder`**
  Elements: `.where-builder__and-filters`, `.where-builder__no-filters`, `.where-builder__or-filters`


---

## Components (149 total)


### Elements (84)

| Component | BEM Block | CSS Var Refs | Style Rules | Key Vars |
|-----------|-----------|--------------|-------------|----------|
| AddNewRelation | .relationship-add-new | 0 | 9 | — |
| AnimateHeight | .rah-static | 0 | 1 | — |
| AppHeader | .app-header | 9 | 47 | --app-header-height, --z-modal, --accessibility-outline |
| ArrayAction | .array-actions | 1 | 6 | --theme-elevation-0 |
| Autosave | .autosave | 0 | 0 | — |
| Banner | .banner | 12 | 14 | --theme-elevation-100, --theme-elevation-800, --theme-elevation-900 |
| Button | .btn | 70 | 147 | --theme-elevation-0, --theme-elevation-800, --theme-elevation-600 |
| Card | .card | 4 | 21 | --theme-elevation-50, --style-radius-m, --theme-elevation-0 |
| CheckboxPopup | .checkbox-popup | 0 | 2 | — |
| CloseModalButton | .close-modal-button | 2 | 11 | --base |
| CodeEditor | .code-editor | 0 | 5 | — |
| Collapsible | .collapsible | 10 | 26 | --theme-elevation-50, --theme-elevation-100, --toggle-pad-v |
| Combobox | .combobox | 6 | 12 | --popup-padding, --theme-elevation-50, --theme-text |
| ConfirmationModal | .confirmation-modal | 0 | 4 | — |
| CopyLocaleData | .copy-locale-data | 1 | 5 | --base |
| CopyToClipboard | .copy-to-clipboard | 1 | 2 | --accessibility-outline |
| DatePicker | .react-datepicker | 26 | 65 | --theme-error-200, --theme-input-bg, --font-body |
| DefaultListViewTabs | .default-list-view-tabs | 0 | 1 | — |
| DeleteDocument | .delete-document | 0 | 3 | — |
| DeleteMany | .delete-documents | 0 | 2 | — |
| DocumentControls | .doc-controls | 14 | 71 | --theme-elevation-100, --base, --doc-controls-height |
| DocumentDrawer | .doc-drawer | 0 | 3 | — |
| DocumentFields | .document-fields | 34 | 75 | --gutter-h, --main-width, --main-gutter-h-left |
| DocumentLocked | .document-locked | 3 | 7 | --base |
| DocumentStaleData | .document-stale-data | 2 | 5 | --base |
| DocumentTakeOver | .document-take-over | 3 | 7 | --base |
| Drawer | .drawer | 3 | 29 | --theme-bg, --theme-elevation-800, --color-base-1000 |
| DrawerActionHeader | .drawer-action-header | 4 | 8 | --gutter-h, --base |
| DrawerContentContainer | .drawer-content-container | 0 | 1 | — |
| Dropzone | .dropzone | 3 | 8 | --style-radius-s, --theme-success-500, --theme-success-150 |
| EditMany | .edit-many | 4 | 38 | --z-nav, --gutter-h |
| EditUpload | .edit-upload | 11 | 51 | --edit-upload-cell-spacing, --gutter-h, --edit-upload-sidebar-width |
| EmailAndUsername | .login-fields | 1 | 1 | --base |
| ErrorPill | .error-pill | 3 | 13 | --style-radius-l, --theme-error-300, --theme-error-950 |
| FieldDiffContainer | .field-diff | 3 | 7 | --theme-elevation-100, --style-radius-s, --theme-elevation-50 |
| FieldDiffLabel | .field-diff-label | 0 | 3 | — |
| FieldSelect | .field-select | 0 | 0 | — |
| GroupByBuilder | .group-by-builder | 3 | 9 | --theme-elevation-50, --base, --theme-elevation-500 |
| Gutter | .gutter | 2 | 4 | --gutter-h |
| Hamburger | .hamburger | 6 | 14 | --theme-bg, --theme-text, --base |
| HTMLDiff | .html-diff-create-inline-wrapper | 17 | 35 | --theme-elevation-400, --diff-create-parent-bg, --diff-create-parent-color |
| IDLabel | .id-label | 2 | 2 | --theme-elevation-600, --theme-elevation-100 |
| ItemsDrawer | .items-drawer | 0 | 9 | — |
| ListControls | .list-controls | 0 | 2 | — |
| ListHeader | .list-header | 0 | 9 | — |
| ListSelection | .list-selection | 2 | 5 | --theme-elevation-500, --theme-elevation-800 |
| Loading | .loading-overlay | 2 | 19 | --theme-elevation-0, --font-body |
| Localizer | .localizer | 0 | 0 | — |
| Locked | .locked | 0 | 2 | — |
| NavGroup | .nav-group | 4 | 11 | --theme-elevation-400, --theme-elevation-1000, --theme-elevation-200 |
| NoListResults | .no-results | 2 | 8 | --style-radius-m, --base |
| PageControls | .page-controls | 0 | 3 | — |
| Pagination | .paginator | 6 | 9 | --theme-elevation-100, --theme-elevation-400, --style-radius-s |
| PerPage | .per-page | 2 | 6 | --theme-elevation-500, --theme-text |
| Pill | .pill | 29 | 51 | --theme-elevation-150, --theme-elevation-800, --pill-padding-block-start |
| PillSelector | .pill-selector | 5 | 11 | --theme-elevation-50, --base, --theme-elevation-100 |
| Popup | .popup | 8 | 22 | --theme-elevation-150, --z-popup, --theme-input-bg |
| PreviewButton | .preview-btn | 6 | 11 | --theme-elevation-100, --style-radius-s, --btn-line-height |
| PreviewSizes | .preview-sizes | 4 | 32 | --theme-elevation-600, --gutter-h, --theme-elevation-100 |
| ReactSelect | .rs | 9 | 14 | --theme-elevation-1000, --font-body, --theme-input-bg |
| RelationshipTable | .relationship-table | 3 | 8 | --base |
| RenderTitle | .render-title | 0 | 0 | — |
| RestoreButton | .restore-button | 0 | 3 | — |
| RestoreMany | .restore-many | 0 | 3 | — |
| SearchBar | .search-bar | 6 | 21 | --theme-elevation-50, --search-bg, --style-radius-m |
| SearchFilter | .search-filter | 1 | 5 | --theme-elevation-50 |
| SelectAll | .select-all | 0 | 0 | — |
| SelectRow | .select-row | 0 | 0 | — |
| ShimmerEffect | .shimmer-effect | 1 | 6 | --theme-elevation-50 |
| SortColumn | .sort-column | 0 | 10 | — |
| SortComplex | .sort-complex | 2 | 6 | --theme-elevation-100, --theme-elevation-400 |
| SortHeader | .sort-header | 0 | 10 | — |
| SortRow | .sort-row | 0 | 4 | — |
| Status | .status | 1 | 2 | --theme-elevation-500 |
| StepNav | .step-nav | 2 | 16 | --base, --accessibility-outline |
| StickyToolbar | .sticky-toolbar | 4 | 9 | --base, --theme-bg, --style-radius-m |
| Table | .table | 13 | 20 | --theme-elevation-400, --base, --theme-elevation-50 |
| Thumbnail | .thumbnail | 0 | 8 | — |
| ThumbnailCard | .thumbnail-card | 2 | 6 | --theme-input-bg, --style-radius-m |
| TimezonePicker | .rs | 2 | 10 | --theme-elevation-400, --base |
| Tooltip | .tooltip | 10 | 28 | --theme-elevation-800, --theme-elevation-0, --caret-size |
| TrashBanner | .trash-banner | 5 | 7 | --base, --style-radius-s, --theme-warning-100 |
| Upload | .file-field | 7 | 33 | --base, --theme-elevation-50, --style-radius-s |
| WhereBuilder | .where-builder | 2 | 10 | --theme-elevation-50, --base |

### Fields (25)

| Component | BEM Block | CSS Var Refs | Style Rules | Key Vars |
|-----------|-----------|--------------|-------------|----------|
| Array | .array-field | 11 | 19 | --theme-text, --theme-elevation-800, --theme-elevation-600 |
| Blocks | .blocks-field | 8 | 21 | --theme-text, --theme-error-500, --theme-elevation-400 |
| Checkbox | .checkbox-input | 2 | 24 | --theme-elevation-250, --theme-elevation-400 |
| Code | .code-field | 2 | 3 | --theme-error-500, --theme-error-50 |
| Collapsible | .collapsible-field | 0 | 0 | — |
| ConfirmPassword | .field-type | 0 | 0 | — |
| DateTime | . | 0 | 0 | — |
| Email | .field-type | 1 | 1 | --theme-error-200 |
| FieldDescription | .field-description | 1 | 4 | --theme-elevation-400 |
| FieldError | .field-error | 5 | 8 | --font-body, --theme-error-950, --theme-error-300 |
| FieldLabel | .field-label | 3 | 3 | --theme-elevation-800, --font-body, --theme-error-500 |
| Group | .group-field | 7 | 51 | --base, --gutter-h, --theme-error-750 |
| JSON | .json-field | 2 | 2 | --theme-error-500, --theme-error-50 |
| Number | .field-type | 0 | 0 | — |
| Password | .field-type | 0 | 0 | — |
| Point | .point | 0 | 4 | — |
| RadioGroup | .radio-input | 3 | 8 | --theme-elevation-50, --theme-elevation-400, --theme-elevation-250 |
| Relationship | .relationship | 2 | 8 | --theme-error-500, --theme-elevation-0 |
| Row | .row | 1 | 14 | --base |
| Select | .field-type | 0 | 0 | — |
| Slug | .slug-field-component | 0 | 4 | — |
| Tabs | .tabs-field | 3 | 11 | --gutter-h |
| Text | .field-type | 0 | 0 | — |
| Textarea | .field-type | 0 | 1 | — |
| Upload | .upload | 3 | 11 | --theme-elevation-500, --style-radius-s |

### Views (4)

| Component | BEM Block | CSS Var Refs | Style Rules | Key Vars |
|-----------|-----------|--------------|-------------|----------|
| BrowseByFolder | .folder-list | 6 | 33 | --theme-elevation-150, --spacing-view-bottom, --base |
| CollectionFolder | .collection-folder-list | 5 | 30 | --spacing-view-bottom, --base, --gutter-h |
| Edit | .collection-edit | 3 | 14 | --gradient, --style-radius-s, --base |
| List | .collection-list | 7 | 30 | --spacing-view-bottom, --base, --theme-bg |

### Widgets (1)

| Component | BEM Block | CSS Var Refs | Style Rules | Key Vars |
|-----------|-----------|--------------|-------------|----------|
| CollectionCards | .collections | 5 | 18 | --base, --gap |

### Forms (4)

| Component | BEM Block | CSS Var Refs | Style Rules | Key Vars |
|-----------|-----------|--------------|-------------|----------|
| Form | . | 0 | 1 | — |
| NullifyField | .nullify-locale-field | 0 | 3 | — |
| RenderFields | .render-fields | 3 | 12 | --base, --spacing-field |
| Submit | .btn | 0 | 1 | — |

### Icons (30)

| Component | BEM Block | CSS Var Refs | Style Rules | Key Vars |
|-----------|-----------|--------------|-------------|----------|
| Calendar | .icon | 0 | 0 | — |
| Check | .icon | 0 | 0 | — |
| Chevron | .icon | 4 | 6 | --base |
| CloseMenu | .icon | 0 | 0 | — |
| Copy | .icon | 0 | 0 | — |
| Document | .icon | 2 | 2 | --base |
| Dots | .dots | 2 | 9 | --theme-elevation-150, --theme-elevation-250 |
| DragHandle | .icon | 1 | 1 | --theme-elevation-800 |
| Edit | .icon | 0 | 0 | — |
| ExternalLink | .icon | 0 | 0 | — |
| Eye | .icon | 0 | 1 | — |
| Folder | .icon | 2 | 2 | --base |
| Gear | .icon | 2 | 3 | --base |
| GridView | .icon | 0 | 0 | — |
| Line | .icon | 0 | 0 | — |
| Link | .icon | 0 | 0 | — |
| ListView | .icon | 0 | 0 | — |
| Lock | .stroke | 0 | 0 | — |
| LogOut | .icon | 0 | 1 | — |
| Menu | .stroke | 0 | 0 | — |
| More | .icon | 1 | 1 | --theme-elevation-800 |
| MoveFolder | .icon | 2 | 2 | --base |
| People | .stroke | 0 | 0 | — |
| Plus | .stroke | 0 | 0 | — |
| Search | .icon | 0 | 0 | — |
| Sort | .icon | 1 | 1 | --theme-elevation-800 |
| Swap | .icon | 0 | 0 | — |
| ThreeDots | .icon | 0 | 7 | — |
| Trash | .icon | 2 | 2 | --base |
| X | .stroke | 0 | 0 | — |

### Providers (1)

| Component | BEM Block | CSS Var Refs | Style Rules | Key Vars |
|-----------|-----------|--------------|-------------|----------|
| LivePreview | .live-preview | 2 | 11 | --gutter-h, --gradient |
