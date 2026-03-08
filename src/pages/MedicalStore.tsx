import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Search, ShoppingCart, Pill, Shield, Star, IndianRupee, Loader2, AlertTriangle, ArrowRight } from "lucide-react";
import { API_BASE_URL } from "@/services/api";
import { toast } from "sonner";

interface Medicine {
    _id: string;
    name: string;
    brandName?: string;
    category: string;
    imageUrl: string;
    description: string;
    dosageForm: string;
    strength?: string;
    manufacturer?: string;
    price: number;
    discountPercent: number;
    rating: number;
    reviewCount: number;
    stockStatus: "In Stock" | "Low Stock" | "Out of Stock";
    prescriptionRequired: boolean;
}

const CATEGORIES = [
    { name: "Fever & Pain Relief", emoji: "🌡️", color: "from-red-400 to-orange-400" },
    { name: "Cold & Cough", emoji: "🤧", color: "from-sky-400 to-blue-400" },
    { name: "Antibiotics", emoji: "💊", color: "from-rose-500 to-red-400" },
    { name: "Diabetes Medicines", emoji: "🩸", color: "from-indigo-500 to-blue-500" },
    { name: "Blood Pressure Medicines", emoji: "❤️‍🩹", color: "from-pink-500 to-rose-400" },
    { name: "Heart Medicines", emoji: "🫀", color: "from-red-600 to-rose-500" },
    { name: "Vitamins & Supplements", emoji: "✨", color: "from-amber-400 to-yellow-300" },
    { name: "Digestive Health", emoji: "🫙", color: "from-green-500 to-emerald-400" },
    { name: "Skin Care", emoji: "🧴", color: "from-pink-300 to-rose-300" },
    { name: "Eye Care", emoji: "👁️", color: "from-cyan-400 to-teal-400" },
    { name: "Allergy Medicines", emoji: "🌸", color: "from-purple-400 to-violet-400" },
    { name: "Respiratory Medicines", emoji: "💨", color: "from-teal-500 to-cyan-400" },
    { name: "Women's Health", emoji: "🌷", color: "from-fuchsia-400 to-pink-400" },
    { name: "Men's Health", emoji: "💪", color: "from-blue-500 to-indigo-400" },
    { name: "Baby Care", emoji: "👶", color: "from-sky-300 to-blue-300" },
    { name: "First Aid", emoji: "🩹", color: "from-orange-400 to-amber-400" },
    { name: "Medical Devices", emoji: "🔬", color: "from-slate-600 to-gray-500" },
    { name: "Ayurvedic & Herbal", emoji: "🌿", color: "from-lime-500 to-green-500" },
    { name: "Immunity Boosters", emoji: "🛡️", color: "from-emerald-500 to-teal-500" },
    { name: "Fitness & Nutrition", emoji: "🏋️", color: "from-gray-700 to-gray-600" },
];

const STOCK_STYLE: Record<string, string> = {
    "In Stock": "text-emerald-600 bg-emerald-50",
    "Low Stock": "text-amber-600 bg-amber-50",
    "Out of Stock": "text-red-600 bg-red-50",
};

export default function MedicalStore() {
    const navigate = useNavigate();
    const [view, setView] = useState<"categories" | "medicines">("categories");
    const [selectedCategory, setSelectedCategory] = useState("");
    const [medicines, setMedicines] = useState<Medicine[]>([]);
    const [categoryCounts, setCategoryCounts] = useState<Record<string, number>>({});
    const [loading, setLoading] = useState(false);
    const [search, setSearch] = useState("");
    const [sort, setSort] = useState("name");

    useEffect(() => {
        fetch(`${API_BASE_URL}/medicines/categories`)
            .then(r => r.json())
            .then(d => {
                const counts: Record<string, number> = {};
                (d.categories || []).forEach((c: any) => { counts[c._id] = c.count; });
                setCategoryCounts(counts);
            })
            .catch(() => { });
    }, []);

    const loadMedicines = async (category: string) => {
        setLoading(true);
        try {
            const params = new URLSearchParams({ limit: "100", sort });
            if (category) params.set("category", category);
            const res = await fetch(`${API_BASE_URL}/medicines?${params}`);
            const data = await res.json();
            setMedicines(data.medicines || []);
        } catch {
            toast.error("Failed to load medicines");
        } finally {
            setLoading(false);
        }
    };

    const handleCategoryClick = (cat: string) => {
        setSelectedCategory(cat);
        setView("medicines");
        loadMedicines(cat);
    };

    const handleBack = () => {
        setView("categories");
        setSelectedCategory("");
        setSearch("");
    };

    const filtered = medicines.filter(m =>
        !search || m.name.toLowerCase().includes(search.toLowerCase()) ||
        m.brandName?.toLowerCase().includes(search.toLowerCase())
    );

    const discountedPrice = (price: number, pct: number) =>
        pct > 0 ? Math.round(price - (price * pct) / 100) : price;

    return (
        <div className="min-h-screen flex flex-col">
            <Navbar />

            {/* ── Hero ── */}
            <section className="relative bg-gradient-to-br from-emerald-600 via-teal-600 to-cyan-700 overflow-hidden">
                <div className="absolute inset-0 bg-black/20" />
                <div className="absolute -top-20 -right-20 w-72 h-72 rounded-full bg-white/10 blur-3xl" />
                <div className="absolute -bottom-20 -left-20 w-64 h-64 rounded-full bg-white/10 blur-3xl" />
                <div className="container relative z-10 py-12 text-white">
                    {view === "categories" ? (
                        <>
                            <div className="flex items-center gap-3 mb-2">
                                <div className="h-12 w-12 rounded-2xl bg-white/20 flex items-center justify-center">
                                    <Pill className="h-6 w-6" />
                                </div>
                                <div>
                                    <h1 className="text-3xl font-black">Medical Store</h1>
                                    <p className="text-white/80 text-sm">Medicines, devices & supplements delivered to your door</p>
                                </div>
                            </div>
                            <div className="flex flex-wrap gap-4 mt-6">
                                <div className="flex items-center gap-2 bg-white/15 rounded-full px-4 py-2 text-sm">
                                    <Shield className="h-4 w-4" /> 100% Genuine Medicines
                                </div>
                                <div className="flex items-center gap-2 bg-white/15 rounded-full px-4 py-2 text-sm">
                                    <ShoppingCart className="h-4 w-4" /> Free Delivery on ₹499+
                                </div>
                            </div>
                        </>
                    ) : (
                        <div>
                            <button onClick={handleBack} className="flex items-center gap-2 text-white/70 hover:text-white text-sm mb-3 transition-colors">
                                ← Back to All Categories
                            </button>
                            <h1 className="text-3xl font-black">{selectedCategory}</h1>
                            <p className="text-white/80 mt-1">{filtered.length} medicines available</p>
                        </div>
                    )}
                </div>
            </section>

            <main className="flex-1 gradient-subtle">
                <div className="container py-8">

                    {/* ── CATEGORY GRID VIEW ── */}
                    {view === "categories" && (
                        <div>
                            <h2 className="text-xl font-bold mb-6">Browse by Category</h2>
                            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-4">
                                {CATEGORIES.map(cat => (
                                    <button
                                        key={cat.name}
                                        onClick={() => handleCategoryClick(cat.name)}
                                        className={`
                      group relative overflow-hidden rounded-2xl p-5 text-center text-white cursor-pointer
                      bg-gradient-to-br ${cat.color} shadow-md
                      hover:-translate-y-1.5 hover:shadow-xl transition-all duration-300
                    `}
                                    >
                                        <div className="text-4xl mb-2">{cat.emoji}</div>
                                        <p className="text-sm font-bold leading-tight">{cat.name}</p>
                                        {categoryCounts[cat.name] && (
                                            <p className="text-xs text-white/80 mt-1">{categoryCounts[cat.name]} items</p>
                                        )}
                                        <div className="absolute inset-0 bg-white/0 group-hover:bg-white/10 transition-colors rounded-2xl" />
                                    </button>
                                ))}
                            </div>
                        </div>
                    )}

                    {/* ── MEDICINES GRID VIEW ── */}
                    {view === "medicines" && (
                        <div>
                            {/* Search + Sort */}
                            <div className="flex gap-3 mb-6 flex-wrap">
                                <div className="relative flex-1 min-w-[200px]">
                                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                                    <Input placeholder="Search medicines..." value={search} onChange={e => setSearch(e.target.value)} className="pl-10" />
                                </div>
                                <select value={sort} onChange={e => { setSort(e.target.value); loadMedicines(selectedCategory); }}
                                    className="px-3 py-2 rounded-lg border border-border bg-background text-sm">
                                    <option value="name">Name A–Z</option>
                                    <option value="price_asc">Price: Low to High</option>
                                    <option value="price_desc">Price: High to Low</option>
                                    <option value="rating">Top Rated</option>
                                </select>
                            </div>

                            {loading ? (
                                <div className="flex items-center justify-center py-20">
                                    <Loader2 className="h-8 w-8 animate-spin text-emerald-600 mr-3" />
                                    <p className="text-muted-foreground">Loading medicines…</p>
                                </div>
                            ) : filtered.length === 0 ? (
                                <div className="text-center py-16">
                                    <Pill className="h-12 w-12 mx-auto text-muted-foreground/30 mb-3" />
                                    <p className="font-semibold">No medicines found</p>
                                </div>
                            ) : (
                                <div className="grid sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-5">
                                    {filtered.map(m => {
                                        const finalPrice = discountedPrice(m.price, m.discountPercent);
                                        return (
                                            <div
                                                key={m._id}
                                                onClick={() => navigate(`/store/${m._id}`)}
                                                className="group bg-background rounded-2xl border border-border shadow-card hover:shadow-hover hover:-translate-y-1 transition-spring cursor-pointer overflow-hidden"
                                            >
                                                {/* Image */}
                                                <div className="relative h-36 bg-gradient-to-br from-emerald-50 to-teal-50 dark:from-emerald-900/20 dark:to-teal-900/20 flex items-center justify-center">
                                                    {m.imageUrl ? (
                                                        <img src={m.imageUrl} alt={m.name} className="h-24 w-full object-contain p-2" />
                                                    ) : (
                                                        <Pill className="h-12 w-12 text-emerald-400" />
                                                    )}
                                                    {m.discountPercent > 0 && (
                                                        <span className="absolute top-2 right-2 bg-red-500 text-white text-[10px] font-bold px-2 py-0.5 rounded-full">
                                                            -{m.discountPercent}%
                                                        </span>
                                                    )}
                                                    {m.prescriptionRequired && (
                                                        <span className="absolute top-2 left-2 bg-amber-500 text-white text-[10px] font-bold px-2 py-0.5 rounded-full flex items-center gap-0.5">
                                                            <AlertTriangle className="h-3 w-3" /> Rx
                                                        </span>
                                                    )}
                                                </div>

                                                {/* Content */}
                                                <div className="p-4">
                                                    <p className="text-xs text-muted-foreground mb-0.5">{m.dosageForm} {m.strength && `· ${m.strength}`}</p>
                                                    <h3 className="font-bold text-sm leading-tight group-hover:text-emerald-600 transition-colors">{m.name}</h3>
                                                    {m.brandName && <p className="text-xs text-muted-foreground">{m.brandName}</p>}

                                                    <div className="flex items-center gap-1 mt-1.5">
                                                        <Star className="h-3 w-3 fill-amber-400 text-amber-400" />
                                                        <span className="text-xs font-semibold">{m.rating.toFixed(1)}</span>
                                                        <span className="text-xs text-muted-foreground">({m.reviewCount.toLocaleString()})</span>
                                                    </div>

                                                    <div className="flex items-center justify-between mt-3">
                                                        <div>
                                                            <div className="flex items-center gap-1 font-black text-emerald-600">
                                                                <IndianRupee className="h-3.5 w-3.5" />{finalPrice}
                                                            </div>
                                                            {m.discountPercent > 0 && (
                                                                <div className="text-xs text-muted-foreground line-through">₹{m.price}</div>
                                                            )}
                                                        </div>
                                                        <span className={`text-[10px] font-semibold px-2 py-0.5 rounded-full ${STOCK_STYLE[m.stockStatus]}`}>
                                                            {m.stockStatus}
                                                        </span>
                                                    </div>

                                                    <Button size="sm" className="w-full mt-3 bg-emerald-600 hover:bg-emerald-700 text-white text-xs h-8">
                                                        {m.prescriptionRequired ? "Upload Prescription" : "View Details"}
                                                        <ArrowRight className="ml-1 h-3 w-3" />
                                                    </Button>
                                                </div>
                                            </div>
                                        );
                                    })}
                                </div>
                            )}
                        </div>
                    )}
                </div>
            </main>

            <Footer />
        </div>
    );
}
