"use server";
import { db } from "@/db/drizzle";
import { spots } from "@/db/schema";
import { eq } from "drizzle-orm";
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
        });
        // Drizzle MySQL retourne [ResultSetHeader, FieldPacket[]]
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
    }
) {
    try {
        // Construire l'objet de mise à jour dynamiquement
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
        await db.delete(spots).where(eq(spots.id, id));

        revalidatePath("/event");
        revalidatePath("/map");

        return { success: true };
    } catch (error) {
        console.error("Erreur suppression spot:", error);
        return { success: false, error: String(error) };
    }
}