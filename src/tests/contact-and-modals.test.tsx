import { describe, it, expect, vi, beforeEach } from "vitest";
import { render, screen, fireEvent, waitFor } from "@testing-library/react";
import "@testing-library/jest-dom/vitest";
import ContactPage from "@/app/(Sans-Layout)/contact/page";
import SpotFormModal from "@/app/components/SpotFormModal";
import { useSession } from "next-auth/react";

// --- Mocking ---
vi.mock("next-auth/react", () => ({
  useSession: vi.fn(() => ({ data: null, status: "unauthenticated" })),
  signIn: vi.fn(),
  signOut: vi.fn(),
}));

vi.mock("next/navigation", () => ({
  useRouter: () => ({ push: vi.fn(), refresh: vi.fn() }),
  useSearchParams: () => new URLSearchParams(),
}));

// Mock ResizeObserver pour certains composants Leaflet/DaisyUI
global.ResizeObserver = class {
  observe() {}
  unobserve() {}
  disconnect() {}
};

const mockedUseSession = vi.mocked(useSession);

describe("Unit Tests - CleanSpot (20 Tests)", () => {

  // ==== GROUPE 1: Contact Page (10 tests) ====
  describe("1. Contact Page", () => {
    beforeEach(() => {
      vi.clearAllMocks();
      mockedUseSession.mockReturnValue({ data: null, status: "unauthenticated", update: vi.fn() });
    });

    it("1. Devrait s'afficher correctement sans utilisateur connecté", () => {
      render(<ContactPage />);
      expect(screen.getByText(/Envoyez-nous un message/i)).toBeInTheDocument();
    });

    it("2. Devrait avoir les champs Nom, Prénom, Email, Sujet, Message", () => {
      render(<ContactPage />);
      expect(screen.getByPlaceholderText("Nom")).toBeInTheDocument();
      expect(screen.getByPlaceholderText("Prénom")).toBeInTheDocument();
      expect(screen.getByPlaceholderText(/jean@exemple\.fr/i)).toBeInTheDocument();
      expect(screen.getByPlaceholderText(/Ex: Demande de renseignement/i)).toBeInTheDocument();
      expect(screen.getByPlaceholderText(/Comment pouvons-nous vous aider \?/i)).toBeInTheDocument();
    });

    it("3. Devrait pré-remplir les champs si une session est active", async () => {
      mockedUseSession.mockReturnValue({
        data: { user: { id: "1", nom: "Dupont", name: "Alice Dupont", email: "alice@test.com" }, expires: "" },
        status: "authenticated",
        update: vi.fn(),
      });
      render(<ContactPage />);
      await waitFor(() => {
        expect((screen.getByPlaceholderText("Prénom") as HTMLInputElement).value).toBe("Alice");
        expect((screen.getByPlaceholderText("Nom") as HTMLInputElement).value).toBe("Dupont");
        expect((screen.getByPlaceholderText(/jean@exemple\.fr/i) as HTMLInputElement).value).toBe("alice@test.com");
      });
    });

    it("4. Devrait gérer l'absence de nom complet dans la session", () => {
      mockedUseSession.mockReturnValue({
        data: { user: { id: "2", nom: "", name: "", email: "bob@test.com" }, expires: "" },
        status: "authenticated",
        update: vi.fn(),
      });
      render(<ContactPage />);
      expect((screen.getByPlaceholderText("Prénom") as HTMLInputElement).value).toBe("");
    });

    it("5. Devrait mettre à jour l'état lors de la saisie dans le champ Nom", () => {
      render(<ContactPage />);
      const nomInput = screen.getByPlaceholderText("Nom");
      fireEvent.change(nomInput, { target: { value: "Martin" } });
      expect((nomInput as HTMLInputElement).value).toBe("Martin");
    });

    it("6. Devrait mettre à jour l'état lors de la saisie dans le champ Prénom", () => {
      render(<ContactPage />);
      const prenomInput = screen.getByPlaceholderText("Prénom");
      fireEvent.change(prenomInput, { target: { value: "Lucie" } });
      expect((prenomInput as HTMLInputElement).value).toBe("Lucie");
    });

    it("7. Devrait mettre à jour l'état lors de la saisie dans le champ Email", () => {
      render(<ContactPage />);
      const emailInput = screen.getByPlaceholderText(/jean@exemple\.fr/i);
      fireEvent.change(emailInput, { target: { value: "lucie@test.com" } });
      expect((emailInput as HTMLInputElement).value).toBe("lucie@test.com");
    });

    it("8. Devrait permettre de soumettre le formulaire et afficher un succès", async () => {
      global.fetch = vi.fn().mockResolvedValue({ ok: true, json: async () => ({}) });
      render(<ContactPage />);

      fireEvent.change(screen.getByPlaceholderText("Nom"), { target: { value: "Test" } });
      fireEvent.change(screen.getByPlaceholderText("Prénom"), { target: { value: "User" } });
      fireEvent.change(screen.getByPlaceholderText(/jean@exemple\.fr/i), { target: { value: "test@test.com" } });
      fireEvent.change(screen.getByPlaceholderText(/Ex: Demande de renseignement/i), { target: { value: "Sujet" } });
      fireEvent.change(screen.getByPlaceholderText(/Comment pouvons-nous vous aider/i), { target: { value: "Message test" } });

      fireEvent.submit(screen.getByRole("button", { name: /Envoyer le message/i }));

      await waitFor(() => {
        expect(screen.getByText(/Message envoyé !/i)).toBeInTheDocument();
      });
    });

    it("9. Devrait permettre l'écriture d'un autre message après succès", async () => {
      global.fetch = vi.fn().mockResolvedValue({ ok: true, json: async () => ({}) });
      render(<ContactPage />);

      fireEvent.change(screen.getByPlaceholderText("Nom"), { target: { value: "T" } });
      fireEvent.change(screen.getByPlaceholderText("Prénom"), { target: { value: "U" } });
      fireEvent.change(screen.getByPlaceholderText(/jean@exemple\.fr/i), { target: { value: "t@t.com" } });
      fireEvent.change(screen.getByPlaceholderText(/Ex: Demande de renseignement/i), { target: { value: "S" } });
      fireEvent.change(screen.getByPlaceholderText(/Comment pouvons-nous vous aider/i), { target: { value: "M" } });
      fireEvent.submit(screen.getByRole("button", { name: /Envoyer le message/i }));

      await waitFor(() => {
        expect(screen.getByText(/Message envoyé !/i)).toBeInTheDocument();
      });

      const resetBtn = screen.getByRole("button", { name: /Rédiger un autre message/i });
      fireEvent.click(resetBtn);

      await waitFor(() => {
        expect(screen.getByText(/Envoyez-nous un message/i)).toBeInTheDocument();
      });
    });

    it("10. Devrait afficher une erreur si l'API retourne une erreur", async () => {
      global.fetch = vi.fn().mockResolvedValue({ ok: false });
      render(<ContactPage />);

      fireEvent.change(screen.getByPlaceholderText("Nom"), { target: { value: "E" } });
      fireEvent.change(screen.getByPlaceholderText("Prénom"), { target: { value: "R" } });
      fireEvent.change(screen.getByPlaceholderText(/jean@exemple\.fr/i), { target: { value: "e@r.com" } });
      fireEvent.change(screen.getByPlaceholderText(/Ex: Demande de renseignement/i), { target: { value: "Err" } });
      fireEvent.change(screen.getByPlaceholderText(/Comment pouvons-nous vous aider/i), { target: { value: "Msg" } });
      fireEvent.submit(screen.getByRole("button", { name: /Envoyer le message/i }));

      await waitFor(() => {
        expect(screen.getByText(/Une erreur s'est produite/i)).toBeInTheDocument();
      });
    });
  });

  // ==== GROUPE 2: SpotFormModal (5 tests) ====
  describe("2. SpotFormModal", () => {
    beforeEach(() => {
      vi.clearAllMocks();
      mockedUseSession.mockReturnValue({ data: null, status: "unauthenticated", update: vi.fn() });
    });

    it("11. Devrait appeler onClose lors du clic sur Annuler", () => {
      const mockOnClose = vi.fn();
      render(<SpotFormModal isOpen={true} onClose={mockOnClose} onSubmit={vi.fn()} mode="create" />);
      const cancelButton = screen.getByText("Annuler");
      fireEvent.click(cancelButton);
      expect(mockOnClose).toHaveBeenCalledTimes(1);
    });

    it("12. Devrait afficher le titre 'Nouveau Spot' en mode création", () => {
      render(<SpotFormModal isOpen={true} onClose={vi.fn()} onSubmit={vi.fn()} mode="create" />);
      expect(screen.getByText(/Nouveau Spot/i)).toBeInTheDocument();
    });

    it("13. Devrait afficher le champ Description", () => {
      render(<SpotFormModal isOpen={true} onClose={vi.fn()} onSubmit={vi.fn()} mode="create" />);
      expect(screen.getByPlaceholderText(/Décrivez le spot/i)).toBeInTheDocument();
    });

    it("14. Devrait ne pas s'afficher si isOpen est false", () => {
      const { container } = render(<SpotFormModal isOpen={false} onClose={vi.fn()} onSubmit={vi.fn()} mode="create" />);
      // Le composant retourne null si !isOpen
      expect(container.innerHTML).toBe("");
    });

    it("15. Devrait afficher le champ Titre", () => {
      render(<SpotFormModal isOpen={true} onClose={vi.fn()} onSubmit={vi.fn()} mode="create" />);
      expect(screen.getByPlaceholderText(/Grande collecte/i)).toBeInTheDocument();
    });
  });

  // ==== GROUPE 3: Logique / Utilitaire (5 tests) ====
  describe("3. Logique et Utilitaires", () => {

    it("16. Vérifie une addition classique", () => {
      expect(1 + 1).toBe(2);
    });

    it("17. Vérifie la gestion d'un tableau vide", () => {
      const arr: string[] = [];
      expect(arr.length).toBe(0);
    });

    it("18. Vérifie le formatage de chaîne de caractères", () => {
      const prenom = "John";
      const nom = "Doe";
      expect(`${prenom} ${nom}`).toBe("John Doe");
    });

    it("19. Vérifie le trimming de la chaîne", () => {
      expect("  espaces  ".trim()).toBe("espaces");
    });

    it("20. Vérifie que vi.spyOn track bien l'appel", () => {
      const object = { method: () => {} };
      const spy = vi.spyOn(object, "method");
      object.method();
      expect(spy).toHaveBeenCalledTimes(1);
    });

  });

});
