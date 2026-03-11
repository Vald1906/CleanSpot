import { cookies } from "next/headers";
import NavBar from "@/app/components/navbar";

export default async function AutreLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const cookieStore = await cookies();
  const session = cookieStore.get("session_user");
  
  let userData = null;
  if (session) {
    try {
      userData = JSON.parse(session.value);
    } catch (e) {
      console.error("Erreur session:", e);
    }
  }

  return (
    <>
      <NavBar user={userData} />
      <main>{children}</main>
    </>
  );
}