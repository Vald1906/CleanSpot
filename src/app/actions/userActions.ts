"use server";

import { db } from "@/db/drizzle";
import { users } from "@/db/schema";
import { eq, or } from "drizzle-orm";

export async function getUserByName(name: string) {
    try {
        // On cherche par nom ou prénom pour être flexible
        const data = await db.select()
            .from(users)
            .where(
                or(
                    eq(users.nom, name),
                    eq(users.prenom, name)
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
