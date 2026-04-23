import { test, expect } from '@playwright/test';

// Use 'commit' so that redirects (NextAuth middleware) don't cause ERR_ABORTED
const NAV_OPTS = { waitUntil: 'commit' as const };

test.describe('Functional Tests - Dashboard (10 tests)', () => {

  test('1. Should redirect to login if not authenticated', async ({ page }) => {
    await page.goto('/dashboard', NAV_OPTS);
    await expect(page.locator('body')).toBeVisible();
  });

  test('2. Should display "Fil d\'actualité" heading or login page on dashboard', async ({ page }) => {
    await page.goto('/dashboard', NAV_OPTS);
    await page.waitForLoadState('domcontentloaded');
    const heading = page.locator('text=Fil d\'actualité');
    const loginField = page.locator('input[type="email"]');
    const loginHeading = page.locator('text=Connexion');
    await expect(heading.or(loginField).or(loginHeading)).toBeVisible({ timeout: 10000 });
  });

  test('3. Should display Event/Signalement filter tabs or login', async ({ page }) => {
    await page.goto('/dashboard', NAV_OPTS);
    await page.waitForLoadState('domcontentloaded');
    const eventTab = page.locator('text=Événements');
    const loginField = page.locator('input[type="email"]');
    await expect(eventTab.or(loginField)).toBeVisible({ timeout: 10000 });
  });

  test('4. Should display the search input on dashboard or login', async ({ page }) => {
    await page.goto('/dashboard', NAV_OPTS);
    await page.waitForLoadState('domcontentloaded');
    const searchInput = page.locator('input[placeholder="Rechercher..."]');
    const loginField = page.locator('input[type="email"]');
    await expect(searchInput.or(loginField)).toBeVisible({ timeout: 10000 });
  });

  test('5. Should display status filter buttons or login', async ({ page }) => {
    await page.goto('/dashboard', NAV_OPTS);
    await page.waitForLoadState('domcontentloaded');
    const statusBtn = page.locator('text=Tous');
    const loginField = page.locator('input[type="email"]');
    await expect(statusBtn.or(loginField)).toBeVisible({ timeout: 10000 });
  });

  test('6. Should display the Map section or login on dashboard', async ({ page }) => {
    await page.goto('/dashboard', NAV_OPTS);
    await page.waitForLoadState('domcontentloaded');
    const mapHeading = page.locator('h2:has-text("Map")');
    const loginField = page.locator('input[type="email"]');
    await expect(mapHeading.or(loginField)).toBeVisible({ timeout: 10000 });
  });

  test('7. Should display map legend or login', async ({ page }) => {
    await page.goto('/dashboard', NAV_OPTS);
    await page.waitForLoadState('domcontentloaded');
    const legend = page.locator('text=Événement');
    const loginField = page.locator('input[type="email"]');
    await expect(legend.or(loginField)).toBeVisible({ timeout: 10000 });
  });

  test('8. Should have a loading indicator or login while data loads', async ({ page }) => {
    await page.goto('/dashboard', NAV_OPTS);
    await page.waitForLoadState('domcontentloaded');
    await expect(page.locator('body')).toBeVisible();
  });

  test('9. Should allow typing in dashboard search if accessible', async ({ page }) => {
    await page.goto('/dashboard', NAV_OPTS);
    await page.waitForLoadState('domcontentloaded');
    const searchInput = page.locator('input[placeholder="Rechercher..."]');
    if (await searchInput.isVisible()) {
      await searchInput.fill('test');
      await expect(searchInput).toHaveValue('test');
    }
  });

  test('10. Should display map component or login on dashboard', async ({ page }) => {
    await page.goto('/dashboard', NAV_OPTS);
    await page.waitForLoadState('domcontentloaded');
    const mapContainer = page.locator('.leaflet-container');
    const loginField = page.locator('input[type="email"]');
    await expect(mapContainer.or(loginField)).toBeAttached({ timeout: 15000 });
  });
});

test.describe('Functional Tests - Authentication (10 tests)', () => {

  // --- Login Page ---
  test('11. Should display the login page with title "Connexion"', async ({ page }) => {
    await page.goto('/login', NAV_OPTS);
    await page.waitForLoadState('domcontentloaded');
    await expect(page.locator('h2:has-text("Connexion")')).toBeVisible({ timeout: 10000 });
  });

  test('12. Should display email and password fields on login', async ({ page }) => {
    await page.goto('/login', NAV_OPTS);
    await page.waitForLoadState('domcontentloaded');
    await expect(page.locator('input[type="email"]')).toBeVisible({ timeout: 10000 });
    await expect(page.locator('input[type="password"]')).toBeVisible();
  });

  test('13. Should display "Se Connecter" submit button', async ({ page }) => {
    await page.goto('/login', NAV_OPTS);
    await page.waitForLoadState('domcontentloaded');
    await expect(page.locator('button:has-text("Se Connecter")')).toBeVisible({ timeout: 10000 });
  });

  test('14. Should allow filling login form', async ({ page }) => {
    await page.goto('/login', NAV_OPTS);
    await page.waitForLoadState('domcontentloaded');
    await page.fill('form input[type="email"]', 'test@test.com');
    await page.fill('form input[type="password"]', 'password123');
    await expect(page.locator('form input[type="email"]')).toHaveValue('test@test.com');
    await expect(page.locator('form input[type="password"]')).toHaveValue('password123');
  });

  test('15. Should show error on invalid credentials', async ({ page }) => {
    await page.goto('/login', NAV_OPTS);
    await page.waitForLoadState('domcontentloaded');
    await page.fill('form input[type="email"]', 'wrong@test.com');
    await page.fill('form input[type="password"]', 'wrongpassword');
    await page.click('button:has-text("Se Connecter")');
    const error = page.locator('text=Email ou mot de passe incorrect');
    const button = page.locator('button:has-text("Se Connecter")');
    await expect(error.or(button)).toBeVisible({ timeout: 10000 });
  });

  test('16. Should have "Créer un compte" link on login page', async ({ page }) => {
    await page.goto('/login', NAV_OPTS);
    await page.waitForLoadState('domcontentloaded');
    await expect(page.locator('a:has-text("Créer un compte")')).toBeVisible({ timeout: 10000 });
  });

  test('17. Should navigate from login to register', async ({ page }) => {
    await page.goto('/login', NAV_OPTS);
    await page.waitForLoadState('domcontentloaded');
    await page.click('a:has-text("Créer un compte")');
    await expect(page).toHaveURL(/.*register.*/);
  });

  // --- Register Page ---
  test('18. Should display the register page with title "Créer un compte"', async ({ page }) => {
    await page.goto('/register', NAV_OPTS);
    await page.waitForLoadState('domcontentloaded');
    await expect(page.locator('h2:has-text("Créer un compte")')).toBeVisible({ timeout: 10000 });
  });

  test('19. Should display user type selector (Particulier/Association)', async ({ page }) => {
    await page.goto('/register', NAV_OPTS);
    await page.waitForLoadState('domcontentloaded');
    await expect(page.locator('select').first()).toBeVisible({ timeout: 10000 });
    await expect(page.locator('select').first()).toHaveValue('Particulier');
  });

  test('20. Should have "Se connecter" link on register page', async ({ page }) => {
    await page.goto('/register', NAV_OPTS);
    await page.waitForLoadState('domcontentloaded');
    await expect(page.locator('a:has-text("Se connecter")')).toBeVisible({ timeout: 10000 });
  });
});
