import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";
import { cookies } from "next/headers";
import { NotificationProvider } from "@/app/context/NotificationContext";
import NavbarWrapper from "@/app/components/NavbarWrapper";
import { NextAuthProvider } from "./providers";

const geistSans = Geist({
    variable: "--font-geist-sans",
    subsets: ["latin"],
});

const geistMono = Geist_Mono({
    variable: "--font-geist-mono",
    subsets: ["latin"],
});

export const metadata: Metadata = {
    title: "CleanSpot",
    description: "Plateforme écologique pour le signalement de spots",
    icons: {
        icon: "/images/cleanspot.png",
    },
};

export default async function RootLayout({
    children,
}: Readonly<{
    children: React.ReactNode;
}>) {
    const cookieStore = await cookies();
    const session = cookieStore.get("session_user");
    const user = session ? JSON.parse(session.value) : null;

    return (
        <html lang="fr">
            <head>
                <link
                    href="https://fonts.googleapis.com/icon?family=Material+Icons+Outlined"
                    rel="stylesheet"
                />
            </head>
            <body className={`${geistSans.variable} ${geistMono.variable} antialiased`}>
                {/* 1. On enveloppe tout avec le Provider d'Auth */}
                <NextAuthProvider>
                    <NotificationProvider>
                        <NavbarWrapper />
                        <main>
                            {children}
                        </main>
                    </NotificationProvider>
                </NextAuthProvider>
            </body>
        </html>
    );
}