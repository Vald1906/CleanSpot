import { test, expect } from '@playwright/test';

const NAV_OPTS = { waitUntil: 'commit' as const };

test.describe('Admin & Association Routes - Security & UI', () => {

  // --- ADMIN ---
  test('1. Admin Dashboard should redirect to login if unauthenticated', async ({ page }) => {
    await page.goto('/admin/associations', NAV_OPTS);
    await expect(page).toHaveURL(/.*(login|signin).*/);
  });

  test('2. Admin Spots should redirect to login if unauthenticated', async ({ page }) => {
    await page.goto('/admin/spots', NAV_OPTS);
    await expect(page).toHaveURL(/.*(login|signin).*/);
  });

  // --- ASSOCIATION ---
  test('3. Association Dashboard should redirect to login if unauthenticated', async ({ page }) => {
    await page.goto('/association/dashboard', NAV_OPTS);
    await expect(page).toHaveURL(/.*(login|signin).*/);
  });

  test('4. Association Profile should redirect to login if unauthenticated', async ({ page }) => {
    await page.goto('/association/profil', NAV_OPTS);
    await expect(page).toHaveURL(/.*(login|signin).*/);
  });

  // --- UI Elements (if accessible or redirected) ---
  test('5. Should see login form when trying to access admin', async ({ page }) => {
    await page.goto('/admin/associations');
    await expect(page.locator('form').first()).toBeVisible();
  });

  test('6. Should see login form when trying to access association dash', async ({ page }) => {
    await page.goto('/association/dashboard');
    await expect(page.locator('form').first()).toBeVisible();
  });

});
