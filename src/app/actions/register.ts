"use server";

import { db } from "@/db/drizzle";
import { user } from "@/db/schema";
import { hash } from "bcryptjs";
import { redirect } from "next/navigation";

export async function handleRegister(prevState: any, formData: FormData) {
    const nom = formData.get("nom") as string;
    const prenom = formData.get("prenom") as string;
    const email = formData.get("email") as string;
    const password = formData.get("password") as string;
    const statut_pro = formData.get("statut_pro") as string;

    // Validation basique
    if (!email || !password || !nom) {
        return { error: "Veuillez remplir tous les champs obligatoires." };
    }

    const hashedPassword = await hash(password, 12);

    try {
        await db.insert(user).values({
            nom,
            prenom,
            email,
            password: hashedPassword,
            statut_pro,
            roles: ["ROLE_USER"], // Format JSON pour MySQL
            createdAt: new Date(),
        });
    } catch (error: any) {
        if (error.code === 'ER_DUP_ENTRY') {
            return { error: "Cet email est déjà utilisé." };
        }
        return { error: "Une erreur est survenue lors de l'inscription." };
    }

    redirect("/login");
}