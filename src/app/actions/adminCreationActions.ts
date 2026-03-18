"use server";

import { db } from "@/db/drizzle";
import { user } from "@/db/schema";
import { eq } from "drizzle-orm";
import { compare, hash } from "bcryptjs";
import { getServerSession } from "next-auth/next";
import { authOptions } from "@/app/api/auth/[...nextauth]/route";

export async function verifyAdminPassword(password: string) {
    try {
        const session = await getServerSession(authOptions);
        if (!session || !session.user || session.user.statut_pro !== "Admin") {
            return { success: false, error: "Non autorisé" };
        }

        const email = session.user.email;
        if(!email) return { success: false, error: "Email admin introuvable" };

        const adminRecords = await db.select().from(user).where(eq(user.email, email)).limit(1);
        if (adminRecords.length === 0) {
            return { success: false, error: "Admin introuvable en base" };
        }

        const adminUser = adminRecords[0];
        const isValid = await compare(password, adminUser.password);

        if (!isValid) {
            return { success: false, error: "Mot de passe incorrect" };
        }

        return { success: true };
    } catch (error) {
        console.error("Error verifying admin password:", error);
        return { success: false, error: "Erreur serveur de vérification" };
    }
}

export async function createAdminAccount(data: { prenom: string, nom: string, email: string, password: string }) {
    try {
        const session = await getServerSession(authOptions);
        if (!session || !session.user || session.user.statut_pro !== "Admin") {
            return { success: false, error: "Non autorisé" };
        }

        // Vérifier si l'email existe déjà
        const existingUser = await db.select().from(user).where(eq(user.email, data.email)).limit(1);
        if (existingUser.length > 0) {
            return { success: false, error: "Cet email est déjà utilisé." };
        }

        const hashedPassword = await hash(data.password, 10);

        await db.insert(user).values({
            prenom: data.prenom,
            nom: data.nom,
            email: data.email,
            password: hashedPassword,
            roles: ["ROLE_ADMIN"],
            statut_pro: "Admin",
            createdAt: new Date()
        });

        return { success: true };
    } catch (error) {
        console.error("Error creating admin account:", error);
        return { success: false, error: String(error) };
    }
}
