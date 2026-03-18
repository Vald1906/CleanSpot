"use server";

import { db } from "@/db/drizzle";
import { user, associations } from "@/db/schema";
import { eq, desc } from "drizzle-orm";
import { revalidatePath } from "next/cache";

/**
 * Récupère toutes les associations, avec les infos de l'utilisateur jointes
 */
export async function getAllAssociations() {
    try {
        const data = await db.select({
            id: associations.id,
            userId: associations.userId,
            nomAsso: associations.nomAsso,
            rnaNumber: associations.rnaNumber,
            typeAsso: associations.typeAsso,
            siren: associations.siren,
            description: associations.description,
            objetSocial: associations.objetSocial,
            siteWeb: associations.siteWeb,
            telephone: associations.telephone,
            adresse: associations.adresse,
            codePostal: associations.codePostal,
            ville: associations.ville,
            isVerified: associations.isVerified,
            createdAt: associations.createdAt,
            userEmail: user.email,
            userPrenom: user.prenom,
            userNom: user.nom,
        })
            .from(associations)
            .innerJoin(user, eq(associations.userId, user.id))
            .orderBy(desc(associations.createdAt));

        return { success: true, data };
    } catch (error) {
        console.error("Error fetching admin associations:", error);
        return { success: false, error: String(error) };
    }
}

import { createNotification } from "./notificationActions";

/**
 * Met à jour le statut de vérification d'une association
 */
export async function updateAssociationVerification(assoId: number, isVerified: number) {
    try {
        await db.update(associations)
            .set({ isVerified: isVerified })
            .where(eq(associations.id, assoId));

        // Get the userId for this association
        const assoRecords = await db.select({ userId: associations.userId })
            .from(associations)
            .where(eq(associations.id, assoId))
            .limit(1);

        if (assoRecords.length > 0 && assoRecords[0].userId) {
            const userId = assoRecords[0].userId;
            
            // Send notification
            if (isVerified === 1) {
                await createNotification({
                    userId,
                    title: "Compte Association Vérifié",
                    message: "Félicitations ! Votre compte association a été vérifié par notre équipe. Vous avez désormais accès à toutes les fonctionnalités du tableau de bord.",
                    type: "Success"
                });
            } else {
                await createNotification({
                    userId,
                    title: "Compte Association Suspendu",
                    message: "Votre compte association a été suspendu ou révoqué par un administrateur. Vos fonctionnalités sont temporairement restreintes.",
                    type: "Warning"
                });
            }
        }

        revalidatePath("/admin/associations");
        return { success: true };
    } catch (error) {
        console.error("Error updating association status:", error);
        return { success: false, error: String(error) };
    }
}
