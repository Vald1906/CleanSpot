"use server";

import { db } from "@/db/drizzle";
import { user } from "@/db/schema";
import { eq } from "drizzle-orm";
import { compare } from "bcryptjs";
import { cookies } from "next/headers";
import { redirect } from "next/navigation";

export async function handleLogin(prevState: any, formData: FormData) {
    const email = formData.get("email") as string;
    const password = formData.get("password") as string;

    // 1. Chercher l'utilisateur
    const users = await db.select().from(user).where(eq(user.email, email)).limit(1);
    const existingUser = users[0];

    if (!existingUser) {
        return { error: "Identifiants invalides." };
    }

    // 2. Vérifier le mot de passe
    const isPasswordValid = await compare(password, existingUser.password);

    if (!isPasswordValid) {
        return { error: "Identifiants invalides." };
    }

    // 3. Créer la session (Cookie)
    // Ici on stocke les infos basiques, adapte selon tes besoins
    const sessionData = JSON.stringify({
        id: existingUser.id,
        nom: existingUser.nom,
        prenom: existingUser.prenom,
        email: existingUser.email
    });

    const cookieStore = await cookies();
    cookieStore.set("session_user", sessionData, {
        httpOnly: true,
        secure: process.env.NODE_ENV === "production",
        maxAge: 60 * 60 * 24 * 7, // 1 semaine
        path: "/",
    });

    // 4. Redirection
    redirect("/dashboard");
}