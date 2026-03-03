import Link from "next/link";
import Image from "next/image";

export default function Home() {
    return (
        <div className="bg-white text-[#1a2f28] min-h-screen font-sans">
            {/* --- HERO SECTION --- */}
            <section className="relative h-[70vh] flex items-center overflow-hidden">
                {/* Image de fond avec overlay simple */}
                <div className="absolute inset-0 z-0">
                    <img
                        src="/images/landing-hero.png"
                        alt="Join the CleanSpot Movement"
                        className="w-full h-full object-cover"
                    />
                    <div className="absolute inset-0 bg-[#1a2f28]/75"></div>
                </div>

                <div className="container mx-auto px-6 md:px-12 relative z-10">
                    <div className="max-w-xl">
                        <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 text-[10px] font-bold mb-4 animate-fade-in">
                            <span className="material-icons-outlined text-xs">spa</span>
                            La révolution citoyenne est en marche
                        </div>
                        <h1 className="text-3xl md:text-5xl font-black text-white leading-tight mb-4 animate-slide-up">
                            Rendez votre ville <span className="text-emerald-400 underline decoration-2 underline-offset-4">plus propre</span>, un spot à la fois.
                        </h1>
                        <p className="text-sm md:text-base text-slate-300 mb-8 leading-relaxed font-medium max-w-lg">
                            Rejoignez la communauté de citoyens engagés pour l'environnement. Signalez les zones de déchets, participez à des collectes et suivez votre impact.
                        </p>
                        <div className="flex flex-col sm:flex-row gap-3">
                            <Link
                                href="/event"
                                className="px-6 py-2.5 bg-emerald-500 hover:bg-emerald-600 text-[#1a2f28] text-sm font-black rounded-xl transition-all hover:-translate-y-0.5 active:scale-95 text-center flex items-center justify-center gap-2"
                            >
                                <span className="material-icons-outlined text-base">event</span>
                                Voir les Collectes
                            </Link>
                            <Link
                                href="/map"
                                className="px-6 py-2.5 bg-white/10 hover:bg-white/20 backdrop-blur-sm text-white text-sm font-bold rounded-xl border border-white/20 transition-all hover:-translate-y-0.5 text-center flex items-center justify-center gap-2"
                            >
                                <span className="material-icons-outlined text-base">map</span>
                                Explorer la Carte
                            </Link>
                        </div>
                    </div>
                </div>
            </section>

            {/* --- IMPACT SECTION --- */}
            <section className="py-8 bg-[#1a2f28] border-y border-emerald-900/20">
                <div className="container mx-auto px-6">
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-6 text-center">
                        <div className="space-y-0.5">
                            <div className="text-2xl md:text-3xl font-black text-emerald-400">1,2k+</div>
                            <div className="text-slate-400 font-bold uppercase tracking-widest text-[10px]">Spots nettoyés</div>
                        </div>
                        <div className="space-y-0.5">
                            <div className="text-2xl md:text-3xl font-black text-white">450+</div>
                            <div className="text-slate-400 font-bold uppercase tracking-widest text-[10px]">Citoyens engagés</div>
                        </div>
                        <div className="space-y-0.5">
                            <div className="text-2xl md:text-3xl font-black text-emerald-400">5t+</div>
                            <div className="text-slate-400 font-bold uppercase tracking-widest text-[10px]">Déchets collectés</div>
                        </div>
                    </div>
                </div>
            </section>

            {/* --- FEATURES SECTION --- */}
            <section className="py-16 bg-slate-50">
                <div className="container mx-auto px-6">
                    <div className="text-center max-w-xl mx-auto mb-12">
                        <h2 className="text-[10px] font-black text-emerald-600 uppercase tracking-[0.2em] mb-2">Fonctionnalités</h2>
                        <h3 className="text-2xl md:text-3xl font-black text-[#1a2f28]">Comment ça fonctionne ?</h3>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-3 gap-8 text-center md:text-left">
                        {/* Feature 1 */}
                        <div className="bg-white p-8 rounded-2xl shadow-sm border border-slate-100 transition-all hover:shadow-md group">
                            <div className="w-12 h-12 bg-emerald-50 rounded-xl flex items-center justify-center mb-6 mx-auto md:mx-0 group-hover:bg-emerald-500 transition-colors">
                                <span className="material-icons-outlined text-xl text-emerald-500 group-hover:text-white">camera_alt</span>
                            </div>
                            <h4 className="text-lg font-bold mb-3">Signalez</h4>
                            <p className="text-sm text-slate-500 leading-relaxed">
                                Photographiez et géolocalisez les zones de déchets ou les décharges sauvages en quelques secondes.
                            </p>
                        </div>

                        {/* Feature 2 */}
                        <div className="bg-white p-8 rounded-2xl shadow-sm border border-slate-100 transition-all hover:shadow-md group">
                            <div className="w-12 h-12 bg-blue-50 rounded-xl flex items-center justify-center mb-6 mx-auto md:mx-0 group-hover:bg-blue-500 transition-colors">
                                <span className="material-icons-outlined text-xl text-blue-500 group-hover:text-white">people</span>
                            </div>
                            <h4 className="text-lg font-bold mb-3">Agissez</h4>
                            <p className="text-sm text-slate-500 leading-relaxed">
                                Rejoignez une collecte citoyenne près de chez vous ou organisez votre propre événement de quartier.
                            </p>
                        </div>

                        {/* Feature 3 */}
                        <div className="bg-white p-8 rounded-2xl shadow-sm border border-slate-100 transition-all hover:shadow-md group">
                            <div className="w-12 h-12 bg-amber-50 rounded-xl flex items-center justify-center mb-6 mx-auto md:mx-0 group-hover:bg-amber-500 transition-colors">
                                <span className="material-icons-outlined text-xl text-amber-500 group-hover:text-white">trending_up</span>
                            </div>
                            <h4 className="text-lg font-bold mb-3">Suivez</h4>
                            <p className="text-sm text-slate-500 leading-relaxed">
                                Cumulez des points, visualisez votre impact sur la carte et voyez votre ville se transformer.
                            </p>
                        </div>
                    </div>
                </div>
            </section>

            {/* --- CTA SECTION --- */}
            <section className="py-16">
                <div className="container mx-auto px-6">
                    <div className="bg-[#1a2f28] rounded-[2rem] p-10 md:p-16 text-center relative overflow-hidden shadow-xl">
                        <h2 className="text-3xl md:text-4xl font-black text-white mb-6 leading-tight relative z-10">
                            Prêt à passer <span className="text-emerald-400">à l'action ?</span>
                        </h2>
                        <div className="flex justify-center relative z-10">
                            <Link
                                href="/event"
                                className="px-8 py-3.5 bg-emerald-500 hover:bg-emerald-600 text-[#1a2f28] text-base font-black rounded-xl transition-all hover:scale-105 active:scale-95"
                            >
                                Commencer maintenant
                            </Link>
                        </div>
                    </div>
                </div>
            </section>

            {/* --- FOOTER --- */}
            <footer className="py-8 border-t border-slate-100">
                <div className="container mx-auto px-6 text-center">
                    <div className="flex items-center justify-center gap-1.5 mb-4">
                        <div className="w-8 h-8 bg-[#1a2f28] rounded-lg flex items-center justify-center text-white font-black text-sm">CS</div>
                        <span className="text-lg font-black tracking-tight text-[#1a2f28]">CleanSpot</span>
                    </div>
                    <p className="text-slate-400 text-[11px]">
                        &copy; 2026 CleanSpot. Fabriqué avec passion pour la planète.
                    </p>
                </div>
            </footer>
        </div>
    );
}
