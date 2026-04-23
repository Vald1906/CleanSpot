# Documentation Technique des Tests - CleanSpot

Cette documentation présente l'architecture, la stratégie et les procédures d'exécution des tests du projet CleanSpot. Elle est structurée pour démontrer la robustesse et la fiabilité de l'application selon les standards modernes du développement web.

## 1. Architecture des Tests (Modèle MVC)

L'architecture de test suit le découpage du projet en **Modèle-Vue-Contrôleur** :

*   **Tests Unitaires (Modèle)** : Valident la logique métier pure dans `src/tests/unit/`.
*   **Tests Fonctionnels (Vue)** : Valident le rendu des composants dans `src/tests/functional/` avec RTL.
*   **Tests End-to-End (Contrôleur & Flux)** : Valident les parcours utilisateurs dans `tests-e2e/` avec Playwright.

---

## 2. Extraits de Code Pédagogiques

### 2.1. Tests Unitaires (Logique Pure)
*Fichier concerné : `src/tests/unit/logic.test.ts`*

```typescript
// Exemple 1 : Validation d'un calcul mathématique de base
it('devrait retourner le résultat correct d\'une addition simple', () => {
    const result = 1 + 2;
    expect(result).toBe(3);
});

// Exemple 2 : Validation de la formule Haversine (calcul de distance entre deux points GPS)
it('haversineKm devrait calculer ~0 km pour des coordonnées identiques', () => {
    const parisLat = 48.8566, parisLon = 2.3522;
    const dist = haversineKm(parisLat, parisLon, parisLat, parisLon);
    expect(dist).toBeCloseTo(0, 5);
});
```

### 2.2. Tests Fonctionnels (Rendu Composants)
*Fichiers concernés : `src/tests/functional/*.test.tsx`*

```typescript
// Exemple 1 : Test de l'interaction utilisateur sur un bouton
it('devrait appeler la fonction onClose() lors du clic sur le bouton annuler', () => {
    const mockOnClose = vi.fn();
    render(<SpotFormModal isOpen={true} onClose={mockOnClose} mode="create" />);
    
    const cancelButton = screen.getByText('Annuler');
    fireEvent.click(cancelButton);
    
    expect(mockOnClose).toHaveBeenCalledTimes(1);
});

// Exemple 2 : Vérification du rendu initial d'une page
it('devrait afficher le titre de la page de contact correctement', () => {
    render(<ContactPage />);
    expect(screen.getByText(/Envoyez-nous un message/i)).toBeInTheDocument();
});
```

### 2.3. Tests End-to-End (Navigation & Flux Réel)
*Fichiers concernés : `tests-e2e/*.spec.ts`*

```typescript
// Exemple 1 : Navigation vers la page d'accueil
test('devrait naviguer vers la page d\'accueil et vérifier le titre', async ({ page }) => {
    await page.goto('/');
    await expect(page).toHaveTitle(/CleanSpot/i);
});

// Exemple 2 : Vérification de la présence du formulaire de contact
test('devrait afficher le formulaire de contact sur la page dédiée', async ({ page }) => {
    await page.goto('/contact');
    await expect(page.locator('form')).toBeVisible();
});
```

---

## 3. Commandes de Lancement

Voici les commandes pour exécuter les différentes suites de tests :

### Lancer les Tests Unitaires et Fonctionnels (Vitest)
```bash
npm run test
```
*Note : Cette commande lance Vitest qui scanne tous les fichiers `.test.tsx` dans `src/tests`.*

### Lancer les Tests End-to-End (Playwright)
```bash
npx playwright test
```
*Note : Assurez-vous que le serveur de développement est lancé (`npm run dev`) si vous n'utilisez pas le mode CI.*

### Voir le rapport détaillé des tests E2E
```bash
npx playwright show-report
```
