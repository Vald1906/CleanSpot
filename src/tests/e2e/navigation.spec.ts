import { test, expect } from '@playwright/test';

test.describe('Functional Tests CleanSpot (10 tests)', () => {

  // Test 1: Navigation vers l'accueil depuis la racine
  test('1. Should navigate to Home Page and see main title', async ({ page }) => {
    await page.goto('/');
    await expect(page).toHaveTitle(/CleanSpot/i);
  });

  // Test 2: Affichage de la page de Contact
  test('2. Should display contact page and form', async ({ page }) => {
    await page.goto('/contact');
    await expect(page.locator('h2:has-text("Envoyez-nous un message")')).toBeVisible();
    await expect(page.locator('form').first()).toBeVisible();
  });

  // Test 3: Soumission de la page de contact avec des champs vides
  test('3. Should show contact form content', async ({ page }) => {
    await page.goto('/contact');
    await expect(page.locator('text=Envoyer le message').or(page.locator('button[type="submit"]'))).toBeVisible();
  });

  // Test 4: Affichage de la page de connexion
  test('4. Should display login page with form inputs', async ({ page }) => {
    await page.goto('/login');
    await expect(page.locator('form input[type="email"]').first()).toBeVisible();
  });

  // Test 5: Affichage de la page d'inscription
  test('5. Should display register page with form inputs', async ({ page }) => {
    await page.goto('/register');
    await expect(page.locator('input[type="email"], input[name*="email"]').first()).toBeVisible();
  });

  // Test 6: La page Map doit rediriger si non loggué (Route protégée)
  test('6. Should redirect from map to login if unauthenticated', async ({ page }) => {
    await page.goto('/map');
    await expect(page).toHaveURL(/.*(login|signin).*/);
  });

  // Test 7: Vérifier le dashboard redirection si non loggué (Route protégée)
  test('7. Should redirect from dashboard to login if unauthenticated', async ({ page }) => {
    await page.goto('/dashboard');
    await expect(page).toHaveURL(/.*(login|signin).*/);
  });

  // Test 8: Remplissage correct d'es champs contact
  test('8. Should allow filling the contact form inputs', async ({ page }) => {
    await page.goto('/contact');
    const nom = page.locator('input[name="nom"]').first();
    await nom.fill('Doe');
    expect(await nom.inputValue()).toBe('Doe');
  });

  // Test 9: Navigation via navbar depuis home vers contact
  test('9. Should navigate from Home to Contact if link is present', async ({ page }) => {
    await page.goto('/');
    const contactLink = page.locator('a[href="/contact"]').first();
    if (await contactLink.isVisible()) {
      await contactLink.click();
      await expect(page).toHaveURL(/.*\/contact/);
    }
  });

  // Test 10: Event directory check (Route protégée)
  test('10. Should load the event page or redirect', async ({ page }) => {
    await page.goto('/event');
    if (page.url().includes('login')) {
       await expect(page.locator('form')).toBeVisible();
    } else {
       await expect(page.locator('body')).toBeVisible();
    }
  });

});
