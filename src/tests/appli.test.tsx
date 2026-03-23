import { describe, it, expect, vi } from "vitest";
import SpotFormModal from "@/app/components/SpotFormModal";
import { render, screen, fireEvent } from "@testing-library/react";
import "@testing-library/jest-dom/vitest";

// Mocks nécessaires pour SpotFormModal (utilise useSession)
vi.mock("next-auth/react", () => ({
  useSession: vi.fn(() => ({ data: null, status: "unauthenticated" })),
}));

vi.mock("next/navigation", () => ({
  useRouter: () => ({ push: vi.fn(), refresh: vi.fn() }),
  useSearchParams: () => new URLSearchParams(),
}));

global.ResizeObserver = class { observe() {} unobserve() {} disconnect() {} };

//tests unitaires
describe('addition', () => {
    it('tests with negative numbers', () => {
        const leftNumber: number = -1;
        const rightNumber: number = -2;
        const result: number = leftNumber + rightNumber;

        expect(result).toBe(-3);
    });
    it('tests with positive numbers', () => {
        const leftNumber: number = 1;
        const rightNumber: number = 2;
        const result: number = leftNumber + rightNumber;

        expect(result).toBe(3);
    });

    //tests fonctionnels
    it('demo mock', () => {
        const object = { methodExample: () => {} };
        const demoSpy = vi.spyOn(object, 'methodExample');
        object.methodExample();
        object.methodExample();

        expect(demoSpy).toHaveBeenCalledTimes(2);
    });

});

describe('SpotFormModal', () => {
    it('devrait appeler onClose() lors du clic sur le bouton annuler', () => {
        const mockOnClose = vi.fn();
        const mockOnSubmit = vi.fn();
        // Rendre le composant avec les props requises
        render(<SpotFormModal isOpen={true} onClose={mockOnClose} onSubmit={mockOnSubmit} mode="create" />);
        // 1. Trouver le bouton "Annuler"
        const cancelButton = screen.getByText('Annuler');
        // 2. Simuler un clic de l'utilisateur
        fireEvent.click(cancelButton);
        // 3. Vérifier que la fonction onClose a bien été appelée 1 fois
        expect(mockOnClose).toHaveBeenCalledTimes(1);
    });
});