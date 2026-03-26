"use server";

import { db } from "@/db/drizzle";
import { user, associations } from "@/db/schema";
import { hash } from "bcryptjs";
import { redirect } from "next/navigation";
import { eq } from "drizzle-orm";

export async function handleRegister(prevState: any, formData: FormData) {
    const statut_pro = formData.get("statut_pro") as string;
    
    // Extraction flexible selon le type
    const email = (formData.get("email_particulier") || formData.get("email_asso")) as string;
    const password = (formData.get("password_particulier") || formData.get("password_asso")) as string;

    // Champs pour Particulier
    const nom = formData.get("nom") as string;
    const prenom = formData.get("prenom") as string;

    // Champs pour Association
    const nomAsso = formData.get("nomAsso") as string;
    const rnaNumber = formData.get("rnaNumber") as string;
    const typeAsso = formData.get("typeAsso") as string;
    const adresse = formData.get("adresse") as string;
    const siteWeb = formData.get("siteWeb") as string;

    // Validation basique
    if (!email || !password || !statut_pro) {
        return { error: "Veuillez remplir tous les champs obligatoires." };
    }

    if (statut_pro === "Particulier" && (!nom || !prenom)) {
        return { error: "Veuillez remplir votre nom et prénom." };
    }

    if (statut_pro === "Association" && (!nomAsso || !rnaNumber)) {
        return { error: "Veuillez remplir le nom et le numéro RNA de l'association." };
    }

    const hashedPassword = await hash(password, 12);
    
    // Vérification de l'existence de l'email AVANT toute opération
    const [existingUser] = await db.select().from(user).where(eq(user.email, email)).limit(1);

    if (existingUser) {
        return { error: "Cet email est déjà utilisé." };
    }

    // Si c'est une association, on vérifie aussi le RNA
    if (statut_pro === "Association" && rnaNumber) {
        const [existingAsso] = await db.select().from(associations).where(eq(associations.rnaNumber, rnaNumber)).limit(1);
        if (existingAsso) {
            return { error: "Ce numéro RNA est déjà utilisé." };
        }
    }

    try {
        await db.transaction(async (tx) => {
            const [newUser] = await tx.insert(user).values({
                nom: statut_pro === "Association" ? nomAsso : nom,
                prenom: statut_pro === "Association" ? "Association" : prenom,
                email,
                password: hashedPassword,
                statut_pro,
                roles: ["ROLE_USER"],
                createdAt: new Date(),
            }).$returningId();

            if (statut_pro === "Association") {
                await tx.insert(associations).values({
                    userId: newUser.id,
                    nomAsso,
                    rnaNumber,
                    typeAsso,
                    adresse,
                    siteWeb,
                    createdAt: new Date(),
                });
            }
        });
    } catch (error: any) {
        // En cas de conflit résiduel (si checks ratés par race condition)
        if (error.code === 'ER_DUP_ENTRY') {
            if (error.message.includes('rna_number')) {
                return { error: "Ce numéro RNA est déjà utilisé." };
            }
            return { error: "Cet email est déjà utilisé." };
        }
        
        // Log uniquement les erreurs inattendues
        console.error("Unexpected registration error:", error);
        return { error: "Une erreur est survenue lors de l'inscription." };
    }

    redirect("/login");
}