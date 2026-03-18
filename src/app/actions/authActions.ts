"use server";

import { cookies } from "next/headers";

export async function getSessionUser() {
    try {
        const cookieStore = await cookies();
        const session = cookieStore.get("session_user");

        if (!session || !session.value) {
            return null;
        }

        return JSON.parse(session.value);
    } catch (e) {
        return null;
    }
}