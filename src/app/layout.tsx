import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";
import { NotificationProvider } from "@/app/context/NotificationContext";

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

export default function RootLayout({
    children,
}: Readonly<{
    children: React.ReactNode;
}>) {
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
                <NotificationProvider>
                    {children}
                </NotificationProvider>
            </body>
        </html>
    );
}
