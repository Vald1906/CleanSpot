"use server";
import { db } from "@/db/drizzle";
import { spots } from "@/db/schema";

export async function getSpotsFromDb() {
    try {
        const data = await db.select().from(spots);
        return { success: true, data };
    } catch (error) {
        console.error("Erreur DB:", error);
        return { success: false, data: [] };
    }
}