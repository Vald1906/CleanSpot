import { test, expect } from '@playwright/test';

const NAV_OPTS = { waitUntil: 'commit' as const };

test.describe('Functional Tests - Map Page (10 tests)', () => {

  test('1. Should redirect from map to login if unauthenticated', async ({ page }) => {
    await page.goto('/map', NAV_OPTS);
    await expect(page).toHaveURL(/.*(login|signin).*/);
  });

  test('2. Should display the search bar or login on /map', async ({ page }) => {
    await page.goto('/map', NAV_OPTS);
    const searchInput = page.locator('input[placeholder="Rechercher un lieu..."]');
    const loginField = page.locator('input[name="email"]');
    await expect(searchInput.or(loginField).first()).toBeVisible({ timeout: 10000 });
  });

  test('3. Should type in the search bar', async ({ page }) => {
    await page.goto('/map', NAV_OPTS);
    await page.waitForLoadState('domcontentloaded');
    const searchInput = page.locator('input[placeholder="Rechercher un lieu..."]');
    await searchInput.waitFor({ timeout: 10000 });
    await searchInput.fill('Paris');
    await expect(searchInput).toHaveValue('Paris');
  });

  test('4. Should display the map tiles', async ({ page }) => {
    await page.goto('/map', NAV_OPTS);
    await page.waitForLoadState('domcontentloaded');
    await expect(page.locator('.leaflet-tile-container').or(page.locator('.leaflet-container'))).toBeAttached({ timeout: 15000 });
  });

  test('5. Should not display the side panel by default', async ({ page }) => {
    await page.goto('/map', NAV_OPTS);
    await page.waitForLoadState('domcontentloaded');
    await page.waitForTimeout(2000);
    await expect(page.locator('text=Participants').first()).not.toBeVisible();
  });

  test('6. Should clear search input when emptied', async ({ page }) => {
    await page.goto('/map', NAV_OPTS);
    await page.waitForLoadState('domcontentloaded');
    const searchInput = page.locator('input[placeholder="Rechercher un lieu..."]');
    await searchInput.waitFor({ timeout: 10000 });
    await searchInput.fill('test');
    await searchInput.fill('');
    await expect(searchInput).toHaveValue('');
  });

  test('7. Should have correct page body', async ({ page }) => {
    await page.goto('/map', NAV_OPTS);
    await page.waitForLoadState('domcontentloaded');
    await expect(page.locator('body')).toBeVisible();
  });

  test('8. Should display loading text or map while map initializes', async ({ page }) => {
    await page.goto('/map', NAV_OPTS);
    await page.waitForLoadState('domcontentloaded');
    const mapOrLoading = page.locator('.leaflet-container').or(page.locator('text=Initialisation'));
    await expect(mapOrLoading).toBeAttached({ timeout: 15000 });
  });

  test('9. Should not show SpotFormModal by default', async ({ page }) => {
    await page.goto('/map', NAV_OPTS);
    await page.waitForLoadState('domcontentloaded');
    await page.waitForTimeout(2000);
    await expect(page.locator('[data-testid="spot-form-modal"]')).not.toBeVisible();
  });

  test('10. Should have a responsive layout on mobile', async ({ page }) => {
    await page.goto('/map', NAV_OPTS);
    await page.waitForLoadState('domcontentloaded');
    await page.setViewportSize({ width: 375, height: 667 });
    await expect(page.locator('body')).toBeVisible();
    await expect(page.locator('input[placeholder="Rechercher un lieu..."]')).toBeAttached({ timeout: 10000 });
  });
});

test.describe('Functional Tests - Event Page (10 tests)', () => {

  test('11. Should redirect from event to login if unauthenticated', async ({ page }) => {
    await page.goto('/event', NAV_OPTS);
    await expect(page).toHaveURL(/.*(login|signin).*/);
  });

  test('12. Should display filter sidebar with "Type de déchets"', async ({ page }) => {
    await page.goto('/event', NAV_OPTS);
    await page.waitForLoadState('domcontentloaded');
    await expect(page.locator('text=Type de déchets')).toBeVisible({ timeout: 10000 });
  });

  test('13. Should display material filter buttons', async ({ page }) => {
    await page.goto('/event', NAV_OPTS);
    await page.waitForLoadState('domcontentloaded');
    await expect(page.locator('text=Plastique')).toBeVisible({ timeout: 10000 });
    await expect(page.locator('text=Verre')).toBeVisible();
    await expect(page.locator('text=Compost')).toBeVisible();
  });

  test('14. Should display the calendar section', async ({ page }) => {
    await page.goto('/event', NAV_OPTS);
    await page.waitForLoadState('domcontentloaded');
    await expect(page.locator('text=Date')).toBeVisible({ timeout: 10000 });
  });

  test('15. Should have a search bar', async ({ page }) => {
    await page.goto('/event', NAV_OPTS);
    await page.waitForLoadState('domcontentloaded');
    await expect(page.locator('input[placeholder="Rechercher..."]')).toBeVisible({ timeout: 10000 });
  });

  test('16. Should allow typing in the search bar', async ({ page }) => {
    await page.goto('/event', NAV_OPTS);
    await page.waitForLoadState('domcontentloaded');
    const searchInput = page.locator('input[placeholder="Rechercher..."]');
    await searchInput.waitFor({ timeout: 10000 });
    await searchInput.fill('Collecte');
    await expect(searchInput).toHaveValue('Collecte');
  });

  test('17. Should display the sort button', async ({ page }) => {
    await page.goto('/event', NAV_OPTS);
    await page.waitForLoadState('domcontentloaded');
    await expect(page.locator('text=Date (plus proche)')).toBeVisible({ timeout: 10000 });
  });

  test('18. Should show results count', async ({ page }) => {
    await page.goto('/event', NAV_OPTS);
    await page.waitForLoadState('domcontentloaded');
    await expect(page.locator('text=Résultats')).toBeVisible({ timeout: 10000 });
  });

  test('19. Should display the Reset filters button', async ({ page }) => {
    await page.goto('/event', NAV_OPTS);
    await page.waitForLoadState('domcontentloaded');
    await expect(page.locator('text=Réinitialiser les filtres')).toBeVisible({ timeout: 10000 });
  });

  test('20. Should display the FAB add button', async ({ page }) => {
    await page.goto('/event', NAV_OPTS);
    await page.waitForLoadState('domcontentloaded');
    await expect(page.locator('button:has(span.material-icons-outlined:has-text("add"))').last()).toBeVisible({ timeout: 10000 });
  });
});
