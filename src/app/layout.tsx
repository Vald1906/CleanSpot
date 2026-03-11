import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";
import { cookies } from "next/headers"; // Ajouté pour la session
import NavBar from "./components/navbar"; // Import de ta NavBar

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
};

export default async function RootLayout({
    children,
}: Readonly<{
    children: React.ReactNode;
}>) {
    // Lecture du cookie de session
    const cookieStore = await cookies();
    const sessionCookie = cookieStore.get("session_user");
    
    // On parse les données de l'utilisateur s'il existe
    const user = sessionCookie ? JSON.parse(sessionCookie.value) : null;

    return (
        <html lang="fr">
            <head>
                <link
                    href="https://fonts.googleapis.com/icon?family=Material+Icons+Outlined"
                    rel="stylesheet"
                />
            </head>
            <body
                className={`${geistSans.variable} ${geistMono.variable} antialiased`}
            >
                {/* On passe l'user à la NavBar pour gérer l'affichage dynamique */}
              
                {children}
            </body>
        </html>
    );
}