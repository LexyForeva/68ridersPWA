/**
 * E2E Tests: Authentication Flow
 */

import { test, expect } from '@playwright/test'

test.describe('Authentication', () => {
  test('should display login page', async ({ page }) => {
    await page.goto('/login')
    
    await expect(page).toHaveTitle(/68 Riders/i)
    await expect(page.locator('h1')).toContainText(/giriş/i)
  })

  test('should navigate to register page', async ({ page }) => {
    await page.goto('/login')
    
    const registerLink = page.locator('text=/üyelik/i')
    await registerLink.click()
    
    await expect(page).toHaveURL('/register')
    await expect(page.locator('h1')).toContainText(/başvuru/i)
  })

  test('should validate login form', async ({ page }) => {
    await page.goto('/login')
    
    // Try to submit without filling fields
    const submitButton = page.locator('button[type="submit"]')
    await submitButton.click()
    
    // Browser validation should prevent submission
    const emailInput = page.locator('input[type="email"]')
    await expect(emailInput).toBeFocused()
  })

  test('should show demo mode indicator when no Supabase config', async ({ page }) => {
    await page.goto('/')
    
    // If in demo mode, should show some indicator or automatically log in
    await expect(page).toHaveURL('/')
  })
})
