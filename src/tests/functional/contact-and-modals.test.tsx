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

global.ResizeObserver = class { observe() {} unobserve() {} disconnect() {} };

const mockedUseSession = vi.mocked(useSession);

describe("Functional Tests - Components & Pages (RTL)", () => {

  describe("Contact Page", () => {
    beforeEach(() => {
      vi.clearAllMocks();
      mockedUseSession.mockReturnValue({ data: null, status: "unauthenticated", update: vi.fn() });
    });

    it("1. Devrait s'afficher correctement sans utilisateur connecté", () => {
      render(<ContactPage />);
      expect(screen.getByText(/Envoyez-nous un message/i)).toBeInTheDocument();
    });

    it("2. Devrait avoir les champs Nom, Prénom, Email", () => {
      render(<ContactPage />);
      expect(screen.getByPlaceholderText("Nom")).toBeInTheDocument();
      expect(screen.getByPlaceholderText("Prénom")).toBeInTheDocument();
    });

    it("3. Devrait permettre de soumettre le formulaire et afficher un succès", async () => {
      global.fetch = vi.fn().mockResolvedValue({ ok: true, json: async () => ({}) });
      render(<ContactPage />);

      fireEvent.change(screen.getByPlaceholderText("Nom"), { target: { value: "Test" } });
      fireEvent.submit(screen.getByRole("button", { name: /Envoyer le message/i }));

      await waitFor(() => {
        expect(screen.getByText(/Message envoyé !/i)).toBeInTheDocument();
      });
    });
  });

  describe("SpotFormModal", () => {
    it("4. Devrait appeler onClose lors du clic sur Annuler", () => {
      const mockOnClose = vi.fn();
      render(<SpotFormModal isOpen={true} onClose={mockOnClose} onSubmit={vi.fn()} mode="create" />);
      fireEvent.click(screen.getByText("Annuler"));
      expect(mockOnClose).toHaveBeenCalledTimes(1);
    });

    it("5. Devrait afficher le titre 'Nouveau Spot' en mode création", () => {
      render(<SpotFormModal isOpen={true} onClose={vi.fn()} onSubmit={vi.fn()} mode="create" />);
      expect(screen.getByText(/Nouveau Spot/i)).toBeInTheDocument();
    });
  });
});
