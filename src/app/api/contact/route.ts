import { NextResponse } from "next/server";
import { db } from "@/db";
import { contact } from "@/db/schema";

export async function POST(request: Request) {
    try {
        const body = await request.json();
        const { email, nom, subject, message, userId } = body;

        if (!email || !nom || !subject || !message) {
            return NextResponse.json(
                { message: "Tous les champs (email, nom, sujet, message) sont obligatoires." },
                { status: 400 }
            );
        }

        // Using user_id mapping to insert userId if it exists
        await db.insert(contact).values({
            email,
            nom,
            subject,
            message,
            userId: userId || null, // Optional, could be from submitted form if logged in
        });

        return NextResponse.json(
            { message: "Message envoyé avec succès." },
            { status: 201 }
        );
    } catch (error) {
        console.error("Erreur lors de l'envoi du message :", error);
        return NextResponse.json(
            { message: "Une erreur est survenue lors de l'envoi du message." },
            { status: 500 }
        );
    }
}
