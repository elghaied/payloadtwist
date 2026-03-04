/**
 * Build a form initial state object for a single field.
 *
 * Usage:
 * ```tsx
 * <Form initialState={buildFormState('title', 'Hello World')}>
 * ```
 */
export function buildFormState(
  fieldName: string,
  initialValue?: unknown,
): Record<string, unknown> {
  return {
    [fieldName]: {
      value: initialValue ?? '',
      valid: true,
      initialValue: initialValue ?? '',
    },
  }
}

/**
 * Build form initial state for multiple fields at once.
 *
 * Usage:
 * ```tsx
 * <Form initialState={buildMultiFieldState({
 *   title: 'Hello',
 *   category: 'blog',
 *   published: true,
 * })}>
 * ```
 */
export function buildMultiFieldState(
  fields: Record<string, unknown>,
): Record<string, unknown> {
  const state: Record<string, unknown> = {}
  for (const [name, value] of Object.entries(fields)) {
    state[name] = {
      value,
      valid: true,
      initialValue: value,
    }
  }
  return state
}

/**
 * Build a minimal field config object suitable for Payload field components.
 *
 * Usage:
 * ```tsx
 * <TextField path="title" field={buildFieldConfig({ name: 'title', label: 'Title', type: 'text' })} />
 * ```
 */
export function buildFieldConfig(config: {
  name: string
  label?: string
  type?: string
  required?: boolean
  admin?: Record<string, unknown>
  options?: Array<{ label: string; value: string }>
  [key: string]: unknown
}) {
  return {
    name: config.name,
    label: config.label ?? config.name,
    type: config.type ?? 'text',
    required: config.required ?? false,
    admin: config.admin ?? {},
    ...(config.options ? { options: config.options } : {}),
  }
}
