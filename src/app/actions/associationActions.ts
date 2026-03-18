"use server";

import { db } from "@/db/drizzle";
import { spots, archived_spots, participations, user, associations } from "@/db/schema";
import { eq, and, or, desc } from "drizzle-orm";
import { revalidatePath } from "next/cache";
import { createNotification } from "./notificationActions";

/**
 * Récupère les données du dashboard et les infos de l'association
 */
export async function getAssociationDashboardData(authorName: string, userId: number) {
    try {
        // 1. Infos de l'association
        const assoInfo = await db.select()
            .from(associations)
            .where(eq(associations.userId, userId))
            .then(rows => rows[0]);

        // 2. Spots actifs
        const activeSpots = await db.select()
            .from(spots)
            .where(eq(spots.author, authorName))
            .orderBy(desc(spots.createdAt));

        // 3. Spots archivés
        const archivedSpots = await db.select()
            .from(archived_spots)
            .where(eq(archived_spots.author, authorName))
            .orderBy(desc(archived_spots.createdAt));

        return {
            success: true,
            data: {
                association: assoInfo,
                active: activeSpots,
                archived: archivedSpots
            }
        };
    } catch (error) {
        console.error("Error fetching association dashboard data:", error);
        return { success: false, error: String(error) };
    }
}

/**
 * Met à jour le profil de l'association
 */
export async function updateAssociationProfile(userId: number, data: any) {
    try {
        // On construit dynamiquement l'objet de mise à jour pour ne pas écraser
        // les champs déjà remplis qui ne sont pas dans le formulaire courant
        const updates: Record<string, any> = {};

        if (data.siren     !== undefined) updates.siren      = data.siren     || null;
        if (data.description !== undefined) updates.description = data.description || null;
        if (data.objetSocial !== undefined) updates.objetSocial = data.objetSocial || null;
        if (data.siteWeb    !== undefined) updates.siteWeb    = data.siteWeb    || null;
        if (data.telephone  !== undefined) updates.telephone  = data.telephone  || null;
        if (data.adresse    !== undefined) updates.adresse    = data.adresse    || null;
        if (data.codePostal !== undefined) updates.codePostal = data.codePostal || null;
        if (data.ville      !== undefined) updates.ville      = data.ville      || null;
        if (data.typeAsso   !== undefined) updates.typeAsso   = data.typeAsso   || null;

        if (Object.keys(updates).length === 0) return { success: true };

        await db.update(associations)
            .set(updates)
            .where(eq(associations.userId, userId));

        revalidatePath("/association/dashboard");
        return { success: true };
    } catch (error) {
        console.error("Error updating association profile:", error);
        return { success: false, error: String(error) };
    }
}

/**
 * Récupère tous les participants pour un spot donné
 */
export async function getSpotParticipants(spotId: number) {
    try {
        const participants = await db.select()
            .from(participations)
            .where(eq(participations.spotId, spotId))
            .orderBy(desc(participations.createdAt));

        return { success: true, data: participants };
    } catch (error) {
        console.error("Error fetching spot participants:", error);
        return { success: false, error: String(error) };
    }
}

/**
 * Vérifie si une association a complété son profil (utilisé pour la redirection au premier login)
 * Champs obligatoires : description, telephone, ville, objetSocial
 */
export async function checkAssociationProfileComplete(userId: number) {
    try {
        const asso = await db.select({
            description: associations.description,
            telephone: associations.telephone,
            ville: associations.ville,
            objetSocial: associations.objetSocial,
        })
            .from(associations)
            .where(eq(associations.userId, userId))
            .then(rows => rows[0]);

        if (!asso) return { complete: false };

        const complete =
            !!asso.description?.trim() &&
            !!asso.telephone?.trim() &&
            !!asso.ville?.trim() &&
            !!asso.objetSocial?.trim();

        return { complete };
    } catch (error) {
        console.error("Error checking association profile:", error);
        return { complete: true }; // On laisse passer en cas d'erreur pour ne pas bloquer
    }
}

/**
 * Met à jour la présence d'un utilisateur et envoie une notification
 */
export async function updateAttendance(
    participationId: number, 
    isPresent: boolean, 
    spotTitle: string, 
    userName: string
) {
    try {
        const presenceValue = isPresent ? 1 : 0;
        
        // 1. Vérifier si le statut est déjà le même pour éviter les doublons de notifications
        const currentParticipation = await db.select({ presence: participations.presence })
            .from(participations)
            .where(eq(participations.id, participationId))
            .then(rows => rows[0]);

        if (currentParticipation && currentParticipation.presence === presenceValue) {
            return { success: true }; // Déjà à jour, on ne fait rien
        }

        // 2. Mettre à jour la présence
        await db.update(participations)
            .set({ presence: presenceValue })
            .where(eq(participations.id, participationId));

        // 2. Tenter de trouver l'ID de l'utilisateur pour la notification
        // Le userName est au format "ID - Nom" ou juste l'email
        const userIdMatch = userName.match(/^(\d+) -/);
        if (userIdMatch) {
            const uid = parseInt(userIdMatch[1]);
            const title = isPresent ? "Présence validée" : "Absence remarquée";
            const message = isPresent 
                ? `Merci pour votre participation ! Votre présence à l'événement "${spotTitle}" a été validée.`
                : `Nous avons remarqué votre absence à l'événement "${spotTitle}". N'oubliez pas d'annuler vos participations si vous ne pouvez pas venir.`;
            
            await createNotification({
                userId: uid,
                title,
                message,
                type: isPresent ? 'Success' : 'Warning'
            });
        }

        revalidatePath("/association/dashboard");
        return { success: true };
    } catch (error) {
        console.error("Error updating attendance:", error);
        return { success: false, error: String(error) };
    }
}
