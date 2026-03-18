"use server";
import { db } from "@/db/drizzle";
import { spots, archived_spots, comments, participations, favorites, user } from "@/db/schema";
import { eq, and, inArray, or } from "drizzle-orm";
import { revalidatePath } from "next/cache";
import { desc, asc } from "drizzle-orm";
import { sql } from "drizzle-orm";
import { createNotification } from "./notificationActions";

// ---------- READ ----------
// À mettre à jour dans spotActions.ts
export async function getSpotsFromDb() {
    try {
        const allSpots = await db.select().from(spots);
        const allParticipations = await db.select().from(participations);
        const allFavorites = await db.select().from(favorites);

        const data = allSpots.map(spot => {
            const spotParticipations = allParticipations.filter(p => p.spotId === spot.id);
            const spotFavorites = allFavorites.filter(f => f.spotId === spot.id);

            return {
                ...spot,
                // On remplace le compteur statique par le nombre réel de participations trouvées
                participants_count: spotParticipations.length,
                // On garde notre liste de noms pour le bouton
                participants: spotParticipations.map(p => p.userName),
                // On ajoute la liste des favoris pour la page
                favorites: spotFavorites.map(f => f.userName)
            };
        });

        return { success: true, data };
    } catch (error) {
        console.error("Erreur DB:", error);
        return { success: false, data: [] };
    }
}

// NOUVELLE FONCTION AJOUTÉE
export async function getArchivedSpotsFromDb() {
    try {
        const data = await db.select().from(archived_spots);
        return { success: true, data };
    } catch (error) {
        console.error("Erreur DB Archived:", error);
        return { success: false, data: [] };
    }
}

// ========== ARCHIVAGE ==========

export async function archiveSpot(id: number) {
    try {
        const spotToArchive = await db.select()
            .from(spots)
            .where(eq(spots.id, id))
            .then(rows => rows[0]);

        if (!spotToArchive) {
            return { success: false, error: "Spot introuvable" };
        }

        // 1. Récupérer les favoris avant de supprimer le spot
        const spotFavorites = await db.select().from(favorites).where(eq(favorites.spotId, id));

        // 2. Archiver le spot
        await db.insert(archived_spots).values({
            ...spotToArchive,
        });

        await db.delete(spots).where(eq(spots.id, id));

        // 3. Notifier les utilisateurs qui avaient ce spot en favori
        for (const fav of spotFavorites) {
            // L'identifiant est au format "ID - Nom"
            const userIdMatch = fav.userName.match(/^(\d+) -/);
            if (userIdMatch) {
                const uid = parseInt(userIdMatch[1]);
                await createNotification({
                    userId: uid,
                    title: "Spot terminé",
                    message: `Le spot "${spotToArchive.title}" a été archivé car il est terminé.`,
                    type: 'Info'
                });
            } else {
                console.warn(`Impossible de notifier l'utilisateur ${fav.userName} : ID non trouvé.`);
            }
        }

        revalidatePath("/event");
        revalidatePath("/map");

        return { success: true };
    } catch (error) {
        console.error("Erreur lors de l'archivage du spot:", error);
        return { success: false, error: String(error) };
    }
}

// ---------- CREATE ----------
export async function createSpot(spotData: {
    type: "Event" | "Signalement" | "Point de Tri";
    title: string;
    description?: string;
    author: string;
    latitude: number;
    longitude: number;
    address: string;
    image?: string;
    date?: string;
    hours?: string;
    urgency?: string;
    materials?: string[];
    maxParticipants?: number;
}) {
    try {
        const result = await db.insert(spots).values({
            type: spotData.type,
            title: spotData.title,
            description: spotData.description || null,
            author: spotData.author,
            latitude: spotData.latitude,
            longitude: spotData.longitude,
            address: spotData.address,
            image: spotData.image || null,
            date: spotData.date ? new Date(spotData.date) : null,
            hours: spotData.hours || null,
            urgency: spotData.urgency || null,
            materials: spotData.materials || null,
            maxParticipants: spotData.maxParticipants || 0,
        });
        const insertId = (result as any)[0]?.insertId;

        revalidatePath("/event");
        revalidatePath("/map");

        return { success: true, id: insertId };
    } catch (error) {
        console.error("Erreur création spot:", error);
        return { success: false, error: String(error) };
    }
}

// ---------- UPDATE ----------
export async function updateSpot(
    id: number,
    spotData: {
        type?: "Event" | "Signalement" | "Point de Tri";
        title?: string;
        description?: string;
        author?: string;
        latitude?: number;
        longitude?: number;
        address?: string;
        image?: string;
        date?: string;
        hours?: string;
        urgency?: string;
        materials?: string[];
        maxParticipants?: number;
    }
) {
    try {
        const updateData: Record<string, any> = {};
        if (spotData.type !== undefined) updateData.type = spotData.type;
        if (spotData.title !== undefined) updateData.title = spotData.title;
        if (spotData.description !== undefined) updateData.description = spotData.description;
        if (spotData.author !== undefined) updateData.author = spotData.author;
        if (spotData.latitude !== undefined) updateData.latitude = spotData.latitude;
        if (spotData.longitude !== undefined) updateData.longitude = spotData.longitude;
        if (spotData.address !== undefined) updateData.address = spotData.address;
        if (spotData.image !== undefined) updateData.image = spotData.image;
        if (spotData.date !== undefined) updateData.date = spotData.date;
        if (spotData.hours !== undefined) updateData.hours = spotData.hours;
        if (spotData.urgency !== undefined) updateData.urgency = spotData.urgency;
        if (spotData.materials !== undefined) updateData.materials = spotData.materials;
        if (spotData.maxParticipants !== undefined) updateData.maxParticipants = spotData.maxParticipants;

        await db.update(spots).set(updateData).where(eq(spots.id, id));

        revalidatePath("/event");
        revalidatePath("/map");

        return { success: true };
    } catch (error) {
        console.error("Erreur mise à jour spot:", error);
        return { success: false, error: String(error) };
    }
}

// ---------- DELETE ----------
export async function deleteSpot(id: number) {
    try {
        await db.delete(comments).where(eq(comments.spotId, id));
        await db.delete(participations).where(eq(participations.spotId, id));
        await db.delete(favorites).where(eq(favorites.spotId, id));
        await db.delete(spots).where(eq(spots.id, id));

        revalidatePath("/event");
        revalidatePath("/map");

        return { success: true };
    } catch (error) {
        console.error("Erreur suppression spot:", error);
        return { success: false, error: String(error) };
    }
}

// ========== COMMENTAIRES ==========

export async function addComment({ spotId, author, content }: { spotId: number, author: string, content: string }) {
    try {
        await db.insert(comments).values({
            spotId,
            author,
            content,
        });
        return { success: true };
    } catch (error: any) {
        console.error("Erreur addComment:", error);
        return { success: false, error: error.message };
    }
}
// Optionnel : s'assurer que getComments récupère par date
export async function getComments(spotId: number) {
    try {
        const data = await db.select()
            .from(comments)
            .where(eq(comments.spotId, spotId))
            .orderBy(asc(comments.createdAt)); // Les plus vieux en haut, nouveaux en bas
        return { success: true, data };
    } catch (error) {
        return { success: false, data: [] };
    }
}

// ========== PARTICIPATIONS ==========

export async function getParticipations(spotId: number) {
    try {
        const data = await db.select().from(participations).where(eq(participations.spotId, spotId));
        return { success: true, data, count: data.length };
    } catch (error) {
        console.error("Erreur récupération participations:", error);
        return { success: false, data: [], count: 0 };
    }
}

export async function toggleParticipation(spotId: number, userName: string) {
    try {
        const existing = await db.select().from(participations)
            .where(and(eq(participations.spotId, spotId), eq(participations.userName, userName)));

        if (existing.length > 0) {
            await db.delete(participations)
                .where(and(eq(participations.spotId, spotId), eq(participations.userName, userName)));
            revalidatePath("/event");
            revalidatePath("/map");
            return { success: true, participating: false };
        } else {
            // Vérifier la limite avant d'ajouter
            const spot = await db.select().from(spots).where(eq(spots.id, spotId)).then(rows => rows[0]);
            if (spot && spot.maxParticipants !== null && spot.maxParticipants > 0) {
                const currentCount = await db.select().from(participations).where(eq(participations.spotId, spotId)).then(rows => rows.length);
                if (currentCount >= spot.maxParticipants) {
                    return { success: false, error: "Désolé, la limite de participants est atteinte." };
                }
            }
            await db.insert(participations).values({ spotId, userName });
            revalidatePath("/event");
            revalidatePath("/map");
            return { success: true, participating: true };
        }
    } catch (error) {
        console.error("Erreur toggle participation:", error);
        return { success: false, error: String(error) };
    }
}

// ========== FAVORIS ==========

export async function getFavorites(spotId: number) {
    try {
        const data = await db.select().from(favorites).where(eq(favorites.spotId, spotId));
        return { success: true, data, count: data.length };
    } catch (error) {
        console.error("Erreur récupération favoris:", error);
        return { success: false, data: [], count: 0 };
    }
}

export async function toggleFavorite(spotId: number, userName: string) {
    try {
        const existing = await db.select().from(favorites)
            .where(and(eq(favorites.spotId, spotId), eq(favorites.userName, userName)));

        if (existing.length > 0) {
            await db.delete(favorites)
                .where(and(eq(favorites.spotId, spotId), eq(favorites.userName, userName)));
            revalidatePath("/event");
            revalidatePath("/map");
            return { success: true, favorited: false };
        } else {
            await db.insert(favorites).values({ spotId, userName });
            revalidatePath("/event");
            revalidatePath("/map");
            return { success: true, favorited: true };
        }
    } catch (error) {
        console.error("Erreur toggle favori:", error);
        return { success: false, error: String(error) };
    }
}
// ========== PROFIL UTILISATEUR ==========

export async function getUserProfileData(userName: string, userFullIdentity?: string) {
    try {
        const fullId = userFullIdentity || userName;
        
        // 1. Spots actifs créés par l'utilisateur
        const createdActiveSpots = await db.select().from(spots).where(
            or(eq(spots.author, userName), eq(spots.author, fullId))
        );

        // 2. Spots archivés créés par l'utilisateur
        const createdArchivedSpots = await db.select().from(archived_spots).where(
            or(eq(archived_spots.author, userName), eq(archived_spots.author, fullId))
        );

        // Fusionner et ajouter le statut
        const createdSpots = [
            ...createdActiveSpots.map(s => ({ ...s, status: 'en cours' })),
            ...createdArchivedSpots.map(s => ({ ...s, status: 'terminé' }))
        ].sort((a, b) => {
            const dateA = a.createdAt ? new Date(a.createdAt).getTime() : 0;
            const dateB = b.createdAt ? new Date(b.createdAt).getTime() : 0;
            return dateB - dateA;
        });

        // 3. Participations (actives et archivées)
        const participatedEntries = await db.select().from(participations).where(
            or(eq(participations.userName, fullId), eq(participations.userName, userName))
        );

        let participatedSpots: any[] = [];
        if (participatedEntries.length > 0) {
            const spotIds = participatedEntries.map(p => p.spotId);
            
            // Chercher dans les spots actifs
            const activeParticipated = await db.select().from(spots).where(inArray(spots.id, spotIds));
            
            // Chercher dans les spots archivés
            const archivedParticipated = await db.select().from(archived_spots).where(inArray(archived_spots.id, spotIds));

            // Fusionner avec les infos de présence
            participatedSpots = [
                ...activeParticipated.map(s => ({ ...s, status: 'en cours' })),
                ...archivedParticipated.map(s => ({ ...s, status: 'terminé' }))
            ].map(spot => {
                const pEntry = participatedEntries.find(p => p.spotId === spot.id);
                return {
                    ...spot,
                    presence: pEntry ? pEntry.presence : null
                };
            }).sort((a, b) => {
                const dateA = a.date ? new Date(a.date).getTime() : (a.createdAt ? new Date(a.createdAt).getTime() : 0);
                const dateB = b.date ? new Date(b.date).getTime() : (b.createdAt ? new Date(b.createdAt).getTime() : 0);
                return dateB - dateA;
            });
        }

        // 4. Spots favoris de l'utilisateur (utilise le format unifié id - nom)
        const favoriteEntries = await db.select().from(favorites).where(
            or(eq(favorites.userName, fullId), eq(favorites.userName, userName))
        );
        const favoriteSpots = favoriteEntries.length > 0
            ? await db.select().from(spots).where(inArray(spots.id, favoriteEntries.map(f => f.spotId)))
            : [];

        return {
            success: true,
            data: {
                created: createdSpots,
                participated: participatedSpots,
                favorites: favoriteSpots
            }
        };
    } catch (error) {
        console.error("Erreur récupération données profil:", error);
        return { success: false, error: String(error) };
    }
}


