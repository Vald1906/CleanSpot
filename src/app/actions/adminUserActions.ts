"use server";

import { db } from "@/db/drizzle";
import { user, banned_users, spots, participations, favorites } from "@/db/schema";
import { eq, desc, count, sql } from "drizzle-orm";
import { revalidatePath } from "next/cache";

export async function getAllUsersWithStats() {
    try {
        // We'll fetch all users (except password for security)
        // Since we need to aggregate counts from spots, participations, and favorites,
        // we'll do subsequent queries or a complex join. Subqueries are often easier to read here.
        // For performance on small/medium db, fetching users and mapping works well.
        
        const allUsers = await db.select({
            id: user.id,
            email: user.email,
            nom: user.nom,
            prenom: user.prenom,
            statutAsso: user.statut_pro,
            createdAt: user.createdAt,
            bannedAt: banned_users.bannedAt,
        })
        .from(user)
        .leftJoin(banned_users, eq(user.id, banned_users.userId))
        .orderBy(desc(user.createdAt));

        // Fetch counts. Note: spots.author is a string "id - name" or "email". 
        // We'll need to fetch all spots to manually aggregate by author.
        const allSpots = await db.select({ author: spots.author }).from(spots);
        
        // Participations use userName (string: "email" or "id - name")
        const allParticipations = await db.select({ userName: participations.userName }).from(participations);
        
        // Favorites use userName (string: "email" or "id - name")
        const allFavorites = await db.select({ userName: favorites.userName }).from(favorites);

        const usersWithStats = allUsers.map(u => {
            const userIdStrStart = `${u.id} -`; 
            const userEmail = u.email;

            // Spots created
            const spotsCount = allSpots.filter(s => 
                s.author.startsWith(userIdStrStart) || s.author === userEmail
            ).length;

            // Participations
            const participationsCount = allParticipations.filter(p => 
                p.userName.startsWith(userIdStrStart) || p.userName === userEmail
            ).length;

            // Favorites
            const favoritesCount = allFavorites.filter(f => 
                f.userName.startsWith(userIdStrStart) || f.userName === userEmail
            ).length;

            return {
                ...u,
                isBanned: !!u.bannedAt,
                stats: {
                    creations: spotsCount,
                    participations: participationsCount,
                    favorites: favoritesCount
                }
            };
        });

        return { success: true, data: usersWithStats };
    } catch (error) {
        console.error("Error fetching admin users with stats:", error);
        return { success: false, error: String(error) };
    }
}

export async function toggleUserBanStatus(userId: number, isBanned: boolean) {
    try {
        if (isBanned) {
            // Unban user by deleting from banned_users
            await db.delete(banned_users).where(eq(banned_users.userId, userId));
        } else {
            // Ban user by inserting into banned_users
            await db.insert(banned_users).values({ userId });
        }
        
        revalidatePath("/admin/users");
        return { success: true };
    } catch (error) {
        console.error("Error toggling user ban status:", error);
        return { success: false, error: String(error) };
    }
}
