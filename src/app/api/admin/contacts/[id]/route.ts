import { NextResponse } from "next/server";
import { db } from "@/db";
import { contact } from "@/db/schema";
import { eq } from "drizzle-orm";
import { getServerSession } from "next-auth";
import { authOptions } from "@/app/api/auth/[...nextauth]/route"; // Try to get auth options correctly, though let's just use getServerSession directly or mock auth check

export async function DELETE(
    request: Request,
    { params }: { params: Promise<{ id: string }> }
) {
    try {
        const session = await getServerSession(authOptions);

        // Check if user is admin. The dashbaord check uses session?.user?.statut_pro !== "Admin"
        if (session?.user?.statut_pro !== "Admin") {
            return NextResponse.json(
                { message: "Non autorisé" },
                { status: 401 }
            );
        }

        const { id: rawId } = await params;
        const id = parseInt(rawId, 10);
        if (isNaN(id)) {
            return NextResponse.json(
                { message: "ID invalide." },
                { status: 400 }
            );
        }

        await db.delete(contact).where(eq(contact.id, id));

        return NextResponse.json(
            { message: "Message supprimé avec succès." },
            { status: 200 }
        );
    } catch (error) {
        console.error("Erreur lors de la suppression du message :", error);
        return NextResponse.json(
            { message: "Une erreur est survenue lors de la suppression du message." },
            { status: 500 }
        );
    }
}
