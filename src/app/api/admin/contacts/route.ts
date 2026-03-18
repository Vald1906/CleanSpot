import { NextResponse } from "next/server";
import { db } from "@/db";
import { contact } from "@/db/schema";
import { desc } from "drizzle-orm";
import { getServerSession } from "next-auth";
import { authOptions } from "@/app/api/auth/[...nextauth]/route";

// Only admins can get all messages
export async function GET() {
    const session = await getServerSession(authOptions);

    if (session?.user?.statut_pro !== "Admin") {
        return NextResponse.json({ message: "Non autorisé" }, { status: 401 });
    }

    try {
        const messages = await db.select().from(contact).orderBy(desc(contact.createdAt));
        return NextResponse.json(messages, { status: 200 });
    } catch (error) {
        console.error("Erreur de récupération :", error);
        return NextResponse.json({ message: "Erreur serveur" }, { status: 500 });
    }
}
