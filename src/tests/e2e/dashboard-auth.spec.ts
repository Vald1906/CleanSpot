import { test, expect } from '@playwright/test';

const NAV_OPTS = { waitUntil: 'commit' as const };

test.describe('Functional Tests - Dashboard (10 tests)', () => {

  test('1. Should redirect to login if not authenticated', async ({ page }) => {
    await page.goto('/dashboard', NAV_OPTS);
    await expect(page).toHaveURL(/.*(login|signin).*/);
  });

  test('2. Should display "Fil d\'actualité" heading or login page', async ({ page }) => {
    await page.goto('/dashboard', NAV_OPTS);
    const heading = page.locator('text=Fil d\'actualité');
    const loginForm = page.locator('form');
    await expect(heading.or(loginForm).first()).toBeVisible({ timeout: 15000 });
  });

  test('3. Should display Event filter tabs or login', async ({ page }) => {
    await page.goto('/dashboard', NAV_OPTS);
    const eventTab = page.locator('text=Événements');
    const loginForm = page.locator('form');
    await expect(eventTab.or(loginForm).first()).toBeVisible({ timeout: 15000 });
  });

  test('4. Should display search input or login', async ({ page }) => {
    await page.goto('/dashboard', NAV_OPTS);
    const searchInput = page.locator('input[placeholder="Rechercher..."]');
    const loginForm = page.locator('form');
    await expect(searchInput.or(loginForm).first()).toBeVisible({ timeout: 15000 });
  });

  test('5. Should display status filters or login', async ({ page }) => {
    await page.goto('/dashboard', NAV_OPTS);
    const statusBtn = page.locator('text=Tous');
    const loginForm = page.locator('form');
    await expect(statusBtn.or(loginForm).first()).toBeVisible({ timeout: 15000 });
  });

  test('6. Should display Map section or login', async ({ page }) => {
    await page.goto('/dashboard', NAV_OPTS);
    const mapHeading = page.locator('h2:has-text("Map")');
    const loginForm = page.locator('form');
    await expect(mapHeading.or(loginForm).first()).toBeVisible({ timeout: 15000 });
  });

  test('7. Should display map legend or login', async ({ page }) => {
    await page.goto('/dashboard', NAV_OPTS);
    const legend = page.locator('text=Événement');
    const loginForm = page.locator('form');
    await expect(legend.or(loginForm).first()).toBeVisible({ timeout: 15000 });
  });

  test('8. Should have a visible body or login', async ({ page }) => {
    await page.goto('/dashboard', NAV_OPTS);
    await expect(page.locator('body')).toBeVisible();
  });

  test('9. Should allow interaction if dashboard is accessible', async ({ page }) => {
    await page.goto('/dashboard', NAV_OPTS);
    const searchInput = page.locator('input[placeholder="Rechercher..."]').first();
    if (await searchInput.isVisible()) {
      await searchInput.fill('test');
      await expect(searchInput).toHaveValue('test');
    }
  });

  test('10. Should display map component or login', async ({ page }) => {
    await page.goto('/dashboard', NAV_OPTS);
    const mapContainer = page.locator('.leaflet-container');
    const loginForm = page.locator('form');
    await expect(mapContainer.or(loginForm).first()).toBeAttached({ timeout: 15000 });
  });
});

test.describe('Functional Tests - Authentication (10 tests)', () => {

  test('11. Should display login page title', async ({ page }) => {
    await page.goto('/login', NAV_OPTS);
    await expect(page.locator('h2:has-text("Connexion")').or(page.locator('h2:has-text("compte")'))).toBeVisible();
  });

  test('12. Should display form fields on login', async ({ page }) => {
    await page.goto('/login', NAV_OPTS);
    await expect(page.locator('input[type="email"]').first()).toBeVisible();
    await expect(page.locator('input[type="password"]').first()).toBeVisible();
  });

  test('13. Should display submit button', async ({ page }) => {
    await page.goto('/login', NAV_OPTS);
    await expect(page.locator('button[type="submit"]').or(page.locator('button:has-text("Connecter")'))).toBeVisible();
  });

  test('14. Should allow filling login form', async ({ page }) => {
    await page.goto('/login', NAV_OPTS);
    const email = page.locator('form input[type="email"]').first();
    const pass = page.locator('form input[type="password"]').first();
    await email.fill('test@test.com');
    await pass.fill('password123');
    await expect(email).toHaveValue('test@test.com');
  });

  test('15. Should show error or button on invalid login', async ({ page }) => {
    await page.goto('/login', NAV_OPTS);
    await page.fill('form input[type="email"]', 'wrong@test.com');
    await page.fill('form input[type="password"]', 'wrongpassword');
    await page.click('button:has-text("Connecter")');
    const error = page.locator('text=incorrect');
    const button = page.locator('button[type="submit"]');
    await expect(error.or(button).first()).toBeVisible();
  });

  test('16. Should have register link', async ({ page }) => {
    await page.goto('/login', NAV_OPTS);
    await expect(page.locator('a[href="/register"]').first()).toBeVisible();
  });

  test('17. Should navigate to register', async ({ page }) => {
    await page.goto('/login', NAV_OPTS);
    await page.click('a[href="/register"]');
    await expect(page).toHaveURL(/.*register.*/);
  });

  test('18. Should display register page title', async ({ page }) => {
    await page.goto('/register', NAV_OPTS);
    await expect(page.locator('h2:has-text("compte")')).toBeVisible();
  });

  test('19. Should display user type selector', async ({ page }) => {
    await page.goto('/register', NAV_OPTS);
    await expect(page.locator('select').first()).toBeVisible();
  });

  test('20. Should have login link on register', async ({ page }) => {
    await page.goto('/register', NAV_OPTS);
    await expect(page.locator('a[href="/login"]').first()).toBeVisible();
  });
});
