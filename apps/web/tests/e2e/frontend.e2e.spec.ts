import { test, expect } from '@playwright/test'

test.describe('Landing page', () => {
  test('renders with correct title', async ({ page }) => {
    await page.goto('/')
    await expect(page).toHaveTitle(/payloadtwist/)
  })

  test('has navigation links', async ({ page }) => {
    await page.goto('/')
    await expect(page.getByRole('link', { name: /editor/i })).toBeVisible()
    await expect(page.getByRole('link', { name: /gallery/i })).toBeVisible()
  })
})

test.describe('Editor page', () => {
  test('loads without error', async ({ page }) => {
    await page.goto('/editor')
    await expect(page).toHaveTitle(/editor/i)
  })
})

test.describe('404 page', () => {
  test('shows custom not-found page', async ({ page }) => {
    const response = await page.goto('/nonexistent-page-abc123')
    expect(response?.status()).toBe(404)
    await expect(page.getByText('Page not found')).toBeVisible()
  })
})
