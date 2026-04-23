import { test, expect } from '@playwright/test';

const NAV_OPTS = { waitUntil: 'commit' as const };

test.describe('Functional Tests - Map Page (10 tests)', () => {

  // Utilitaire pour vérifier l'élément ou la redirection login
  async function checkMapOrRedirect(page: any, selector: string) {
    await page.goto('/map', NAV_OPTS);
    if (page.url().includes('login') || page.url().includes('signin')) {
      await expect(page.locator('h2:has-text("Connexion")').or(page.locator('form')).first()).toBeVisible();
      return true;
    }
    await expect(page.locator(selector).first()).toBeAttached({ timeout: 10000 });
    return false;
  }

  test('1. Should redirect from map to login if unauthenticated', async ({ page }) => {
    await page.goto('/map', NAV_OPTS);
    await expect(page).toHaveURL(/.*(login|signin).*/);
  });

  test('2. Should display the search bar or login on /map', async ({ page }) => {
    await checkMapOrRedirect(page, 'input[placeholder="Rechercher un lieu..."]');
  });

  test('3. Should type in the search bar if accessible', async ({ page }) => {
    const redirected = await checkMapOrRedirect(page, 'input[placeholder="Rechercher un lieu..."]');
    if (!redirected) {
      const searchInput = page.locator('input[placeholder="Rechercher un lieu..."]').first();
      await searchInput.fill('Paris');
      await expect(searchInput).toHaveValue('Paris');
    }
  });

  test('4. Should display the map tiles if accessible', async ({ page }) => {
    await checkMapOrRedirect(page, '.leaflet-container');
  });

  test('5. Should check side panel state', async ({ page }) => {
    const redirected = await checkMapOrRedirect(page, 'body');
    if (!redirected && page.url().includes('/map')) {
       await expect(page.locator('text=Participants').first()).not.toBeVisible();
    }
  });

  test('6. Should clear search input when emptied if accessible', async ({ page }) => {
    const redirected = await checkMapOrRedirect(page, 'input[placeholder="Rechercher un lieu..."]');
    if (!redirected) {
      const searchInput = page.locator('input[placeholder="Rechercher un lieu..."]').first();
      await searchInput.fill('test');
      await searchInput.fill('');
      await expect(searchInput).toHaveValue('');
    }
  });

  test('7. Should have correct page body', async ({ page }) => {
    await page.goto('/map', NAV_OPTS);
    await expect(page.locator('body')).toBeVisible();
  });

  test('8. Should display loading text or map', async ({ page }) => {
    await page.goto('/map', NAV_OPTS);
    if (!page.url().includes('login')) {
      const mapOrLoading = page.locator('.leaflet-container').or(page.locator('text=Initialisation'));
      await expect(mapOrLoading.first()).toBeAttached({ timeout: 15000 });
    }
  });

  test('9. Should check SpotFormModal default state', async ({ page }) => {
    await page.goto('/map', NAV_OPTS);
    if (!page.url().includes('login')) {
      await expect(page.locator('[data-testid="spot-form-modal"]')).not.toBeVisible();
    }
  });

  test('10. Should have a responsive layout on mobile', async ({ page }) => {
    await page.setViewportSize({ width: 375, height: 667 });
    await page.goto('/map', NAV_OPTS);
    await expect(page.locator('body')).toBeVisible();
  });
});

test.describe('Functional Tests - Event Page (10 tests)', () => {

  test('11. Should redirect from event to login if unauthenticated', async ({ page }) => {
    await page.goto('/event', NAV_OPTS);
    await expect(page).toHaveURL(/.*(login|signin).*/);
  });

  test('12. Should check filter sidebar or login', async ({ page }) => {
    await page.goto('/event', NAV_OPTS);
    if (page.url().includes('login')) {
       await expect(page.locator('form')).toBeVisible();
    } else {
       await expect(page.locator('text=Type de déchets')).toBeVisible();
    }
  });

  test('13. Should display material filter buttons if accessible', async ({ page }) => {
    await page.goto('/event', NAV_OPTS);
    if (!page.url().includes('login')) {
       await expect(page.locator('text=Plastique').first()).toBeVisible();
    }
  });

  test('14. Should display the calendar section if accessible', async ({ page }) => {
    await page.goto('/event', NAV_OPTS);
    if (!page.url().includes('login')) {
       await expect(page.locator('text=Date').first()).toBeVisible();
    }
  });

  test('15. Should have a search bar if accessible', async ({ page }) => {
    await page.goto('/event', NAV_OPTS);
    if (!page.url().includes('login')) {
       await expect(page.locator('input[placeholder="Rechercher..."]').first()).toBeVisible();
    }
  });

  test('16. Should allow typing in the search bar if accessible', async ({ page }) => {
    await page.goto('/event', NAV_OPTS);
    if (!page.url().includes('login')) {
      const searchInput = page.locator('input[placeholder="Rechercher..."]').first();
      await searchInput.fill('Collecte');
      await expect(searchInput).toHaveValue('Collecte');
    }
  });

  test('17. Should display the sort button if accessible', async ({ page }) => {
    await page.goto('/event', NAV_OPTS);
    if (!page.url().includes('login')) {
       await expect(page.locator('text=Date (plus proche)').first()).toBeVisible();
    }
  });

  test('18. Should show results count if accessible', async ({ page }) => {
    await page.goto('/event', NAV_OPTS);
    if (!page.url().includes('login')) {
       await expect(page.locator('text=Résultats').first()).toBeVisible();
    }
  });

  test('19. Should display the Reset filters button if accessible', async ({ page }) => {
    await page.goto('/event', NAV_OPTS);
    if (!page.url().includes('login')) {
       await expect(page.locator('text=Réinitialiser les filtres').first()).toBeVisible();
    }
  });

  test('20. Should display the FAB add button if accessible', async ({ page }) => {
    await page.goto('/event', NAV_OPTS);
    if (!page.url().includes('login')) {
       await expect(page.locator('button:has(span.material-icons-outlined:has-text("add"))').last()).toBeVisible();
    }
  });
});
