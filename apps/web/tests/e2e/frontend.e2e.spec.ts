import { test, expect, type Page } from '@playwright/test'

const previewVar = (page: Page, name: string) =>
  page.evaluate((v) => {
    const doc = (document.getElementById('payload-preview') as HTMLIFrameElement).contentDocument!
    return getComputedStyle(doc.documentElement).getPropertyValue(v).trim()
  }, name)

test.describe('Landing page', () => {
  test('renders with Payload v4 copy and real generated CSS', async ({ page }) => {
    await page.goto('/')
    await expect(page).toHaveTitle(/payloadtwist/)
    await expect(page.getByRole('link', { name: /editor/i }).first()).toBeVisible()
    await expect(page.getByText("html [data-theme='dark'] {")).toBeVisible()
  })
})

test.describe('Embedded Payload v4 admin', () => {
  test('dashboard, list, edit and gallery render', async ({ page }) => {
    for (const [path, text] of [
      ['/preview', 'Editorial overview'],
      ['/preview/collections/posts', 'Create New'],
      ['/preview/gallery', 'Component gallery'],
      ['/preview/collections/field-showcase/1', 'Spring campaign launch'],
    ] as const) {
      await page.goto(path)
      await expect(page.getByText(text).first()).toBeVisible({ timeout: 30_000 })
    }
  })

  test('rejects writes', async ({ request }) => {
    const res = await request.patch('/preview-api/posts/1', { data: { title: 'hacked' } })
    expect(res.status()).toBe(403)
  })
})

test.describe('Editor', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/editor')
    await page.evaluate(() => localStorage.removeItem('payloadtwist-editor-v4'))
    await page.reload()
    // the bridge inside the preview announces itself and receives the theme CSS
    await expect
      .poll(
        () =>
          page.evaluate(() => {
            const f = document.getElementById('payload-preview') as HTMLIFrameElement | null
            return !!f?.contentDocument?.getElementById('payloadtwist-theme')
          }),
        { timeout: 30_000 },
      )
      .toBe(true)
  })

  test('applies a preset to the live preview and follows dark mode', async ({ page }) => {
    await page.getByRole('button', { name: 'Light Cream' }).click()
    await expect.poll(() => previewVar(page, '--ramp-blue-500')).toBe('#5f9a55')
    const lightBg = await previewVar(page, '--color-bg')
    expect(lightBg).not.toBe('#fff')

    await page.getByRole('button', { name: 'Preview dark mode' }).click()
    await expect.poll(() => previewVar(page, '--color-bg')).not.toBe(lightBg)

    await page.getByRole('button', { name: 'Undo' }).click()
    await expect.poll(() => previewVar(page, '--ramp-blue-500')).toBe('#0d99ff')
  })

  test('exports custom.css', async ({ page }) => {
    await page.getByRole('button', { name: 'Brutal' }).click()
    await page.getByRole('button', { name: /^Export/ }).click()
    const dialog = page.getByRole('dialog')
    await expect(dialog.getByText('--radius-medium: 0rem;')).toBeVisible()
    await dialog.getByRole('tab', { name: 'Theme package' }).click()
    await expect(dialog.getByText(/html\[data-admin-theme="my-theme"\]/).first()).toBeVisible()
  })
})

test.describe('404 page', () => {
  test('shows custom not-found page', async ({ page }) => {
    const response = await page.goto('/nonexistent-page-abc123')
    expect(response?.status()).toBe(404)
    await expect(page.getByText('Page not found')).toBeVisible()
  })
})
