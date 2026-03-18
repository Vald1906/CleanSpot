import { NextResponse } from 'next/server';
import { db } from '@/db/drizzle';
import { contact, notifications } from '@/db/schema';
import { eq } from 'drizzle-orm';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/app/api/auth/[...nextauth]/route';

export async function POST(req: Request) {
    try {
        const session = await getServerSession(authOptions);
        
        // Ensure user is an admin
        if (session?.user?.statut_pro !== "Admin") {
            return NextResponse.json({ success: false, error: 'Non autorisé' }, { status: 403 });
        }

        const body = await req.json();
        const { messageId, replyText } = body;

        if (!messageId || !replyText) {
            return NextResponse.json({ success: false, error: 'Données manquantes' }, { status: 400 });
        }

        // Fetch original message
        const targetMessage = await db.select().from(contact).where(eq(contact.id, messageId)).limit(1);

        if (targetMessage.length === 0) {
            return NextResponse.json({ success: false, error: 'Message introuvable' }, { status: 404 });
        }

        const userId = targetMessage[0].userId;
        const originalSubject = targetMessage[0].subject;

        if (!userId) {
            return NextResponse.json({ success: false, error: "L'utilisateur n'est pas connecté au site, réponse impossible via notification." }, { status: 400 });
        }

        // Create notification
        await db.insert(notifications).values({
            userId: userId,
            title: `Réponse du support : ${originalSubject}`,
            message: replyText,
            type: 'Info',
            isRead: 0,
            createdAt: new Date(),
        });

        return NextResponse.json({ success: true, message: 'Réponse envoyée avec succès' }, { status: 200 });

    } catch (error) {
        console.error('Erreur reply contact:', error);
        return NextResponse.json({ success: false, error: 'Erreur interne du serveur' }, { status: 500 });
    }
}
