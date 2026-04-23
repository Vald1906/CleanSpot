# 🧪 Documentation Stratégique des Tests - CleanSpot

Cette documentation détaille l'écosystème de tests mis en place pour garantir la fiabilité, la performance et la sécurité de la plateforme **CleanSpot**. Elle est structurée pour démontrer une maîtrise complète du cycle de vie logiciel selon le modèle **MVC**.

---

## 1. Architecture des Tests & Alignement MVC

L'application suit une séparation stricte des responsabilités, validée par trois niveaux de tests :

| Niveau | Cible MVC | Technologie | Objectif |
| :--- | :--- | :--- | :--- |
| **Unitaires** | **Modèle** (Logic) | Vitest | Valider les algorithmes métier et les utilitaires. |
| **Fonctionnels** | **Vue** (UI/UX) | RTL & Vitest | Garantir que les composants réagissent correctement aux actions. |
| **End-to-End** | **Contrôleur** (Flux) | Playwright | Simuler des parcours réels dans un navigateur piloté. |

---

## 2. Focus sur les Tests Unitaires (Logique Métier)
*Localisation : `src/tests/unit/`*

Ces tests sont isolés et n'utilisent pas le DOM. Ils valident les "fonctions pures".

### 2.1. Calcul de Distance (Géolocalisation)
Cet extrait montre comment nous validons la précision des calculs GPS via la formule de Haversine.
```typescript
it('haversineKm devrait calculer ~462 km entre Paris et Lyon', () => {
    const paris = { lat: 48.8566, lon: 2.3522 };
    const lyon = { lat: 45.7640, lon: 4.8357 };
    
    const dist = haversineKm(paris.lat, paris.lon, lyon.lat, lyon.lon);
    
    expect(dist).toBeGreaterThan(380);
    expect(dist).toBeLessThan(500);
});
```

### 2.2. Gestion du Calendrier Éco-Citoyen
Validation de la logique temporelle pour l'affichage des événements.
```typescript
it('getDaysInMonth devrait retourner 29 pour février 2024 (année bissextile)', () => {
    const days = getDaysInMonth(2024, 1); // Index 1 = Février
    expect(days).toBe(29);
});
```

**Commande d'exécution ciblée :**
```bash
npx vitest run src/tests/unit
```

---

## 3. Focus sur les Tests Fonctionnels (Composants)
*Localisation : `src/tests/functional/`*

Ces tests simulent le rendu React et les interactions utilisateur (clics, saisies).

### 3.1. Soumission du Formulaire de Contact
Validation de l'appel API asynchrone et du retour visuel.
```typescript
it('devrait afficher un message de succès après une soumission valide', async () => {
    global.fetch = vi.fn().mockResolvedValue({ ok: true, json: async () => ({}) });
    render(<ContactPage />);

    fireEvent.change(screen.getByPlaceholderText("Nom"), { target: { value: "Martin" } });
    fireEvent.submit(screen.getByRole("button", { name: /Envoyer le message/i }));

    await waitFor(() => {
        expect(screen.getByText(/Message envoyé !/i)).toBeInTheDocument();
    });
});
```

### 3.2. Gestion d'État de la Modal d'Événement
Vérification que les props de rappel (callbacks) sont déclenchées.
```typescript
it('devrait déclencher onClose lors du clic sur le bouton Annuler', () => {
    const mockOnClose = vi.fn();
    render(<SpotFormModal isOpen={true} onClose={mockOnClose} mode="create" />);
    
    fireEvent.click(screen.getByText("Annuler"));
    expect(mockOnClose).toHaveBeenCalledTimes(1);
});
```

**Commande d'exécution ciblée :**
```bash
npx vitest run src/tests/functional
```

---

## 4. Focus sur les Tests End-to-End (Parcours Complets)
*Localisation : `src/tests/e2e/`*

Simulation réelle dans un navigateur (Chromium) pour tester la navigation et l'intégration.

### 4.1. Navigation vers l'Inscription
Vérification de la continuité du parcours utilisateur.
```typescript
test('devrait naviguer de la page de connexion vers la page d\'inscription', async ({ page }) => {
    await page.goto('/login');
    await page.click('a:has-text("Créer un compte")');
    await expect(page).toHaveURL(/.*register.*/);
});
```

### 4.2. Interaction avec la Barre de Recherche (Map)
Validation de la réactivité de l'interface cartographique.
```typescript
test('devrait permettre de saisir une ville dans la barre de recherche', async ({ page }) => {
    await page.goto('/map');
    const searchInput = page.locator('input[placeholder="Rechercher un lieu..."]');
    await searchInput.fill('Paris');
    await expect(searchInput).toHaveValue('Paris');
});
```

**Commande d'exécution ciblée :**
```bash
npx playwright test src/tests/e2e
```

---

## 5. Résumé des Commandes

| Type | Commande |
| :--- | :--- |
| **Global** | `npm test` |
| **Unitaires** | `npx vitest run src/tests/unit` |
| **Fonctionnels** | `npx vitest run src/tests/functional` |
| **End-to-End** | `npx playwright test` |
| **Interface UI E2E** | `npx playwright test --ui` |

---
*Documentation générée pour la soutenance technique - CleanSpot 2026*
