"use server";

import { db } from "@/db/drizzle";
import { spots, archived_spots, comments, participations, favorites } from "@/db/schema";
import { desc, eq } from "drizzle-orm";
import { revalidatePath } from "next/cache";

export async function getAllSpotsForAdmin() {
    try {
        const result = await db.select().from(spots).orderBy(desc(spots.createdAt));
        return { success: true, data: result };
    } catch (error) {
        console.error("Error fetching all spots for admin:", error);
        return { success: false, error: String(error) };
    }
}

export async function deleteSpotByAdmin(spotId: number) {
    try {
        // Supprimer toutes les données liées au spot pour éviter les problèmes de clés étrangères
        await db.delete(comments).where(eq(comments.spotId, spotId));
        await db.delete(participations).where(eq(participations.spotId, spotId));
        await db.delete(favorites).where(eq(favorites.spotId, spotId));

        // Supprimer le spot de la table `spots` et potentiellement `archived_spots`
        await db.delete(spots).where(eq(spots.id, spotId));
        await db.delete(archived_spots).where(eq(archived_spots.id, spotId));

        revalidatePath("/admin/spots");
        revalidatePath("/dashboard");
        revalidatePath("/event");
        return { success: true };
    } catch (error) {
        console.error("Error deleting spot by admin:", error);
        return { success: false, error: String(error) };
    }
}

export async function updateSpotByAdmin(spotId: number, data: any) {
    try {
        await db.update(spots).set({
            title: data.title,
            description: data.description,
            type: data.type,
            image: data.image,
            materials: JSON.stringify(data.materials || []),
            address: data.address,
            latitude: data.latitude,
            longitude: data.longitude,
            date: data.date,
            hours: data.hours,
            urgency: data.urgency,
            maxParticipants: data.maxParticipants || 0,
        }).where(eq(spots.id, spotId));

        revalidatePath("/admin/spots");
        revalidatePath(`/spot/${spotId}`);
        revalidatePath("/dashboard");
        revalidatePath("/event");
        
        return { success: true };
    } catch (error) {
        console.error("Error updating spot by admin:", error);
        return { success: false, error: String(error) };
    }
}
