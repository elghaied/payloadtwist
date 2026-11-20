import { execFileSync } from 'node:child_process'
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

  test('lookbook spreads open their theme in the editor', async ({ page }) => {
    await page.goto('/')
    await page.getByRole('link', { name: 'Try Brutal in the editor' }).click()
    await expect(page).toHaveURL(/\/editor$/)
    await expect(page.getByRole('button', { name: /Export/ })).toContainText(/\d+/)
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

  test('registers payloadtwist themes with payload-admin-ui-themes', async ({ page }) => {
    await page.goto('/preview')
    await expect(page.getByText('Editorial overview')).toBeVisible({ timeout: 30_000 })
    // the plugin stores the choice per user (demo user id 1)
    await page.evaluate(() => localStorage.setItem('payload-admin-ui-theme:1', 'corporate'))
    await page.reload()
    await expect(page.locator('html')).toHaveAttribute('data-admin-theme', 'corporate')
    await expect
      .poll(() => page.evaluate(() => getComputedStyle(document.documentElement).getPropertyValue('--ramp-blue-500').trim()))
      .toBe('#1d4ed8')
    await page.evaluate(() => localStorage.removeItem('payload-admin-ui-theme:1'))
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

    const [download] = await Promise.all([page.waitForEvent('download'), dialog.getByRole('button', { name: /Download \.zip/ }).click()])
    expect(download.suggestedFilename()).toBe('my-theme-payload-theme.zip')
    const file = await download.path()
    const listing = execFileSync('unzip', ['-l', file]).toString()
    for (const f of ['theme.css', 'client.tsx', 'index.ts', 'README.md']) expect(listing).toContain(`my-theme/${f}`)
    expect(execFileSync('unzip', ['-p', file, 'my-theme/theme.css']).toString()).toContain('--radius-medium: 0rem;')
  })
})

test.describe('404 page', () => {
  test('shows custom not-found page', async ({ page }) => {
    const response = await page.goto('/nonexistent-page-abc123')
    expect(response?.status()).toBe(404)
    await expect(page.getByText('Page not found')).toBeVisible()
  })
})
