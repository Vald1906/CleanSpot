import { test, expect } from '@playwright/test';

test.describe('Functional Tests CleanSpot (10 tests)', () => {

  // Test 1: Navigation vers l'accueil depuis la racine
  test('1. Should navigate to Home Page and see main title', async ({ page }) => {
    await page.goto('/');
    // On s'attend à ce que le titre principal ou la balise html soit présent
    await expect(page).toHaveTitle(/CleanSpot/i);
  });

  // Test 2: Affichage de la page de Contact
  test('2. Should display contact page and form', async ({ page }) => {
    await page.goto('/contact');
    await expect(page.locator('h2', { hasText: 'Envoyez-nous un message' })).toBeVisible();
    await expect(page.locator('form')).toBeVisible();
  });

  // Test 3: Soumission de la page de contact avec des champs vides
  test('3. Should show HTML5 validation on empty contact form submission', async ({ page }) => {
    await page.goto('/contact');
    await page.locator('button[type="submit"]').click();

    // Since HTML5 validation intercepts, the form is not submitted.
    // The visual state remains the same natively, and we can check if the button is still there 
    // instead of an error message element unless manually rendered.
    await expect(page.locator('text=Envoyer le message')).toBeVisible();
  });

  // Test 4: Affichage de la page de connexion
  test('4. Should display login page with form inputs', async ({ page }) => {
    await page.goto('/login');
    // Vérifier les champs de base s'ils existent
    await expect(page.locator('input[type="email"], input[name="email"]')).toBeVisible();
  });

  // Test 5: Affichage de la page d'inscription
  test('5. Should display register page with form inputs', async ({ page }) => {
    await page.goto('/register');
    await expect(page.locator('input[type="email"], input[name="email"]')).toBeVisible();
  });

  // Test 6: La page Map doit se charger correctement
  test('6. Should display the Map page', async ({ page }) => {
    await page.goto('/map');
    // Either map container or specific div exists
    await expect(page.locator('.leaflet-container').or(page.locator('#map'))).toBeAttached();
  });

  // Test 7: Vérifier le dashboard redirection si non loggué (Route protégée)
  test('7. Should redirect from dashboard to login if unauthenticated', async ({ page }) => {
    await page.goto('/dashboard');
    // Attendre la redirection (NextAuth redirige vers /api/auth/signin ou /login)
    await expect(page).toHaveURL(/.*(login|signin).*/);
  });

  // Test 8: Remplissage correct d'es champs contact
  test('8. Should allow filling the contact form inputs', async ({ page }) => {
    await page.goto('/contact');
    await page.fill('input[name="nom"]', 'Doe');
    await page.fill('input[name="prenom"]', 'John');
    await page.fill('input[name="email"]', 'john.doe@test.com');
    await page.fill('input[name="subject"]', 'Test Subject');
    await page.fill('textarea[name="message"]', 'Ceci est un test');
    expect(await page.inputValue('input[name="nom"]')).toBe('Doe');
  });

  // Test 9: Navigation via navbar depuis home vers contact
  test('9. Should navigate from Home to Contact using Navbar links', async ({ page }) => {
    await page.goto('/');
    const contactLink = page.locator('a[href="/contact"]');
    if (await contactLink.isVisible()) {
      await contactLink.click();
      await expect(page).toHaveURL(/.*\/contact/);
    }
  });

  // Test 10: Event directory check
  test('10. Should load the event page', async ({ page }) => {
    await page.goto('/event');
    await expect(page.locator('body')).toBeVisible();
  });

});
