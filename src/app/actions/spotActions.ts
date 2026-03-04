"use server";
import { db } from "@/db/drizzle";
// AJOUT de archived_spots dans l'import ci-dessous
import { spots, archived_spots, comments, participations, favorites } from "@/db/schema";
import { eq, and } from "drizzle-orm";
import { revalidatePath } from "next/cache";

// ---------- READ ----------
export async function getSpotsFromDb() {
    try {
        const data = await db.select().from(spots);
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

export async function getComments(spotId: number) {
    try {
        const data = await db.select().from(comments).where(eq(comments.spotId, spotId));
        return { success: true, data };
    } catch (error) {
        console.error("Erreur récupération commentaires:", error);
        return { success: false, data: [] };
    }
}

export async function addComment(spotId: number, author: string, content: string) {
    try {
        await db.insert(comments).values({ spotId, author, content });
        revalidatePath("/event");
        revalidatePath("/map");
        return { success: true };
    } catch (error) {
        console.error("Erreur ajout commentaire:", error);
        return { success: false, error: String(error) };
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