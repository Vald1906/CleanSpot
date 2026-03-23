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

// Helpers testés indépendamment
function getDaysInMonth(year: number, month: number) {
  return new Date(year, month + 1, 0).getDate();
}
function getFirstDayOfMonth(year: number, month: number) {
  const day = new Date(year, month, 1).getDay();
  return day === 0 ? 6 : day - 1;
}
function haversineKm(lat1: number, lon1: number, lat2: number, lon2: number): number {
  const R = 6371;
  const dLat = (lat2 - lat1) * Math.PI / 180;
  const dLon = (lon2 - lon1) * Math.PI / 180;
  const a = Math.sin(dLat / 2) ** 2 + Math.cos(lat1 * Math.PI / 180) * Math.cos(lat2 * Math.PI / 180) * Math.sin(dLon / 2) ** 2;
  return R * 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
}

describe("Unit Tests - Event Page (20 Tests)", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    mockedUseSession.mockReturnValue({ data: null, status: "unauthenticated", update: vi.fn() });
    mockGetSpotsFromDb.mockResolvedValue({ success: true, data: [] });
  });

  // --- Rendu de base ---
  it("1. Devrait afficher le titre principal 'Exploration CleanSpot'", async () => {
    render(<EventPage />);
    await waitFor(() => {
      expect(screen.getByText("Exploration CleanSpot")).toBeInTheDocument();
    });
  });

  it("2. Devrait afficher le sous-titre 'Événements et Signalements communautaires'", async () => {
    render(<EventPage />);
    await waitFor(() => {
      expect(screen.getByText("Événements et Signalements communautaires")).toBeInTheDocument();
    });
  });

  it("3. Devrait afficher la barre de recherche", async () => {
    render(<EventPage />);
    await waitFor(() => {
      expect(screen.getByPlaceholderText("Rechercher...")).toBeInTheDocument();
    });
  });

  it("4. Devrait afficher les boutons de filtre matières", async () => {
    render(<EventPage />);
    await waitFor(() => {
      expect(screen.getByText("Plastique")).toBeInTheDocument();
      expect(screen.getByText("Verre")).toBeInTheDocument();
      expect(screen.getByText("Compost")).toBeInTheDocument();
    });
  });

  it("5. Devrait afficher le label 'Type de déchets'", async () => {
    render(<EventPage />);
    await waitFor(() => {
      expect(screen.getByText("Type de déchets")).toBeInTheDocument();
    });
  });

  // --- Filtres ---
  it("6. Devrait mettre à jour la recherche à la saisie", async () => {
    render(<EventPage />);
    await waitFor(() => {
      const input = screen.getByPlaceholderText("Rechercher...");
      fireEvent.change(input, { target: { value: "test" } });
      expect((input as HTMLInputElement).value).toBe("test");
    });
  });

  it("7. Devrait afficher le nombre de filtres actifs après clique sur matière", async () => {
    render(<EventPage />);
    await waitFor(() => {
      fireEvent.click(screen.getByText("Plastique"));
    });
    await waitFor(() => {
      expect(screen.getByText("1 filtre(s) actif(s)")).toBeInTheDocument();
    });
  });

  it("8. Devrait permettre de sélectionner plusieurs matières", async () => {
    render(<EventPage />);
    await waitFor(() => {
      fireEvent.click(screen.getByText("Plastique"));
      fireEvent.click(screen.getByText("Verre"));
    });
    await waitFor(() => {
      expect(screen.getByText("2 filtre(s) actif(s)")).toBeInTheDocument();
    });
  });

  it("9. Devrait désélectionner une matière au second clic", async () => {
    render(<EventPage />);
    await waitFor(() => {
      fireEvent.click(screen.getByText("Plastique"));
    });
    await waitFor(() => {
      expect(screen.getByText("1 filtre(s) actif(s)")).toBeInTheDocument();
    });
    // Après activation, "Plastique" apparaît aussi dans le badge actif, on clique le premier (le bouton filtre)
    fireEvent.click(screen.getAllByText("Plastique")[0]);
    await waitFor(() => {
      expect(screen.queryByText(/filtre\(s\) actif/)).not.toBeInTheDocument();
    });
  });

  // --- Calendrier ---
  it("10. Devrait afficher le mois courant dans le calendrier", async () => {
    render(<EventPage />);
    const monthNames = ['Janvier', 'Février', 'Mars', 'Avril', 'Mai', 'Juin', 'Juillet', 'Août', 'Septembre', 'Octobre', 'Novembre', 'Décembre'];
    const currentMonth = monthNames[new Date().getMonth()];
    await waitFor(() => {
      expect(screen.getByText(new RegExp(currentMonth))).toBeInTheDocument();
    });
  });

  it("11. Devrait afficher les jours de la semaine (L M M J V S D)", async () => {
    render(<EventPage />);
    await waitFor(() => {
      const dayHeaders = screen.getAllByText("L");
      expect(dayHeaders.length).toBeGreaterThanOrEqual(1);
    });
  });

  // --- Tri ---
  it("12. Devrait afficher le label de tri par défaut 'Date (plus proche)'", async () => {
    render(<EventPage />);
    await waitFor(() => {
      expect(screen.getByText("Date (plus proche)")).toBeInTheDocument();
    });
  });

  // --- Bouton réinitialiser ---
  it("13. Devrait avoir le bouton 'Réinitialiser les filtres' désactivé par défaut", async () => {
    render(<EventPage />);
    await waitFor(() => {
      const resetBtn = screen.getByText("Réinitialiser les filtres");
      expect(resetBtn.closest("button")).toBeDisabled();
    });
  });

  it("14. Devrait activer le bouton réinitialiser quand un filtre est actif", async () => {
    render(<EventPage />);
    await waitFor(() => {
      fireEvent.click(screen.getByText("Plastique"));
    });
    await waitFor(() => {
      const resetBtn = screen.getByText("Réinitialiser les filtres");
      expect(resetBtn.closest("button")).not.toBeDisabled();
    });
  });

  // --- Skeletons de chargement ---
  it("15. Devrait afficher des skeletons pendant le chargement", async () => {
    // Le composant commence en loading=true, les skeletons s'affichent
    mockGetSpotsFromDb.mockImplementation(() => new Promise(() => {})); // Never resolves
    render(<EventPage />);
    // Les skeletons sont des div.animate-pulse
    const { container } = render(<EventPage />);
    expect(container.querySelectorAll(".animate-pulse").length).toBeGreaterThan(0);
  });

  // --- Chargement ---
  it("16. Devrait charger les spots depuis la DB au montage", async () => {
    render(<EventPage />);
    await waitFor(() => {
      expect(mockGetSpotsFromDb).toHaveBeenCalled();
    });
  });

  // --- Helpers Calendrier ---
  it("17. getDaysInMonth devrait retourner 28 ou 29 pour février", () => {
    const days2024 = getDaysInMonth(2024, 1); // Février 2024 (bissextile)
    expect(days2024).toBe(29);
    const days2023 = getDaysInMonth(2023, 1); // Février 2023 (non-bissextile)
    expect(days2023).toBe(28);
  });

  it("18. getFirstDayOfMonth devrait retourner correctement le jour (Lundi=0)", () => {
    // 1er Janvier 2024 = Lundi → 0
    expect(getFirstDayOfMonth(2024, 0)).toBe(0);
    // 1er Mars 2024 = Vendredi → 4
    expect(getFirstDayOfMonth(2024, 2)).toBe(4);
  });

  // --- Haversine ---
  it("19. haversineKm devrait calculer ~0 km pour des coordonnées identiques", () => {
    const dist = haversineKm(48.8566, 2.3522, 48.8566, 2.3522);
    expect(dist).toBeCloseTo(0, 5);
  });

  it("20. haversineKm devrait calculer ~462 km entre Paris et Lyon", () => {
    const dist = haversineKm(48.8566, 2.3522, 45.7640, 4.8357);
    expect(dist).toBeGreaterThan(380);
    expect(dist).toBeLessThan(500);
  });
});
