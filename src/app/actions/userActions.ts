"use server";

import { db } from "@/db/drizzle";
import { user, associations } from "@/db/schema";
import { eq, or } from "drizzle-orm";

export async function getUserByName(identifier: string) {
    try {
        const data = await db.select({
            id: user.id,
            email: user.email,
            roles: user.roles,
            password: user.password,
            nom: user.nom,
            statut_pro: user.statut_pro,
            prenom: user.prenom,
            createdAt: user.createdAt,
            isVerified: associations.isVerified,
        })
            .from(user)
            .leftJoin(associations, eq(user.id, associations.userId))
            .where(
                or(
                    eq(user.email, identifier),
                    eq(user.nom, identifier),
                    eq(user.prenom, identifier)
                )
            )
            .limit(1);

        if (data.length > 0) {
            return { success: true, user: data[0] };
        }
        return { success: false, error: "Utilisateur non trouvé en base de données" };
    } catch (error) {
        console.error("Erreur récupération utilisateur:", error);
        return { success: false, error: String(error) };
    }
}