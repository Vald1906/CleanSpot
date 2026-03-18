"use server";

import { db } from "@/db/drizzle";
import { user, notifications, participations, favorites, comments, spots } from "@/db/schema";
import { eq, like, or } from "drizzle-orm";
import { compare } from "bcryptjs";
import bcrypt from "bcryptjs";
import { revalidatePath } from "next/cache";
// --- MISE À JOUR DU PROFIL ---
export async function updateUserInfo(userId: number, data: { prenom: string, nom: string, email: string }) {
    try {
        await db.update(user)
            .set({
                prenom: data.prenom,
                nom: data.nom,
                email: data.email,
            })
            .where(eq(user.id, userId));

        revalidatePath('/profil');
        return { success: true };
    } catch (error: any) {
        console.error("Erreur updateUserInfo:", error);
        return { success: false, error: "Impossible de mettre à jour le profil." };
    }
}

// --- EMAIL ET MOT DE PASSE (Simulation) ---
// Note : Le code magique test est '123456'.
export async function sendPasswordResetEmail(userId: number, email: string) {
    try {
        if (!email) return { success: false, error: "Aucun email fourni." };

        const simulatedCode = "123456";

        console.log(`\n======================================`);
        console.log(`[SIMULATION EMAIL] Envoi à ${email}`);
        console.log(`[SIMULATION EMAIL] VOTRE CODE DE VÉRIFICATION : ${simulatedCode}`);
        console.log(`======================================\n`);

        return { success: true };
    } catch (error: any) {
        return { success: false, error: "Erreur lors de l'envoi de l'email." };
    }
}

export async function verifyEmailAndChangePassword(userId: number, code: string, newPassword: string) {
    try {
        if (code !== "123456") {
            return { success: false, error: "Code de vérification invalide." };
        }

        const hashedPassword = await bcrypt.hash(newPassword, 10);

        await db.update(user)
            .set({ password: hashedPassword })
            .where(eq(user.id, userId));

        return { success: true };
    } catch (error: any) {
        console.error("Erreur changement de mot de passe:", error);
        return { success: false, error: "Erreur lors de la mise à jour du mot de passe." };
    }
}
export async function deleteAccount(userId: number, passwordInput: string) {
    try {
        const [foundUser] = await db.select().from(user).where(eq(user.id, userId)).limit(1);
        if (!foundUser) return { success: false, error: "Utilisateur non trouvé." };

        const isMatch = await bcrypt.compare(passwordInput, foundUser.password);
        if (!isMatch) return { success: false, error: "Mot de passe incorrect." };

        // --- NETTOYAGE DES DONNÉES LIÉES ---
        // (Note: Les notifications sont supprimées automatiquement via la clé étrangère ON DELETE CASCADE)

        // Participations, Favoris, Commentaires, Spots (liés par "id - nom")
        const identifierPattern = `${userId} - %`;
        await db.delete(participations).where(like(participations.userName, identifierPattern));
        await db.delete(favorites).where(like(favorites.userName, identifierPattern));
        await db.delete(comments).where(like(comments.author, identifierPattern));
        await db.delete(spots).where(like(spots.author, identifierPattern));

        // Enfin, on supprime l'utilisateur
        await db.delete(user).where(eq(user.id, userId));

        revalidatePath('/');
        return { success: true };
    } catch (error: any) {
        console.error("Erreur deleteAccount:", error);
        return { success: false, error: "Impossible de supprimer le compte." };
    }
}
