import type { Metadata } from "next";


export const metadata: Metadata = {
  title: "CleanSpot - Ensemble pour une ville plus propre",
  description: "Rejoignez la plus grande communauté de citoyens engagés pour l'environnement.",
};



export default function AvecLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <>
      {children}
    </>
  );
}


