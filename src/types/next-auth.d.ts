import NextAuth, { DefaultSession } from "next-auth";

declare module "next-auth" {
    interface Session {
        user: {
            id: string;
            nom: string;
            statut_pro?: string;
            is_verified?: number;
        } & DefaultSession["user"];
    }

    interface User {
        nom: string;
        statut_pro?: string;
        is_verified?: number;
    }
}

declare module "next-auth/jwt" {
    interface JWT {
        nom: string;
        statut_pro?: string;
        is_verified?: number;
    }
}