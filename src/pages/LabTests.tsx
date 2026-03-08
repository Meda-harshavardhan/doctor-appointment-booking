import { useState, useEffect } from "react";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import LabTestCard from "@/components/LabTestCard";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { labTestsAPI } from "@/services/api";
import { Search, ArrowLeft, SlidersHorizontal, FlaskConical } from "lucide-react";

/* ── Category metadata ──────────────────────────────────────────────────── */
const CATEGORY_META: Record<string, { icon: string; gradient: string; description: string }> = {
    "Blood Tests": { icon: "🩸", gradient: "from-rose-500 to-red-400", description: "CBC, ESR, CRP & more" },
    "Urine Tests": { icon: "🧪", gradient: "from-amber-500 to-orange-400", description: "Routine, culture, microalbumin" },
    "Diabetes Tests": { icon: "💉", gradient: "from-orange-500 to-amber-400", description: "HbA1c, FBG, OGTT & more" },
    "Thyroid Tests": { icon: "🦋", gradient: "from-purple-500 to-violet-400", description: "TSH, T3, T4, Anti-TPO" },
    "Liver Function Tests": { icon: "🫁", gradient: "from-yellow-600 to-amber-500", description: "LFT, bilirubin, hepatitis" },
    "Kidney Function Tests": { icon: "🫘", gradient: "from-blue-500 to-cyan-400", description: "KFT, creatinine, eGFR" },
    "Lipid Profile Tests": { icon: "❤️", gradient: "from-red-500 to-rose-400", description: "Cholesterol, HDL, LDL, Trig" },
    "Vitamin & Mineral Tests": { icon: "💊", gradient: "from-emerald-500 to-teal-400", description: "Vit D, B12, Iron, Calcium" },
    "Hormone Tests": { icon: "⚗️", gradient: "from-pink-500 to-fuchsia-400", description: "Testosterone, FSH, LH, AMH" },
    "Cardiac Tests": { icon: "🫀", gradient: "from-red-600 to-rose-500", description: "ECG, Troponin, BNP, Echo" },
    "Infection & Disease Tests": { icon: "🦠", gradient: "from-teal-500 to-emerald-400", description: "Dengue, HIV, COVID, Typhoid" },
    "Cancer Screening Tests": { icon: "🔬", gradient: "from-indigo-600 to-purple-500", description: "PSA, CA-125, CEA, AFP" },
    "Allergy Tests": { icon: "🌿", gradient: "from-lime-500 to-green-400", description: "IgE, Food & Inhalant panels" },
    "Pregnancy Tests": { icon: "🤰", gradient: "from-pink-400 to-rose-300", description: "hCG, TORCH, Antenatal" },
    "Genetic Tests": { icon: "🧬", gradient: "from-violet-600 to-indigo-500", description: "Karyotyping, BRCA, G6PD" },
    "Imaging & Radiology": { icon: "🩻", gradient: "from-slate-600 to-gray-500", description: "X-Ray, CT, MRI, Ultrasound" },
    "Health Packages": { icon: "📋", gradient: "from-blue-600 to-indigo-500", description: "Full body, diabetes, cardiac" },
};

export default function LabTests() {
    const [allTests, setAllTests] = useState<any[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [error, setError] = useState("");

    // UI state
    const [selectedCategory, setSelectedCategory] = useState<string | null>(null);
    const [search, setSearch] = useState("");
    const [popularityFilter, setPopularityFilter] = useState<"All" | "Common" | "Advanced">("All");

    /* fetch all tests once */
    useEffect(() => {
        labTestsAPI.getTests({ limit: 300 })
            .then(res => setAllTests(res.tests || []))
            .catch(err => setError(err.message || "Failed to load tests"))
            .finally(() => setIsLoading(false));
    }, []);

    /* Counts per category */
    const categoryCounts = allTests.reduce<Record<string, number>>((acc, t) => {
        acc[t.category] = (acc[t.category] || 0) + 1;
        return acc;
    }, {});

    const categories = Object.keys(CATEGORY_META).filter(c => categoryCounts[c]);

    /* Tests shown in drill-down */
    const categoryTests = allTests.filter(t => {
        if (t.category !== selectedCategory) return false;
        if (popularityFilter !== "All" && t.popularityFlag !== popularityFilter) return false;
        if (search && !t.name.toLowerCase().includes(search.toLowerCase())) return false;
        return true;
    });

    /* ─────────────────────────────────────── */
    return (
        <div className="min-h-screen flex flex-col">
            <Navbar />

            {/* Hero */}
            <section className="relative gradient-hero overflow-hidden">
                <div className="absolute -top-20 -left-20 w-80 h-80 rounded-full bg-white/8 blur-3xl pointer-events-none" />
                <div className="absolute -bottom-10 right-0 w-60 h-60 rounded-full bg-white/8 blur-3xl pointer-events-none" />
                <div className="container relative py-12 z-10 text-white text-center">
                    {selectedCategory ? (
                        /* Drill-down hero */
                        <div className="flex flex-col items-center gap-3">
                            <button
                                onClick={() => { setSelectedCategory(null); setSearch(""); setPopularityFilter("All"); }}
                                className="flex items-center gap-2 text-white/70 hover:text-white text-sm transition-base self-start"
                            >
                                <ArrowLeft className="h-4 w-4" /> Back to All Categories
                            </button>
                            <div className="text-5xl">{CATEGORY_META[selectedCategory]?.icon}</div>
                            <h1 className="text-3xl md:text-4xl font-black">{selectedCategory}</h1>
                            <p className="text-white/80 text-base">
                                {categoryCounts[selectedCategory]} tests available
                            </p>
                            {/* Inline search */}
                            <div className="relative w-full max-w-xl mt-2">
                                <Search className="absolute left-4 top-1/2 -translate-y-1/2 h-4 w-4 text-white/60" />
                                <Input
                                    placeholder={`Search in ${selectedCategory}...`}
                                    value={search}
                                    onChange={e => setSearch(e.target.value)}
                                    className="pl-11 py-5 bg-white/15 border-white/25 text-white placeholder:text-white/50 focus:bg-white/20 rounded-xl backdrop-blur-sm"
                                />
                            </div>
                        </div>
                    ) : (
                        /* Category browse hero */
                        <div className="max-w-2xl mx-auto space-y-4">
                            <div className="flex justify-center">
                                <div className="h-14 w-14 rounded-2xl glass flex items-center justify-center shadow-glow text-3xl">🔬</div>
                            </div>
                            <h1 className="text-3xl md:text-4xl font-black animate-slide-up">Lab Tests</h1>
                            <p className="text-white/80 animate-slide-up-delay-1">
                                {allTests.length} diagnostic tests • {categories.length} categories • Certified labs • <span className="font-bold text-cyan-200">Results in hours</span>
                            </p>
                        </div>
                    )}
                </div>
            </section>

            <main className="flex-1 gradient-subtle">
                <div className="container py-10">

                    {/* ── Loading ── */}
                    {isLoading && (
                        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-4">
                            {Array.from({ length: 17 }).map((_, i) => (
                                <div key={i} className="skeleton rounded-2xl h-36" />
                            ))}
                        </div>
                    )}

                    {/* ── Error ── */}
                    {error && !isLoading && (
                        <div className="text-center py-20">
                            <p className="text-destructive mb-4">{error}</p>
                            <Button onClick={() => window.location.reload()}>Retry</Button>
                        </div>
                    )}

                    {/* ═══════════════════════════════════════
              CATEGORY GRID VIEW (Apollo-style)
          ═══════════════════════════════════════ */}
                    {!isLoading && !error && !selectedCategory && (
                        <>
                            <h2 className="text-2xl font-bold mb-6">Browse by Category</h2>
                            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-4">
                                {categories.map(cat => {
                                    const meta = CATEGORY_META[cat] || { icon: "🧫", gradient: "from-gray-500 to-slate-400", description: "" };
                                    return (
                                        <button
                                            key={cat}
                                            onClick={() => setSelectedCategory(cat)}
                                            className="group flex flex-col items-center gap-3 p-5 bg-background rounded-2xl border border-border shadow-card
                                 hover:shadow-hover hover:-translate-y-1.5 transition-spring text-center cursor-pointer"
                                        >
                                            {/* Icon circle */}
                                            <div className={`h-16 w-16 rounded-2xl bg-gradient-to-br ${meta.gradient} flex items-center justify-center text-3xl shadow-sm group-hover:scale-110 transition-spring`}>
                                                {meta.icon}
                                            </div>
                                            {/* Name */}
                                            <div>
                                                <p className="text-sm font-semibold leading-tight group-hover:text-primary transition-colors line-clamp-2">
                                                    {cat}
                                                </p>
                                                <p className="text-xs text-muted-foreground mt-0.5">{categoryCounts[cat]} tests</p>
                                            </div>
                                            {/* Bottom accent line */}
                                            <div className={`absolute bottom-0 left-4 right-4 h-0.5 rounded-full bg-gradient-to-r ${meta.gradient} scale-x-0 group-hover:scale-x-100 transition-transform duration-300`} />
                                        </button>
                                    );
                                })}
                            </div>

                            {/* Quick stats strip */}
                            <div className="mt-12 grid grid-cols-2 md:grid-cols-4 gap-4">
                                {[
                                    { label: "Total Tests", value: allTests.length, icon: "🔬" },
                                    { label: "Categories", value: categories.length, icon: "📂" },
                                    { label: "Common Tests", value: allTests.filter(t => t.popularityFlag === "Common").length, icon: "⭐" },
                                    { label: "Health Packages", value: allTests.filter(t => t.isPackage).length, icon: "📋" },
                                ].map(s => (
                                    <div key={s.label} className="bg-background rounded-2xl border border-border p-5 flex items-center gap-4 shadow-card">
                                        <span className="text-3xl">{s.icon}</span>
                                        <div>
                                            <p className="text-2xl font-black text-primary">{s.value}</p>
                                            <p className="text-xs text-muted-foreground">{s.label}</p>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </>
                    )}

                    {/* ═══════════════════════════════════════
              TEST CARDS VIEW (drill-down)
          ═══════════════════════════════════════ */}
                    {!isLoading && !error && selectedCategory && (
                        <>
                            {/* Filter bar */}
                            <div className="flex items-center gap-3 mb-6 flex-wrap">
                                <div className="flex items-center gap-1 text-xs text-muted-foreground">
                                    <SlidersHorizontal className="h-3.5 w-3.5" /> Show:
                                </div>
                                {(["All", "Common", "Advanced"] as const).map(f => (
                                    <button key={f} onClick={() => setPopularityFilter(f)}
                                        className={`px-3 py-1 rounded-full text-xs font-medium border transition-base ${popularityFilter === f
                                                ? "bg-primary text-white border-transparent"
                                                : "border-border text-muted-foreground hover:border-primary/40 bg-background"
                                            }`}>
                                        {f === "Common" ? "⭐ Common" : f === "Advanced" ? "🔬 Advanced" : "All Tests"}
                                    </button>
                                ))}
                                <span className="ml-auto text-xs text-muted-foreground">
                                    <span className="font-semibold text-foreground">{categoryTests.length}</span> test{categoryTests.length !== 1 ? "s" : ""}
                                </span>
                            </div>

                            {categoryTests.length === 0 ? (
                                <div className="text-center py-20">
                                    <div className="text-6xl mb-4">🔍</div>
                                    <p className="text-xl font-bold mb-2">No tests found</p>
                                    <Button onClick={() => { setSearch(""); setPopularityFilter("All"); }}>Clear Filters</Button>
                                </div>
                            ) : (
                                <div className="grid sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-4">
                                    {categoryTests.map(test => (
                                        <LabTestCard
                                            key={test._id}
                                            id={test._id}
                                            name={test.name}
                                            category={test.category}
                                            description={test.description}
                                            price={test.price}
                                            duration={test.duration}
                                            imageUrl={test.imageUrl}
                                            sampleType={test.sampleType}
                                            estimatedReportTime={test.estimatedReportTime}
                                            popularityFlag={test.popularityFlag}
                                            isPackage={test.isPackage}
                                        />
                                    ))}
                                </div>
                            )}
                        </>
                    )}

                </div>
            </main>

            <Footer />
        </div>
    );
}
