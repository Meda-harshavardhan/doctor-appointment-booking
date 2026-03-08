import { useEffect, useState } from "react";
import { useParams, useNavigate, Link } from "react-router-dom";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
    Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription
} from "@/components/ui/dialog";
import {
    Star, AlertTriangle, ShoppingCart, IndianRupee, ArrowLeft,
    MapPin, Clock, Shield, Pill, CheckCircle2, Loader2, Upload
} from "lucide-react";
import { API_BASE_URL } from "@/services/api";
import { toast } from "sonner";
import { useAuth } from "@/contexts/AuthContext";

interface NearbPharmacy { name: string; distance: string; address: string; rating: number }
interface Medicine {
    _id: string; name: string; brandName?: string; category: string; imageUrl: string;
    description: string; dosageForm: string; strength?: string; manufacturer?: string;
    price: number; discountPercent: number; rating: number; reviewCount: number;
    stockStatus: string; deliveryAvailable: boolean; nearbyPharmacies: NearbPharmacy[];
    usageInstructions?: string; sideEffects: string[]; warnings: string[];
    ageRestriction?: string; pregnancyWarning?: string; storageInstructions?: string;
    prescriptionRequired: boolean; prescriptionUploadRequired: boolean;
}

export default function MedicineDetail() {
    const { id } = useParams<{ id: string }>();
    const navigate = useNavigate();
    const { user } = useAuth();
    const [medicine, setMedicine] = useState<Medicine | null>(null);
    const [loading, setLoading] = useState(true);
    const [prescriptionOpen, setPrescriptionOpen] = useState(false);
    const [file, setFile] = useState<File | null>(null);
    const [submitted, setSubmitted] = useState(false);
    const [cart, setCart] = useState<string[]>(() => JSON.parse(localStorage.getItem("medCart") || "[]"));

    useEffect(() => {
        fetch(`${API_BASE_URL}/medicines/${id}`)
            .then(r => r.json())
            .then(d => { setMedicine(d.medicine); setLoading(false); })
            .catch(() => { setLoading(false); toast.error("Failed to load medicine"); });
    }, [id]);

    if (loading) return (
        <div className="min-h-screen flex flex-col"><Navbar />
            <div className="flex-1 flex items-center justify-center">
                <Loader2 className="h-10 w-10 animate-spin text-emerald-600" />
            </div>
        </div>
    );
    if (!medicine) return (
        <div className="min-h-screen flex flex-col"><Navbar />
            <div className="flex-1 flex items-center justify-center text-center">
                <div><Pill className="h-12 w-12 mx-auto text-muted-foreground/30 mb-3" />
                    <p className="font-semibold">Medicine not found</p>
                    <Button className="mt-4" onClick={() => navigate("/store")}>Back to Store</Button>
                </div>
            </div>
        </div>
    );

    const finalPrice = medicine.discountPercent > 0
        ? Math.round(medicine.price - (medicine.price * medicine.discountPercent) / 100)
        : medicine.price;

    const handleAddToCart = () => {
        if (medicine.prescriptionRequired) { setPrescriptionOpen(true); return; }
        if (!user) { navigate("/login", { state: { from: `/store/${id}` } }); return; }
        const updated = [...new Set([...cart, medicine._id])];
        setCart(updated);
        localStorage.setItem("medCart", JSON.stringify(updated));
        toast.success(`${medicine.name} added to cart!`);
    };

    const handlePrescriptionSubmit = () => {
        if (!file) { toast.error("Please select a prescription file"); return; }
        if (!user) { navigate("/login", { state: { from: `/store/${id}` } }); return; }
        setSubmitted(true);
        toast.success("Prescription submitted for verification! You will be notified once approved.");
        setPrescriptionOpen(false);
    };

    return (
        <div className="min-h-screen flex flex-col">
            <Navbar />

            {/* Hero */}
            <section className="bg-gradient-to-br from-emerald-600 to-teal-700 text-white">
                <div className="container py-8">
                    <button onClick={() => navigate("/store")} className="flex items-center gap-2 text-white/70 hover:text-white text-sm mb-4 transition-colors">
                        <ArrowLeft className="h-4 w-4" /> Back to Store
                    </button>
                    <div className="flex flex-col md:flex-row items-start gap-6">
                        <div className="h-40 w-40 rounded-2xl bg-white/20 flex items-center justify-center shrink-0 backdrop-blur-sm border border-white/20">
                            {medicine.imageUrl ? (
                                <img src={medicine.imageUrl} alt={medicine.name} className="h-32 w-32 object-contain" />
                            ) : <Pill className="h-16 w-16 text-white/70" />}
                        </div>
                        <div className="flex-1">
                            <div className="flex flex-wrap gap-2 mb-2">
                                <Badge className="bg-white/20 text-white hover:bg-white/30">{medicine.category}</Badge>
                                {medicine.prescriptionRequired && (
                                    <Badge className="bg-amber-500 text-white"><AlertTriangle className="h-3 w-3 mr-1" />Prescription Required</Badge>
                                )}
                            </div>
                            <h1 className="text-2xl md:text-3xl font-black">{medicine.name}</h1>
                            {medicine.brandName && <p className="text-white/80">{medicine.brandName} · {medicine.dosageForm} {medicine.strength && `· ${medicine.strength}`}</p>}
                            <div className="flex items-center gap-2 mt-2">
                                <div className="flex">
                                    {[1, 2, 3, 4, 5].map(i => (
                                        <Star key={i} className={`h-4 w-4 ${i <= Math.round(medicine.rating) ? "fill-amber-400 text-amber-400" : "text-white/30"}`} />
                                    ))}
                                </div>
                                <span className="font-bold">{medicine.rating.toFixed(1)}</span>
                                <span className="text-white/70">({medicine.reviewCount.toLocaleString()} reviews)</span>
                            </div>
                        </div>
                        {/* Price card */}
                        <div className="w-full md:w-56 bg-white/10 backdrop-blur-md rounded-2xl p-5 border border-white/20 space-y-4">
                            <div>
                                <p className="text-white/70 text-xs">Price</p>
                                <div className="flex items-center font-black text-3xl gap-0.5">
                                    <IndianRupee className="h-6 w-6" />{finalPrice}
                                </div>
                                {medicine.discountPercent > 0 && (
                                    <div className="flex items-center gap-2">
                                        <span className="text-sm line-through text-white/60">₹{medicine.price}</span>
                                        <span className="text-xs bg-red-500 text-white rounded-full px-2 py-0.5">{medicine.discountPercent}% off</span>
                                    </div>
                                )}
                            </div>
                            <div className={`text-xs font-semibold px-2 py-1 rounded-full text-center ${medicine.stockStatus === "In Stock" ? "bg-emerald-500/80" : medicine.stockStatus === "Low Stock" ? "bg-amber-500/80" : "bg-red-500/80"}`}>
                                {medicine.stockStatus}
                            </div>
                            {submitted ? (
                                <div className="text-center text-sm text-emerald-300 font-semibold flex items-center gap-1 justify-center">
                                    <CheckCircle2 className="h-4 w-4" /> Prescription Submitted
                                </div>
                            ) : (
                                <Button
                                    className="w-full bg-white text-emerald-700 hover:bg-white/90 font-bold"
                                    disabled={medicine.stockStatus === "Out of Stock"}
                                    onClick={handleAddToCart}
                                >
                                    {medicine.prescriptionRequired ? (<><Upload className="mr-2 h-4 w-4" />Upload Prescription</>) : (<><ShoppingCart className="mr-2 h-4 w-4" />Add to Cart</>)}
                                </Button>
                            )}
                            {medicine.deliveryAvailable && (
                                <p className="text-xs text-white/70 text-center">🚚 Free delivery on ₹499+</p>
                            )}
                        </div>
                    </div>
                </div>
            </section>

            <main className="flex-1 gradient-subtle">
                <div className="container py-8">
                    <div className="grid lg:grid-cols-3 gap-6">
                        {/* Left */}
                        <div className="lg:col-span-2 space-y-5">
                            {/* Description */}
                            <Section title="About this Medicine" icon={<Pill className="h-5 w-5 text-emerald-600" />}>
                                <p className="text-muted-foreground leading-relaxed">{medicine.description}</p>
                            </Section>
                            {/* Usage */}
                            {medicine.usageInstructions && (
                                <Section title="How to Use" icon={<CheckCircle2 className="h-5 w-5 text-emerald-600" />}>
                                    <p className="text-muted-foreground">{medicine.usageInstructions}</p>
                                </Section>
                            )}
                            {/* Side effects */}
                            {medicine.sideEffects?.length > 0 && (
                                <Section title="Possible Side Effects" icon={<AlertTriangle className="h-5 w-5 text-amber-500" />}>
                                    <ul className="space-y-1">
                                        {medicine.sideEffects.map(s => (
                                            <li key={s} className="flex items-center gap-2 text-sm">
                                                <span className="h-1.5 w-1.5 rounded-full bg-amber-500 shrink-0" />{s}
                                            </li>
                                        ))}
                                    </ul>
                                </Section>
                            )}
                            {/* Warnings */}
                            {medicine.warnings?.length > 0 && (
                                <div className="bg-red-50 dark:bg-red-900/20 rounded-2xl border border-red-100 dark:border-red-800/30 p-5">
                                    <h3 className="font-bold mb-3 flex items-center gap-2 text-red-700 dark:text-red-400">
                                        <AlertTriangle className="h-5 w-5" /> Warnings & Precautions
                                    </h3>
                                    <ul className="space-y-1.5">
                                        {medicine.warnings.map(w => (
                                            <li key={w} className="flex items-start gap-2 text-sm text-red-600 dark:text-red-300">
                                                <span className="h-1.5 w-1.5 rounded-full bg-red-500 mt-1.5 shrink-0" />{w}
                                            </li>
                                        ))}
                                    </ul>
                                    {medicine.pregnancyWarning && (
                                        <p className="mt-3 text-sm font-semibold text-red-700">🤰 {medicine.pregnancyWarning}</p>
                                    )}
                                    {medicine.ageRestriction && (
                                        <p className="mt-1 text-sm font-semibold text-red-700">👶 {medicine.ageRestriction}</p>
                                    )}
                                </div>
                            )}
                        </div>

                        {/* Right sidebar */}
                        <div className="space-y-5">
                            {/* Quick info */}
                            <Section title="Product Details" icon={<Shield className="h-5 w-5 text-emerald-600" />}>
                                <div className="space-y-2 text-sm">
                                    {[
                                        ["Form", medicine.dosageForm],
                                        ["Strength", medicine.strength || "—"],
                                        ["Manufacturer", medicine.manufacturer || "—"],
                                        ["Storage", medicine.storageInstructions || "Cool dry place"],
                                        ["Prescription", medicine.prescriptionRequired ? "Required ⚠️" : "Not Required ✅"],
                                    ].map(([l, v]) => (
                                        <div key={l} className="flex justify-between border-b border-border/40 pb-1.5 last:border-0">
                                            <span className="text-muted-foreground">{l}</span>
                                            <span className="font-semibold text-right max-w-[60%]">{v}</span>
                                        </div>
                                    ))}
                                </div>
                            </Section>

                            {/* Nearby pharmacies */}
                            {medicine.nearbyPharmacies?.length > 0 && (
                                <Section title="Nearby Pharmacies" icon={<MapPin className="h-5 w-5 text-emerald-600" />}>
                                    <div className="space-y-3">
                                        {medicine.nearbyPharmacies.map((p, i) => (
                                            <div key={i} className="flex items-start gap-3 p-3 rounded-xl bg-muted/30">
                                                <MapPin className="h-4 w-4 text-emerald-600 mt-0.5 shrink-0" />
                                                <div className="flex-1 min-w-0">
                                                    <p className="font-semibold text-sm">{p.name}</p>
                                                    <p className="text-xs text-muted-foreground truncate">{p.address}</p>
                                                    <div className="flex items-center gap-2 mt-0.5">
                                                        <span className="text-xs text-emerald-600 font-medium">{p.distance}</span>
                                                        <span className="flex items-center gap-0.5 text-xs">
                                                            <Star className="h-3 w-3 fill-amber-400 text-amber-400" />{p.rating}
                                                        </span>
                                                    </div>
                                                </div>
                                            </div>
                                        ))}
                                    </div>
                                </Section>
                            )}
                        </div>
                    </div>
                </div>
            </main>

            <Footer />

            {/* Prescription Upload Dialog */}
            <Dialog open={prescriptionOpen} onOpenChange={setPrescriptionOpen}>
                <DialogContent className="max-w-md">
                    <DialogHeader>
                        <DialogTitle className="flex items-center gap-2">
                            <AlertTriangle className="h-5 w-5 text-amber-500" /> Prescription Required
                        </DialogTitle>
                        <DialogDescription>
                            <strong>{medicine.name}</strong> requires a valid doctor-issued prescription.
                        </DialogDescription>
                    </DialogHeader>
                    <div className="space-y-4 pt-2">
                        <div className="bg-amber-50 dark:bg-amber-900/20 rounded-xl p-4 text-sm text-amber-700 dark:text-amber-300">
                            <p className="font-semibold mb-2">📋 Prescription Workflow:</p>
                            <ol className="space-y-1 list-decimal list-inside">
                                <li>Upload a doctor-issued prescription (PDF or image)</li>
                                <li>Our team verifies it within 2–4 hours</li>
                                <li>Once approved, you can complete your purchase</li>
                            </ol>
                        </div>
                        <div className="border-2 border-dashed border-border rounded-xl p-6 text-center">
                            <Upload className="h-8 w-8 mx-auto text-muted-foreground/50 mb-2" />
                            <p className="text-sm text-muted-foreground mb-3">Upload prescription (PDF, JPG, PNG)</p>
                            <input
                                type="file"
                                accept=".pdf,.jpg,.jpeg,.png"
                                onChange={e => setFile(e.target.files?.[0] || null)}
                                className="hidden"
                                id="rx-upload"
                            />
                            <label htmlFor="rx-upload">
                                <Button variant="outline" size="sm" asChild><span className="cursor-pointer">Choose File</span></Button>
                            </label>
                            {file && <p className="mt-2 text-xs text-emerald-600 font-medium">✓ {file.name}</p>}
                        </div>
                        <div className="flex gap-2">
                            <Button variant="outline" className="flex-1" onClick={() => setPrescriptionOpen(false)}>Cancel</Button>
                            <Button className="flex-1 bg-emerald-600 hover:bg-emerald-700 text-white" onClick={handlePrescriptionSubmit} disabled={!file}>
                                Submit for Verification
                            </Button>
                        </div>
                    </div>
                </DialogContent>
            </Dialog>
        </div>
    );
}

function Section({ title, icon, children }: { title: string; icon: React.ReactNode; children: React.ReactNode }) {
    return (
        <div className="bg-background rounded-2xl border border-border p-5 shadow-card">
            <h2 className="font-bold mb-3 flex items-center gap-2">{icon}{title}</h2>
            {children}
        </div>
    );
}
