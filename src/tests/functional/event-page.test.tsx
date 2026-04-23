import { describe, it, expect, vi, beforeEach } from "vitest";
import { render, screen, fireEvent, waitFor } from "@testing-library/react";
import "@testing-library/jest-dom/vitest";

// --- Mocks ---
const mockShowNotification = vi.fn();
vi.mock("@/app/context/NotificationContext", () => ({
  useNotification: () => ({ showNotification: mockShowNotification }),
}));

const mockGetSpotsFromDb = vi.fn();
const mockCreateSpot = vi.fn();
const mockToggleParticipation = vi.fn();
const mockToggleFavorite = vi.fn();
const mockGetParticipations = vi.fn();
const mockGetFavorites = vi.fn();
const mockGetComments = vi.fn();
const mockAddComment = vi.fn();

vi.mock("@/app/actions/spotActions", () => ({
  getSpotsFromDb: (...args: any[]) => mockGetSpotsFromDb(...args),
  createSpot: (...args: any[]) => mockCreateSpot(...args),
  toggleParticipation: (...args: any[]) => mockToggleParticipation(...args),
  toggleFavorite: (...args: any[]) => mockToggleFavorite(...args),
  getParticipations: (...args: any[]) => mockGetParticipations(...args),
  getFavorites: (...args: any[]) => mockGetFavorites(...args),
  getComments: (...args: any[]) => mockGetComments(...args),
  addComment: (...args: any[]) => mockAddComment(...args),
}));

vi.mock("next-auth/react", () => ({
  useSession: vi.fn(() => ({ data: null, status: "unauthenticated" })),
}));

vi.mock("next/navigation", () => ({
  useRouter: () => ({ push: vi.fn(), refresh: vi.fn() }),
  useSearchParams: () => new URLSearchParams(),
}));

vi.mock("@/app/components/SpotFormModal", () => ({
  __esModule: true,
  default: (props: any) => props.isOpen ? <div data-testid="spot-form-modal">SpotFormModal</div> : null,
}));

vi.mock("@/app/components/navbar", () => ({
  __esModule: true,
  default: () => <nav data-testid="navbar">Navbar</nav>,
}));

global.ResizeObserver = class { observe() {} unobserve() {} disconnect() {} };

import { useSession } from "next-auth/react";
import EventPage from "@/app/(Sans-Layout)/event/page";
const mockedUseSession = vi.mocked(useSession);

describe("Functional Tests - Event Page (RTL)", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    mockedUseSession.mockReturnValue({ data: null, status: "unauthenticated", update: vi.fn() });
    mockGetSpotsFromDb.mockResolvedValue({ success: true, data: [] });
  });

  it("1. Devrait afficher le titre principal 'Exploration CleanSpot'", async () => {
    render(<EventPage />);
    await waitFor(() => {
      expect(screen.getByText("Exploration CleanSpot")).toBeInTheDocument();
    });
  });

  it("2. Devrait afficher la barre de recherche", async () => {
    render(<EventPage />);
    await waitFor(() => {
      expect(screen.getByPlaceholderText("Rechercher...")).toBeInTheDocument();
    });
  });

  it("3. Devrait mettre à jour la recherche à la saisie", async () => {
    render(<EventPage />);
    await waitFor(() => {
      const input = screen.getByPlaceholderText("Rechercher...");
      fireEvent.change(input, { target: { value: "test" } });
      expect((input as HTMLInputElement).value).toBe("test");
    });
  });

  it("4. Devrait activer le bouton réinitialiser quand un filtre est actif", async () => {
    render(<EventPage />);
    await waitFor(() => {
      fireEvent.click(screen.getByText("Plastique"));
    });
    await waitFor(() => {
      const resetBtn = screen.getByText("Réinitialiser les filtres");
      expect(resetBtn.closest("button")).not.toBeDisabled();
    });
  });

  it("5. Devrait afficher des skeletons pendant le chargement", async () => {
    mockGetSpotsFromDb.mockImplementation(() => new Promise(() => {})); 
    const { container } = render(<EventPage />);
    expect(container.querySelectorAll(".animate-pulse").length).toBeGreaterThan(0);
  });
});
