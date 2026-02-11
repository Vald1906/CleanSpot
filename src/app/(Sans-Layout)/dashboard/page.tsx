import NavBar from "@/app/components/navbar";

export default function Home() {
    return (
        <html lang="en">
            <body>
                <div className="flex min-h-screen items-center justify-center bg-zinc-50 font-sans dark:bg-black">
                    <main className="flex min-h-screen w-full max-w-3xl flex-col items-center justify-between py-32 px-16 bg-white dark:bg-black sm:items-start">
                        <NavBar />
                    </main>
                </div>
            </body>
        </html>
    );
}