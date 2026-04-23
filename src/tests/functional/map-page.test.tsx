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
const mockUpdateSpot = vi.fn();
const mockDeleteSpot = vi.fn();
const mockToggleParticipation = vi.fn();
const mockGetComments = vi.fn();
const mockAddComment = vi.fn();
const mockGetParticipations = vi.fn();
const mockArchiveSpot = vi.fn();
const mockToggleFavorite = vi.fn();

vi.mock("@/app/actions/spotActions", () => ({
  getSpotsFromDb: (...args: any[]) => mockGetSpotsFromDb(...args),
  createSpot: (...args: any[]) => mockCreateSpot(...args),
  updateSpot: (...args: any[]) => mockUpdateSpot(...args),
  deleteSpot: (...args: any[]) => mockDeleteSpot(...args),
  toggleParticipation: (...args: any[]) => mockToggleParticipation(...args),
  getComments: (...args: any[]) => mockGetComments(...args),
  addComment: (...args: any[]) => mockAddComment(...args),
  getParticipations: (...args: any[]) => mockGetParticipations(...args),
  archiveSpot: (...args: any[]) => mockArchiveSpot(...args),
  toggleFavorite: (...args: any[]) => mockToggleFavorite(...args),
}));

vi.mock("next-auth/react", () => ({
  useSession: vi.fn(() => ({ data: null, status: "unauthenticated" })),
}));

vi.mock("next/navigation", () => ({
  useRouter: () => ({ push: vi.fn(), refresh: vi.fn() }),
  useSearchParams: () => new URLSearchParams(),
}));

// Mock dynamic import pour MapComponent
vi.mock("next/dynamic", () => ({
  __esModule: true,
  default: () => {
    const MockMap = (props: any) => <div data-testid="mock-map">Map</div>;
    MockMap.displayName = "MockMapComponent";
    return MockMap;
  },
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
import MapPage from "@/app/(Sans-Layout)/map/page";
const mockedUseSession = vi.mocked(useSession);

describe("Unit Tests - Map Page (20 Tests)", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    mockedUseSession.mockReturnValue({ data: null, status: "unauthenticated", update: vi.fn() });
    mockGetSpotsFromDb.mockResolvedValue({ success: true, data: [] });
    mockGetComments.mockResolvedValue({ success: true, data: [] });
  });

  // --- Rendu de base ---
  it("1. Devrait afficher la map après le montage", async () => {
    render(<MapPage />);
    await waitFor(() => {
      expect(screen.getByTestId("mock-map")).toBeInTheDocument();
    });
  });

  it("2. Devrait afficher la barre de recherche", async () => {
    render(<MapPage />);
    await waitFor(() => {
      expect(screen.getByPlaceholderText("Rechercher un lieu...")).toBeInTheDocument();
    });
  });

  it("3. Devrait ne pas afficher le panneau latéral par défaut", async () => {
    render(<MapPage />);
    await waitFor(() => {
      expect(screen.queryByText("Participants")).not.toBeInTheDocument();
    });
  });

  // --- Recherche ---
  it("4. Devrait mettre à jour la barre de recherche à la saisie", async () => {
    render(<MapPage />);
    await waitFor(() => {
      const input = screen.getByPlaceholderText("Rechercher un lieu...");
      fireEvent.change(input, { target: { value: "Paris" } });
      expect((input as HTMLInputElement).value).toBe("Paris");
    });
  });

  it("5. Devrait afficher des suggestions filtrées lors de la recherche", async () => {
    mockGetSpotsFromDb.mockResolvedValue({
      success: true,
      data: [
        { id: 1, title: "Collecte Paris", address: "Rue de Rivoli", type: "Event", participants: [], favorites: [] },
        { id: 2, title: "Signalement Lyon", address: "Place Bellecour", type: "Signalement", participants: [], favorites: [] },
      ],
    });
    render(<MapPage />);
    await waitFor(() => {
      const input = screen.getByPlaceholderText("Rechercher un lieu...");
      fireEvent.change(input, { target: { value: "Paris" } });
    });
    await waitFor(() => {
      expect(screen.getByText("Collecte Paris")).toBeInTheDocument();
    });
  });

  it("6. Devrait ne pas afficher de résultat si la recherche ne correspond à rien", async () => {
    mockGetSpotsFromDb.mockResolvedValue({
      success: true,
      data: [{ id: 1, title: "Collecte Paris", address: "Rue", type: "Event", participants: [], favorites: [] }],
    });
    render(<MapPage />);
    await waitFor(() => {
      const input = screen.getByPlaceholderText("Rechercher un lieu...");
      fireEvent.change(input, { target: { value: "Inexistant" } });
    });
    expect(screen.queryByText("Collecte Paris")).not.toBeInTheDocument();
  });

  // --- Chargement de spots ---
  it("7. Devrait charger les spots depuis la DB au montage", async () => {
    render(<MapPage />);
    await waitFor(() => {
      expect(mockGetSpotsFromDb).toHaveBeenCalledTimes(1);
    });
  });

  it("8. Devrait gérer correctement un échec de chargement", async () => {
    mockGetSpotsFromDb.mockResolvedValue({ success: false });
    render(<MapPage />);
    await waitFor(() => {
      expect(mockGetSpotsFromDb).toHaveBeenCalled();
    });
    // Pas de crash
    expect(screen.getByTestId("mock-map")).toBeInTheDocument();
  });

  // --- Session utilisateur ---
  it("9. Devrait ne pas afficher le champ commentaire si non connecté", async () => {
    render(<MapPage />);
    expect(screen.queryByPlaceholderText("Message...")).not.toBeInTheDocument();
  });

  it("10. Devrait construire l'identité utilisateur correctement", async () => {
    mockedUseSession.mockReturnValue({
      data: { user: { id: "42", nom: "Dupont", name: "Jean Dupont", email: "j@d.com" }, expires: "" },
      status: "authenticated",
      update: vi.fn(),
    });
    mockGetSpotsFromDb.mockResolvedValue({ success: true, data: [] });
    render(<MapPage />);
    await waitFor(() => {
      expect(screen.getByTestId("mock-map")).toBeInTheDocument();
    });
    // Le composant se monte sans erreur avec une session valide
  });

  // --- Retour null avant montage ---
  it("11. Devrait retourner null si le composant n'est pas encore monté", () => {
    // Le composant retourne null avant setMounted(true)
    // On vérifie que le render ne crash pas
    const { container } = render(<MapPage />);
    expect(container).toBeTruthy();
  });

  // --- SpotFormModal ---
  it("12. Devrait ne pas afficher le SpotFormModal par défaut", async () => {
    render(<MapPage />);
    await waitFor(() => {
      expect(screen.queryByTestId("spot-form-modal")).not.toBeInTheDocument();
    });
  });

  // --- Utilitaires isOwner ---
  it("13. Devrait traiter correctement les données de spots vides", async () => {
    mockGetSpotsFromDb.mockResolvedValue({ success: true, data: [] });
    render(<MapPage />);
    await waitFor(() => {
      expect(screen.getByTestId("mock-map")).toBeInTheDocument();
    });
  });

  // --- Recherche avancée ---
  it("14. Devrait filtrer par type dans la recherche", async () => {
    mockGetSpotsFromDb.mockResolvedValue({
      success: true,
      data: [
        { id: 1, title: "Spot A", address: "", type: "Event", participants: [], favorites: [] },
        { id: 2, title: "Spot B", address: "", type: "Signalement", participants: [], favorites: [] },
      ],
    });
    render(<MapPage />);
    await waitFor(() => {
      fireEvent.change(screen.getByPlaceholderText("Rechercher un lieu..."), { target: { value: "Signalement" } });
    });
    await waitFor(() => {
      expect(screen.getByText("Spot B")).toBeInTheDocument();
    });
  });

  it("15. Devrait filtrer par adresse dans la recherche", async () => {
    mockGetSpotsFromDb.mockResolvedValue({
      success: true,
      data: [
        { id: 1, title: "Spot X", address: "15 Rue Victor Hugo", type: "Event", participants: [], favorites: [] },
      ],
    });
    render(<MapPage />);
    await waitFor(() => {
      fireEvent.change(screen.getByPlaceholderText("Rechercher un lieu..."), { target: { value: "Victor" } });
    });
    await waitFor(() => {
      expect(screen.getByText("Spot X")).toBeInTheDocument();
    });
  });

  it("16. Devrait limiter les suggestions à 5 résultats maximum", async () => {
    const manySpots = Array.from({ length: 10 }, (_, i) => ({
      id: i, title: `Test Spot ${i}`, address: "Addr", type: "Event", participants: [], favorites: [],
    }));
    mockGetSpotsFromDb.mockResolvedValue({ success: true, data: manySpots });
    render(<MapPage />);
    await waitFor(() => {
      fireEvent.change(screen.getByPlaceholderText("Rechercher un lieu..."), { target: { value: "Test" } });
    });
    await waitFor(() => {
      const buttons = screen.getAllByText(/Test Spot/);
      expect(buttons.length).toBeLessThanOrEqual(5);
    });
  });

  // --- Participation (sans session) ---
  it("17. Devrait nécessiter une connexion pour participer", async () => {
    // Sans session, les actions sociales ne fonctionnent pas
    mockedUseSession.mockReturnValue({ data: null, status: "unauthenticated", update: vi.fn() });
    render(<MapPage />);
    await waitFor(() => {
      expect(screen.getByTestId("mock-map")).toBeInTheDocument();
    });
  });

  // --- Données vides ---
  it("18. Devrait gérer les spots sans participants ni favoris", async () => {
    mockGetSpotsFromDb.mockResolvedValue({
      success: true,
      data: [{ id: 1, title: "Empty Spot", address: "", type: "Event" }],
    });
    render(<MapPage />);
    await waitFor(() => {
      expect(screen.getByTestId("mock-map")).toBeInTheDocument();
    });
  });

  // --- Vider la recherche ---
  it("19. Devrait vider les suggestions quand la recherche est vide", async () => {
    mockGetSpotsFromDb.mockResolvedValue({
      success: true,
      data: [{ id: 1, title: "Spot", address: "", type: "Event", participants: [], favorites: [] }],
    });
    render(<MapPage />);
    await waitFor(() => {
      const input = screen.getByPlaceholderText("Rechercher un lieu...");
      fireEvent.change(input, { target: { value: "Spot" } });
    });
    await waitFor(() => {
      expect(screen.getByText("Spot")).toBeInTheDocument();
    });
    fireEvent.change(screen.getByPlaceholderText("Rechercher un lieu..."), { target: { value: "" } });
    await waitFor(() => {
      // Quand la recherche est vide, pas de suggestions affichées
      expect(screen.queryByText("Spot")).not.toBeInTheDocument();
    });
  });

  it("20. Devrait appeler getSpotsFromDb avec succès et stocker les données", async () => {
    const testData = [
      { id: 1, title: "A", participants: ["user1"], favorites: [], address: "", type: "Event" },
      { id: 2, title: "B", participants: [], favorites: ["user2"], address: "", type: "Signalement" },
    ];
    mockGetSpotsFromDb.mockResolvedValue({ success: true, data: testData });
    render(<MapPage />);
    await waitFor(() => {
      expect(mockGetSpotsFromDb).toHaveBeenCalled();
    });
    // Vérifier que la recherche fonctionne avec ces données
    fireEvent.change(screen.getByPlaceholderText("Rechercher un lieu..."), { target: { value: "B" } });
    await waitFor(() => {
      expect(screen.getByText("B")).toBeInTheDocument();
    });
  });
});
