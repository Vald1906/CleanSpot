"use server";

import { db } from "@/db/drizzle";
import { comments, spots, archived_spots } from "@/db/schema";
import { eq, desc } from "drizzle-orm";
import { revalidatePath } from "next/cache";

export async function reportComment(commentId: number) {
    try {
        await db.update(comments)
            .set({ isReported: 1 })
            .where(eq(comments.id, commentId));
        
        // Obtenir l'ID du spot pour revalider
        const comm = await db.select({ spotId: comments.spotId }).from(comments).where(eq(comments.id, commentId)).limit(1);
        if (comm.length > 0) {
            revalidatePath(`/spot/${comm[0].spotId}`);
            revalidatePath(`/dashboard`);
            revalidatePath(`/event`);
        }
        revalidatePath(`/admin/comments`);
        return { success: true };
    } catch (error) {
        console.error("Error reporting comment:", error);
        return { success: false, error: String(error) };
    }
}

export async function getReportedComments() {
    try {
        const reported = await db.select({
            id: comments.id,
            author: comments.author,
            content: comments.content,
            createdAt: comments.createdAt,
            spotId: comments.spotId,
            spotTitle: spots.title,
            archivedTitle: archived_spots.title,
        })
        .from(comments)
        .leftJoin(spots, eq(comments.spotId, spots.id))
        .leftJoin(archived_spots, eq(comments.spotId, archived_spots.id))
        .where(eq(comments.isReported, 1))
        .orderBy(desc(comments.createdAt));

        // On fusionne le titre (actif ou archivé)
        const formattedData = reported.map(r => ({
            ...r,
            spotTitle: r.spotTitle || r.archivedTitle || "Spot Introuvable",
            archivedTitle: undefined // on nettoie
        }));

        return { success: true, data: formattedData };
    } catch (error) {
        console.error("Error getting reported comments:", error);
        return { success: false, error: String(error) };
    }
}

export async function deleteReportedComment(commentId: number) {
    try {
        await db.delete(comments).where(eq(comments.id, commentId));
        revalidatePath("/admin/comments");
        return { success: true };
    } catch (error) {
        console.error("Error deleting comment:", error);
        return { success: false, error: String(error) };
    }
}

export async function ignoreCommentReport(commentId: number) {
    try {
        await db.update(comments)
            .set({ isReported: 0 })
            .where(eq(comments.id, commentId));
        
        revalidatePath("/admin/comments");
        return { success: true };
    } catch (error) {
        console.error("Error ignoring comment report:", error);
        return { success: false, error: String(error) };
    }
}
