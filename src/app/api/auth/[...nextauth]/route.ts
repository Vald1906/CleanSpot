import NextAuth, { NextAuthOptions } from "next-auth";
import CredentialsProvider from "next-auth/providers/credentials";
import { getUserByName } from "@/app/actions/userActions";
import { compare } from "bcryptjs";
import { db } from "@/db/drizzle";
import { banned_users } from "@/db/schema";
import { eq } from "drizzle-orm";

export const authOptions: NextAuthOptions = {
    secret: process.env.NEXTAUTH_SECRET || "fallback-secret-for-dev",
    providers: [
        CredentialsProvider({
            name: "Connexion",
            credentials: {
                email: { label: "Email", type: "email" },
                password: { label: "Mot de passe", type: "password" }
            },
            async authorize(credentials) {
                if (!credentials?.email || !credentials?.password) return null;

                const res = await getUserByName(credentials.email);

                if (res.success && res.user) {
                    const dbUser = res.user;
                    const isPasswordValid = await compare(credentials.password, dbUser.password);

                    if (isPasswordValid) {
                        // Check if user is banned
                        const isBanned = await db.select().from(banned_users).where(eq(banned_users.userId, dbUser.id)).limit(1);
                        if (isBanned.length > 0) {
                            throw new Error("Ce compte a été suspendu par un administrateur.");
                        }

                        return {
                            id: dbUser.id.toString(),
                            name: `${dbUser.prenom} ${dbUser.nom}`,
                            nom: dbUser.nom,
                            email: dbUser.email,
                            statut_pro: dbUser.statut_pro,
                            is_verified: dbUser.isVerified ?? 0,
                        };
                    }
                }
                return null;
            }
        })
    ],
    callbacks: {
        async jwt({ token, user, trigger }) {
            // Premier login : on hydrate le token depuis l'objet user
            if (user) {
                token.sub = user.id;
                token.nom = user.nom;
                token.statut_pro = user.statut_pro;
                token.is_verified = (user as any).is_verified;
            }

            // À chaque refresh du token (ou appel à update()), on re-lit is_verified en BDD
            // pour ne pas avoir à se déconnecter quand l'admin valide le compte
            if (!user && token.sub) {
                try {
                    const { db } = await import("@/db/drizzle");
                    const { associations, user: userTable } = await import("@/db/schema");
                    const { eq } = await import("drizzle-orm");

                    const row = await db
                        .select({ isVerified: associations.isVerified })
                        .from(associations)
                        .where(eq(associations.userId, parseInt(token.sub)))
                        .then(r => r[0]);

                    if (row !== undefined) {
                        token.is_verified = row.isVerified ?? 0;
                    }
                } catch {
                    // En cas d'erreur DB, on garde la valeur du token
                }
            }

            return token;
        },
        async session({ session, token }) {
            if (session.user && token.sub) {
                session.user.id = token.sub as string;
                session.user.nom = token.nom as string;
                session.user.statut_pro = (token as any).statut_pro;
                (session.user as any).is_verified = token.is_verified;
            }
            return session;
        }
    },
    pages: {
        signIn: '/login',
    },
};

const handler = NextAuth(authOptions);

export { handler as GET, handler as POST };