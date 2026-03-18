"use server";
import { db } from "@/db/drizzle";
import { notifications } from "@/db/schema";
import { eq, desc } from "drizzle-orm";
import { revalidatePath } from "next/cache";

export async function getNotifications(userId: number) {
    try {
        const data = await db.select()
            .from(notifications)
            .where(eq(notifications.userId, userId))
            .orderBy(desc(notifications.createdAt));
        return { success: true, data };
    } catch (error) {
        console.error("Erreur getNotifications:", error);
        return { success: false, data: [] };
    }
}

export async function markNotificationAsRead(id: number) {
    try {
        await db.update(notifications)
            .set({ isRead: 1 })
            .where(eq(notifications.id, id));
        revalidatePath("/profil");
        return { success: true };
    } catch (error) {
        console.error("Erreur markNotificationAsRead:", error);
        return { success: false, error: String(error) };
    }
}

export async function createNotification({ userId, title, message, type }: { 
    userId: number, 
    title: string, 
    message: string, 
    type?: 'Info' | 'Success' | 'Warning' | 'Suggestion' 
}) {
    try {
        await db.insert(notifications).values({
            userId,
            title,
            message,
            type: type || 'Info',
        });
        return { success: true };
    } catch (error) {
        console.error("Erreur createNotification:", error);
        return { success: false, error: String(error) };
    }
}
